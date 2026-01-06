// @aibos/kernel - Supabase Edge Function: Sync Kernel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Edge function for syncing kernel metadata to database
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { syncKernelToDatabase } from "npm:@aibos/kernel@latest/supabase";

Deno.serve(async (req: Request) => {
  try {
    // Get Supabase client from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body = await req.json();
    const kernelRegistry = body.kernelRegistry;
    
    if (!kernelRegistry) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing kernelRegistry in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Validate kernel registry structure
    if (!kernelRegistry.concepts || !kernelRegistry.value_sets || !kernelRegistry.values) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid kernelRegistry structure. Expected: { concepts, value_sets, values }",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Sync kernel to database
    const result = await syncKernelToDatabase(supabase, kernelRegistry);
    
    if (result.errors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Sync completed with errors",
          errors: result.errors,
          result,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Kernel synced successfully",
        result,
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
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Connection": "keep-alive",
        },
      }
    );
  }
});

