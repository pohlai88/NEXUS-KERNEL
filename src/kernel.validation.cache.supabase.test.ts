// @aibos/kernel - Supabase Cache Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSupabaseCache, SupabaseValidationCache } from "./kernel.validation.cache.supabase";
import type { ConceptShape, ValueSetShape, ValueShape } from "./kernel.contract";

// Mock Supabase client
const createMockSupabaseClient = () => {
  const mockData: Record<string, unknown> = {};
  
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn((columns?: string) => ({
        eq: vi.fn((column: string, value: unknown) => ({
          gt: vi.fn((column: string, value: unknown) => ({
            maybeSingle: vi.fn(async () => {
              const key = `${table}:${value}`;
              const entry = mockData[key];
              if (entry) {
                return { data: entry, error: null };
              }
              return { data: null, error: null };
            }),
          })),
          maybeSingle: vi.fn(async () => {
            const key = `${table}:${value}`;
            const entry = mockData[key];
            if (entry) {
              return { data: entry, error: null };
            }
            return { data: null, error: null };
          }),
        })),
      })),
      upsert: vi.fn(async (values: unknown) => {
        const v = values as { cache_key: string; cache_type: string };
        const key = `${v.cache_key}:${v.cache_type}`;
        mockData[key] = values;
        return { data: values, error: null };
      }),
      delete: vi.fn(() => ({
        eq: vi.fn(async (column: string, value: unknown) => {
          const key = `${table}:${value}`;
          delete mockData[key];
          return { data: null, error: null };
        }),
        neq: vi.fn(async (column: string, value: unknown) => {
          Object.keys(mockData).forEach(k => delete mockData[k]);
          return { data: null, error: null };
        }),
        lt: vi.fn(async (column: string, value: unknown) => {
          // Mock expired entry deletion
          return { data: [], error: null };
        }),
      })),
    })),
    rpc: vi.fn(async (functionName: string, params?: Record<string, unknown>) => {
      if (functionName === "get_cache_entry") {
        const key = `${params?.p_cache_key}:${params?.p_cache_type}`;
        const entry = mockData[key];
        if (entry) {
          const e = entry as { cache_value: unknown; expires_at: string };
          // Check expiration
          if (new Date(e.expires_at) > new Date()) {
            return { data: [e], error: null };
          }
        }
        return { data: [], error: null };
      }
      if (functionName === "upsert_cache_entry") {
        const key = `${params?.p_cache_key}:${params?.p_cache_type}`;
        mockData[key] = {
          cache_value: params?.p_cache_value,
          expires_at: params?.p_expires_at,
        };
        return { data: null, error: null };
      }
      if (functionName === "get_cache_stats") {
        return {
          data: [
            { cache_type: "concept", active_count: 5 },
            { cache_type: "valueset", active_count: 3 },
            { cache_type: "value", active_count: 10 },
          ],
          error: null,
        };
      }
      if (functionName === "cleanup_expired_cache") {
        return { data: null, error: null };
      }
      return { data: null, error: null };
    }),
  };
};

describe("SupabaseValidationCache", () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;
  let cache: SupabaseValidationCache;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    cache = createSupabaseCache({
      client: mockClient as unknown as Parameters<typeof createSupabaseCache>[0]["client"],
      tableName: "kernel_validation_cache",
      ttl: 3600,
    });
  });

  describe("getConcept", () => {
    it("should return cached concept if exists and not expired", async () => {
      const concept: ConceptShape = {
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test Concept",
        tags: [],
      };

      await cache.setConcept("TEST_CONCEPT", concept);
      const result = await cache.getConcept("TEST_CONCEPT");

      expect(result).toBeDefined();
      expect(result?.code).toBe("TEST_CONCEPT");
    });

    it("should return undefined if concept not cached", async () => {
      const result = await cache.getConcept("NON_EXISTENT");
      expect(result).toBeUndefined();
    });
  });

  describe("setConcept", () => {
    it("should cache concept successfully", async () => {
      const concept: ConceptShape = {
        code: "NEW_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "New Concept",
        tags: [],
      };

      await cache.setConcept("NEW_CONCEPT", concept);
      
      // Verify RPC was called
      expect(mockClient.rpc).toHaveBeenCalledWith(
        "upsert_cache_entry",
        expect.objectContaining({
          p_cache_key: "concept:NEW_CONCEPT",
          p_cache_type: "concept",
        })
      );
    });
  });

  describe("getValueSet", () => {
    it("should return cached value set if exists", async () => {
      const valueSet: ValueSetShape = {
        code: "TEST_VALUESET",
        domain: "CORE",
        description: "Test Value Set",
        jurisdiction: "GLOBAL",
        tags: [],
      };

      await cache.setValueSet("TEST_VALUESET", valueSet);
      const result = await cache.getValueSet("TEST_VALUESET");

      expect(result).toBeDefined();
      expect(result?.code).toBe("TEST_VALUESET");
    });
  });

  describe("getValue", () => {
    it("should return cached value if exists", async () => {
      const value: ValueShape = {
        code: "TEST_VALUE",
        value_set_code: "TEST_VALUESET",
        label: "Test Value",
        description: "Test Value Description",
      };

      await cache.setValue("TEST_VALUESET:TEST_VALUE", value);
      const result = await cache.getValue("TEST_VALUESET:TEST_VALUE");

      expect(result).toBeDefined();
      expect(result?.code).toBe("TEST_VALUE");
    });
  });

  describe("clear", () => {
    it("should clear all cache entries", async () => {
      await cache.clear();
      expect(mockClient.from).toHaveBeenCalledWith("kernel_validation_cache");
    });
  });

  describe("cleanExpired", () => {
    it("should clean expired entries", async () => {
      const count = await cache.cleanExpired();
      expect(mockClient.rpc).toHaveBeenCalledWith("cleanup_expired_cache");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getStats", () => {
    it("should return cache statistics", () => {
      const stats = cache.getStats();
      
      expect(stats).toHaveProperty("concepts");
      expect(stats).toHaveProperty("valueSets");
      expect(stats).toHaveProperty("values");
      expect(stats).toHaveProperty("total");
      
      expect(stats.concepts.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.concepts.hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe("getDatabaseStats", () => {
    it("should return database-level statistics", async () => {
      const stats = await cache.getDatabaseStats();
      
      expect(stats).toHaveProperty("concepts");
      expect(stats).toHaveProperty("valueSets");
      expect(stats).toHaveProperty("values");
      expect(stats).toHaveProperty("total");
      
      // Should include database sizes
      expect(stats.concepts.size).toBeGreaterThanOrEqual(0);
      expect(stats.valueSets.size).toBeGreaterThanOrEqual(0);
      expect(stats.values.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe("resetStats", () => {
    it("should reset statistics", () => {
      cache.resetStats();
      const stats = cache.getStats();
      
      expect(stats.concepts.hits).toBe(0);
      expect(stats.concepts.misses).toBe(0);
      expect(stats.valueSets.hits).toBe(0);
      expect(stats.valueSets.misses).toBe(0);
      expect(stats.values.hits).toBe(0);
      expect(stats.values.misses).toBe(0);
    });
  });
});

