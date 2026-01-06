import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SECURITY_CONFIG, validateInput, sanitizeInput } from '@/lib/security';

/**
 * DEMO: Secure API Route with Input Validation
 * 
 * Demonstrates OWASP best practices:
 * - Input validation (Zod schema)
 * - SQL injection prevention
 * - XSS sanitization
 * - Rate limiting ready
 * - Secure error handling (no stack traces to client)
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ INPUT VALIDATION SCHEMA (OWASP A03:2021 Injection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query required')
    .max(100, 'Query too long')
    .transform(sanitizeInput), // Remove zero-width chars, normalize unicode
  
  filters: z.object({
    domain: z.enum(['FINANCE', 'SALES', 'INVENTORY']).optional(),
    status: z.enum(['ACTIVE', 'DEPRECATED']).optional(),
  }).optional().default({}),
  
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

type SearchInput = z.infer<typeof searchSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚫 ATTACK DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function detectMaliciousInput(input: string): { safe: boolean; reason?: string } {
  // SQL Injection detection
  if (!validateInput(input, SECURITY_CONFIG.validation.sqlInjection)) {
    return { safe: false, reason: 'SQL injection pattern detected' };
  }
  
  // XSS detection
  if (!validateInput(input, SECURITY_CONFIG.validation.xss)) {
    return { safe: false, reason: 'XSS pattern detected' };
  }
  
  // Path traversal detection
  if (!validateInput(input, SECURITY_CONFIG.validation.pathTraversal)) {
    return { safe: false, reason: 'Path traversal detected' };
  }
  
  return { safe: true };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📡 API HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const rawInput = {
      query: searchParams.get('query') || '',
      filters: {
        domain: searchParams.get('domain'),
        status: searchParams.get('status'),
      },
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    };
    
    // ✅ STEP 1: Validate and sanitize input
    const validation = searchSchema.safeParse(rawInput);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_FAILED',
          message: 'Invalid input parameters',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    
    const input: SearchInput = validation.data;
    
    // ✅ STEP 2: Attack pattern detection
    const securityCheck = detectMaliciousInput(input.query);
    
    if (!securityCheck.safe) {
      // Log attack attempt (in production, send to SIEM)
      console.warn('🚨 Security: Attack detected', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        reason: securityCheck.reason,
        input: input.query,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        {
          error: 'SECURITY_VIOLATION',
          message: 'Invalid input detected',
        },
        { status: 400 }
      );
    }
    
    // ✅ STEP 3: Business logic (safe - input is validated and sanitized)
    // In production, this would query database with parameterized queries
    const mockResults = {
      query: input.query,
      results: [
        {
          code: 'ACCOUNT',
          category: 'ENTITY',
          domain: 'FINANCE',
          description: 'General ledger account',
        },
        {
          code: 'INVOICE',
          category: 'ENTITY',
          domain: 'FINANCE',
          description: 'Sales or purchase invoice',
        },
      ],
      pagination: {
        page: input.page,
        limit: input.limit,
        total: 2,
      },
    };
    
    // ✅ STEP 4: Secure response
    const response = NextResponse.json(mockResults, { status: 200 });
    
    // Add security headers (additional to middleware)
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    
    return response;
    
  } catch (error) {
    // ✅ STEP 5: Secure error handling
    // NEVER expose stack traces or internal details to client
    console.error('API Error:', error);
    
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        // In production, use correlation ID for debugging
        requestId: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 POST Example with Body Validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const createConceptSchema = z.object({
  code: z.string()
    .min(2)
    .max(50)
    .regex(/^[A-Z_]+$/, 'Only uppercase letters and underscores')
    .transform(sanitizeInput),
  
  category: z.enum(['ENTITY', 'ATTRIBUTE', 'OPERATION', 'RELATIONSHIP']),
  
  domain: z.string()
    .min(2)
    .max(20)
    .transform(sanitizeInput),
  
  description: z.string()
    .min(10)
    .max(500)
    .transform(sanitizeInput),
});

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const rawBody = await request.json();
    
    // Validate schema
    const validation = createConceptSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_FAILED',
          message: 'Invalid concept data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    
    const concept = validation.data;
    
    // Security checks
    const descriptionCheck = detectMaliciousInput(concept.description);
    if (!descriptionCheck.safe) {
      return NextResponse.json(
        { error: 'SECURITY_VIOLATION', message: descriptionCheck.reason },
        { status: 400 }
      );
    }
    
    // Business logic here...
    const created = {
      id: crypto.randomUUID(),
      ...concept,
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json(created, { status: 201 });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to create concept' },
      { status: 500 }
    );
  }
}
