/**
 * Break Glass Escalation Server Actions
 * 
 * SOS feature: Vendor can escalate directly to Senior Manager.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { BreakGlassRepository } from '@/src/repositories/break-glass-repository';

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

export async function createBreakGlassEscalationAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const breakGlassRepo = new BreakGlassRepository();

    const escalation = await breakGlassRepo.escalate(
      {
        tenant_id: ctx.actor.tenantId || 'default',
        escalation_type: formData.get('escalation_type') as 'sla_breach' | 'no_response' | 'staff_difficulty' | 'urgent_issue' | 'other',
        priority: (formData.get('priority') as 'high' | 'critical' | 'emergency') || 'critical',
        case_id: formData.get('case_id') as string || undefined,
        invoice_id: formData.get('invoice_id') as string || undefined,
        vendor_id: formData.get('vendor_id') as string,
        reason: formData.get('reason') as string,
        description: formData.get('description') as string,
        evidence: formData.get('evidence') ? JSON.parse(formData.get('evidence') as string) : undefined,
        original_sla_deadline: formData.get('original_sla_deadline') as string || undefined,
        sla_breach_reason: formData.get('sla_breach_reason') as string || undefined,
      },
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/escalations');
    return { success: true, escalation_id: escalation.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create escalation',
    };
  }
}

export async function acknowledgeEscalationAction(escalationId: string) {
  try {
    const ctx = getRequestContext();
    const breakGlassRepo = new BreakGlassRepository();

    const escalation = await breakGlassRepo.acknowledge(
      escalationId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/escalations');
    revalidatePath(`/escalations/${escalationId}`);
    return { success: true, escalation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to acknowledge escalation',
    };
  }
}

export async function resolveEscalationAction(
  escalationId: string,
  resolutionNotes: string
) {
  try {
    const ctx = getRequestContext();
    const breakGlassRepo = new BreakGlassRepository();

    const escalation = await breakGlassRepo.resolve(
      escalationId,
      ctx.actor.userId,
      resolutionNotes,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/escalations');
    revalidatePath(`/escalations/${escalationId}`);
    return { success: true, escalation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to resolve escalation',
    };
  }
}

