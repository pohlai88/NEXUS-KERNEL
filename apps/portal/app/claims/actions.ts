/**
 * Employee Claims Server Actions
 *
 * Claims as Invoices: Same process, same database.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { EmployeeClaimRepository } from '@/src/repositories/employee-claim-repository';
import { EmployeeClaimSchema } from '@nexus/kernel';

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

export async function submitClaimAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const claimRepo = new EmployeeClaimRepository();

    // Parse form data
    const claimData = {
      employee_id: formData.get('employee_id') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      merchant_name: formData.get('merchant_name') as string,
      claim_date: formData.get('claim_date') as string,
      receipt_url: formData.get('receipt_url') as string,
      receipt_file_id: formData.get('receipt_file_id') as string || undefined,
      metadata: formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : undefined,
      charge_to_tenant_id: formData.get('charge_to_tenant_id') as string || undefined,
      tenant_id: ctx.actor.tenantId || 'default',
    };

    // Validate against schema
    const validated = EmployeeClaimSchema.parse(claimData);

    // Create claim (Code Gate runs here) - add tenant_id for CreateClaimParams
    const claim = await claimRepo.create({
      ...validated,
      tenant_id: claimData.tenant_id,
    }, {
      request_id: ctx.requestId,
    });

    revalidatePath('/claims');
    revalidatePath('/claims/my-claims');
    return { success: true, claim_id: claim.id, auto_approved: claim.status === 'APPROVED' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to submit claim',
    };
  }
}

