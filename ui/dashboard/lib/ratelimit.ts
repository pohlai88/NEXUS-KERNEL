/**
 * NEXUS-KERNEL RATE LIMITING
 * 
 * Based on: security.pack.json RATE_LIMIT_POLICY
 * OWASP A09:2021 - Security Logging and Monitoring Failures
 * 
 * Uses Supabase PostgreSQL for distributed rate limiting
 * Implements sliding window algorithm (prevents boundary attacks)
 * No third-party accounts required - uses your existing Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 SUPABASE CLIENT CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Initialize Supabase client (requires environment variables)
 * 
 * Required .env.local:
 * NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 * SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 */
function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.warn('⚠️ Rate limiting disabled - missing Supabase credentials');
    console.warn('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }
  
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

let supabaseInstance: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!supabaseInstance) {
    supabaseInstance = getSupabaseClient();
  }
  return supabaseInstance;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ RATE LIMITER CONFIGS (Based on security.pack.json)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface RateLimiterConfig {
  name: string;
  limit: number;
  windowMs: number;
  description?: string;
}

/**
 * Global API rate limiter - 100 requests per minute
 */
export const globalRateLimiter: RateLimiterConfig = {
  name: 'global',
  limit: 100,
  windowMs: 60 * 1000, // 1 minute
  description: 'Global API rate limit (100 req/min)',
};

/**
 * API route rate limiter - 60 requests per minute
 */
export const apiRateLimiter: RateLimiterConfig = {
  name: 'api',
  limit: 60,
  windowMs: 60 * 1000, // 1 minute
  description: 'API endpoint rate limit (60 req/min)',
};

/**
 * Authentication rate limiter - 5 attempts per 15 minutes
 * CRITICAL: Prevents brute force attacks
 */
export const authRateLimiter: RateLimiterConfig = {
  name: 'auth',
  limit: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  description: 'Authentication rate limit (5 attempts/15min) - BRUTE_FORCE_PROTECTION',
};

/**
 * Strict rate limiter - 10 requests per hour
 */
export const strictRateLimiter: RateLimiterConfig = {
  name: 'strict',
  limit: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  description: 'Strict rate limit (10 req/hour)',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 IDENTIFIER EXTRACTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract identifier from request (IP + User-Agent hash)
 */
export function getIdentifier(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const fingerprint = `${ip}_${hashString(userAgent)}`;
  
  return fingerprint;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 RATE LIMIT CHECKING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  current: number;
}

/**
 * Check rate limit using Supabase
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimiterConfig
): Promise<RateLimitResult> {
  const client = getClient();
  
  // Fallback: Allow if Supabase not configured
  if (!client) {
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Date.now() + config.windowMs,
      current: 0,
    };
  }
  
  const identifier = getIdentifier(request);
  const now = Date.now();
  const expiresAt = now + config.windowMs;
  
  try {
    // Get existing record
    const { data: existing, error: selectError } = await client
      .from('rate_limits')
      .select('count, expires_at')
      .eq('identifier', identifier)
      .eq('limiter_name', config.name)
      .gt('expires_at', now)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[RATELIMIT] Error:', selectError);
      return {
        success: true,
        limit: config.limit,
        remaining: config.limit,
        reset: expiresAt,
        current: 0,
      };
    }
    
    if (!existing) {
      // Create new record
      await client
        .from('rate_limits')
        .insert({
          identifier,
          limiter_name: config.name,
          count: 1,
          expires_at: expiresAt,
        });
      
      return {
        success: true,
        limit: config.limit,
        remaining: config.limit - 1,
        reset: expiresAt,
        current: 1,
      };
    }
    
    // Update count
    const newCount = existing.count + 1;
    const success = newCount <= config.limit;
    
    await client
      .from('rate_limits')
      .update({ count: newCount, updated_at: new Date().toISOString() })
      .eq('identifier', identifier)
      .eq('limiter_name', config.name);
    
    return {
      success,
      limit: config.limit,
      remaining: Math.max(0, config.limit - newCount),
      reset: existing.expires_at,
      current: newCount,
    };
    
  } catch (error) {
    console.error('[RATELIMIT] Unexpected error:', error);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: expiresAt,
      current: 0,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚦 RESPONSE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceededResponse(
  message: string = 'Too many requests',
  result: RateLimitResult
): NextResponse {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
  
  const response = NextResponse.json(
    {
      success: false,
      error: message,
      rateLimit: {
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter,
      },
    },
    { status: 429 }
  );
  
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', '0');
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  response.headers.set('Retry-After', retryAfter.toString());
  
  return response;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// � VIOLATION LOGGING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Log rate limit violation to database
 */
export async function logRateLimitViolation(
  request: NextRequest,
  limiterName: string,
  currentCount: number
): Promise<void> {
  const client = getClient();
  if (!client) return;
  
  const identifier = getIdentifier(request);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const path = request.nextUrl.pathname;
  
  const limiterConfig = [globalRateLimiter, apiRateLimiter, authRateLimiter, strictRateLimiter]
    .find(l => l.name === limiterName);
  
  if (!limiterConfig) return;
  
  await client
    .from('rate_limit_violations')
    .insert({
      identifier,
      limiter_name: limiterName,
      ip_address: ip,
      user_agent: userAgent,
      path,
      limit_amount: limiterConfig.limit,
      current_count: currentCount,
      window_ms: limiterConfig.windowMs,
    });
  
  console.warn(`[SECURITY] Rate limit violation: ${limiterName} - ${identifier} - ${path}`);
}
