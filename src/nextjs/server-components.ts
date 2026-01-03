// @aibos/kernel - Next.js Server Components Integration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Server Components utilities with Next.js unstable_cache for optimal performance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { unstable_cache } from "next/cache";
import { CONCEPT } from "../concepts.js";
import { VALUESET, VALUE } from "../values.js";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";

/**
 * Get cached concepts (Server Component optimized)
 * 
 * Uses Next.js unstable_cache for request-level caching.
 * Cache is invalidated when kernel version changes.
 * 
 * @returns Cached CONCEPT object
 * 
 * @example
 * ```typescript
 * // app/concepts/page.tsx
 * import { getCachedConcepts } from '@aibos/kernel/nextjs';
 * 
 * export default async function ConceptsPage() {
 *   const concepts = await getCachedConcepts();
 *   return <div>Render concepts here</div>;
 * }
 * ```
 */
export const getCachedConcepts = unstable_cache(
  async () => CONCEPT,
  ["kernel-concepts", KERNEL_VERSION, SNAPSHOT_ID],
  {
    revalidate: 3600, // 1 hour
    tags: ["kernel", `kernel-${KERNEL_VERSION}`],
  }
);

/**
 * Get cached value sets (Server Component optimized)
 * 
 * @returns Cached VALUESET object
 */
export const getCachedValueSets = unstable_cache(
  async () => VALUESET,
  ["kernel-valuesets", KERNEL_VERSION, SNAPSHOT_ID],
  {
    revalidate: 3600, // 1 hour
    tags: ["kernel", `kernel-${KERNEL_VERSION}`],
  }
);

/**
 * Get cached values (Server Component optimized)
 * 
 * @returns Cached VALUE object
 */
export const getCachedValues = unstable_cache(
  async () => VALUE,
  ["kernel-values", KERNEL_VERSION, SNAPSHOT_ID],
  {
    revalidate: 3600, // 1 hour
    tags: ["kernel", `kernel-${KERNEL_VERSION}`],
  }
);

/**
 * Revalidate kernel cache
 * 
 * Call this after kernel updates to invalidate Next.js cache.
 * 
 * @example
 * ```typescript
 * // app/api/kernel/sync/route.ts
 * import { revalidateKernelCache } from '@aibos/kernel/nextjs';
 * 
 * export async function POST() {
 *   // Sync kernel to database
 *   await syncKernel();
 *   
 *   // Revalidate Next.js cache
 *   await revalidateKernelCache();
 *   
 *   return Response.json({ success: true });
 * }
 * ```
 */
export async function revalidateKernelCache(): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("kernel", "max");
}

/**
 * Get kernel version info (cached)
 * 
 * @returns Kernel version and snapshot ID
 */
export const getKernelVersion = unstable_cache(
  async () => ({
    version: KERNEL_VERSION,
    snapshotId: SNAPSHOT_ID,
  }),
  ["kernel-version", KERNEL_VERSION, SNAPSHOT_ID],
  {
    revalidate: 3600,
    tags: ["kernel", `kernel-${KERNEL_VERSION}`],
  }
);

