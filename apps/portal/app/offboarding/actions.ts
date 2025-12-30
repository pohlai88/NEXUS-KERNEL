/**
 * Offboarding Server Actions
 * 
 * Next.js 16 Server Actions for supplier offboarding workflow.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { SupplierOffboardingRepository } from '@/src/repositories/supplier-offboarding-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      vendorId: 'default', // TODO: Get from vendor_user_access
      tenantId: 'default', // TODO: Get from auth
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export async function createOffboardingAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const offboardingRepo = new SupplierOffboardingRepository();

    const params = {
      tenant_id: ctx.actor.tenantId || 'default',
      vendor_id: formData.get('vendor_id') as string,
      company_id: formData.get('company_id') as string || 'default',
      reason: formData.get('reason') as string,
      effective_date: formData.get('effective_date') as string | undefined,
    };

    // Validate required fields
    if (!params.vendor_id || !params.reason) {
      return {
        error: 'Vendor ID and reason are required',
      };
    }

    const offboarding = await offboardingRepo.create(
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/vendor/offboarding');
    revalidatePath('/vendor/dashboard');
    return { success: true, offboarding_id: offboarding.id, case_id: offboarding.case_id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create offboarding request',
    };
  }
}

export async function cancelOffboardingAction(
  offboardingId: string,
  formData: FormData
) {
  try {
    const ctx = getRequestContext();
    const offboardingRepo = new SupplierOffboardingRepository();

    const reason = formData.get('cancellation_reason') as string;
    if (!reason) {
      return {
        error: 'Cancellation reason is required',
      };
    }

    const offboarding = await offboardingRepo.cancel(
      offboardingId,
      reason,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/vendor/offboarding');
    revalidatePath(`/vendor/offboarding/${offboardingId}`);
    return { success: true, offboarding };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to cancel offboarding',
    };
  }
}

