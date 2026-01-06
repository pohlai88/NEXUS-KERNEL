import { NextResponse } from 'next/server';

/**
 * API Root Endpoint
 * Provides API documentation and available endpoints
 */

export async function GET() {
  return NextResponse.json({
    name: 'NEXUS-KERNEL API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      authentication: {
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'User authentication with rate limiting',
          body: {
            email: 'string (required)',
            password: 'string (required)',
            mfaCode: 'string (optional)',
            rememberMe: 'boolean (optional)',
          },
          rateLimit: '5 attempts per 15 minutes',
        },
      },
      search: {
        get: {
          method: 'GET',
          path: '/api/search?query=<search>&page=1&limit=20',
          description: 'Search with query parameters',
        },
        post: {
          method: 'POST',
          path: '/api/search',
          description: 'Search with JSON body',
          body: {
            query: 'string (required)',
            filters: 'object (optional)',
            page: 'number (optional, default: 1)',
            limit: 'number (optional, default: 20)',
          },
        },
      },
    },
    security: {
      rateLimit: 'Active (Supabase PostgreSQL)',
      headers: '10 security headers enabled',
      csp: 'Content Security Policy with nonces',
      cors: 'Configured per endpoint',
    },
    documentation: 'https://github.com/pohlai88/NEXUS-KERNEL',
  });
}
