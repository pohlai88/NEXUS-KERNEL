/**
 * Exception Server Actions
 * 
 * PRD A-01: Exception-First Workload (MUST)
 * - Default view shows only problems, not volume
 * - Severity tagging: 🔴 Blocking, 🟠 Needs action, 🟢 Safe
 */

'use server';

import { revalidatePath } from 'next/cache';
import { ExceptionRepository, type ExceptionFilters } from '@/src/repositories/exception-repository';

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

export async function getExceptionsAction(filters?: ExceptionFilters) {
  try {
    const ctx = getRequestContext();
    const exceptionRepo = new ExceptionRepository();

    const exceptions = await exceptionRepo.getExceptions(
      filters,
      ctx.actor.tenantId || 'default'
    );

    return { success: true, exceptions };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get exceptions',
    };
  }
}

export async function getExceptionSummaryAction() {
  try {
    const ctx = getRequestContext();
    const exceptionRepo = new ExceptionRepository();

    const summary = await exceptionRepo.getSummary(ctx.actor.tenantId || 'default');

    return { success: true, summary };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get exception summary',
    };
  }
}

export async function detectExceptionsAction(invoiceId: string) {
  try {
    const ctx = getRequestContext();
    const exceptionRepo = new ExceptionRepository();

    const exceptions = await exceptionRepo.detectAndCreate(
      invoiceId,
      ctx.actor.tenantId || 'default',
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/exceptions');
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, exceptions };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to detect exceptions',
    };
  }
}

export async function resolveExceptionAction(
  exceptionId: string,
  resolutionNotes: string
) {
  try {
    const ctx = getRequestContext();
    const exceptionRepo = new ExceptionRepository();

    const resolvedException = await exceptionRepo.resolve(
      exceptionId,
      ctx.actor.userId,
      resolutionNotes,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/exceptions');
    return { success: true, exception: resolvedException };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to resolve exception',
    };
  }
}

