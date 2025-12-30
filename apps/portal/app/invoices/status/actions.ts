/**
 * Invoice Status Server Actions with Reason Code Enforcement
 * 
 * PRD V-01: Payment Status Transparency (MUST)
 * - Status changes must include reason codes
 * - No status changes without explanations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { InvoiceStatusRepository, type InvoiceStatus, type UpdateInvoiceStatusParams } from '@/src/repositories/invoice-status-repository';

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

export async function updateInvoiceStatusAction(
  invoiceId: string,
  formData: FormData
) {
  try {
    const ctx = getRequestContext();
    const statusRepo = new InvoiceStatusRepository();

    // Validate required fields
    const status = formData.get('status') as InvoiceStatus;
    const reasonCode = formData.get('reason_code') as string;

    if (!status || !reasonCode) {
      return {
        error: 'Status and reason_code are required',
      };
    }

    // Validate status is canonical
    const validStatuses: InvoiceStatus[] = ['RECEIVED', 'UNDER_REVIEW', 'REJECTED', 'APPROVED_FOR_PAYMENT', 'PAID'];
    if (!validStatuses.includes(status)) {
      return {
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      };
    }

    const params: UpdateInvoiceStatusParams = {
      status,
      reason_code: reasonCode,
      reason_text: formData.get('reason_text') as string || undefined,
      notes: formData.get('notes') as string || undefined,
      expected_next_step: formData.get('expected_next_step') as string || undefined,
      expected_payment_date: formData.get('expected_payment_date') as string || undefined,
    };

    const statusInfo = await statusRepo.updateStatus(
      invoiceId,
      params,
      ctx.actor.userId,
      ctx.actor.tenantId || 'default',
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, status_info: statusInfo };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update invoice status',
    };
  }
}

export async function getInvoiceStatusInfoAction(invoiceId: string) {
  try {
    const ctx = getRequestContext();
    const statusRepo = new InvoiceStatusRepository();

    const statusInfo = await statusRepo.getStatusInfo(
      invoiceId,
      ctx.actor.tenantId || 'default'
    );

    return { success: true, status_info: statusInfo };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get invoice status',
    };
  }
}

export async function getStatusReasonsAction(status: InvoiceStatus) {
  try {
    const ctx = getRequestContext();
    const statusRepo = new InvoiceStatusRepository();

    const reasons = await statusRepo.getReasonsByStatus(
      ctx.actor.tenantId || 'default',
      status
    );

    return { success: true, reasons };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get status reasons',
    };
  }
}

