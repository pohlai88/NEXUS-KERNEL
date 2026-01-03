// @aibos/kernel - Lazy Loading Utilities for Large Value Sets
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Performance optimization: Lazy load large value sets to reduce initial import time
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { VALUE } from "./values";

/**
 * Large value sets that can be lazy loaded
 * These are value sets with many values (>50) that are not always needed immediately
 */
export const LARGE_VALUE_SETS = [
  "COUNTRIES", // 112 values
  "CURRENCIES", // 106 values
] as const;

type LargeValueSetName = (typeof LARGE_VALUE_SETS)[number];

/**
 * Lazy loader for large value sets
 * Returns a promise that resolves to the value set when needed
 */
class LazyValueSetLoader {
  private cache = new Map<LargeValueSetName, Promise<Record<string, string>>>();

  /**
   * Load a large value set lazily
   * First call loads it, subsequent calls return cached promise
   */
  async load(valueSetName: LargeValueSetName): Promise<Record<string, string>> {
    if (this.cache.has(valueSetName)) {
      return this.cache.get(valueSetName)!;
    }

    const loadPromise = this._loadValueSet(valueSetName);
    this.cache.set(valueSetName, loadPromise);
    return loadPromise;
  }

  /**
   * Preload a value set (useful for warming up)
   */
  preload(valueSetName: LargeValueSetName): void {
    this.load(valueSetName);
  }

  /**
   * Check if a value set is already loaded
   */
  isLoaded(valueSetName: LargeValueSetName): boolean {
    return this.cache.has(valueSetName);
  }

  /**
   * Clear the cache (forces reload on next access)
   */
  clear(): void {
    this.cache.clear();
  }

  private async _loadValueSet(
    valueSetName: LargeValueSetName
  ): Promise<Record<string, string>> {
    // Dynamic import of values module
    // This allows bundlers to code-split large value sets
    const valuesModule = await import("./values");
    return valuesModule.VALUE[valueSetName] as Record<string, string>;
  }
}

/**
 * Global lazy loader instance
 */
export const lazyValueSetLoader = new LazyValueSetLoader();

/**
 * Get a large value set lazily
 * 
 * @example
 * ```typescript
 * import { getCountries } from "@aibos/kernel/values/lazy";
 * 
 * const countries = await getCountries();
 * const malaysia = countries.MALAYSIA;
 * ```
 */
export async function getCountries(): Promise<Record<string, string>> {
  return lazyValueSetLoader.load("COUNTRIES");
}

/**
 * Get currencies lazily
 */
export async function getCurrencies(): Promise<Record<string, string>> {
  return lazyValueSetLoader.load("CURRENCIES");
}

/**
 * Preload commonly used value sets
 * Useful for warming up the cache during app initialization
 */
export function preloadLargeValueSets(): void {
  lazyValueSetLoader.preload("COUNTRIES");
  lazyValueSetLoader.preload("CURRENCIES");
}

