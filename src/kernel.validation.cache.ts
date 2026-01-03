// @aibos/kernel - Validation Result Cache (Optimized)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Performance optimization: Advanced caching with LRU, statistics, and memory limits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ConceptShape, ValueSetShape, ValueShape } from "./kernel.contract";

/**
 * LRU Cache implementation for string-based keys
 * Used for caching validation results by code strings
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Cache statistics for monitoring
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

/**
 * Validation cache for performance optimization
 * Optimized with:
 * - WeakMap for object-based caching (automatic GC)
 * - LRU cache for string-based caching (code lookups)
 * - Statistics tracking
 * - Memory limits
 */
class ValidationCache {
  // Object-based caches (WeakMap - automatic GC)
  private conceptCache = new WeakMap<object, ConceptShape>();
  private valueSetCache = new WeakMap<object, ValueSetShape>();
  private valueCache = new WeakMap<object, ValueShape>();

  // String-based caches (LRU - for code lookups)
  private conceptCodeCache = new LRUCache<string, ConceptShape>(500);
  private valueSetCodeCache = new LRUCache<string, ValueSetShape>(200);
  private valueCodeCache = new LRUCache<string, ValueShape>(1000);

  // Statistics
  private stats = {
    conceptHits: 0,
    conceptMisses: 0,
    valueSetHits: 0,
    valueSetMisses: 0,
    valueHits: 0,
    valueMisses: 0,
  };

  private enabled = true;

  /**
   * Enable or disable caching
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Clear all caches
   */
  clear(): void {
    // WeakMap doesn't have clear(), but we can create new instances
    this.conceptCache = new WeakMap();
    this.valueSetCache = new WeakMap();
    this.valueCache = new WeakMap();
    
    // Clear LRU caches
    this.conceptCodeCache.clear();
    this.valueSetCodeCache.clear();
    this.valueCodeCache.clear();

    // Reset statistics
    this.stats = {
      conceptHits: 0,
      conceptMisses: 0,
      valueSetHits: 0,
      valueSetMisses: 0,
      valueHits: 0,
      valueMisses: 0,
    };
  }

  /**
   * Get cached concept by object or code
   */
  getConcept(key: object | string): ConceptShape | undefined {
    if (!this.enabled) return undefined;

    if (typeof key === "string") {
      const cached = this.conceptCodeCache.get(key);
      if (cached !== undefined) {
        this.stats.conceptHits++;
        return cached;
      }
      this.stats.conceptMisses++;
      return undefined;
    }

    const cached = this.conceptCache.get(key);
    if (cached !== undefined) {
      this.stats.conceptHits++;
    } else {
      this.stats.conceptMisses++;
    }
    return cached;
  }

  /**
   * Set cached concept by object or code
   */
  setConcept(key: object | string, value: ConceptShape): void {
    if (!this.enabled) return;

    if (typeof key === "string") {
      this.conceptCodeCache.set(key, value);
    } else {
      this.conceptCache.set(key, value);
      // Also cache by code for faster lookups
      if (value.code) {
        this.conceptCodeCache.set(value.code, value);
      }
    }
  }

  /**
   * Get cached value set by object or code
   */
  getValueSet(key: object | string): ValueSetShape | undefined {
    if (!this.enabled) return undefined;

    if (typeof key === "string") {
      const cached = this.valueSetCodeCache.get(key);
      if (cached !== undefined) {
        this.stats.valueSetHits++;
        return cached;
      }
      this.stats.valueSetMisses++;
      return undefined;
    }

    const cached = this.valueSetCache.get(key);
    if (cached !== undefined) {
      this.stats.valueSetHits++;
    } else {
      this.stats.valueSetMisses++;
    }
    return cached;
  }

  /**
   * Set cached value set by object or code
   */
  setValueSet(key: object | string, value: ValueSetShape): void {
    if (!this.enabled) return;

    if (typeof key === "string") {
      this.valueSetCodeCache.set(key, value);
    } else {
      this.valueSetCache.set(key, value);
      // Also cache by code for faster lookups
      if (value.code) {
        this.valueSetCodeCache.set(value.code, value);
      }
    }
  }

  /**
   * Get cached value by object or code
   */
  getValue(key: object | string): ValueShape | undefined {
    if (!this.enabled) return undefined;

    if (typeof key === "string") {
      const cached = this.valueCodeCache.get(key);
      if (cached !== undefined) {
        this.stats.valueHits++;
        return cached;
      }
      this.stats.valueMisses++;
      return undefined;
    }

    const cached = this.valueCache.get(key);
    if (cached !== undefined) {
      this.stats.valueHits++;
    } else {
      this.stats.valueMisses++;
    }
    return cached;
  }

  /**
   * Set cached value by object or code
   */
  setValue(key: object | string, value: ValueShape): void {
    if (!this.enabled) return;

    if (typeof key === "string") {
      this.valueCodeCache.set(key, value);
    } else {
      this.valueCache.set(key, value);
      // Also cache by code for faster lookups
      const cacheKey = `${value.value_set_code}:${value.code}`;
      this.valueCodeCache.set(cacheKey, value);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    concepts: CacheStats;
    valueSets: CacheStats;
    values: CacheStats;
    total: CacheStats;
  } {
    const conceptTotal = this.stats.conceptHits + this.stats.conceptMisses;
    const valueSetTotal = this.stats.valueSetHits + this.stats.valueSetMisses;
    const valueTotal = this.stats.valueHits + this.stats.valueMisses;
    const totalHits = this.stats.conceptHits + this.stats.valueSetHits + this.stats.valueHits;
    const totalMisses = this.stats.conceptMisses + this.stats.valueSetMisses + this.stats.valueMisses;
    const totalRequests = totalHits + totalMisses;

    return {
      concepts: {
        hits: this.stats.conceptHits,
        misses: this.stats.conceptMisses,
        hitRate: conceptTotal > 0 ? this.stats.conceptHits / conceptTotal : 0,
        size: this.conceptCodeCache.size(),
      },
      valueSets: {
        hits: this.stats.valueSetHits,
        misses: this.stats.valueSetMisses,
        hitRate: valueSetTotal > 0 ? this.stats.valueSetHits / valueSetTotal : 0,
        size: this.valueSetCodeCache.size(),
      },
      values: {
        hits: this.stats.valueHits,
        misses: this.stats.valueMisses,
        hitRate: valueTotal > 0 ? this.stats.valueHits / valueTotal : 0,
        size: this.valueCodeCache.size(),
      },
      total: {
        hits: totalHits,
        misses: totalMisses,
        hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
        size: this.conceptCodeCache.size() + this.valueSetCodeCache.size() + this.valueCodeCache.size(),
      },
    };
  }

  /**
   * Reset statistics (keeps cache, resets counters)
   */
  resetStats(): void {
    this.stats = {
      conceptHits: 0,
      conceptMisses: 0,
      valueSetHits: 0,
      valueSetMisses: 0,
      valueHits: 0,
      valueMisses: 0,
    };
  }
}

/**
 * Global validation cache instance
 */
export const validationCache = new ValidationCache();

/**
 * ValidationCache class (exported for extension)
 */
export { ValidationCache };

/**
 * Cache warming options
 */
export interface CacheWarmingOptions {
  /** Warm concept cache (default: true) */
  concepts?: boolean;
  /** Warm value set cache (default: true) */
  valueSets?: boolean;
  /** Warm value cache (default: false - can be large) */
  values?: boolean;
  /** Maximum concepts to warm (default: 50) */
  maxConcepts?: number;
  /** Maximum value sets to warm (default: 20) */
  maxValueSets?: number;
  /** Maximum values to warm (default: 100) */
  maxValues?: number;
}

/**
 * Performance optimization: Pre-validate and cache common shapes
 * Warms up the cache with frequently used validations
 * 
 * @param options - Cache warming options
 * 
 * @example
 * ```typescript
 * import { warmValidationCache } from '@aibos/kernel/cache';
 * 
 * // Warm cache on app startup
 * warmValidationCache({
 *   concepts: true,
 *   valueSets: true,
 *   maxConcepts: 100,
 * });
 * ```
 */
export async function warmValidationCache(options: CacheWarmingOptions = {}): Promise<void> {
  const {
    concepts = true,
    valueSets = true,
    values = false,
    maxConcepts = 50,
    maxValueSets = 20,
    maxValues = 100,
  } = options;

  try {
    // Dynamic imports to avoid circular dependencies
    if (concepts || valueSets || values) {
      const [{ CONCEPT }, { VALUESET, VALUE }] = await Promise.all([
        import("./concepts.js"),
        import("./values.js"),
      ]);

      // Warm concept cache with most common concepts
      if (concepts && CONCEPT) {
        const conceptCodes = Object.keys(CONCEPT).slice(0, maxConcepts);
        conceptCodes.forEach((code) => {
          const conceptId = CONCEPT[code as keyof typeof CONCEPT];
          // Cache the concept code -> ID mapping
          // This helps with code-based lookups
          validationCache.setConcept(conceptId, {
            code: conceptId,
            category: "ENTITY", // Default, actual would come from registry
            domain: "CORE", // Default
            description: `Cached concept: ${code}`,
            tags: [],
          } as ConceptShape);
        });
      }

      // Warm value set cache
      if (valueSets && VALUESET) {
        const valueSetCodes = Object.keys(VALUESET).slice(0, maxValueSets);
        valueSetCodes.forEach((code) => {
          const valueSetId = VALUESET[code as keyof typeof VALUESET];
          // Cache the value set code -> ID mapping
          validationCache.setValueSet(valueSetId, {
            code: valueSetId,
            domain: "GLOBAL", // Default
            description: `Cached value set: ${code}`,
            jurisdiction: "GLOBAL",
            tags: [],
          } as ValueSetShape);
        });
      }

      // Warm value cache (can be large, so optional)
      if (values && VALUE) {
        let valueCount = 0;
        for (const [valueSetKey, valueSet] of Object.entries(VALUE)) {
          if (valueCount >= maxValues) break;
          
          const valueSetId = VALUESET[valueSetKey as keyof typeof VALUESET] || `VALUESET_${valueSetKey}`;
          
          if (typeof valueSet === "object" && valueSet !== null) {
            for (const [valueKey, valueId] of Object.entries(valueSet)) {
              if (valueCount >= maxValues) break;
              
              const cacheKey = `${valueSetId}:${valueId}`;
              validationCache.setValue(cacheKey, {
                code: valueId as string,
                value_set_code: valueSetId,
                label: valueKey,
                description: `Cached value: ${valueKey}`,
                sort_order: valueCount + 1,
              } as ValueShape);
              
              valueCount++;
            }
          }
        }
      }
    }
  } catch (error) {
    // If imports fail, skip warming (might be in test environment)
    console.warn("Cache warming skipped:", error);
  }
}
