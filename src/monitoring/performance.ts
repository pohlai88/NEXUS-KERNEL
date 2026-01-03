// @aibos/kernel - Performance Monitoring Hooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Runtime performance monitoring utilities for kernel operations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { performance } from "perf_hooks";

/**
 * Performance metrics for kernel operations
 */
export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Performance monitoring callback
 */
export type PerformanceCallback = (metrics: PerformanceMetrics) => void;

/**
 * Global performance monitoring callbacks
 */
const performanceCallbacks: PerformanceCallback[] = [];

/**
 * Enable performance monitoring
 * 
 * @param callback - Callback function to receive performance metrics
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * const unsubscribe = enablePerformanceMonitoring((metrics) => {
 *   console.log(`Operation ${metrics.operation} took ${metrics.duration}ms`);
 * });
 * 
 * // Later, unsubscribe
 * unsubscribe();
 * ```
 */
export function enablePerformanceMonitoring(
  callback: PerformanceCallback
): () => void {
  performanceCallbacks.push(callback);
  return () => {
    const index = performanceCallbacks.indexOf(callback);
    if (index > -1) {
      performanceCallbacks.splice(index, 1);
    }
  };
}

/**
 * Disable all performance monitoring
 */
export function disablePerformanceMonitoring(): void {
  performanceCallbacks.length = 0;
}

/**
 * Emit performance metrics to all registered callbacks
 */
function emitMetrics(metrics: PerformanceMetrics): void {
  performanceCallbacks.forEach((callback) => {
    try {
      callback(metrics);
    } catch (error) {
      // Silently ignore callback errors to prevent breaking kernel operations
      console.warn("Performance monitoring callback error:", error);
    }
  });
}

/**
 * Measure operation performance
 * 
 * @param operation - Operation name
 * @param fn - Function to measure
 * @param metadata - Optional metadata
 * @returns Function result
 * 
 * @example
 * ```typescript
 * const result = await measurePerformance(
 *   'validateConcept',
 *   () => validateConcept(data),
 *   { conceptId: 'CONCEPT_INVOICE' }
 * );
 * ```
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    emitMetrics({
      operation,
      duration,
      timestamp: Date.now(),
      metadata,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    emitMetrics({
      operation,
      duration,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    
    throw error;
  }
}

/**
 * Performance statistics collector
 */
export class PerformanceCollector {
  private metrics: PerformanceMetrics[] = [];
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Collect metrics
   */
  collect(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    if (this.metrics.length > this.maxSize) {
      this.metrics.shift(); // Remove oldest
    }
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get statistics for an operation
   */
  getStatistics(operation: string): {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } {
    const operationMetrics = this.metrics.filter((m) => m.operation === operation);
    
    if (operationMetrics.length === 0) {
      return {
        count: 0,
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0,
      };
    }

    const durations = operationMetrics.map((m) => m.duration).sort((a, b) => a - b);
    const total = durations.reduce((sum, d) => sum + d, 0);
    const average = total / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const p95 = durations[p95Index] || 0;
    const p99 = durations[p99Index] || 0;

    return {
      count: operationMetrics.length,
      total,
      average,
      min,
      max,
      p95,
      p99,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get summary statistics
   */
  getSummary(): Record<string, ReturnType<PerformanceCollector["getStatistics"]>> {
    const operations = new Set(this.metrics.map((m) => m.operation));
    const summary: Record<string, ReturnType<PerformanceCollector["getStatistics"]>> = {};

    operations.forEach((operation) => {
      summary[operation] = this.getStatistics(operation);
    });

    return summary;
  }
}

/**
 * Global performance collector instance
 */
export const globalPerformanceCollector = new PerformanceCollector();

// Auto-collect metrics if monitoring is enabled
enablePerformanceMonitoring((metrics) => {
  globalPerformanceCollector.collect(metrics);
});

