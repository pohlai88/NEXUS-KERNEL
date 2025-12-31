/**
 * Global Vendor Repository
 * 
 * Golden Records: Master vendor data at Group level (L0).
 * Subsidiaries "subscribe" to global vendors via tenant_vendors.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface GlobalVendor {
  id: string;
  group_id: string;
  legal_name: string;
  display_name: string | null;
  tax_id: string;
  country_code: string;
  registration_number: string | null;
  risk_status: 'GREEN' | 'YELLOW' | 'RED' | 'BLACKLISTED';
  credit_limit: number | null;
  current_exposure: number;
  risk_score: number;
  compliance_status: 'approved' | 'pending' | 'rejected' | 'suspended';
  compliance_docs: Record<string, unknown>;
  blacklist_reason: string | null;
  bank_account: Record<string, unknown> | null;
  payment_terms: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TenantVendor {
  id: string;
  tenant_id: string;
  global_vendor_id: string;
  local_payment_terms: string | null;
  local_credit_limit: number | null;
  local_status: 'active' | 'suspended' | 'inactive';
  local_vendor_id: string | null;
  subscribed_at: string;
  subscribed_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateGlobalVendorParams {
  group_id: string;
  legal_name: string;
  display_name?: string;
  tax_id: string;
  country_code: string;
  registration_number?: string;
  credit_limit?: number;
  payment_terms?: string;
  bank_account?: Record<string, unknown>;
}

export class GlobalVendorRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Create Global Vendor (Golden Record)
   */
  async create(
    params: CreateGlobalVendorParams,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<GlobalVendor> {
    // Check if vendor with same tax_id already exists in group
    const existing = await this.findByTaxId(params.group_id, params.tax_id);
    if (existing) {
      throw new Error(`Vendor with tax ID ${params.tax_id} already exists in this group`);
    }

    const { data: vendorData, error } = await this.supabase
      .from('global_vendors')
      .insert({
        group_id: params.group_id,
        legal_name: params.legal_name,
        display_name: params.display_name || null,
        tax_id: params.tax_id,
        country_code: params.country_code,
        registration_number: params.registration_number || null,
        credit_limit: params.credit_limit || null,
        payment_terms: params.payment_terms || null,
        bank_account: params.bank_account || null,
        risk_status: 'GREEN',
        compliance_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create global vendor: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'global_vendor',
      entity_id: vendorData.id,
      action: 'create',
      action_by: 'system', // TODO: Get from requestContext
      new_state: vendorData,
      workflow_stage: 'pending',
      workflow_state: {
        group_id: params.group_id,
        tax_id: params.tax_id,
      },
      tenant_id: params.group_id, // Using group_id as tenant_id for group-level entities
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToGlobalVendor(vendorData);
  }

  /**
   * Subscribe Tenant to Global Vendor
   */
  async subscribeTenant(
    tenantId: string,
    globalVendorId: string,
    localPaymentTerms?: string,
    localCreditLimit?: number,
    subscribedBy?: string
  ): Promise<TenantVendor> {
    // Check if global vendor is blacklisted
    const globalVendor = await this.findById(globalVendorId);
    if (!globalVendor) {
      throw new Error('Global vendor not found');
    }

    if (globalVendor.risk_status === 'BLACKLISTED') {
      throw new Error(`Cannot subscribe to blacklisted vendor: ${globalVendor.blacklist_reason || 'Blacklisted'}`);
    }

    // Create local vendor record in tenant
    const { data: localVendor, error: localError } = await this.supabase
      .from('vmp_vendors')
      .insert({
        tenant_id: tenantId,
        legal_name: globalVendor.legal_name,
        display_name: globalVendor.display_name,
        country_code: globalVendor.country_code,
        status: 'APPROVED', // Auto-approved since it's from global vendor
      })
      .select()
      .single();

    if (localError) {
      throw new Error(`Failed to create local vendor: ${localError.message}`);
    }

    // Create tenant_vendors subscription
    const { data: subscriptionData, error } = await this.supabase
      .from('tenant_vendors')
      .insert({
        tenant_id: tenantId,
        global_vendor_id: globalVendorId,
        local_vendor_id: localVendor.id,
        local_payment_terms: localPaymentTerms || null,
        local_credit_limit: localCreditLimit || null,
        subscribed_by: subscribedBy || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to subscribe tenant to global vendor: ${error.message}`);
    }

    return this.mapRowToTenantVendor(subscriptionData);
  }

  /**
   * Blacklist Global Vendor (affects all subsidiaries)
   */
  async blacklist(
    globalVendorId: string,
    reason: string,
    blacklistedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<GlobalVendor> {
    const vendor = await this.findById(globalVendorId);
    if (!vendor) {
      throw new Error('Global vendor not found');
    }

    const { data: updatedVendor, error } = await this.supabase
      .from('global_vendors')
      .update({
        risk_status: 'BLACKLISTED',
        blacklist_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', globalVendorId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to blacklist vendor: ${error.message}`);
    }

    // Suspend all tenant subscriptions
    await this.supabase
      .from('tenant_vendors')
      .update({ local_status: 'suspended' })
      .eq('global_vendor_id', globalVendorId);

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'global_vendor',
      entity_id: globalVendorId,
      action: 'blacklist',
      action_by: blacklistedBy,
      old_state: vendor,
      new_state: updatedVendor,
      workflow_stage: 'blacklisted',
      workflow_state: {
        reason,
        blacklisted_by: blacklistedBy,
      },
      tenant_id: vendor.group_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToGlobalVendor(updatedVendor);
  }

  /**
   * Update Credit Limit
   */
  async updateCreditLimit(
    globalVendorId: string,
    creditLimit: number,
    updatedBy: string
  ): Promise<GlobalVendor> {
    const { data: updatedVendor, error } = await this.supabase
      .from('global_vendors')
      .update({
        credit_limit: creditLimit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', globalVendorId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update credit limit: ${error.message}`);
    }

    // Recalculate exposure
    const vendor = await this.findById(globalVendorId);
    if (vendor) {
      await this.supabase.rpc('calculate_group_credit_exposure', {
        p_group_id: vendor.group_id,
        p_global_vendor_id: globalVendorId,
      });
    }

    return this.mapRowToGlobalVendor(updatedVendor);
  }

  /**
   * Find by ID
   */
  async findById(globalVendorId: string): Promise<GlobalVendor | null> {
    const { data, error } = await this.supabase
      .from('global_vendors')
      .select('*')
      .eq('id', globalVendorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get global vendor: ${error.message}`);
    }

    return this.mapRowToGlobalVendor(data);
  }

  /**
   * Find by Tax ID
   */
  async findByTaxId(groupId: string, taxId: string): Promise<GlobalVendor | null> {
    const { data, error } = await this.supabase
      .from('global_vendors')
      .select('*')
      .eq('group_id', groupId)
      .eq('tax_id', taxId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find vendor by tax ID: ${error.message}`);
    }

    return this.mapRowToGlobalVendor(data);
  }

  /**
   * Get subscribed tenants
   */
  async getSubscribedTenants(globalVendorId: string): Promise<TenantVendor[]> {
    const { data, error } = await this.supabase
      .from('tenant_vendors')
      .select('*')
      .eq('global_vendor_id', globalVendorId)
      .eq('local_status', 'active');

    if (error) {
      throw new Error(`Failed to get subscribed tenants: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToTenantVendor(row));
  }

  /**
   * Map database row to GlobalVendor
   */
  private mapRowToGlobalVendor(row: unknown): GlobalVendor {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      group_id: r.group_id as string,
      legal_name: r.legal_name as string,
      display_name: (r.display_name as string) || null,
      tax_id: r.tax_id as string,
      country_code: r.country_code as string,
      registration_number: (r.registration_number as string) || null,
      risk_status: r.risk_status as GlobalVendor['risk_status'],
      credit_limit: (r.credit_limit as number) || null,
      current_exposure: parseFloat((r.current_exposure as number || 0).toString()),
      risk_score: (r.risk_score as number) || 100,
      compliance_status: r.compliance_status as GlobalVendor['compliance_status'],
      compliance_docs: (r.compliance_docs as Record<string, unknown>) || {},
      blacklist_reason: (r.blacklist_reason as string) || null,
      bank_account: (r.bank_account as Record<string, unknown>) || null,
      payment_terms: (r.payment_terms as string) || null,
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }

  /**
   * Map database row to TenantVendor
   */
  private mapRowToTenantVendor(row: unknown): TenantVendor {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      global_vendor_id: r.global_vendor_id as string,
      local_payment_terms: (r.local_payment_terms as string) || null,
      local_credit_limit: (r.local_credit_limit as number) || null,
      local_status: r.local_status as TenantVendor['local_status'],
      local_vendor_id: (r.local_vendor_id as string) || null,
      subscribed_at: r.subscribed_at as string,
      subscribed_by: (r.subscribed_by as string) || null,
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}

