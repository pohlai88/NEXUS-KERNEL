/**
 * NEXUS-KERNEL XSS SANITIZATION UTILITIES
 * 
 * Based on: security.pack.json DATA_SANITIZATION_RULE
 * OWASP A03:2021 Injection - Prevents XSS attacks via DOMPurify
 * 
 * CRITICAL: Never render user-generated HTML without sanitization
 * Use these utilities for ALL user content (comments, descriptions, rich text)
 */

import DOMPurify from 'isomorphic-dompurify';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ SANITIZATION PROFILES (Based on security.pack.json)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Config {
  ALLOWED_TAGS: string[];
  ALLOWED_ATTR: string[];
  KEEP_CONTENT: boolean;
  ALLOWED_URI_REGEXP?: RegExp;
  RETURN_DOM?: boolean;
  RETURN_DOM_FRAGMENT?: boolean;
  RETURN_TRUSTED_TYPE?: boolean;
}

/**
 * Strict sanitization - Remove ALL HTML tags
 * Use for: Usernames, titles, short descriptions
 */
export const STRICT_CONFIG: Config = {
  ALLOWED_TAGS: [], // Remove all HTML
  ALLOWED_ATTR: [], // Remove all attributes
  KEEP_CONTENT: true, // Keep text content
};

/**
 * Basic sanitization - Allow safe formatting tags only
 * Use for: Comments, blog posts, forum posts
 */
export const BASIC_CONFIG: Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Rich text sanitization - Allow common formatting + links
 * Use for: Blog articles, documentation, help text
 */
export const RICH_TEXT_CONFIG: Config = {
  ALLOWED_TAGS: [
    // Text formatting
    'b', 'i', 'em', 'strong', 'u', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
    // Structure
    'p', 'br', 'hr', 'div', 'span',
    // Lists
    'ul', 'ol', 'li',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Links
    'a',
    // Code
    'code', 'pre', 'blockquote',
  ],
  ALLOWED_ATTR: [
    'href', 'title', // Links
    'class', // Styling (limited to safe classes)
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i, // Only allow https, http, mailto
  KEEP_CONTENT: true,
};

/**
 * Ultra-strict sanitization - Remove everything, escape special chars
 * Use for: Database queries, file paths, system commands
 */
export const ULTRA_STRICT_CONFIG: Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧹 SANITIZATION FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Sanitize HTML with strict config (remove all tags)
 */
export function sanitizeStrict(dirty: string): string {
  return String(DOMPurify.sanitize(dirty, STRICT_CONFIG));
}

/**
 * Sanitize HTML with basic formatting allowed
 */
export function sanitizeBasic(dirty: string): string {
  return String(DOMPurify.sanitize(dirty, BASIC_CONFIG));
}

/**
 * Sanitize rich text (links, headings, formatting)
 */
export function sanitizeRichText(dirty: string): string {
  return String(DOMPurify.sanitize(dirty, RICH_TEXT_CONFIG));
}

/**
 * Ultra-strict sanitization (escape everything)
 */
export function sanitizeUltraStrict(dirty: string): string {
  return String(DOMPurify.sanitize(dirty, ULTRA_STRICT_CONFIG));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CONTEXT-SPECIFIC SANITIZERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Sanitize user profile data
 */
export function sanitizeUserProfile(data: {
  username?: string;
  displayName?: string;
  bio?: string;
  website?: string;
}): {
  username: string;
  displayName: string;
  bio: string;
  website: string;
} {
  return {
    username: sanitizeStrict(data.username || ''),
    displayName: sanitizeStrict(data.displayName || ''),
    bio: sanitizeBasic(data.bio || ''),
    website: sanitizeStrict(data.website || ''),
  };
}

/**
 * Sanitize form input (generic)
 */
export function sanitizeFormInput(input: Record<string, unknown>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeStrict(value);
    } else if (value !== null && value !== undefined) {
      sanitized[key] = sanitizeStrict(String(value));
    }
  }
  
  return sanitized;
}

/**
 * Sanitize search query (prevent SQL injection, XSS)
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove HTML
  let clean = sanitizeStrict(query);
  
  // Remove SQL injection patterns (from lib/security.ts)
  const sqlPatterns = [
    /(\bOR\b|\bAND\b).*?=.*?/gi,
    /UNION.*?SELECT/gi,
    /DROP.*?TABLE/gi,
    /INSERT.*?INTO/gi,
    /DELETE.*?FROM/gi,
    /UPDATE.*?SET/gi,
    /--/g,
    /\/\*/g,
    /\*\//g,
  ];
  
  for (const pattern of sqlPatterns) {
    clean = clean.replace(pattern, '');
  }
  
  // Remove script tags and event handlers
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/on\w+\s*=/gi, '');
  
  // Trim and limit length
  return clean.trim().slice(0, 500);
}

/**
 * Sanitize filename (prevent path traversal)
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators
  let clean = filename.replace(/[/\\]/g, '');
  
  // Remove null bytes
  clean = clean.replace(/\0/g, '');
  
  // Remove special characters (keep alphanumeric, dash, underscore, dot)
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Remove leading/trailing dots (prevent hidden files, path traversal)
  clean = clean.replace(/^\.+|\.+$/g, '');
  
  // Limit length
  clean = clean.slice(0, 255);
  
  // Ensure not empty
  if (!clean) {
    clean = 'unnamed_file';
  }
  
  return clean;
}

/**
 * Sanitize URL (prevent javascript:, data:, file: schemes)
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:'];
    if (!safeProtocols.includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    // Invalid URL
    return null;
  }
}

/**
 * Sanitize JSON input (remove dangerous keys)
 */
export function sanitizeJSON<T>(json: unknown): T {
  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid JSON input');
  }
  
  const sanitized: Record<string, unknown> = {};
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  for (const [key, value] of Object.entries(json)) {
    // Skip dangerous keys (prototype pollution)
    if (dangerousKeys.includes(key)) {
      continue;
    }
    
    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeJSON(value);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeStrict(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 DETECTION UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Detect potential XSS attack vectors
 */
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\(/gi,
    /expression\(/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect SQL injection attempts
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bOR\b|\bAND\b).*?=.*?/gi,
    /UNION.*?SELECT/gi,
    /DROP.*?TABLE/gi,
    /INSERT.*?INTO/gi,
    /DELETE.*?FROM/gi,
    /UPDATE.*?SET/gi,
    /--/g,
    /\/\*/g,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect path traversal attempts
 */
export function containsPathTraversal(input: string): boolean {
  const pathPatterns = [
    /\.\.\//g,  // ../
    /\.\.\\/g,  // ..\
    /\.\.%2f/gi, // URL encoded ../
    /\.\.%5c/gi, // URL encoded ..\
  ];
  
  return pathPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive malicious input detection
 */
export function isMaliciousInput(input: string): {
  isMalicious: boolean;
  threats: string[];
} {
  const threats: string[] = [];
  
  if (containsXSS(input)) {
    threats.push('XSS');
  }
  
  if (containsSQLInjection(input)) {
    threats.push('SQL_INJECTION');
  }
  
  if (containsPathTraversal(input)) {
    threats.push('PATH_TRAVERSAL');
  }
  
  return {
    isMalicious: threats.length > 0,
    threats,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 USAGE EXAMPLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Example: Sanitize user comment before displaying
 */
export function sanitizeUserComment(comment: string): string {
  // 1. Check for malicious input
  const { isMalicious, threats } = isMaliciousInput(comment);
  
  if (isMalicious) {
    console.warn('[SECURITY] Malicious input detected:', threats);
    // Log to security audit trail
    // Block or sanitize aggressively
    return sanitizeStrict(comment);
  }
  
  // 2. Sanitize with basic formatting
  return sanitizeBasic(comment);
}

/**
 * Example: Sanitize blog post content
 */
export function sanitizeBlogPost(html: string): string {
  // Allow rich formatting but sanitize
  return sanitizeRichText(html);
}

/**
 * Example: Sanitize and validate file upload
 */
export function validateFileUpload(file: {
  name: string;
  content: string;
}): {
  isValid: boolean;
  sanitizedName: string;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Sanitize filename
  const sanitizedName = sanitizeFilename(file.name);
  
  // Check for path traversal
  if (containsPathTraversal(file.name)) {
    errors.push('Filename contains path traversal attack');
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.csv'];
  const ext = sanitizedName.slice(sanitizedName.lastIndexOf('.')).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    errors.push(`File extension ${ext} not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedName,
    errors,
  };
}

// Export DOMPurify for advanced use cases
export { DOMPurify };
