/**
 * Exception Detection Service
 *
 * PRD A-01: Exception-First Workload (MUST)
 * - Default view shows only problems, not volume
 * - Severity tagging: 🔴 Blocking, 🟠 Needs action, 🟢 Safe
 * - AP staff discovers issues before vendor escalation
 */

import { createClient } from '@/lib/supabase-client';

export type ExceptionType =
  | 'MISSING_DOCUMENT'
  | 'VARIANCE_BREACH'
  | 'AGING_THRESHOLD'
  | 'MATCHING_FAILURE'
  | 'APPROVAL_OVERDUE'
  | 'PAYMENT_DELAYED'
  | 'DATA_INVALID'
  | 'DUPLICATE_DETECTED';

export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface InvoiceException {
  id: string;
  tenant_id: string;
  invoice_id: string;
  exception_type: ExceptionType;
  severity: ExceptionSeverity;
  status: 'open' | 'in_progress' | 'resolved' | 'ignored';
  title: string;
  description: string;
  exception_data: Record<string, unknown>;
  detected_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExceptionDetectionResult {
  exceptions: InvoiceException[];
  blocking_count: number;
  needs_action_count: number;
  safe_count: number;
}

export class ExceptionDetectionService {
  private supabase = createClient();

  /**
   * Detect all exceptions for an invoice
   * PRD A-01: Exception-First Workload
   */
  async detectExceptions(invoiceId: string, tenantId: string): Promise<InvoiceException[]> {
    const exceptions: InvoiceException[] = [];

    // Get invoice
    const { data: invoice } = await this.supabase
      .from('vmp_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return exceptions;
    }

    // 1. Check for missing documents
    const missingDocExceptions = await this.detectMissingDocuments(invoice, tenantId);
    exceptions.push(...missingDocExceptions);

    // 2. Check for variance breaches
    const varianceExceptions = await this.detectVarianceBreaches(invoice, tenantId);
    exceptions.push(...varianceExceptions);

    // 3. Check for aging thresholds
    const agingExceptions = await this.detectAgingThresholds(invoice, tenantId);
    exceptions.push(...agingExceptions);

    // 4. Check for matching failures
    const matchingExceptions = await this.detectMatchingFailures(invoice, tenantId);
    exceptions.push(...matchingExceptions);

    // 5. Check for approval overdue
    const approvalExceptions = await this.detectApprovalOverdue(invoice, tenantId);
    exceptions.push(...approvalExceptions);

    // 6. Check for payment delays
    const paymentExceptions = await this.detectPaymentDelays(invoice, tenantId);
    exceptions.push(...paymentExceptions);

    // 7. Check for invalid data
    const dataExceptions = await this.detectInvalidData(invoice, tenantId);
    exceptions.push(...dataExceptions);

    return exceptions;
  }

  /**
   * Detect missing documents
   */
  private async detectMissingDocuments(invoice: unknown, tenantId: string): Promise<InvoiceException[]> {
    const exceptions: InvoiceException[] = [];
    const inv = invoice as Record<string, unknown>;

    // Check for missing PO
    if (!inv.po_ref && inv.status !== 'PAID') {
      exceptions.push({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        invoice_id: inv.id as string,
        exception_type: 'MISSING_DOCUMENT',
        severity: 'high',
        status: 'open',
        title: 'Missing Purchase Order',
        description: `Invoice ${inv.invoice_number || inv.invoice_num} is missing Purchase Order reference`,
        exception_data: {
          missing_document: 'PO',
          invoice_number: inv.invoice_number || inv.invoice_num,
        },
        detected_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Check for missing GRN (if PO exists)
    if (inv.po_ref && !inv.grn_ref && inv.status !== 'PAID') {
      exceptions.push({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        invoice_id: inv.id as string,
        exception_type: 'MISSING_DOCUMENT',
        severity: 'high',
        status: 'open',
        title: 'Missing Goods Receipt Note',
        description: `Invoice ${inv.invoice_number || inv.invoice_num} has PO ${inv.po_ref} but missing GRN`,
        exception_data: {
          missing_document: 'GRN',
          po_ref: inv.po_ref,
          invoice_number: inv.invoice_number || inv.invoice_num,
        },
        detected_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return exceptions;
  }

  /**
   * Detect variance breaches
   */
  private async detectVarianceBreaches(invoice: unknown, tenantId: string): Promise<InvoiceException[]> {
    const exceptions: InvoiceException[] = [];
    const inv = invoice as Record<string, unknown>;

    // Get 3-way matching result
    const { data: match } = await this.supabase
      .from('three_way_matching')
      .select('*')
      .eq('invoice_id', inv.id as string)
      .eq('tenant_id', tenantId)
      .limit(1)
      .single();

    if (match) {
      const varianceAmount = Math.abs(match.variance_amount || 0);
      const varianceThreshold = 100; // TODO: Get from configuration

      if (varianceAmount > varianceThreshold) {
        const severity: ExceptionSeverity = varianceAmount > 1000 ? 'critical' : varianceAmount > 500 ? 'high' : 'medium';

        exceptions.push({
          id: crypto.randomUUID(),
          tenant_id: tenantId,
          invoice_id: inv.id as string,
          exception_type: 'VARIANCE_BREACH',
          severity,
          status: 'open',
          title: 'Amount Variance Exceeds Threshold',
          description: `Invoice amount variance: ${varianceAmount.toFixed(2)}. Threshold: ${varianceThreshold}`,
          exception_data: {
            variance_amount: varianceAmount,
            threshold: varianceThreshold,
            po_amount: match.po_amount,
            grn_amount: match.grn_amount,
            invoice_amount: match.invoice_amount,
          },
          detected_at: new Date().toISOString(),
          resolved_at: null,
          resolved_by: null,
          resolution_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    return exceptions;
  }

  /**
   * Detect aging thresholds
   */
  private async detectAgingThresholds(invoice: unknown, tenantId: string): Promise<InvoiceException[]> {
    const exceptions: InvoiceException[] = [];
    const inv = invoice as Record<string, unknown>;

    const invoiceDate = new Date(inv.invoice_date as string);
    const daysSinceInvoice = Math.floor((Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));

    // Aging thresholds
    const warningThreshold = 30; // 30 days
    const criticalThreshold = 60; // 60 days

    if (daysSinceInvoice > criticalThreshold && inv.status !== 'PAID') {
      exceptions.push({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        invoice_id: inv.id as string,
        exception_type: 'AGING_THRESHOLD',
        severity: 'critical',
        status: 'open',
        title: 'Invoice Aging Critical',
        description: `Invoice ${inv.invoice_number || inv.invoice_num} is ${daysSinceInvoice} days old (critical threshold: ${criticalThreshold} days)`,
        exception_data: {
          days_old: daysSinceInvoice,
          threshold: criticalThreshold,
          invoice_date: inv.invoice_date,
        },
        detected_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else if (daysSinceInvoice > warningThreshold && inv.status !== 'PAID') {
      exceptions.push({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        invoice_id: inv.id as string,
        exception_type: 'AGING_THRESHOLD',
        severity: 'medium',
        status: 'open',
        title: 'Invoice Aging Warning',
        description: `Invoice ${inv.invoice_number || inv.invoice_num} is ${daysSinceInvoice} days old (warning threshold: ${warningThreshold} days)`,
        exception_data: {
          days_old: daysSinceInvoice,
          threshold: warningThreshold,
          invoice_date: inv.invoice_date,
        },
        detected_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return exceptions;
  }

  /**
   * Detect matching failures
   */
  private async detectMatchingFailures(invoice: unknown, tenantId: string): Promise<InvoiceException[]> {
    const exceptions: InvoiceException[] = [];
    const inv = invoice as Record<string, unknown>;

    // Get 3-way matching result
    const { data: match } = await this.supabase
      .from('three_way_matching')
      .select('*')
      .eq('invoice_id', inv.id as string)
      .eq('tenant_id', tenantId)
      .limit(1)
      .single();

    if (match && match.matching_status === 'mismatch') {
      exceptions.push({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        invoice_id: inv.id as string,
        exception_type: 'MATCHING_FAILURE',
        severity: match.matching_score && match.matching_score < 50 ? 'critical' : 'high',
        status: 'open',
        title: '3-Way Matching Failure',
        description: `Invoice ${inv.invoice_number || inv.invoice_num} failed 3-way matching. Score: ${match.matching_score || 0}/100`,
        exception_data: {
          matching_status: match.matching_status,
          matching_score: match.matching_score,
          variance_amount: match.variance_amount,
        },
        detected_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return exceptions;
  }

  /**
   * Detect approval overdue
   */
  private async detectApprovalOverdue(invoice: unknown, tenantId: string): Promise<InvoiceException[]> {
    const exceptions: InvoiceException[] = [];
    const inv = invoice as Record<string, unknown>;

    // Check if invoice is in UNDER_REVIEW status for too long
    if (inv.status === 'UNDER_REVIEW' && inv.status_changed_at) {
      const statusChangedDate = new Date(inv.status_changed_at as string);
      const daysInReview = Math.floor((Date.now() - statusChangedDate.getTime()) / (1000 * 60 * 60 * 24));
      const reviewThreshold = 7; // 7 days

      if (daysInReview > reviewThreshold) {
        exceptions.push({
          id: crypto.randomUUID(),
          tenant_id: tenantId,
          invoice_id: inv.id as string,
          exception_type: 'APPROVAL_OVERDUE',
          severity: daysInReview > 14 ? 'critical' : 'high',
          status: 'open',
          title: 'Approval Overdue',
          description: `Invoice ${inv.invoice_number || inv.invoice_num} has been under review for ${daysInReview} days (threshold: ${reviewThreshold} days)`,
          exception_data: {
            days_in_review: daysInReview,
            threshold: reviewThreshold,
            status_changed_at: inv.status_changed_at,
          },
          detected_at: new Date().toISOString(),
          resolved_at: null,
          resolved_by: null,
          resolution_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    return exceptions;
  }

  /**
   * Detect payment delays
   */
  private async detectPaymentDelays(invoice: unknown, tenantId: string): Promise<InvoiceException[]> {
    const exceptions: InvoiceException[] = [];
    const inv = invoice as Record<string, unknown>;

    // Check if invoice is APPROVED_FOR_PAYMENT but payment is delayed
    if (inv.status === 'APPROVED_FOR_PAYMENT' && inv.expected_payment_date) {
      const expectedPaymentDate = new Date(inv.expected_payment_date as string);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expectedPaymentDate < today) {
        const daysOverdue = Math.floor((today.getTime() - expectedPaymentDate.getTime()) / (1000 * 60 * 60 * 24));

        exceptions.push({
          id: crypto.randomUUID(),
          tenant_id: tenantId,
          invoice_id: inv.id as string,
          exception_type: 'PAYMENT_DELAYED',
          severity: daysOverdue > 14 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium',
          status: 'open',
          title: 'Payment Delayed',
          description: `Invoice ${inv.invoice_number || inv.invoice_num} payment is ${daysOverdue} days overdue. Expected: ${inv.expected_payment_date}`,
          exception_data: {
            days_overdue: daysOverdue,
            expected_payment_date: inv.expected_payment_date,
            invoice_amount: inv.amount,
          },
          detected_at: new Date().toISOString(),
          resolved_at: null,
          resolved_by: null,
          resolution_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    return exceptions;
  }

  /**
   * Detect invalid data
   */
  private async detectInvalidData(invoice: unknown, tenantId: string): Promise<InvoiceException[]> {
    const exceptions: InvoiceException[] = [];
    const inv = invoice as Record<string, unknown>;

    // Check for missing required fields
    if (!inv.invoice_number && !inv.invoice_num) {
      exceptions.push({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        invoice_id: inv.id as string,
        exception_type: 'DATA_INVALID',
        severity: 'high',
        status: 'open',
        title: 'Missing Invoice Number',
        description: 'Invoice is missing invoice number',
        exception_data: {
          missing_field: 'invoice_number',
        },
        detected_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (!inv.invoice_date) {
      exceptions.push({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        invoice_id: inv.id as string,
        exception_type: 'DATA_INVALID',
        severity: 'high',
        status: 'open',
        title: 'Missing Invoice Date',
        description: 'Invoice is missing invoice date',
        exception_data: {
          missing_field: 'invoice_date',
        },
        detected_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const amount = typeof inv.amount === 'number' ? inv.amount : 0;
    if (!inv.amount || amount <= 0) {
      exceptions.push({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        invoice_id: inv.id as string,
        exception_type: 'DATA_INVALID',
        severity: 'high',
        status: 'open',
        title: 'Invalid Invoice Amount',
        description: 'Invoice amount is missing or invalid',
        exception_data: {
          invalid_field: 'amount',
          current_value: inv.amount,
        },
        detected_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return exceptions;
  }

  /**
   * Get severity icon
   */
  getSeverityIcon(severity: ExceptionSeverity): string {
    const icons: Record<ExceptionSeverity, string> = {
      critical: '🔴',
      high: '🔴',
      medium: '🟠',
      low: '🟢',
    };
    return icons[severity] || '🟢';
  }

  /**
   * Get severity label
   */
  getSeverityLabel(severity: ExceptionSeverity): string {
    const labels: Record<ExceptionSeverity, string> = {
      critical: 'Blocking',
      high: 'Blocking',
      medium: 'Needs Action',
      low: 'Safe',
    };
    return labels[severity] || 'Safe';
  }
}

