"use client";

import { useState, useCallback } from "react";
import type { Result } from "./result";
import type { ActionDef } from "./registry";
import type { ActionContext, runAction } from "./runAction";

export function useAction<T>(
  action: ActionDef,
  context: ActionContext,
  handler: (ctx: ActionContext) => Promise<T>
) {
  const [result, setResult] = useState<Result<T> | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setResult(null);

    try {
      // Import runAction dynamically to avoid SSR issues
      const { runAction } = await import("./runAction");
      const res = await runAction(action, context, handler);
      setResult(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, [action, context, handler]);

  return {
    execute,
    result,
    loading,
    error: result && !result.ok ? result.error : null,
    data: result && result.ok ? result.data : null,
  };
}

