/**
 * Quotation Server Actions with Audit Trail
 * 
 * Server Actions for quotation operations with automatic audit trail logging.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { QuotationRepository, type CreateQuotationParams, type UpdateQuotationParams } from '@/src/repositories/quotation-repository';

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

export async function createQuotationAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const quotationRepo = new QuotationRepository();

    const params: CreateQuotationParams = {
      tenant_id: ctx.actor.tenantId || 'default',
      vendor_id: formData.get('vendor_id') as string,
      company_id: formData.get('company_id') as string,
      quotation_number: formData.get('quotation_number') as string,
      quotation_date: formData.get('quotation_date') as string,
      valid_until: formData.get('valid_until') as string,
      subject: formData.get('subject') as string,
      description: formData.get('description') as string || undefined,
      line_items: JSON.parse(formData.get('line_items') as string),
      subtotal: parseFloat(formData.get('subtotal') as string),
      tax_amount: parseFloat(formData.get('tax_amount') as string),
      total_amount: parseFloat(formData.get('total_amount') as string),
      currency_code: formData.get('currency_code') as string,
      document_url: formData.get('document_url') as string || undefined,
    };

    const quotation = await quotationRepo.create(
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/quotations');
    return { success: true, quotation_id: quotation.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create quotation',
    };
  }
}

export async function updateQuotationAction(
  quotationId: string,
  formData: FormData
) {
  try {
    const ctx = getRequestContext();
    const quotationRepo = new QuotationRepository();

    const params: UpdateQuotationParams = {};

    if (formData.get('subject')) {
      params.subject = formData.get('subject') as string;
    }

    if (formData.get('description')) {
      params.description = formData.get('description') as string;
    }

    if (formData.get('line_items')) {
      params.line_items = JSON.parse(formData.get('line_items') as string);
    }

    if (formData.get('subtotal')) {
      params.subtotal = parseFloat(formData.get('subtotal') as string);
    }

    if (formData.get('tax_amount')) {
      params.tax_amount = parseFloat(formData.get('tax_amount') as string);
    }

    if (formData.get('total_amount')) {
      params.total_amount = parseFloat(formData.get('total_amount') as string);
    }

    if (formData.get('valid_until')) {
      params.valid_until = formData.get('valid_until') as string;
    }

    if (formData.get('document_url')) {
      params.document_url = formData.get('document_url') as string;
    }

    const updatedQuotation = await quotationRepo.update(
      quotationId,
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/quotations');
    revalidatePath(`/quotations/${quotationId}`);
    return { success: true, quotation: updatedQuotation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update quotation',
    };
  }
}

export async function submitQuotationAction(quotationId: string) {
  try {
    const ctx = getRequestContext();
    const quotationRepo = new QuotationRepository();

    const submittedQuotation = await quotationRepo.submit(
      quotationId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/quotations');
    revalidatePath(`/quotations/${quotationId}`);
    return { success: true, quotation: submittedQuotation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to submit quotation',
    };
  }
}

export async function approveQuotationAction(quotationId: string) {
  try {
    const ctx = getRequestContext();
    const quotationRepo = new QuotationRepository();

    const approvedQuotation = await quotationRepo.approve(
      quotationId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/quotations');
    revalidatePath(`/quotations/${quotationId}`);
    return { success: true, quotation: approvedQuotation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to approve quotation',
    };
  }
}

export async function rejectQuotationAction(quotationId: string, reason: string) {
  try {
    const ctx = getRequestContext();
    const quotationRepo = new QuotationRepository();

    const rejectedQuotation = await quotationRepo.reject(
      quotationId,
      reason,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/quotations');
    revalidatePath(`/quotations/${quotationId}`);
    return { success: true, quotation: rejectedQuotation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to reject quotation',
    };
  }
}

export async function acceptQuotationAction(quotationId: string) {
  try {
    const ctx = getRequestContext();
    const quotationRepo = new QuotationRepository();

    const acceptedQuotation = await quotationRepo.accept(
      quotationId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/quotations');
    revalidatePath(`/quotations/${quotationId}`);
    return { success: true, quotation: acceptedQuotation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to accept quotation',
    };
  }
}

