/**
 * Invoice Rejection Server Actions with Code Enforcement
 * 
 * PRD A-03: System-Enforced Rejection (MUST)
 * - Standardized rejection reasons (select, not type)
 * - No free-text rejection reasons
 * - Vendor sees exactly the same reason AP sees
 */

'use server';

import { revalidatePath } from 'next/cache';
import { RejectionRepository, type RejectInvoiceParams } from '@/src/repositories/rejection-repository';

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

export async function rejectInvoiceAction(
  invoiceId: string,
  formData: FormData
) {
  try {
    const ctx = getRequestContext();
    const rejectionRepo = new RejectionRepository();

    // Validate required fields
    const reasonCode = formData.get('reason_code') as string;
    if (!reasonCode) {
      return {
        error: 'Rejection reason code is required',
      };
    }

    // Validate reason code is not free text
    const validReasonCodes = [
      'REJECT_MISSING_PO',
      'REJECT_MISSING_GRN',
      'REJECT_MISSING_CONTRACT',
      'REJECT_VARIANCE_EXCEEDED',
      'REJECT_MATCHING_FAILED',
      'REJECT_INVALID_INVOICE_NUMBER',
      'REJECT_INVALID_DATE',
      'REJECT_INVALID_AMOUNT',
      'REJECT_CUTOFF_MISSED',
      'REJECT_APPROVAL_LIMIT_EXCEEDED',
      'REJECT_VENDOR_SUSPENDED',
      'REJECT_OTHER',
    ];

    if (!validReasonCodes.includes(reasonCode)) {
      return {
        error: `Invalid rejection reason code. Must be one of: ${validReasonCodes.join(', ')}`,
      };
    }

    const params: RejectInvoiceParams = {
      reason_code: reasonCode,
      explanation: formData.get('explanation') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    await rejectionRepo.rejectInvoice(
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
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to reject invoice',
    };
  }
}

export async function getRejectionReasonCodesAction() {
  try {
    const ctx = getRequestContext();
    const rejectionRepo = new RejectionRepository();

    const reasonCodes = await rejectionRepo.getRejectionReasonCodes(
      ctx.actor.tenantId || 'default'
    );

    return { success: true, reason_codes: reasonCodes };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get rejection reason codes',
    };
  }
}

export async function checkApprovalRulesAction(invoiceId: string) {
  try {
    const ctx = getRequestContext();
    const rejectionRepo = new RejectionRepository();

    const violations = await rejectionRepo.checkApprovalRules(
      invoiceId,
      ctx.actor.tenantId || 'default'
    );

    return { success: true, violations };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to check approval rules',
    };
  }
}

