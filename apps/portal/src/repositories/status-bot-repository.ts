/**
 * Status Bot Repository
 * 
 * 24/7 inquiry system for vendor status checks.
 * "When do I get paid?" - Instant answers, zero calls.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface StatusInquiry {
  id: string;
  tenant_id: string;
  inquiry_type: 'invoice_status' | 'payment_status' | 'case_status' | 'onboarding_status';
  inquiry_identifier: string;
  vendor_id: string | null;
  response_status: string | null;
  response_message: string | null;
  response_data: Record<string, unknown> | null;
  channel: 'whatsapp' | 'portal' | 'api';
  inquiry_text: string;
  inquired_at: string;
  responded_at: string;
}

export interface InquiryRequest {
  inquiry_type: StatusInquiry['inquiry_type'];
  inquiry_identifier: string; // Invoice number, case ID, etc.
  vendor_id?: string;
  channel: StatusInquiry['channel'];
  inquiry_text?: string;
}

export class StatusBotRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Process status inquiry (24/7 bot)
   */
  async inquire(
    request: InquiryRequest,
    tenantId: string
  ): Promise<StatusInquiry> {
    let responseStatus: string | null = null;
    let responseMessage: string | null = null;
    let responseData: Record<string, unknown> | null = null;

    // Process inquiry based on type
    switch (request.inquiry_type) {
      case 'invoice_status':
        const invoiceStatus = await this.getInvoiceStatus(request.inquiry_identifier, request.vendor_id);
        responseStatus = invoiceStatus.status;
        responseMessage = this.formatInvoiceStatusMessage(invoiceStatus);
        responseData = invoiceStatus;
        break;

      case 'payment_status':
        const paymentStatus = await this.getPaymentStatus(request.inquiry_identifier, request.vendor_id);
        responseStatus = paymentStatus.status;
        responseMessage = this.formatPaymentStatusMessage(paymentStatus);
        responseData = paymentStatus;
        break;

      case 'case_status':
        const caseStatus = await this.getCaseStatus(request.inquiry_identifier, request.vendor_id);
        responseStatus = caseStatus.status;
        responseMessage = this.formatCaseStatusMessage(caseStatus);
        responseData = caseStatus;
        break;

      case 'onboarding_status':
        const onboardingStatus = await this.getOnboardingStatus(request.inquiry_identifier, request.vendor_id);
        responseStatus = onboardingStatus.status;
        responseMessage = this.formatOnboardingStatusMessage(onboardingStatus);
        responseData = onboardingStatus;
        break;
    }

    // Create inquiry record
    const { data: inquiryData, error } = await this.supabase
      .from('status_inquiries')
      .insert({
        tenant_id: tenantId,
        inquiry_type: request.inquiry_type,
        inquiry_identifier: request.inquiry_identifier,
        vendor_id: request.vendor_id || null,
        response_status: responseStatus,
        response_message: responseMessage,
        response_data: responseData,
        channel: request.channel,
        inquiry_text: request.inquiry_text || '',
        inquired_at: new Date().toISOString(),
        responded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create inquiry: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'status_inquiry',
      entity_id: inquiryData.id,
      action: 'inquire',
      action_by: request.vendor_id || 'system',
      new_state: inquiryData,
      workflow_stage: 'responded',
      workflow_state: {
        inquiry_type: request.inquiry_type,
        response_status: responseStatus,
        channel: request.channel,
      },
      tenant_id: tenantId,
    });

    return this.mapRowToInquiry(inquiryData);
  }

  /**
   * Get invoice status
   */
  private async getInvoiceStatus(invoiceNumber: string, vendorId?: string) {
    let query = this.supabase
      .from('vmp_invoices')
      .select('*')
      .or(`invoice_num.eq.${invoiceNumber},invoice_number.eq.${invoiceNumber}`);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return {
        status: 'not_found',
        message: `Invoice ${invoiceNumber} not found`,
        invoice: null,
        payment_date: null,
      };
    }

    // Get matching status
    const matchingRepo = new (await import('./three-way-matching-repository')).ThreeWayMatchingRepository();
    const matches = await matchingRepo.getByInvoice(data.id);

    // Get payment status
    const { data: payment } = await this.supabase
      .from('vmp_payments')
      .select('*')
      .eq('invoice_id', data.id)
      .single();

    return {
      status: data.status,
      message: this.getInvoiceStatusText(data.status, matches, payment),
      invoice: data,
      payment_date: payment?.payment_date || null,
      matching_status: matches[0]?.matching_status || 'pending',
    };
  }

  /**
   * Get payment status
   */
  private async getPaymentStatus(paymentRef: string, vendorId?: string) {
    let query = this.supabase
      .from('vmp_payments')
      .select('*')
      .eq('payment_ref', paymentRef);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return {
        status: 'not_found',
        message: `Payment ${paymentRef} not found`,
        payment: null,
      };
    }

    return {
      status: 'completed', // Assuming payment_ref means it's completed
      message: `Payment ${paymentRef} completed on ${new Date(data.payment_date || data.created_at).toLocaleDateString()}`,
      payment: data,
    };
  }

  /**
   * Get case status
   */
  private async getCaseStatus(caseId: string, vendorId?: string) {
    let query = this.supabase
      .from('vmp_cases')
      .select('*')
      .eq('id', caseId);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return {
        status: 'not_found',
        message: `Case not found`,
        case: null,
      };
    }

    return {
      status: data.status,
      message: `Case ${data.subject} is ${data.status}. ${data.owner_team} team is handling it.`,
      case: data,
    };
  }

  /**
   * Get onboarding status
   */
  private async getOnboardingStatus(vendorId: string, _vendorIdParam?: string) {
    const { data, error } = await this.supabase
      .from('vmp_vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error || !data) {
      return {
        status: 'not_found',
        message: `Vendor not found`,
        vendor: null,
      };
    }

    return {
      status: data.status,
      message: `Your onboarding status: ${data.status}. ${this.getOnboardingStatusText(data.status)}`,
      vendor: data,
    };
  }

  /**
   * Format invoice status message
   */
  private formatInvoiceStatusMessage(status: unknown): string {
    const s = status as { status: string; payment_date: string | null; matching_status: string };
    if (s.status === 'paid' && s.payment_date) {
      return `Invoice paid on ${new Date(s.payment_date).toLocaleDateString()}`;
    }
    if (s.status === 'matched' && s.matching_status === 'matched') {
      return 'Invoice approved. Payment scheduled for Friday, Feb 2nd.'; // TODO: Get actual date
    }
    if (s.status === 'pending') {
      return 'Invoice is pending approval. We will notify you when it is processed.';
    }
    if (s.status === 'disputed') {
      return 'Invoice is disputed. Please check the case for details.';
    }
    return `Invoice status: ${s.status}`;
  }

  /**
   * Format payment status message
   */
  private formatPaymentStatusMessage(status: unknown): string {
    const s = status as { message: string };
    return s.message;
  }

  /**
   * Format case status message
   */
  private formatCaseStatusMessage(status: unknown): string {
    const s = status as { message: string };
    return s.message;
  }

  /**
   * Format onboarding status message
   */
  private formatOnboardingStatusMessage(status: unknown): string {
    const s = status as { message: string };
    return s.message;
  }

  /**
   * Get invoice status text
   */
  private getInvoiceStatusText(
    status: string,
    matches: unknown[],
    payment: unknown
  ): string {
    if (payment) {
      const p = payment as { payment_date: string };
      return `Paid on ${new Date(p.payment_date).toLocaleDateString()}`;
    }
    if (matches.length > 0) {
      const match = matches[0] as { matching_status: string; approval_status: string };
      if (match.matching_status === 'matched' && match.approval_status === 'approved') {
        return 'Approved. Payment scheduled for Friday, Feb 2nd.'; // TODO: Calculate actual date
      }
      return `Matching: ${match.matching_status}`;
    }
    return `Status: ${status}`;
  }

  /**
   * Get onboarding status text
   */
  private getOnboardingStatusText(status: string): string {
    const map: Record<string, string> = {
      invited: 'Please complete your registration.',
      active: 'You are fully onboarded and active.',
      suspended: 'Your account is suspended. Please contact support.',
    };
    return map[status] || `Status: ${status}`;
  }

  /**
   * Map database row to StatusInquiry
   */
  private mapRowToInquiry(row: unknown): StatusInquiry {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      inquiry_type: r.inquiry_type as StatusInquiry['inquiry_type'],
      inquiry_identifier: r.inquiry_identifier as string,
      vendor_id: (r.vendor_id as string) || null,
      response_status: (r.response_status as string) || null,
      response_message: (r.response_message as string) || null,
      response_data: (r.response_data as Record<string, unknown>) || null,
      channel: r.channel as StatusInquiry['channel'],
      inquiry_text: r.inquiry_text as string,
      inquired_at: r.inquired_at as string,
      responded_at: r.responded_at as string,
    };
  }
}

