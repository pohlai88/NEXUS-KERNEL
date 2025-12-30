/**
 * Staleness Detection Server Actions
 * 
 * PRD S-03: Silence Is a Bug
 * - No change + no explanation = defect
 * - System detects and notifies on staleness
 */

'use server';

import { revalidatePath } from 'next/cache';
import { StalenessRepository, type StalenessFilters } from '@/src/repositories/staleness-repository';

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

export async function detectStalenessAction() {
  try {
    const ctx = getRequestContext();
    const stalenessRepo = new StalenessRepository();

    const stalenessRecords = await stalenessRepo.detectAndCreate(
      ctx.actor.tenantId || 'default',
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/staleness');
    return { success: true, staleness_records: stalenessRecords };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to detect staleness',
    };
  }
}

export async function getStalenessAction(filters?: StalenessFilters) {
  try {
    const ctx = getRequestContext();
    const stalenessRepo = new StalenessRepository();

    const staleness = await stalenessRepo.getStaleness(
      filters,
      ctx.actor.tenantId || 'default'
    );

    return { success: true, staleness };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get staleness',
    };
  }
}

export async function getStalenessSummaryAction() {
  try {
    const ctx = getRequestContext();
    const stalenessRepo = new StalenessRepository();

    const summary = await stalenessRepo.getSummary(ctx.actor.tenantId || 'default');

    return { success: true, summary };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get staleness summary',
    };
  }
}

export async function resolveStalenessAction(stalenessId: string) {
  try {
    const ctx = getRequestContext();
    const stalenessRepo = new StalenessRepository();

    const resolvedStaleness = await stalenessRepo.resolve(
      stalenessId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/staleness');
    return { success: true, staleness: resolvedStaleness };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to resolve staleness',
    };
  }
}

