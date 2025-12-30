import type { Result } from "./result";
import type { ActionDef } from "./registry";
import { CanonError } from "@nexus/kernel";

export interface ActionContext {
  userId: string;
  tenantId?: string;
  roles?: string[];
}

export async function runAction<T>(
  action: ActionDef,
  context: ActionContext,
  handler: (ctx: ActionContext) => Promise<T>
): Promise<Result<T>> {
  try {
    // Check authentication
    if (action.requiresAuth && !context.userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      };
    }

    // Check permission if specified
    if (action.permission) {
      const hasPermission = context.roles?.includes(action.permission.split(":")[0]) ?? false;
      if (!hasPermission) {
        return {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: `Permission required: ${action.permission}`,
          },
        };
      }
    }

    // Execute handler
    const data = await handler(context);

    return { ok: true, data };
  } catch (error) {
    if (error instanceof CanonError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }

    return {
      ok: false,
      error: {
        code: "INTERNAL",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
    };
  }
}

