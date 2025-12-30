/**
 * Vendor Group Repository
 * 
 * Vendor Groups: Vendors as Groups of Companies serving multiple subsidiaries.
 * One vendor group can serve multiple subsidiaries, one vendor user can represent multiple vendor groups.
 */

import { createClient } from '@/lib/supabase-client';

export interface VendorGroup {
  id: string;
  name: string;
  legal_name: string;
  country_code: string;
  parent_vendor_group_id: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VendorGroupAccess {
  id: string;
  vendor_group_id: string;
  tenant_id: string;
  status: 'active' | 'suspended' | 'pending_approval';
  approved_at: string | null;
  approved_by: string | null;
  access_type: 'full' | 'limited' | 'read_only';
  allowed_categories: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VendorUserAccess {
  id: string;
  user_id: string;
  vendor_group_id: string;
  role: 'vendor_admin' | 'vendor_user' | 'vendor_viewer';
  is_primary: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export class VendorGroupRepository {
  private supabase = createClient();

  /**
   * Get vendor groups for user
   */
  async getVendorGroupsForUser(userId: string): Promise<VendorGroup[]> {
    const { data, error } = await this.supabase
      .from('vendor_user_access')
      .select('vendor_group_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get vendor groups: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const vendorGroupIds = data.map((d) => d.vendor_group_id);

    const { data: vendorGroups, error: groupsError } = await this.supabase
      .from('vendor_groups')
      .select('*')
      .in('id', vendorGroupIds);

    if (groupsError) {
      throw new Error(`Failed to get vendor groups: ${groupsError.message}`);
    }

    return (vendorGroups || []).map((row) => this.mapRowToVendorGroup(row));
  }

  /**
   * Get accessible subsidiaries for vendor user
   */
  async getAccessibleSubsidiaries(userId: string): Promise<VendorGroupAccess[]> {
    const { data, error } = await this.supabase
      .from('vendor_group_access')
      .select('*')
      .in('vendor_group_id', 
        this.supabase
          .from('vendor_user_access')
          .select('vendor_group_id')
          .eq('user_id', userId)
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get accessible subsidiaries: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToVendorGroupAccess(row));
  }

  /**
   * Get accessible tenant IDs for vendor user
   */
  async getAccessibleTenantIds(userId: string): Promise<string[]> {
    const subsidiaries = await this.getAccessibleSubsidiaries(userId);
    return subsidiaries.map((s) => s.tenant_id);
  }

  /**
   * Check if vendor user has access to tenant
   */
  async hasAccess(userId: string, tenantId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('vendor_group_access')
      .select('id')
      .in('vendor_group_id',
        this.supabase
          .from('vendor_user_access')
          .select('vendor_group_id')
          .eq('user_id', userId)
      )
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to check access: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Create vendor group
   */
  async createVendorGroup(
    name: string,
    legalName: string,
    countryCode: string,
    parentVendorGroupId?: string
  ): Promise<VendorGroup> {
    const { data, error } = await this.supabase
      .from('vendor_groups')
      .insert({
        name,
        legal_name: legalName,
        country_code: countryCode,
        parent_vendor_group_id: parentVendorGroupId || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create vendor group: ${error.message}`);
    }

    return this.mapRowToVendorGroup(data);
  }

  /**
   * Grant vendor group access to subsidiary
   */
  async grantAccess(
    vendorGroupId: string,
    tenantId: string,
    accessType: VendorGroupAccess['access_type'] = 'full',
    allowedCategories: string[] = []
  ): Promise<VendorGroupAccess> {
    const { data, error } = await this.supabase
      .from('vendor_group_access')
      .insert({
        vendor_group_id: vendorGroupId,
        tenant_id: tenantId,
        status: 'pending_approval',
        access_type: accessType,
        allowed_categories: allowedCategories,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to grant access: ${error.message}`);
    }

    return this.mapRowToVendorGroupAccess(data);
  }

  /**
   * Approve vendor group access
   */
  async approveAccess(
    accessId: string,
    approvedBy: string
  ): Promise<VendorGroupAccess> {
    const { data, error } = await this.supabase
      .from('vendor_group_access')
      .update({
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
      })
      .eq('id', accessId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve access: ${error.message}`);
    }

    return this.mapRowToVendorGroupAccess(data);
  }

  /**
   * Link vendor user to vendor group
   */
  async linkUserToVendorGroup(
    userId: string,
    vendorGroupId: string,
    role: VendorUserAccess['role'] = 'vendor_user',
    isPrimary: boolean = false
  ): Promise<VendorUserAccess> {
    const { data, error } = await this.supabase
      .from('vendor_user_access')
      .insert({
        user_id: userId,
        vendor_group_id: vendorGroupId,
        role,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to link user to vendor group: ${error.message}`);
    }

    return this.mapRowToVendorUserAccess(data);
  }

  /**
   * Map database row to VendorGroup
   */
  private mapRowToVendorGroup(row: unknown): VendorGroup {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      name: r.name as string,
      legal_name: r.legal_name as string,
      country_code: r.country_code as string,
      parent_vendor_group_id: (r.parent_vendor_group_id as string) || null,
      primary_contact_email: (r.primary_contact_email as string) || null,
      primary_contact_phone: (r.primary_contact_phone as string) || null,
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }

  /**
   * Map database row to VendorGroupAccess
   */
  private mapRowToVendorGroupAccess(row: unknown): VendorGroupAccess {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      vendor_group_id: r.vendor_group_id as string,
      tenant_id: r.tenant_id as string,
      status: r.status as VendorGroupAccess['status'],
      approved_at: (r.approved_at as string) || null,
      approved_by: (r.approved_by as string) || null,
      access_type: (r.access_type as VendorGroupAccess['access_type']) || 'full',
      allowed_categories: (r.allowed_categories as string[]) || [],
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }

  /**
   * Map database row to VendorUserAccess
   */
  private mapRowToVendorUserAccess(row: unknown): VendorUserAccess {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      user_id: r.user_id as string,
      vendor_group_id: r.vendor_group_id as string,
      role: r.role as VendorUserAccess['role'],
      is_primary: (r.is_primary as boolean) || false,
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}

