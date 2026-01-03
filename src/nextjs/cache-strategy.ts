// @aibos/kernel - Next.js Cache Strategy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Advanced caching utilities for Next.js with granular control
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { unstable_cache } from "next/cache";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Revalidation time in seconds (default: 3600 = 1 hour) */
  revalidate?: number;
  /** Cache tags for granular invalidation */
  tags?: string[];
}

/**
 * Create a kernel-aware cache function
 * 
 * Automatically includes kernel version and snapshot ID in cache key
 * for automatic invalidation on kernel updates.
 * 
 * @param key - Cache key (will be prefixed with kernel version)
 * @param fetcher - Function that fetches the data
 * @param config - Cache configuration
 * @returns Cached function
 * 
 * @example
 * ```typescript
 * import { createKernelCache } from '@aibos/kernel/nextjs';
 * 
 * const getCachedConceptData = createKernelCache(
 *   'concept-data',
 *   async () => {
 *     // Fetch concept data
 *     return await fetchConceptData();
 *   },
 *   { revalidate: 1800, tags: ['concepts'] }
 * );
 * 
 * // Use in Server Component
 * const data = await getCachedConceptData();
 * ```
 */
export function createKernelCache<T>(
  key: string,
  fetcher: () => T | Promise<T>,
  config: CacheConfig = {}
): () => Promise<T> {
  const {
    revalidate = 3600,
    tags = [],
  } = config;
  
  // Wrap fetcher to ensure it always returns a Promise
  const asyncFetcher = async () => {
    const result = fetcher();
    return result instanceof Promise ? result : Promise.resolve(result);
  };
  
  return unstable_cache(
    asyncFetcher,
    [`kernel-${key}`, KERNEL_VERSION, SNAPSHOT_ID],
    {
      revalidate,
      tags: ["kernel", `kernel-${KERNEL_VERSION}`, ...tags],
    }
  );
}

/**
 * Revalidate kernel cache by tag
 * 
 * @param tag - Cache tag to revalidate (default: "kernel")
 * 
 * @example
 * ```typescript
 * import { revalidateKernelTag } from '@aibos/kernel/nextjs';
 * 
 * // Revalidate all kernel caches
 * await revalidateKernelTag();
 * 
 * // Revalidate specific tag
 * await revalidateKernelTag('concepts');
 * ```
 */
export async function revalidateKernelTag(tag: string = "kernel"): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(tag, "max");
}

/**
 * Revalidate all kernel-related caches
 * 
 * Revalidates:
 * - "kernel" tag (all kernel caches)
 * - "kernel-{version}" tag (version-specific caches)
 * 
 * @example
 * ```typescript
 * import { revalidateAllKernelCaches } from '@aibos/kernel/nextjs';
 * 
 * // After kernel update
 * await revalidateAllKernelCaches();
 * ```
 */
export async function revalidateAllKernelCaches(): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("kernel", "max");
  revalidateTag(`kernel-${KERNEL_VERSION}`, "max");
}

