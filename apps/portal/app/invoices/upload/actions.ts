/**
 * Invoice Upload Server Actions with Auto-Linking
 * 
 * PRD V-02: Zero Re-Typing Principle (MUST)
 * - Vendor uploads invoice once
 * - System auto-links all available data
 * - Missing items trigger specific prompts with upload actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import { InvoiceRepository, type InvoiceUploadData } from '@/src/repositories/invoice-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: 'default', // TODO: Get from auth
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export async function uploadInvoiceAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const invoiceRepo = new InvoiceRepository();

    // Get file
    const file = formData.get('file') as File;
    if (!file) {
      return {
        error: 'File is required',
      };
    }

    // Extract invoice data from form or file metadata
    const invoiceData: InvoiceUploadData = {
      invoice_number: formData.get('invoice_number') as string || undefined,
      invoice_date: formData.get('invoice_date') as string || undefined,
      vendor_name: formData.get('vendor_name') as string || undefined,
      vendor_email: formData.get('vendor_email') as string || undefined,
      vendor_tax_id: formData.get('vendor_tax_id') as string || undefined,
      po_number: formData.get('po_number') as string || undefined,
      amount: formData.get('amount') ? parseFloat(formData.get('amount') as string) : undefined,
      file_name: file.name,
    };

    // Upload invoice with auto-linking
    const result = await invoiceRepo.uploadInvoice(
      {
        tenant_id: ctx.actor.tenantId || 'default',
        uploaded_by: ctx.actor.userId,
        file,
        invoice_data: invoiceData,
      },
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/invoices');
    return {
      success: true,
      invoice_id: result.invoice.id,
      auto_link_result: result.auto_link_result,
      requires_action: result.requires_action,
      missing_items: result.auto_link_result.missing_items,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to upload invoice',
    };
  }
}

export async function checkDuplicateInvoiceAction(invoiceNumber: string) {
  try {
    const { createClient } = await import('@/lib/supabase-client');
    const supabase = createClient();

    // Check for duplicate
    const { data, error } = await supabase
      .from('vmp_invoices')
      .select('id, invoice_num, invoice_number')
      .or(`invoice_num.eq.${invoiceNumber},invoice_number.eq.${invoiceNumber}`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return {
        error: error.message,
      };
    }

    return {
      success: true,
      is_duplicate: !!data,
      existing_invoice_id: data?.id || null,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to check duplicate',
    };
  }
}

