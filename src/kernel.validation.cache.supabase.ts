// @aibos/kernel - Supabase Cache Adapter (Optional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Optional Supabase integration for distributed caching using existing database
// Uses Supabase's built-in caching capabilities via database tables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ConceptShape, ValueSetShape, ValueShape } from "./kernel.contract";
import type { CacheStats } from "./kernel.validation.cache";

/**
 * Supabase query builder interface (simplified for type safety)
 */
export interface SupabaseQueryBuilder {
  eq(column: string, value: unknown): SupabaseQueryBuilder;
  neq(column: string, value: unknown): SupabaseQueryBuilder;
  gt(column: string, value: unknown): SupabaseQueryBuilder;
  lt(column: string, value: unknown): SupabaseQueryBuilder;
  limit(count: number): SupabaseQueryBuilder;
  single(): Promise<{ data: unknown | null; error: unknown | null }>;
  maybeSingle(): Promise<{ data: unknown | null; error: unknown | null }>;
  then<TResult1 = { data: unknown | null; error: unknown | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown | null; error: unknown | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

/**
 * Supabase client interface (compatible with @supabase/supabase-js)
 */
export interface SupabaseClient {
  from(table: string): {
    select(columns?: string): SupabaseQueryBuilder;
    update(values: unknown): SupabaseQueryBuilder;
    insert(values: unknown): {
      select(columns?: string): Promise<{ data: unknown | null; error: unknown | null }>;
    };
    upsert(values: unknown, options?: { onConflict?: string }): {
      select(columns?: string): Promise<{ data: unknown | null; error: unknown | null }>;
    };
    delete(): SupabaseQueryBuilder;
  };
  rpc(functionName: string, params?: Record<string, unknown>): Promise<{
    data: unknown;
    error: unknown | null;
  }>;
}

/**
 * Supabase cache configuration
 */
export interface SupabaseCacheConfig {
  /** Supabase client instance (required) */
  client: SupabaseClient;
  /** Table name for cache storage (default: "kernel_validation_cache") */
  tableName?: string;
  /** TTL in seconds (default: 3600 = 1 hour) */
  ttl?: number;
  /** Enable statistics tracking (default: true) */
  enableStats?: boolean;
}

/**
 * Cache entry structure stored in Supabase
 */
interface CacheEntry {
  cache_key: string;
  cache_type: "concept" | "valueset" | "value";
  cache_value: unknown; // JSONB (parsed)
  expires_at: string; // ISO timestamp
  created_at: string;
}

/**
 * RPC function result for get_cache_entry
 */
interface CacheEntryResult {
  cache_value: unknown; // JSONB
  expires_at: string;
}

/**
 * Supabase-backed validation cache for distributed systems
 * 
 * This adapter provides Supabase caching for validation results, enabling
 * cache sharing across multiple instances/processes using your existing database.
 * 
 * **Benefits:**
 * - No additional infrastructure (uses existing Supabase database)
 * - Distributed cache sharing across instances
 * - Automatic expiration via database queries
 * - No new dependencies required
 * 
 * @example
 * ```typescript
 * import { createSupabaseCache } from '@aibos/kernel/cache/supabase';
 * import { createClient } from '@supabase/supabase-js';
 * 
 * const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
 * 
 * const cache = createSupabaseCache({
 *   client: supabase,
 *   tableName: 'kernel_validation_cache',
 *   ttl: 7200, // 2 hours
 * });
 * 
 * // Use with validation functions
 * import { validateConcept } from '@aibos/kernel/validation';
 * // Cache is automatically used
 * ```
 */
export class SupabaseValidationCache {
  private client: SupabaseClient;
  private tableName: string;
  private ttl: number;
  private enableStats: boolean;
  
  // Statistics
  private stats = {
    conceptHits: 0,
    conceptMisses: 0,
    valueSetHits: 0,
    valueSetMisses: 0,
    valueHits: 0,
    valueMisses: 0,
  };

  constructor(config: SupabaseCacheConfig) {
    this.client = config.client;
    this.tableName = config.tableName || "kernel_validation_cache";
    this.ttl = config.ttl || 3600; // 1 hour default
    this.enableStats = config.enableStats !== false;
  }

  /**
   * Get cache key with type prefix
   */
  private getKey(type: "concept" | "valueset" | "value", code: string): string {
    return `${type}:${code}`;
  }

  /**
   * Serialize shape to JSONB-compatible object
   * Note: Supabase JSONB handles serialization automatically
   */
  private serialize(shape: ConceptShape | ValueSetShape | ValueShape): unknown {
    return shape; // JSONB stores as object, not string
  }

  /**
   * Deserialize JSONB object to shape
   */
  private deserialize<T extends ConceptShape | ValueSetShape | ValueShape>(
    value: unknown
  ): T {
    // JSONB is already parsed by Supabase
    return value as T;
  }

  /**
   * Get expiration timestamp
   */
  private getExpirationTime(): string {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.ttl);
    return expiresAt.toISOString();
  }

  /**
   * Get cached concept by code (optimized with RPC function)
   */
  async getConcept(code: string): Promise<ConceptShape | undefined> {
    try {
      const key = this.getKey("concept", code);
      
      // Use optimized RPC function for better performance
      const result = await this.client.rpc("get_cache_entry", {
        p_cache_key: key,
        p_cache_type: "concept",
      });

      if (result.error) {
        // Fallback to direct query if RPC not available
        return await this.getConceptDirect(key);
      }

      if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
        if (this.enableStats) this.stats.conceptMisses++;
        return undefined;
      }

      const entry = Array.isArray(result.data) 
        ? (result.data[0] as CacheEntryResult)
        : (result.data as CacheEntryResult);

      if (this.enableStats) this.stats.conceptHits++;
      return this.deserialize<ConceptShape>(entry.cache_value);
    } catch (error) {
      console.warn("Supabase cache getConcept error:", error);
      if (this.enableStats) this.stats.conceptMisses++;
      return undefined;
    }
  }

  /**
   * Fallback direct query method (if RPC not available)
   */
  private async getConceptDirect(key: string): Promise<ConceptShape | undefined> {
    const result = await this.client
      .from(this.tableName)
      .select("cache_value, expires_at")
      .eq("cache_key", key)
      .eq("cache_type", "concept")
      .gt("expires_at", new Date().toISOString()) // Database-level expiration check
      .maybeSingle();

    if (result.error || !result.data) {
      if (this.enableStats) this.stats.conceptMisses++;
      return undefined;
    }

    const entry = result.data as CacheEntry;
    if (this.enableStats) this.stats.conceptHits++;
    return this.deserialize<ConceptShape>(entry.cache_value);
  }

  /**
   * Set cached concept (optimized with RPC function)
   */
  async setConcept(code: string, value: ConceptShape): Promise<void> {
    try {
      const key = this.getKey("concept", code);
      const serialized = this.serialize(value);
      const expiresAt = this.getExpirationTime();

      // Use optimized RPC function for better performance
      const result = await this.client.rpc("upsert_cache_entry", {
        p_cache_key: key,
        p_cache_type: "concept",
        p_cache_value: serialized,
        p_expires_at: expiresAt,
      });

      if (result.error) {
        // Fallback to direct upsert if RPC not available
        await this.client
          .from(this.tableName)
          .upsert({
            cache_key: key,
            cache_type: "concept",
            cache_value: serialized,
            expires_at: expiresAt,
          } as CacheEntry);
      }
    } catch (error) {
      console.warn("Supabase cache setConcept error:", error);
    }
  }

  /**
   * Get cached value set by code (optimized with RPC function)
   */
  async getValueSet(code: string): Promise<ValueSetShape | undefined> {
    try {
      const key = this.getKey("valueset", code);
      
      const result = await this.client.rpc("get_cache_entry", {
        p_cache_key: key,
        p_cache_type: "valueset",
      });

      if (result.error) {
        // Fallback to direct query
        const directResult = await this.client
          .from(this.tableName)
          .select("cache_value, expires_at")
          .eq("cache_key", key)
          .eq("cache_type", "valueset")
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (directResult.error || !directResult.data) {
          if (this.enableStats) this.stats.valueSetMisses++;
          return undefined;
        }

        const entry = directResult.data as CacheEntry;
        if (this.enableStats) this.stats.valueSetHits++;
        return this.deserialize<ValueSetShape>(entry.cache_value);
      }

      if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
        if (this.enableStats) this.stats.valueSetMisses++;
        return undefined;
      }

      const entry = Array.isArray(result.data) 
        ? (result.data[0] as CacheEntryResult)
        : (result.data as CacheEntryResult);

      if (this.enableStats) this.stats.valueSetHits++;
      return this.deserialize<ValueSetShape>(entry.cache_value);
    } catch (error) {
      console.warn("Supabase cache getValueSet error:", error);
      if (this.enableStats) this.stats.valueSetMisses++;
      return undefined;
    }
  }

  /**
   * Set cached value set (optimized with RPC function)
   */
  async setValueSet(code: string, value: ValueSetShape): Promise<void> {
    try {
      const key = this.getKey("valueset", code);
      const serialized = this.serialize(value);
      const expiresAt = this.getExpirationTime();

      const result = await this.client.rpc("upsert_cache_entry", {
        p_cache_key: key,
        p_cache_type: "valueset",
        p_cache_value: serialized,
        p_expires_at: expiresAt,
      });

      if (result.error) {
        // Fallback to direct upsert
        await this.client
          .from(this.tableName)
          .upsert({
            cache_key: key,
            cache_type: "valueset",
            cache_value: serialized,
            expires_at: expiresAt,
          } as CacheEntry);
      }
    } catch (error) {
      console.warn("Supabase cache setValueSet error:", error);
    }
  }

  /**
   * Get cached value by code (format: "valuesetCode:valueCode") - optimized with RPC
   */
  async getValue(code: string): Promise<ValueShape | undefined> {
    try {
      const key = this.getKey("value", code);
      
      const result = await this.client.rpc("get_cache_entry", {
        p_cache_key: key,
        p_cache_type: "value",
      });

      if (result.error) {
        // Fallback to direct query
        const directResult = await this.client
          .from(this.tableName)
          .select("cache_value, expires_at")
          .eq("cache_key", key)
          .eq("cache_type", "value")
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (directResult.error || !directResult.data) {
          if (this.enableStats) this.stats.valueMisses++;
          return undefined;
        }

        const entry = directResult.data as CacheEntry;
        if (this.enableStats) this.stats.valueHits++;
        return this.deserialize<ValueShape>(entry.cache_value);
      }

      if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
        if (this.enableStats) this.stats.valueMisses++;
        return undefined;
      }

      const entry = Array.isArray(result.data) 
        ? (result.data[0] as CacheEntryResult)
        : (result.data as CacheEntryResult);

      if (this.enableStats) this.stats.valueHits++;
      return this.deserialize<ValueShape>(entry.cache_value);
    } catch (error) {
      console.warn("Supabase cache getValue error:", error);
      if (this.enableStats) this.stats.valueMisses++;
      return undefined;
    }
  }

  /**
   * Set cached value (optimized with RPC function)
   */
  async setValue(code: string, value: ValueShape): Promise<void> {
    try {
      const key = this.getKey("value", code);
      const serialized = this.serialize(value);
      const expiresAt = this.getExpirationTime();

      const result = await this.client.rpc("upsert_cache_entry", {
        p_cache_key: key,
        p_cache_type: "value",
        p_cache_value: serialized,
        p_expires_at: expiresAt,
      });

      if (result.error) {
        // Fallback to direct upsert
        await this.client
          .from(this.tableName)
          .upsert({
            cache_key: key,
            cache_type: "value",
            cache_value: serialized,
            expires_at: expiresAt,
          } as CacheEntry);
      }
    } catch (error) {
      console.warn("Supabase cache setValue error:", error);
    }
  }

  /**
   * Clear all cached items (optimized)
   */
  async clear(): Promise<void> {
    try {
      // Delete all entries (TRUNCATE requires elevated permissions)
      await this.client
        .from(this.tableName)
        .delete()
        .neq("cache_key", ""); // Delete all (more efficient than LIKE)
      
      // Reset statistics
      this.stats = {
        conceptHits: 0,
        conceptMisses: 0,
        valueSetHits: 0,
        valueSetMisses: 0,
        valueHits: 0,
        valueMisses: 0,
      };
    } catch (error) {
      console.warn("Supabase cache clear error:", error);
    }
  }

  /**
   * Clean expired cache entries (can be called periodically)
   */
  async cleanExpired(): Promise<number> {
    try {
      const result = await this.client.rpc("cleanup_expired_cache");
      if (result.error) {
        // Fallback to direct delete
        const deleteResult = await this.client
          .from(this.tableName)
          .delete()
          .lt("expires_at", new Date().toISOString());
        
        // Return approximate count (Supabase doesn't return count directly)
        return Array.isArray(deleteResult.data) ? deleteResult.data.length : 0;
      }
      // RPC function doesn't return count, but we can query it
      return 0; // Would need additional query to get exact count
    } catch (error) {
      console.warn("Supabase cache cleanExpired error:", error);
      return 0;
    }
  }

  /**
   * Get cache statistics (synchronous - in-memory stats only)
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
        size: 0, // Use getDatabaseStats() for actual database size
      },
      valueSets: {
        hits: this.stats.valueSetHits,
        misses: this.stats.valueSetMisses,
        hitRate: valueSetTotal > 0 ? this.stats.valueSetHits / valueSetTotal : 0,
        size: 0,
      },
      values: {
        hits: this.stats.valueHits,
        misses: this.stats.valueMisses,
        hitRate: valueTotal > 0 ? this.stats.valueHits / valueTotal : 0,
        size: 0,
      },
      total: {
        hits: totalHits,
        misses: totalMisses,
        hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
        size: 0,
      },
    };
  }

  /**
   * Get database-level cache statistics (async - includes actual cache sizes)
   */
  async getDatabaseStats(): Promise<{
    concepts: CacheStats & { size: number };
    valueSets: CacheStats & { size: number };
    values: CacheStats & { size: number };
    total: CacheStats & { size: number };
  }> {
    const inMemoryStats = this.getStats();
    
    // Get database stats via RPC
    let dbStats: Record<string, { active_count: number }> = {};
    try {
      const statsResult = await this.client.rpc("get_cache_stats");
      if (!statsResult.error && statsResult.data) {
        const statsArray = Array.isArray(statsResult.data) 
          ? statsResult.data 
          : [statsResult.data];
        
        for (const stat of statsArray) {
          const s = stat as { cache_type: string; active_count: number };
          dbStats[s.cache_type] = { active_count: s.active_count };
        }
      }
    } catch (error) {
      // Ignore errors, use in-memory stats only
    }

    return {
      concepts: {
        ...inMemoryStats.concepts,
        size: dbStats.concept?.active_count || 0,
      },
      valueSets: {
        ...inMemoryStats.valueSets,
        size: dbStats.valueset?.active_count || 0,
      },
      values: {
        ...inMemoryStats.values,
        size: dbStats.value?.active_count || 0,
      },
      total: {
        ...inMemoryStats.total,
        size: (dbStats.concept?.active_count || 0) + 
              (dbStats.valueset?.active_count || 0) + 
              (dbStats.value?.active_count || 0),
      },
    };
  }

  /**
   * Reset statistics (keeps cache)
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
 * Create a Supabase-backed validation cache
 * 
 * @param config - Supabase cache configuration
 * @returns Supabase validation cache instance
 * 
 * @example
 * ```typescript
 * import { createClient } from '@supabase/supabase-js';
 * import { createSupabaseCache } from '@aibos/kernel/cache/supabase';
 * 
 * const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
 * 
 * const cache = createSupabaseCache({
 *   client: supabase,
 *   tableName: 'kernel_validation_cache',
 *   ttl: 7200,
 * });
 * ```
 */
export function createSupabaseCache(config: SupabaseCacheConfig): SupabaseValidationCache {
  return new SupabaseValidationCache(config);
}

