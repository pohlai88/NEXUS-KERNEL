/**
 * Invoice Status Repository with Reason Codes
 * 
 * Manages invoice status changes with mandatory reason codes and expected next steps.
 * Every status change creates an immutable timeline record and audit trail.
 * 
 * PRD V-01: Payment Status Transparency (MUST)
 * - Single canonical status per invoice
 * - Each non-final status must include a reason code
 * - Each invoice must show: current status, last updated time, expected next step, expected payment date
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export type InvoiceStatus = 'RECEIVED' | 'UNDER_REVIEW' | 'REJECTED' | 'APPROVED_FOR_PAYMENT' | 'PAID';

export interface InvoiceStatusReason {
  id: string;
  tenant_id: string;
  status: InvoiceStatus;
  reason_code: string;
  reason_label: string;
  reason_description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface InvoiceStatusTimeline {
  id: string;
  tenant_id: string;
  invoice_id: string;
  status: InvoiceStatus;
  reason_code: string;
  reason_text: string | null;
  changed_by: string | null;
  changed_at: string;
  expected_next_step: string | null;
  expected_payment_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface InvoiceStatusInfo {
  current_status: InvoiceStatus;
  current_status_reason_code: string;
  current_status_reason_text: string | null;
  status_changed_at: string | null;
  status_changed_by: string | null;
  expected_next_step: string | null;
  expected_payment_date: string | null;
  timeline: InvoiceStatusTimeline[];
}

export interface UpdateInvoiceStatusParams {
  status: InvoiceStatus;
  reason_code: string;
  reason_text?: string;
  notes?: string;
  expected_next_step?: string;
  expected_payment_date?: string;
}

export class InvoiceStatusRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Update invoice status with mandatory reason code
   * PRD V-01: Status changes must include reason codes
   */
  async updateStatus(
    invoiceId: string,
    params: UpdateInvoiceStatusParams,
    changedBy: string,
    tenantId: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<InvoiceStatusInfo> {
    // Validate reason code exists for this status
    const reason = await this.getReasonByCode(tenantId, params.status, params.reason_code);
    if (!reason) {
      throw new Error(`Invalid reason code '${params.reason_code}' for status '${params.status}'`);
    }

    // Get current invoice state
    const { data: currentInvoice, error: invoiceError } = await this.supabase
      .from('vmp_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !currentInvoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message || 'Unknown error'}`);
    }

    // Calculate expected next step if not provided
    const expectedNextStep = params.expected_next_step || this.calculateExpectedNextStep(params.status, params.reason_code);

    // Calculate expected payment date if not provided
    const expectedPaymentDate = params.expected_payment_date || await this.calculateExpectedPaymentDate(
      invoiceId,
      params.status,
      tenantId
    );

    // Update invoice status
    const { data: updatedInvoice, error: updateError } = await this.supabase
      .from('vmp_invoices')
      .update({
        status: params.status,
        current_status_reason_code: params.reason_code,
        current_status_reason_text: params.reason_text || reason.reason_label,
        expected_next_step: expectedNextStep,
        expected_payment_date: expectedPaymentDate,
        status_changed_at: new Date().toISOString(),
        status_changed_by: changedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update invoice status: ${updateError.message}`);
    }

    // Create timeline record
    const { data: timelineRecord, error: timelineError } = await this.supabase
      .from('invoice_status_timeline')
      .insert({
        tenant_id: tenantId,
        invoice_id: invoiceId,
        status: params.status,
        reason_code: params.reason_code,
        reason_text: params.reason_text || reason.reason_label,
        changed_by: changedBy,
        changed_at: new Date().toISOString(),
        expected_next_step: expectedNextStep,
        expected_payment_date: expectedPaymentDate,
        notes: params.notes || null,
      })
      .select()
      .single();

    if (timelineError) {
      throw new Error(`Failed to create timeline record: ${timelineError.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'invoice',
      entity_id: invoiceId,
      action: 'status_change',
      action_by: changedBy,
      old_state: {
        status: currentInvoice.status,
        reason_code: currentInvoice.current_status_reason_code,
      },
      new_state: {
        status: params.status,
        reason_code: params.reason_code,
        reason_text: params.reason_text || reason.reason_label,
        expected_next_step: expectedNextStep,
        expected_payment_date: expectedPaymentDate,
      },
      changes: {
        status: { from: currentInvoice.status, to: params.status },
        reason_code: { from: currentInvoice.current_status_reason_code, to: params.reason_code },
      },
      workflow_stage: params.status,
      workflow_state: {
        status: params.status,
        reason_code: params.reason_code,
        expected_next_step: expectedNextStep,
        expected_payment_date: expectedPaymentDate,
      },
      tenant_id: tenantId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    // Get complete status info
    return this.getStatusInfo(invoiceId, tenantId);
  }

  /**
   * Get invoice status info with timeline
   * PRD V-01: Must show current status, last updated time, expected next step, expected payment date
   */
  async getStatusInfo(invoiceId: string, tenantId: string): Promise<InvoiceStatusInfo> {
    // Get invoice
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('vmp_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message || 'Unknown error'}`);
    }

    // Get timeline
    const { data: timeline, error: timelineError } = await this.supabase
      .from('invoice_status_timeline')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('changed_at', { ascending: false });

    if (timelineError) {
      throw new Error(`Failed to get timeline: ${timelineError.message}`);
    }

    return {
      current_status: (invoice.status as InvoiceStatus) || 'RECEIVED',
      current_status_reason_code: invoice.current_status_reason_code || 'RECEIVED_AUTO',
      current_status_reason_text: invoice.current_status_reason_text || null,
      status_changed_at: invoice.status_changed_at || invoice.updated_at || invoice.created_at,
      status_changed_by: invoice.status_changed_by || null,
      expected_next_step: invoice.expected_next_step || null,
      expected_payment_date: invoice.expected_payment_date || null,
      timeline: (timeline || []).map((row) => this.mapRowToTimeline(row)),
    };
  }

  /**
   * Get available reason codes for a status
   */
  async getReasonsByStatus(tenantId: string, status: InvoiceStatus): Promise<InvoiceStatusReason[]> {
    const { data, error } = await this.supabase
      .from('invoice_status_reasons')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', status)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to get reason codes: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToReason(row));
  }

  /**
   * Get reason by code
   */
  async getReasonByCode(tenantId: string, status: InvoiceStatus, reasonCode: string): Promise<InvoiceStatusReason | null> {
    const { data, error } = await this.supabase
      .from('invoice_status_reasons')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', status)
      .eq('reason_code', reasonCode)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get reason code: ${error.message}`);
    }

    return this.mapRowToReason(data);
  }

  /**
   * Calculate expected next step based on status and reason
   */
  private calculateExpectedNextStep(status: InvoiceStatus, reasonCode: string): string {
    const nextSteps: Record<string, string> = {
      'RECEIVED_AUTO': 'Invoice will be reviewed for 3-way matching',
      'RECEIVED_MANUAL': 'Invoice will be reviewed for 3-way matching',
      'REVIEW_MATCHING': 'Waiting for PO and GRN to complete 3-way matching',
      'REVIEW_DOCUMENTS': 'Waiting for additional documents to be uploaded',
      'REVIEW_APPROVAL': 'Waiting for approval from authorized personnel',
      'REJECT_MISSING_PO': 'Please provide Purchase Order or request PO creation',
      'REJECT_MISSING_GRN': 'Please upload Goods Receipt Note',
      'REJECT_VARIANCE': 'Please review invoice amount and provide explanation',
      'REJECT_INVALID_DATA': 'Please correct invoice data and resubmit',
      'REJECT_DUPLICATE': 'Invoice number already exists. Please verify and contact AP if needed',
      'APPROVED_AUTO': 'Invoice approved. Payment will be processed in next payment cycle',
      'APPROVED_MANUAL': 'Invoice approved. Payment will be processed in next payment cycle',
      'PAID_COMPLETED': 'Payment completed. No further action required',
      'PAID_PARTIAL': 'Partial payment made. Remaining balance will be paid in next cycle',
    };

    return nextSteps[reasonCode] || 'Status updated. Please check with AP team for next steps';
  }

  /**
   * Calculate expected payment date based on status and payment cycles
   */
  private async calculateExpectedPaymentDate(
    invoiceId: string,
    status: InvoiceStatus,
    tenantId: string
  ): Promise<string | null> {
    // Only calculate for APPROVED_FOR_PAYMENT or PAID
    if (status !== 'APPROVED_FOR_PAYMENT' && status !== 'PAID') {
      return null;
    }

    // Get invoice due date
    const { data: invoice } = await this.supabase
      .from('vmp_invoices')
      .select('due_date, invoice_date')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return null;
    }

    // If already paid, return paid date
    if (status === 'PAID') {
      const { data: payment } = await this.supabase
        .from('vmp_payments')
        .select('payment_date, paid_at')
        .eq('invoice_id', invoiceId)
        .single();

      return payment?.paid_at || payment?.payment_date || null;
    }

    // For APPROVED_FOR_PAYMENT, calculate based on due date or payment cycle
    // TODO: Integrate with payment_cycles table when available
    if (invoice.due_date) {
      return invoice.due_date;
    }

    // Default: 30 days from invoice date
    if (invoice.invoice_date) {
      const invoiceDate = new Date(invoice.invoice_date);
      invoiceDate.setDate(invoiceDate.getDate() + 30);
      return invoiceDate.toISOString().split('T')[0];
    }

    return null;
  }

  /**
   * Map database row to InvoiceStatusReason
   */
  private mapRowToReason(row: unknown): InvoiceStatusReason {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      status: r.status as InvoiceStatus,
      reason_code: r.reason_code as string,
      reason_label: r.reason_label as string,
      reason_description: (r.reason_description as string) || null,
      is_active: (r.is_active as boolean) ?? true,
      sort_order: (r.sort_order as number) || 0,
    };
  }

  /**
   * Map database row to InvoiceStatusTimeline
   */
  private mapRowToTimeline(row: unknown): InvoiceStatusTimeline {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      invoice_id: r.invoice_id as string,
      status: r.status as InvoiceStatus,
      reason_code: r.reason_code as string,
      reason_text: (r.reason_text as string) || null,
      changed_by: (r.changed_by as string) || null,
      changed_at: r.changed_at as string,
      expected_next_step: (r.expected_next_step as string) || null,
      expected_payment_date: (r.expected_payment_date as string) || null,
      notes: (r.notes as string) || null,
      created_at: r.created_at as string,
    };
  }
}

