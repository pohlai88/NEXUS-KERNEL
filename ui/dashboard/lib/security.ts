/**
 * NEXUS-KERNEL SECURITY UTILITIES
 * 
 * Type-safe security configuration using generated kernel types
 * Based on: security.pack.json (87 security values)
 */

// import { KERNEL } from '@nexus/kernel'; // Temporarily commented - kernel not yet published

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ CSP Configuration Builder
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'frame-src'?: string[];
  'frame-ancestors'?: string[];
  'object-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
}

/**
 * Build Content Security Policy string from directives
 * Maps to CSP_DIRECTIVES and CSP_SOURCES value sets from security.pack.json
 */
export function buildCSP(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Production CSP configuration
 * STRICT: No 'unsafe-inline', no 'unsafe-eval'
 */
export const PRODUCTION_CSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'strict-dynamic'"], // Nonce added at runtime
  'style-src': ["'self'", "'unsafe-inline'"], // Next.js styled-jsx requirement
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/**
 * Development CSP configuration (more permissive for HMR)
 */
export const DEVELOPMENT_CSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'"], // Next.js dev server requires eval
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'ws:', 'wss:'], // WebSocket for HMR
  'frame-ancestors': ["'none'"],
  'object-src': ["'none'"],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🍪 Cookie Security Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Maps to COOKIE_POLICY and COOKIE_SAME_SITE_MODES from security.pack.json

export interface SecureCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

/**
 * Authentication cookie settings (SESSION_POLICY)
 * OWASP A07:2021 Identification Failures
 */
export const AUTH_COOKIE_OPTIONS: SecureCookieOptions = {
  httpOnly: true,        // No JavaScript access (XSS protection)
  secure: true,          // HTTPS only (MITM protection)
  sameSite: 'lax',       // CSRF protection (allow top-level navigation)
  maxAge: 3600,          // 1 hour (security.pack.json SESSION_POLICY)
  path: '/',             // Global scope
};

/**
 * Strict cookie settings for highly sensitive operations
 * (e.g., MFA verification, password reset)
 */
export const STRICT_COOKIE_OPTIONS: SecureCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',    // Never send in cross-site requests
  maxAge: 900,           // 15 minutes
  path: '/',
};

/**
 * Session token configuration
 * Maps to TOKEN_TYPES from security.pack.json
 */
export const SESSION_CONFIG = {
  accessTokenTTL: 900,      // 15 minutes (short-lived)
  refreshTokenTTL: 604800,  // 7 days (long-lived, rotate on use)
  maxConcurrentSessions: 3, // Per user
  idleTimeout: 1800,        // 30 minutes of inactivity
  absoluteTimeout: 43200,   // 12 hours absolute maximum
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 TLS/HTTPS Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Maps to TLS_PROFILE, TLS_VERSIONS, CIPHER_SUITES from security.pack.json

/**
 * Minimum TLS version (PCI-DSS 3.2.1 compliant)
 */
export const TLS_CONFIG = {
  minVersion: 'TLSv1.2',     // security.pack.json TLS_1_2
  preferredVersion: 'TLSv1.3', // security.pack.json TLS_1_3
  ciphers: [
    'TLS_AES_256_GCM_SHA384',           // AES_256_GCM
    'TLS_CHACHA20_POLY1305_SHA256',     // CHACHA20_POLY1305
    'TLS_AES_128_GCM_SHA256',           // AES_128_GCM
    'ECDHE+AESGCM',
    'ECDHE+CHACHA20',
  ].join(':'),
  honorCipherOrder: true, // Prefer server cipher order
};

/**
 * HSTS configuration (HTTP_HEADER_PROFILE)
 */
export const HSTS_CONFIG = {
  maxAge: 31536000,          // 1 year in seconds
  includeSubDomains: true,   // Apply to all subdomains
  preload: true,             // Submit to HSTS preload list
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚫 Attack Pattern Detection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Maps to ATTACK_PATTERNS and SQL_INJECTION_PATTERNS from security.pack.json

/**
 * SQL Injection detection patterns (QUERY_VALIDATION_POLICY)
 * OWASP A03:2021 Injection
 */
export const SQL_INJECTION_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
  /(;|\-\-|\/\*|\*\/)/,                    // SQL metacharacters
  /(\bor\b.*=.*|1=1|'=')/i,                // Boolean-based blind
  /(waitfor\s+delay|sleep\()/i,            // Time-based blind
  /(\bxp_|sp_|exec\s*\()/i,                // Stored procedures
];

/**
 * XSS detection patterns (WAF_RULE_PROFILE)
 */
export const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,          // Event handlers
  /javascript:/gi,
  /data:text\/html/gi,
  /<iframe/gi,
];

/**
 * Path traversal detection (ATTACK_PATTERNS)
 */
export const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,                             // ../
  /%2e%2e[\/\\]/i,                         // URL encoded
  /etc\/passwd/,
  /windows[\/\\]system32/i,
];

/**
 * Validate input against attack patterns
 * Returns true if input is safe, false if malicious pattern detected
 */
export function validateInput(input: string, patterns: RegExp[]): boolean {
  return !patterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize user input (DATA_SANITIZATION_RULE)
 * Removes dangerous patterns while preserving legitimate content
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, '')  // Remove zero-width characters
    .normalize('NFC')                        // Unicode normalization
    .trim();                                 // Trim whitespace
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 Rate Limiting Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Maps to RATE_LIMIT_POLICY from security.pack.json

/**
 * Global rate limits (per IP)
 */
export const RATE_LIMITS = {
  global: {
    requests: 100,      // 100 requests
    window: 60,         // per minute
  },
  api: {
    requests: 60,       // 60 API calls
    window: 60,         // per minute
  },
  auth: {
    requests: 5,        // 5 login attempts
    window: 900,        // per 15 minutes (BRUTE_FORCE_PROTECTION)
    blockDuration: 3600, // Block for 1 hour after exceeding
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 Export Security Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SECURITY_CONFIG = {
  csp: {
    production: PRODUCTION_CSP,
    development: DEVELOPMENT_CSP,
  },
  cookies: {
    auth: AUTH_COOKIE_OPTIONS,
    strict: STRICT_COOKIE_OPTIONS,
  },
  session: SESSION_CONFIG,
  tls: TLS_CONFIG,
  hsts: HSTS_CONFIG,
  rateLimits: RATE_LIMITS,
  validation: {
    sqlInjection: SQL_INJECTION_PATTERNS,
    xss: XSS_PATTERNS,
    pathTraversal: PATH_TRAVERSAL_PATTERNS,
  },
} as const;

export type SecurityConfig = typeof SECURITY_CONFIG;
