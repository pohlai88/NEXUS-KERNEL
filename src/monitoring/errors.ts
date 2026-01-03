// @aibos/kernel - Error Tracking Utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Structured error reporting and tracking utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { CanonError } from "../errors";

/**
 * Error context information
 */
export interface ErrorContext {
  operation?: string;
  input?: unknown;
  metadata?: Record<string, unknown>;
  timestamp: number;
  kernelVersion: string;
}

/**
 * Error tracking callback
 */
export type ErrorCallback = (error: Error, context: ErrorContext) => void;

/**
 * Global error tracking callbacks
 */
const errorCallbacks: ErrorCallback[] = [];

/**
 * Enable error tracking
 * 
 * @param callback - Callback function to receive error reports
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * const unsubscribe = enableErrorTracking((error, context) => {
 *   console.error('Kernel error:', error.message, context);
 *   // Send to error tracking service
 * });
 * ```
 */
export function enableErrorTracking(callback: ErrorCallback): () => void {
  errorCallbacks.push(callback);
  return () => {
    const index = errorCallbacks.indexOf(callback);
    if (index > -1) {
      errorCallbacks.splice(index, 1);
    }
  };
}

/**
 * Disable all error tracking
 */
export function disableErrorTracking(): void {
  errorCallbacks.length = 0;
}

/**
 * Track an error with context
 * 
 * @param error - Error to track
 * @param context - Error context
 */
export function trackError(
  error: Error,
  context: Partial<ErrorContext> = {}
): void {
  const fullContext: ErrorContext = {
    timestamp: Date.now(),
    kernelVersion: "1.1.0", // Will be replaced with actual version
    ...context,
  };

  errorCallbacks.forEach((callback) => {
    try {
      callback(error, fullContext);
    } catch (callbackError) {
      // Silently ignore callback errors
      console.warn("Error tracking callback error:", callbackError);
    }
  });
}

/**
 * Wrap function with error tracking
 * 
 * @param operation - Operation name
 * @param fn - Function to wrap
 * @param metadata - Optional metadata
 * @returns Function result
 * 
 * @example
 * ```typescript
 * const result = await withErrorTracking(
 *   'validateConcept',
 *   () => validateConcept(data),
 *   { conceptId: 'CONCEPT_INVOICE' }
 * );
 * ```
 */
export async function withErrorTracking<T>(
  operation: string,
  fn: () => T | Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    trackError(
      error instanceof Error ? error : new Error(String(error)),
      {
        operation,
        metadata,
      }
    );
    throw error;
  }
}

/**
 * Error statistics
 */
export interface ErrorStatistics {
  total: number;
  byType: Record<string, number>;
  byOperation: Record<string, number>;
  recent: Array<{
    error: string;
    operation?: string;
    timestamp: number;
  }>;
}

/**
 * Error statistics collector
 */
export class ErrorCollector {
  private errors: Array<{ error: Error; context: ErrorContext }> = [];
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Collect error
   */
  collect(error: Error, context: ErrorContext): void {
    this.errors.push({ error, context });
    if (this.errors.length > this.maxSize) {
      this.errors.shift(); // Remove oldest
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): ErrorStatistics {
    const byType: Record<string, number> = {};
    const byOperation: Record<string, number> = {};

    this.errors.forEach(({ error, context }) => {
      const errorType = error.constructor.name;
      byType[errorType] = (byType[errorType] || 0) + 1;

      if (context.operation) {
        byOperation[context.operation] = (byOperation[context.operation] || 0) + 1;
      }
    });

    const recent = this.errors
      .slice(-10)
      .map(({ error, context }) => ({
        error: error.message,
        operation: context.operation,
        timestamp: context.timestamp,
      }))
      .reverse();

    return {
      total: this.errors.length,
      byType,
      byOperation,
      recent,
    };
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
  }
}

/**
 * Global error collector instance
 */
export const globalErrorCollector = new ErrorCollector();

// Auto-collect errors if tracking is enabled
enableErrorTracking((error, context) => {
  globalErrorCollector.collect(error, context);
});

