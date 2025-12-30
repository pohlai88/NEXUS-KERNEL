/**
 * Supplier Onboarding Server Actions with Audit Trail
 * 
 * Server Actions for supplier onboarding operations with automatic audit trail logging.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { SupplierOnboardingRepository, type CreateOnboardingParams, type UpdateOnboardingStageParams } from '@/src/repositories/supplier-onboarding-repository';

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

export async function createOnboardingAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const onboardingRepo = new SupplierOnboardingRepository();

    const params: CreateOnboardingParams = {
      tenant_id: ctx.actor.tenantId || 'default',
      vendor_id: formData.get('vendor_id') as string,
      company_id: formData.get('company_id') as string,
      required_documents: formData.get('required_documents') ? JSON.parse(formData.get('required_documents') as string) : undefined,
      checklist_items: formData.get('checklist_items') ? JSON.parse(formData.get('checklist_items') as string) : undefined,
    };

    const onboarding = await onboardingRepo.create(
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/onboarding');
    return { success: true, onboarding_id: onboarding.id, case_id: onboarding.case_id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create onboarding',
    };
  }
}

export async function updateOnboardingStageAction(
  onboardingId: string,
  formData: FormData
) {
  try {
    const ctx = getRequestContext();
    const onboardingRepo = new SupplierOnboardingRepository();

    const params: UpdateOnboardingStageParams = {};

    if (formData.get('stage')) {
      params.stage = formData.get('stage') as UpdateOnboardingStageParams['stage'];
    }

    if (formData.get('status')) {
      params.status = formData.get('status') as UpdateOnboardingStageParams['status'];
    }

    if (formData.get('submitted_documents')) {
      params.submitted_documents = JSON.parse(formData.get('submitted_documents') as string);
    }

    if (formData.get('verification_notes')) {
      params.verification_notes = formData.get('verification_notes') as string;
    }

    if (formData.get('rejected_reason')) {
      params.rejected_reason = formData.get('rejected_reason') as string;
    }

    const updatedOnboarding = await onboardingRepo.updateStage(
      onboardingId,
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/onboarding');
    revalidatePath(`/onboarding/${onboardingId}`);
    return { success: true, onboarding: updatedOnboarding };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update onboarding',
    };
  }
}

export async function approveOnboardingAction(onboardingId: string) {
  try {
    const ctx = getRequestContext();
    const onboardingRepo = new SupplierOnboardingRepository();

    const approvedOnboarding = await onboardingRepo.approve(
      onboardingId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/onboarding');
    revalidatePath(`/onboarding/${onboardingId}`);
    return { success: true, onboarding: approvedOnboarding };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to approve onboarding',
    };
  }
}

export async function rejectOnboardingAction(onboardingId: string, reason: string) {
  try {
    const ctx = getRequestContext();
    const onboardingRepo = new SupplierOnboardingRepository();

    const rejectedOnboarding = await onboardingRepo.reject(
      onboardingId,
      reason,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/onboarding');
    revalidatePath(`/onboarding/${onboardingId}`);
    return { success: true, onboarding: rejectedOnboarding };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to reject onboarding',
    };
  }
}

