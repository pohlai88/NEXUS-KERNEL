/**
 * Matching Server Actions with Audit Trail
 * 
 * Server Actions for 3-way matching and SOA auto-matching operations.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { ThreeWayMatchingRepository } from '@/src/repositories/three-way-matching-repository';
import { SOAMatchingRepository } from '@/src/repositories/soa-matching-repository';

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

export async function matchThreeWayAction(
  purchaseOrderId: string,
  goodsReceiptNoteId: string,
  invoiceId: string
) {
  try {
    const ctx = getRequestContext();
    const matchingRepo = new ThreeWayMatchingRepository();

    const result = await matchingRepo.matchDocuments(
      {
        purchase_order_id: purchaseOrderId,
        goods_receipt_note_id: goodsReceiptNoteId,
        invoice_id: invoiceId,
        tenant_id: ctx.actor.tenantId || 'default',
      },
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/invoices');
    revalidatePath('/matching');
    return { success: true, match: result };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to perform 3-way matching',
    };
  }
}

export async function approveMatchAction(matchId: string) {
  try {
    const ctx = getRequestContext();
    const matchingRepo = new ThreeWayMatchingRepository();

    const match = await matchingRepo.approveMatch(
      matchId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/matching');
    revalidatePath(`/matching/${matchId}`);
    return { success: true, match };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to approve match',
    };
  }
}

export async function autoMatchSOAAction(
  soaDocumentId: string,
  soaPeriodStart: string,
  soaPeriodEnd: string,
  vendorId: string,
  companyId: string
) {
  try {
    const ctx = getRequestContext();
    const soaRepo = new SOAMatchingRepository();

    const result = await soaRepo.autoMatch(
      {
        soa_document_id: soaDocumentId,
        soa_period_start: soaPeriodStart,
        soa_period_end: soaPeriodEnd,
        tenant_id: ctx.actor.tenantId || 'default',
        vendor_id: vendorId,
        company_id: companyId,
      },
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/soa');
    revalidatePath(`/soa/${soaDocumentId}`);
    return { success: true, match: result };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to auto-match SOA',
    };
  }
}

