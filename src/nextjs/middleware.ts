// @aibos/kernel - Next.js Middleware Integration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Next.js middleware utilities for kernel validation at request time
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { NextRequest, NextResponse } from "next/server";
import { validateKernelIntegrity } from "../version.js";

/**
 * Middleware wrapper for kernel validation
 * 
 * Validates kernel integrity at request time (non-blocking, cached).
 * Logs errors but does not block requests.
 * 
 * @param middleware - Next.js middleware function to wrap
 * @returns Wrapped middleware with kernel validation
 * 
 * @example
 * ```typescript
 * // middleware.ts
 * import { withKernelValidation } from '@aibos/kernel/nextjs';
 * 
 * export function middleware(request: NextRequest) {
 *   // Your middleware logic
 *   return NextResponse.next();
 * }
 * 
 * export default withKernelValidation(middleware);
 * ```
 */
export function withKernelValidation(
  middleware: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Validate kernel integrity (cached, non-blocking)
      // This runs on every request but is fast due to in-memory validation
      validateKernelIntegrity();
    } catch (error) {
      // Log but don't block requests
      // Kernel validation failures are logged but don't affect user experience
      console.error("[@aibos/kernel] Kernel validation failed:", error);
      
      // In production, you might want to send this to your error tracking service
      // Example: Sentry.captureException(error);
    }
    
    // Continue with original middleware
    return middleware(req);
  };
}

/**
 * Kernel validation middleware (standalone)
 * 
 * Use this if you want kernel validation as a separate middleware step.
 * 
 * @param req - Next.js request
 * @returns NextResponse (always continues, never blocks)
 * 
 * @example
 * ```typescript
 * // middleware.ts
 * import { kernelValidationMiddleware } from '@aibos/kernel/nextjs';
 * 
 * export async function middleware(request: NextRequest) {
 *   // Run kernel validation first
 *   await kernelValidationMiddleware(request);
 *   
 *   // Your other middleware logic
 *   return NextResponse.next();
 * }
 * ```
 */
export async function kernelValidationMiddleware(
  req: NextRequest
): Promise<void> {
  try {
    validateKernelIntegrity();
  } catch (error) {
    console.error("[@aibos/kernel] Kernel validation failed:", error);
    // Don't throw - allow request to continue
  }
}

