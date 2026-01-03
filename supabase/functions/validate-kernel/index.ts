// @aibos/kernel - Supabase Edge Function: Validate Kernel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Edge function for validating kernel integrity
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { validateKernelIntegrity } from "npm:@aibos/kernel@latest";

Deno.serve(async (req: Request) => {
  try {
    // Parse request body (optional)
    let kernelVersion: string | undefined;
    let snapshotId: string | undefined;
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        kernelVersion = body.kernelVersion;
        snapshotId = body.snapshotId;
      } catch {
        // Body is optional, continue without it
      }
    }
    
    // Validate kernel integrity
    validateKernelIntegrity();
    
    // Return success response
    return new Response(
      JSON.stringify({
        valid: true,
        kernelVersion: kernelVersion || "unknown",
        snapshotId: snapshotId || "unknown",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Connection": "keep-alive",
        },
      }
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({
        valid: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Connection": "keep-alive",
        },
      }
    );
  }
});

