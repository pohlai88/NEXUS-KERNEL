/**
 * Supabase Client Utility
 *
 * Creates Supabase client for database operations.
 * Uses environment variables for configuration.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export function createClient() {
  // TypeScript guard: we've already checked these are defined above
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration error");
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a Supabase client with service role (bypasses RLS)
 * Use ONLY for server-side operations where RLS should be bypassed
 * In production, use proper auth context instead
 */
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    // In production, require service role key
    if (process.env.NODE_ENV === "production") {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY required in production");
    }
    // Fall back to anon key in dev if service role not available
    // This will still be subject to RLS
    return createSupabaseClient(supabaseUrl, supabaseAnonKey!);
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
