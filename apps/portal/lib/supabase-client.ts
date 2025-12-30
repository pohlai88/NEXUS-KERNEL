/**
 * Supabase Client Utility
 *
 * Creates Supabase client for database operations.
 * Uses environment variables for configuration.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export function createClient() {
  // TypeScript guard: we've already checked these are defined above
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration error');
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

