/**
 * Exception Server Actions
 *
 * PRD A-01: Exception-First Workload (MUST)
 * - Default view shows only problems, not volume
 * - Severity tagging: 🔴 Blocking, 🟠 Needs action, 🟢 Safe
 */

"use server";

import {
  ExceptionRepository,
  type ExceptionFilters,
} from "@/src/repositories/exception-repository";
import { revalidatePath } from "next/cache";

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: "system", // TODO: Get from auth
      tenantId: "00000000-0000-0000-0000-000000000000", // Use null UUID for demo/default
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export async function getExceptionsAction(filters?: ExceptionFilters) {
  console.log("[getExceptionsAction] START - filters:", filters);
  try {
    const ctx = getRequestContext();
    console.log("[getExceptionsAction] Got context:", ctx.actor.tenantId);
    const exceptionRepo = new ExceptionRepository();
    console.log("[getExceptionsAction] Created repo, calling getExceptions...");

    const exceptions = await exceptionRepo.getExceptions(
      filters,
      ctx.actor.tenantId || "default"
    );
    console.log(
      "[getExceptionsAction] Got exceptions count:",
      exceptions?.length || 0
    );

    return { success: true, exceptions };
  } catch (error) {
    console.error("[getExceptionsAction] ERROR:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to get exceptions",
    };
  }
}

export async function getExceptionSummaryAction() {
  console.log("[getExceptionSummaryAction] START");
  try {
    const ctx = getRequestContext();
    console.log(
      "[getExceptionSummaryAction] Got context, calling getSummary..."
    );
    const exceptionRepo = new ExceptionRepository();

    const summary = await exceptionRepo.getSummary(
      ctx.actor.tenantId || "default"
    );
    console.log("[getExceptionSummaryAction] Got summary:", summary);

    return { success: true, summary };
  } catch (error) {
    console.error("[getExceptionSummaryAction] ERROR:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to get exception summary",
    };
  }
}

export async function detectExceptionsAction(invoiceId: string) {
  try {
    const ctx = getRequestContext();
    const exceptionRepo = new ExceptionRepository();

    const exceptions = await exceptionRepo.detectAndCreate(
      invoiceId,
      ctx.actor.tenantId || "default",
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath("/exceptions");
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, exceptions };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to detect exceptions",
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

    revalidatePath("/exceptions");
    return { success: true, exception: resolvedException };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to resolve exception",
    };
  }
}
