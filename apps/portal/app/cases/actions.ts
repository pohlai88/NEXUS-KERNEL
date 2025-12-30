/**
 * Case Management Server Actions with Audit Trail
 * 
 * Server Actions for case operations with automatic audit trail logging.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { CaseRepository, type CreateCaseParams, type UpdateCaseParams } from '@/src/repositories/case-repository';

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

export async function createCaseAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const caseRepo = new CaseRepository();

    const params: CreateCaseParams = {
      tenant_id: ctx.actor.tenantId || 'default',
      company_id: formData.get('company_id') as string,
      vendor_id: formData.get('vendor_id') as string,
      case_type: formData.get('case_type') as CreateCaseParams['case_type'],
      subject: formData.get('subject') as string,
      owner_team: formData.get('owner_team') as CreateCaseParams['owner_team'],
      linked_invoice_id: formData.get('linked_invoice_id') as string || undefined,
      linked_po_id: formData.get('linked_po_id') as string || undefined,
      linked_grn_id: formData.get('linked_grn_id') as string || undefined,
      linked_payment_id: formData.get('linked_payment_id') as string || undefined,
      tags: formData.get('tags') ? (formData.get('tags') as string).split(',') : undefined,
      sla_due_at: formData.get('sla_due_at') as string || undefined,
    };

    const newCase = await caseRepo.create(
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/cases');
    return { success: true, case_id: newCase.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create case',
    };
  }
}

export async function updateCaseAction(
  caseId: string,
  formData: FormData
) {
  try {
    const ctx = getRequestContext();
    const caseRepo = new CaseRepository();

    const params: UpdateCaseParams = {};

    if (formData.get('status')) {
      params.status = formData.get('status') as UpdateCaseParams['status'];
    }

    if (formData.get('assigned_to_user_id')) {
      params.assigned_to_user_id = formData.get('assigned_to_user_id') as string;
    }

    if (formData.get('owner_team')) {
      params.owner_team = formData.get('owner_team') as UpdateCaseParams['owner_team'];
    }

    if (formData.get('subject')) {
      params.subject = formData.get('subject') as string;
    }

    if (formData.get('tags')) {
      params.tags = (formData.get('tags') as string).split(',');
    }

    const updatedCase = await caseRepo.update(
      caseId,
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/cases');
    revalidatePath(`/cases/${caseId}`);
    return { success: true, case: updatedCase };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update case',
    };
  }
}

export async function assignCaseAction(
  caseId: string,
  assignedToUserId: string | null,
  ownerTeam: 'procurement' | 'ap' | 'finance'
) {
  try {
    const ctx = getRequestContext();
    const caseRepo = new CaseRepository();

    const updatedCase = await caseRepo.assign(
      caseId,
      assignedToUserId,
      ownerTeam,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/cases');
    revalidatePath(`/cases/${caseId}`);
    return { success: true, case: updatedCase };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to assign case',
    };
  }
}

export async function resolveCaseAction(caseId: string) {
  try {
    const ctx = getRequestContext();
    const caseRepo = new CaseRepository();

    const resolvedCase = await caseRepo.resolve(
      caseId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/cases');
    revalidatePath(`/cases/${caseId}`);
    return { success: true, case: resolvedCase };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to resolve case',
    };
  }
}

