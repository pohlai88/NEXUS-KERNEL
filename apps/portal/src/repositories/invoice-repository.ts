/**
 * Invoice Repository with Auto-Linking
 *
 * PRD V-02: Zero Re-Typing Principle (MUST)
 * - Vendor uploads invoice once
 * - System auto-links all available data
 * - Missing items trigger specific prompts with upload actions
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';
import { InvoiceAutoLinkService, type InvoiceUploadData, type AutoLinkResult } from '../services/invoice-auto-link-service';
import { InvoiceStatusRepository } from './invoice-status-repository';
import { ThreeWayMatchingRepository } from './three-way-matching-repository';
import { AutoApprovalRepository } from './auto-approval-repository';
import { PaymentAutoProcessor } from '../services/payment-auto-processor';

export interface Invoice {
  id: string;
  tenant_id: string;
  vendor_id: string;
  company_id: string | null;
  invoice_num: string | null;
  invoice_number: string | null;
  invoice_date: string;
  amount: number | null;
  currency_code: string;
  status: string;
  source_system: string;
  po_ref: string | null;
  grn_ref: string | null;
  description: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceParams {
  tenant_id: string;
  vendor_id: string;
  company_id?: string;
  invoice_number: string;
  invoice_date: string;
  amount?: number;
  currency_code?: string;
  po_ref?: string;
  grn_ref?: string;
  description?: string;
  due_date?: string;
  document_id?: string;
}

export interface UploadInvoiceParams {
  tenant_id: string;
  uploaded_by: string;
  file: File;
  invoice_data: InvoiceUploadData;
}

export interface UploadInvoiceResult {
  invoice: Invoice;
  auto_link_result: AutoLinkResult;
  requires_action: boolean;
}

export class InvoiceRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();
  private autoLinkService = new InvoiceAutoLinkService();
  private statusRepo = new InvoiceStatusRepository();
  private matchingRepo = new ThreeWayMatchingRepository();
  private autoApprovalRepo = new AutoApprovalRepository();
  private paymentProcessor = new PaymentAutoProcessor();

  /**
   * Upload invoice with auto-linking
   * PRD V-02: Vendor uploads invoice once, system auto-links everything
   */
  async uploadInvoice(
    params: UploadInvoiceParams,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<UploadInvoiceResult> {
    // 1. Auto-link vendor data
    const autoLinkResult = await this.autoLinkService.autoLink(
      params.invoice_data,
      params.tenant_id,
      params.uploaded_by
    );

    // 2. Check for duplicate
    if (autoLinkResult.duplicate_detected) {
      throw new Error(`Duplicate invoice detected: ${params.invoice_data.invoice_number}. Invoice ID: ${autoLinkResult.duplicate_invoice_id}`);
    }

    // 3. Validate vendor is linked
    if (!autoLinkResult.vendor_id) {
      throw new Error('Vendor not found. Please create vendor or select existing vendor before uploading invoice.');
    }

    // 4. Upload document to storage
    const documentId = await this.uploadDocumentFile(params.file, params.tenant_id, params.uploaded_by);

    // 5. Create invoice record
    const invoiceParams: CreateInvoiceParams = {
      tenant_id: params.tenant_id,
      vendor_id: autoLinkResult.vendor_id,
      invoice_number: params.invoice_data.invoice_number || 'TBD', // Required field, use placeholder if not provided
      invoice_date: params.invoice_data.invoice_date || new Date().toISOString().split('T')[0],
      amount: params.invoice_data.amount || undefined,
      currency_code: 'USD', // TODO: Detect from invoice or use vendor default
      po_ref: params.invoice_data.po_number || undefined,
      document_id: documentId,
    };

    const invoice = await this.create(invoiceParams, params.uploaded_by, requestContext);

    // 6. Set initial status with reason code
    await this.statusRepo.updateStatus(
      invoice.id,
      {
        status: 'RECEIVED',
        reason_code: 'RECEIVED_AUTO',
        reason_text: 'Invoice automatically received and processed',
      },
      params.uploaded_by,
      params.tenant_id,
      requestContext
    );

    // 7. Try auto-matching and auto-approval (if PO exists)
    let autoApproved = false;
    let paymentCreated = false;
    const poRef = params.invoice_data.po_number;

    if (poRef || autoLinkResult.po_linked) {
      try {
        // Get PO and GRN IDs (only if poRef is defined)
        const poId = poRef ? await this.findPOId(poRef, params.tenant_id) : null;
        const grnId = poRef ? await this.findGRNId(poRef, params.tenant_id) : null; // GRN typically references PO

        if (poId && grnId) {
          // Perform 3-way matching
          const matchResult = await this.matchingRepo.matchDocuments(
            {
              purchase_order_id: poId,
              goods_receipt_note_id: grnId,
              invoice_id: invoice.id,
              tenant_id: params.tenant_id,
            },
            'system',
            requestContext
          );

          // Check auto-approval
          const approvalResult = await this.autoApprovalRepo.checkAutoApproval(
            invoice.id,
            params.tenant_id
          );

          if (approvalResult.approved) {
            // Auto-approve invoice
            await this.statusRepo.updateStatus(
              invoice.id,
              {
                status: 'APPROVED_FOR_PAYMENT',
                reason_code: 'AUTO_APPROVED',
                reason_text: `Auto-approved: ${approvalResult.reason}. Matching score: ${approvalResult.matching_score}%`,
              },
              'system',
              params.tenant_id,
              requestContext
            );

            autoApproved = true;

            // Auto-process payment (creates payment in standalone mode, or marks for ERP sync)
            if (invoice.amount && invoice.currency_code) {
              const paymentResult = await this.paymentProcessor.autoProcessPayment({
                invoice_id: invoice.id,
                tenant_id: params.tenant_id,
                vendor_id: invoice.vendor_id,
                company_id: invoice.company_id || '',
                amount: invoice.amount,
                currency_code: invoice.currency_code,
                due_date: invoice.due_date || '',
                approved_by: 'system',
                requestContext,
              });

              paymentCreated = paymentResult.payment_created;
            }
          }
        }
      } catch (error) {
        // If auto-approval fails, invoice stays in RECEIVED status for manual review
        console.error('Auto-approval failed:', error);
        // Invoice remains in RECEIVED status - will show in Exception Handler dashboard
      }
    }

    // 8. Determine if action is required
    const requiresAction = autoLinkResult.missing_items.length > 0 || !autoApproved;

    return {
      invoice,
      auto_link_result: autoLinkResult,
      requires_action: requiresAction,
    };
  }

  /**
   * Create invoice with audit trail
   */
  async create(
    params: CreateInvoiceParams,
    createdBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Invoice> {
    // Insert invoice
    const { data: invoiceData, error } = await this.supabase
      .from('vmp_invoices')
      .insert({
        vendor_id: params.vendor_id,
        company_id: params.company_id || null,
        invoice_num: params.invoice_number || null,
        invoice_number: params.invoice_number || null,
        invoice_date: params.invoice_date,
        amount: params.amount || null,
        currency_code: params.currency_code || 'USD',
        status: 'pending', // Will be updated to RECEIVED by status repo
        source_system: 'manual',
        po_ref: params.po_ref || null,
        grn_ref: params.grn_ref || null,
        description: params.description || null,
        due_date: params.due_date || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'invoice',
      entity_id: invoiceData.id,
      action: 'create',
      action_by: createdBy,
      new_state: invoiceData,
      workflow_stage: 'received',
      workflow_state: {
        vendor_id: params.vendor_id,
        invoice_number: params.invoice_number,
        source: 'manual_upload',
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToInvoice(invoiceData);
  }

  /**
   * Find PO ID by PO reference
   */
  private async findPOId(poRef: string, tenantId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('vmp_po_refs')
      .select('id')
      .eq('po_number', poRef)
      .limit(1)
      .single();

    return data?.id || null;
  }

  /**
   * Find GRN ID by GRN reference
   */
  private async findGRNId(grnRef: string, tenantId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('vmp_grn_refs')
      .select('id')
      .eq('grn_number', grnRef)
      .limit(1)
      .single();

    return data?.id || null;
  }

  /**
   * Upload document file to storage
   */
  private async uploadDocumentFile(file: File, tenantId: string, uploadedBy: string): Promise<string> {
    // TODO: Implement actual file upload to Supabase Storage
    // For now, return a placeholder document ID
    // In production, this should:
    // 1. Upload file to Supabase Storage bucket
    // 2. Create document record in documents table
    // 3. Create document_version record
    // 4. Return document ID

    const { data: documentData, error } = await this.supabase
      .from('documents')
      .insert({
        tenant_id: tenantId,
        name: file.name,
        type: file.type,
        category: 'invoice',
        file_url: `placeholder/${file.name}`, // TODO: Actual storage URL
        file_size: file.size,
        mime_type: file.type,
        organization_id: tenantId, // TODO: Get from context
        is_shared: false,
        version: 1,
        created_by: uploadedBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    return documentData.id;
  }

  /**
   * Get invoice by ID
   */
  async getById(invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await this.supabase
      .from('vmp_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get invoice: ${error.message}`);
    }

    return this.mapRowToInvoice(data);
  }

  /**
   * Map database row to Invoice
   */
  private mapRowToInvoice(row: unknown): Invoice {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string || 'default',
      vendor_id: r.vendor_id as string,
      company_id: (r.company_id as string) || null,
      invoice_num: (r.invoice_num as string) || null,
      invoice_number: (r.invoice_number as string) || null,
      invoice_date: r.invoice_date as string,
      amount: (r.amount as number) || null,
      currency_code: (r.currency_code as string) || 'USD',
      status: r.status as string,
      source_system: r.source_system as string,
      po_ref: (r.po_ref as string) || null,
      grn_ref: (r.grn_ref as string) || null,
      description: (r.description as string) || null,
      due_date: (r.due_date as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}

// Re-export types for convenience
export type { InvoiceUploadData, AutoLinkResult } from '../services/invoice-auto-link-service';

