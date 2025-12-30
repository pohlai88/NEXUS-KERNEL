/**
 * Quotation Repository with Audit Trail
 * 
 * Manages quotation submissions and approvals with automatic audit trail logging.
 * Every quotation operation creates an immutable audit record.
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface Quotation {
  id: string;
  tenant_id: string;
  vendor_id: string;
  company_id: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string;
  subject: string;
  description: string | null;
  line_items: unknown[]; // JSONB array of line items
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency_code: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'accepted' | 'expired';
  submitted_by: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  accepted_by: string | null;
  accepted_at: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuotationParams {
  tenant_id: string;
  vendor_id: string;
  company_id: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string;
  subject: string;
  description?: string;
  line_items: unknown[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency_code: string;
  document_url?: string;
}

export interface UpdateQuotationParams {
  subject?: string;
  description?: string;
  line_items?: unknown[];
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  valid_until?: string;
  document_url?: string;
}

export class QuotationRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Create quotation with audit trail
   */
  async create(
    params: CreateQuotationParams,
    createdBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Quotation> {
    // Insert quotation
    const { data: quotationData, error } = await this.supabase
      .from('quotations')
      .insert({
        tenant_id: params.tenant_id,
        vendor_id: params.vendor_id,
        company_id: params.company_id,
        quotation_number: params.quotation_number,
        quotation_date: params.quotation_date,
        valid_until: params.valid_until,
        subject: params.subject,
        description: params.description || null,
        line_items: params.line_items,
        subtotal: params.subtotal,
        tax_amount: params.tax_amount,
        total_amount: params.total_amount,
        currency_code: params.currency_code,
        status: 'draft',
        document_url: params.document_url || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create quotation: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'quotation',
      entity_id: quotationData.id,
      action: 'create',
      action_by: createdBy,
      new_state: quotationData,
      workflow_stage: 'draft',
      workflow_state: {
        status: 'draft',
        quotation_number: params.quotation_number,
        total_amount: params.total_amount,
        vendor_id: params.vendor_id,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToQuotation(quotationData);
  }

  /**
   * Update quotation with audit trail
   */
  async update(
    quotationId: string,
    params: UpdateQuotationParams,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Quotation> {
    // Get current quotation state
    const currentQuotation = await this.getById(quotationId);
    if (!currentQuotation) {
      throw new Error('Quotation not found');
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (params.subject !== undefined) updatePayload.subject = params.subject;
    if (params.description !== undefined) updatePayload.description = params.description;
    if (params.line_items !== undefined) updatePayload.line_items = params.line_items;
    if (params.subtotal !== undefined) updatePayload.subtotal = params.subtotal;
    if (params.tax_amount !== undefined) updatePayload.tax_amount = params.tax_amount;
    if (params.total_amount !== undefined) updatePayload.total_amount = params.total_amount;
    if (params.valid_until !== undefined) updatePayload.valid_until = params.valid_until;
    if (params.document_url !== undefined) updatePayload.document_url = params.document_url;

    // Update quotation
    const { data: updatedQuotation, error } = await this.supabase
      .from('quotations')
      .update(updatePayload)
      .eq('id', quotationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update quotation: ${error.message}`);
    }

    // Calculate changes
    const changes: Record<string, unknown> = {};
    if (params.total_amount !== undefined && params.total_amount !== currentQuotation.total_amount) {
      changes.total_amount = { from: currentQuotation.total_amount, to: params.total_amount };
    }
    if (params.subject && params.subject !== currentQuotation.subject) {
      changes.subject = { from: currentQuotation.subject, to: params.subject };
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'quotation',
      entity_id: quotationId,
      action: 'update',
      action_by: updatedBy,
      old_state: currentQuotation,
      new_state: updatedQuotation,
      changes,
      workflow_stage: updatedQuotation.status,
      workflow_state: {
        status: updatedQuotation.status,
        quotation_number: updatedQuotation.quotation_number,
        total_amount: updatedQuotation.total_amount,
        vendor_id: updatedQuotation.vendor_id,
      },
      tenant_id: currentQuotation.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToQuotation(updatedQuotation);
  }

  /**
   * Submit quotation with audit trail
   */
  async submit(
    quotationId: string,
    submittedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Quotation> {
    const currentQuotation = await this.getById(quotationId);
    if (!currentQuotation) {
      throw new Error('Quotation not found');
    }

    const { data: updatedQuotation, error } = await this.supabase
      .from('quotations')
      .update({
        status: 'submitted',
        submitted_by: submittedBy,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', quotationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit quotation: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'quotation',
      entity_id: quotationId,
      action: 'submit',
      action_by: submittedBy,
      old_state: currentQuotation,
      new_state: updatedQuotation,
      workflow_stage: 'submitted',
      workflow_state: {
        status: 'submitted',
        submitted_by: submittedBy,
        submitted_at: updatedQuotation.submitted_at,
      },
      tenant_id: currentQuotation.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToQuotation(updatedQuotation);
  }

  /**
   * Approve quotation with audit trail
   */
  async approve(
    quotationId: string,
    approvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Quotation> {
    const currentQuotation = await this.getById(quotationId);
    if (!currentQuotation) {
      throw new Error('Quotation not found');
    }

    const { data: updatedQuotation, error } = await this.supabase
      .from('quotations')
      .update({
        status: 'approved',
        reviewed_by: approvedBy,
        reviewed_at: new Date().toISOString(),
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', quotationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve quotation: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'quotation',
      entity_id: quotationId,
      action: 'approve',
      action_by: approvedBy,
      old_state: currentQuotation,
      new_state: updatedQuotation,
      workflow_stage: 'approved',
      workflow_state: {
        status: 'approved',
        approved_by: approvedBy,
        approved_at: updatedQuotation.approved_at,
      },
      tenant_id: currentQuotation.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToQuotation(updatedQuotation);
  }

  /**
   * Reject quotation with audit trail
   */
  async reject(
    quotationId: string,
    reason: string,
    rejectedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Quotation> {
    const currentQuotation = await this.getById(quotationId);
    if (!currentQuotation) {
      throw new Error('Quotation not found');
    }

    const { data: updatedQuotation, error } = await this.supabase
      .from('quotations')
      .update({
        status: 'rejected',
        reviewed_by: rejectedBy,
        reviewed_at: new Date().toISOString(),
        rejected_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quotationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject quotation: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'quotation',
      entity_id: quotationId,
      action: 'reject',
      action_by: rejectedBy,
      old_state: currentQuotation,
      new_state: updatedQuotation,
      workflow_stage: 'rejected',
      workflow_state: {
        status: 'rejected',
        rejected_reason: reason,
      },
      tenant_id: currentQuotation.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToQuotation(updatedQuotation);
  }

  /**
   * Accept quotation with audit trail
   */
  async accept(
    quotationId: string,
    acceptedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Quotation> {
    const currentQuotation = await this.getById(quotationId);
    if (!currentQuotation) {
      throw new Error('Quotation not found');
    }

    const { data: updatedQuotation, error } = await this.supabase
      .from('quotations')
      .update({
        status: 'accepted',
        accepted_by: acceptedBy,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', quotationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to accept quotation: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'quotation',
      entity_id: quotationId,
      action: 'accept',
      action_by: acceptedBy,
      old_state: currentQuotation,
      new_state: updatedQuotation,
      workflow_stage: 'accepted',
      workflow_state: {
        status: 'accepted',
        accepted_by: acceptedBy,
        accepted_at: updatedQuotation.accepted_at,
      },
      tenant_id: currentQuotation.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToQuotation(updatedQuotation);
  }

  /**
   * Get quotation by ID
   */
  async getById(quotationId: string): Promise<Quotation | null> {
    const { data, error } = await this.supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get quotation: ${error.message}`);
    }

    return this.mapRowToQuotation(data);
  }

  /**
   * Get quotations by vendor ID
   */
  async getByVendor(vendorId: string): Promise<Quotation[]> {
    const { data, error } = await this.supabase
      .from('quotations')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('quotation_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get quotations: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToQuotation(row));
  }

  /**
   * Get quotations by company ID
   */
  async getByCompany(companyId: string): Promise<Quotation[]> {
    const { data, error } = await this.supabase
      .from('quotations')
      .select('*')
      .eq('company_id', companyId)
      .order('quotation_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get quotations: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToQuotation(row));
  }

  /**
   * Get audit trail for quotation
   */
  async getAuditTrail(quotationId: string) {
    return this.auditTrail.getByEntity('quotation', quotationId);
  }

  /**
   * Map database row to Quotation
   */
  private mapRowToQuotation(row: unknown): Quotation {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      vendor_id: r.vendor_id as string,
      company_id: r.company_id as string,
      quotation_number: r.quotation_number as string,
      quotation_date: r.quotation_date as string,
      valid_until: r.valid_until as string,
      subject: r.subject as string,
      description: (r.description as string) || null,
      line_items: (r.line_items as unknown[]) || [],
      subtotal: (r.subtotal as number) || 0,
      tax_amount: (r.tax_amount as number) || 0,
      total_amount: (r.total_amount as number) || 0,
      currency_code: r.currency_code as string,
      status: r.status as Quotation['status'],
      submitted_by: (r.submitted_by as string) || null,
      submitted_at: (r.submitted_at as string) || null,
      reviewed_by: (r.reviewed_by as string) || null,
      reviewed_at: (r.reviewed_at as string) || null,
      approved_by: (r.approved_by as string) || null,
      approved_at: (r.approved_at as string) || null,
      rejected_reason: (r.rejected_reason as string) || null,
      accepted_by: (r.accepted_by as string) || null,
      accepted_at: (r.accepted_at as string) || null,
      document_url: (r.document_url as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}

