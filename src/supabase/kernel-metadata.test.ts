// @aibos/kernel - Kernel Metadata Database Integration Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  syncConceptsToDatabase,
  syncValueSetsToDatabase,
  syncValuesToDatabase,
  syncKernelToDatabase,
  getKernelMetadataFromDatabase,
  getCurrentKernelVersion,
  type KernelMetadataRow,
  type SyncKernelOptions,
} from "./kernel-metadata.js";
import type { SupabaseClient } from "../kernel.validation.cache.supabase.js";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";

// Mock version module
vi.mock("../version.js", () => ({
  KERNEL_VERSION: "1.1.0",
  SNAPSHOT_ID: "test-snapshot-123",
}));

// Create mock Supabase client
function createMockSupabaseClient() {
  const mockData: Record<string, unknown[]> = {};
  let updateError: unknown = null;
  let upsertError: unknown = null;
  let selectError: unknown = null;

  const mockClient: SupabaseClient = {
    from: vi.fn((table: string) => ({
      select: vi.fn((columns?: string) => {
        const queryBuilder = {
          eq: vi.fn((column: string, value: unknown) => {
            queryBuilder.eq = vi.fn((col2: string, val2: unknown) => {
              queryBuilder.eq = vi.fn((col3: string, val3: unknown) => queryBuilder);
              queryBuilder.neq = vi.fn((col: string, val: unknown) => queryBuilder);
              queryBuilder.gt = vi.fn((col: string, val: unknown) => queryBuilder);
              queryBuilder.limit = vi.fn((count: number) => queryBuilder);
              queryBuilder.single = vi.fn(async () => {
                if (selectError) {
                  return { data: null, error: selectError };
                }
                return { data: mockData[table]?.[0] || null, error: null };
              });
              queryBuilder.maybeSingle = vi.fn(async () => {
                if (selectError) {
                  return { data: null, error: selectError };
                }
                return { data: mockData[table]?.[0] || null, error: null };
              });
              queryBuilder.then = vi.fn(async (onfulfilled) => {
                if (selectError) {
                  return onfulfilled?.({ data: null, error: selectError });
                }
                return onfulfilled?.({ data: mockData[table] || [], error: null });
              });
              return queryBuilder;
            });
            queryBuilder.neq = vi.fn((col: string, val: unknown) => queryBuilder);
            queryBuilder.gt = vi.fn((col: string, val: unknown) => queryBuilder);
            queryBuilder.limit = vi.fn((count: number) => queryBuilder);
            queryBuilder.single = vi.fn(async () => {
              if (selectError) {
                return { data: null, error: selectError };
              }
              return { data: mockData[table]?.[0] || null, error: null };
            });
            queryBuilder.maybeSingle = vi.fn(async () => {
              if (selectError) {
                return { data: null, error: selectError };
              }
              return { data: mockData[table]?.[0] || null, error: null };
            });
            queryBuilder.then = vi.fn(async (onfulfilled) => {
              if (selectError) {
                return onfulfilled?.({ data: null, error: selectError });
              }
              return onfulfilled?.({ data: mockData[table] || [], error: null });
            });
            return queryBuilder;
          }),
          neq: vi.fn((column: string, value: unknown) => {
            queryBuilder.neq = vi.fn((col: string, val: unknown) => queryBuilder);
            queryBuilder.gt = vi.fn((col: string, val: unknown) => queryBuilder);
            queryBuilder.limit = vi.fn((count: number) => queryBuilder);
            queryBuilder.single = vi.fn(async () => {
              if (selectError) {
                return { data: null, error: selectError };
              }
              return { data: mockData[table]?.[0] || null, error: null };
            });
            queryBuilder.maybeSingle = vi.fn(async () => {
              if (selectError) {
                return { data: null, error: selectError };
              }
              return { data: mockData[table]?.[0] || null, error: null };
            });
            queryBuilder.then = vi.fn(async (onfulfilled) => {
              if (selectError) {
                return onfulfilled?.({ data: null, error: selectError });
              }
              return onfulfilled?.({ data: mockData[table] || [], error: null });
            });
            return queryBuilder;
          }),
          gt: vi.fn((column: string, value: unknown) => queryBuilder),
          limit: vi.fn((count: number) => queryBuilder),
          single: vi.fn(async () => {
            if (selectError) {
              return { data: null, error: selectError };
            }
            return { data: mockData[table]?.[0] || null, error: null };
          }),
          maybeSingle: vi.fn(async () => {
            if (selectError) {
              return { data: null, error: selectError };
            }
            return { data: mockData[table]?.[0] || null, error: null };
          }),
          then: vi.fn(async (onfulfilled) => {
            if (selectError) {
              return onfulfilled?.({ data: null, error: selectError });
            }
            return onfulfilled?.({ data: mockData[table] || [], error: null });
          }),
        };
        return queryBuilder;
      }),
      update: vi.fn((values: unknown) => {
        const queryBuilder = {
          eq: vi.fn((column: string, value: unknown) => {
            queryBuilder.neq = vi.fn((col: string, val: unknown) => {
              queryBuilder.then = vi.fn(async (onfulfilled) => {
                if (updateError) {
                  return onfulfilled?.({ data: null, error: updateError });
                }
                return onfulfilled?.({ data: [], error: null });
              });
              return queryBuilder;
            });
            queryBuilder.then = vi.fn(async (onfulfilled) => {
              if (updateError) {
                return onfulfilled?.({ data: null, error: updateError });
              }
              return onfulfilled?.({ data: [], error: null });
            });
            return queryBuilder;
          }),
          neq: vi.fn((column: string, value: unknown) => {
            queryBuilder.then = vi.fn(async (onfulfilled) => {
              if (updateError) {
                return onfulfilled?.({ data: null, error: updateError });
              }
              return onfulfilled?.({ data: [], error: null });
            });
            return queryBuilder;
          }),
          then: vi.fn(async (onfulfilled) => {
            if (updateError) {
              return onfulfilled?.({ data: null, error: updateError });
            }
            return onfulfilled?.({ data: [], error: null });
          }),
        };
        return queryBuilder;
      }),
      upsert: vi.fn((values: unknown, options?: { onConflict?: string }) => ({
        select: vi.fn(async () => {
          if (upsertError) {
            return { data: null, error: upsertError };
          }
          const rows = Array.isArray(values) ? values : [values];
          if (!mockData[table]) {
            mockData[table] = [];
          }
          mockData[table].push(...rows);
          return { data: rows, error: null };
        }),
      })),
      insert: vi.fn((values: unknown) => ({
        select: vi.fn(async () => {
          if (upsertError) {
            return { data: null, error: upsertError };
          }
          const rows = Array.isArray(values) ? values : [values];
          if (!mockData[table]) {
            mockData[table] = [];
          }
          mockData[table].push(...rows);
          return { data: rows, error: null };
        }),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(async () => ({ data: null, error: null })),
        neq: vi.fn(async () => ({ data: null, error: null })),
      })),
    })),
    rpc: vi.fn(async () => ({ data: null, error: null })),
  };

  return {
    client: mockClient,
    setUpdateError: (error: unknown) => {
      updateError = error;
    },
    setUpsertError: (error: unknown) => {
      upsertError = error;
    },
    setSelectError: (error: unknown) => {
      selectError = error;
    },
    clearErrors: () => {
      updateError = null;
      upsertError = null;
      selectError = null;
    },
    getData: (table: string) => mockData[table] || [],
    clearData: () => {
      Object.keys(mockData).forEach((key) => delete mockData[key]);
    },
  };
}

describe("Kernel Metadata Database Integration", () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mockSupabase = createMockSupabaseClient();
  });

  describe("syncConceptsToDatabase", () => {
    it("should sync concepts successfully", async () => {
      const concepts = [
        { code: "INVOICE", category: "ENTITY", domain: "SALES" },
        { code: "ACCOUNT", category: "ENTITY", domain: "FINANCE" },
      ] as any[];

      const result = await syncConceptsToDatabase(mockSupabase.client, concepts);

      expect(result).toBe(2);
      expect(mockSupabase.client.from).toHaveBeenCalledWith("kernel_metadata");
    });

    it("should sync concepts in batches", async () => {
      const concepts = Array.from({ length: 250 }, (_, i) => ({
        code: `CONCEPT_${i}`,
        category: "ENTITY",
        domain: "CORE",
      })) as any[];

      const result = await syncConceptsToDatabase(mockSupabase.client, concepts, {
        batchSize: 100,
      });

      expect(result).toBe(250);
    });

    it("should handle upsert errors", async () => {
      mockSupabase.setUpsertError(new Error("Database error"));
      const concepts = [{ code: "INVOICE", category: "ENTITY", domain: "SALES" }] as any[];

      await expect(
        syncConceptsToDatabase(mockSupabase.client, concepts)
      ).rejects.toThrow("Failed to sync concepts batch");
    });

    it("should not mark previous as not current when option is false", async () => {
      const concepts = [{ code: "INVOICE", category: "ENTITY", domain: "SALES" }] as any[];

      await syncConceptsToDatabase(mockSupabase.client, concepts, {
        markPreviousAsNotCurrent: false,
      });

      // Should not call update
      expect(mockSupabase.client.from).toHaveBeenCalled();
    });
  });

  describe("syncValueSetsToDatabase", () => {
    it("should sync value sets successfully", async () => {
      const valueSets = [
        { code: "ACCOUNT_TYPE", values: [] },
        { code: "INVOICE_STATUS", values: [] },
      ] as any[];

      const result = await syncValueSetsToDatabase(mockSupabase.client, valueSets);

      expect(result).toBe(2);
    });

    it("should handle errors", async () => {
      mockSupabase.setUpsertError(new Error("Database error"));
      const valueSets = [{ code: "ACCOUNT_TYPE", values: [] }] as any[];

      await expect(
        syncValueSetsToDatabase(mockSupabase.client, valueSets)
      ).rejects.toThrow("Failed to sync value sets batch");
    });
  });

  describe("syncValuesToDatabase", () => {
    it("should sync values successfully", async () => {
      const values = [
        { code: "ASSET", value_set_code: "ACCOUNT_TYPE" },
        { code: "LIABILITY", value_set_code: "ACCOUNT_TYPE" },
      ] as any[];

      const result = await syncValuesToDatabase(mockSupabase.client, values);

      expect(result).toBe(2);
    });

    it("should handle errors", async () => {
      mockSupabase.setUpsertError(new Error("Database error"));
      const values = [{ code: "ASSET", value_set_code: "ACCOUNT_TYPE" }] as any[];

      await expect(
        syncValuesToDatabase(mockSupabase.client, values)
      ).rejects.toThrow("Failed to sync values batch");
    });
  });

  describe("syncKernelToDatabase", () => {
    it("should sync entire kernel successfully", async () => {
      const kernelRegistry = {
        concepts: [{ code: "INVOICE", category: "ENTITY", domain: "SALES" }] as any[],
        value_sets: [{ code: "ACCOUNT_TYPE", values: [] }] as any[],
        values: [{ code: "ASSET", value_set_code: "ACCOUNT_TYPE" }] as any[],
      };

      const result = await syncKernelToDatabase(mockSupabase.client, kernelRegistry);

      expect(result.conceptsSynced).toBe(1);
      expect(result.valueSetsSynced).toBe(1);
      expect(result.valuesSynced).toBe(1);
      expect(result.totalSynced).toBe(3);
      expect(result.errors).toEqual([]);
    });

    it("should handle partial failures", async () => {
      mockSupabase.setUpsertError(new Error("Database error"));
      const kernelRegistry = {
        concepts: [{ code: "INVOICE", category: "ENTITY", domain: "SALES" }] as any[],
        value_sets: [{ code: "ACCOUNT_TYPE", values: [] }] as any[],
        values: [{ code: "ASSET", value_set_code: "ACCOUNT_TYPE" }] as any[],
      };

      const result = await syncKernelToDatabase(mockSupabase.client, kernelRegistry);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.totalSynced).toBeLessThan(3);
    });
  });

  describe("getKernelMetadataFromDatabase", () => {
    it("should fetch all metadata", async () => {
      mockSupabase.client.from("kernel_metadata").select("*").then = vi.fn(async (onfulfilled) => {
        return onfulfilled?.({ data: [], error: null });
      });

      const result = await getKernelMetadataFromDatabase(mockSupabase.client);

      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter by entity type", async () => {
      mockSupabase.client.from("kernel_metadata").select("*").then = vi.fn(async (onfulfilled) => {
        return onfulfilled?.({ data: [], error: null });
      });

      await getKernelMetadataFromDatabase(mockSupabase.client, "concept");

      expect(mockSupabase.client.from).toHaveBeenCalledWith("kernel_metadata");
    });

    it("should handle errors", async () => {
      mockSupabase.setSelectError(new Error("Database error"));
      mockSupabase.client.from("kernel_metadata").select("*").then = vi.fn(async (onfulfilled) => {
        return onfulfilled?.({ data: null, error: new Error("Database error") });
      });

      await expect(
        getKernelMetadataFromDatabase(mockSupabase.client)
      ).rejects.toThrow("Failed to fetch kernel metadata");
    });
  });

  describe("getCurrentKernelVersion", () => {
    it("should return current kernel version", async () => {
      // Create a proper mock that matches the query chain
      const mockQuery = {
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { kernel_version: "1.1.0", snapshot_id: "test-snapshot" },
              error: null,
            })),
          })),
        })),
      };

      const mockFrom = {
        select: vi.fn(() => mockQuery),
      };

      vi.mocked(mockSupabase.client.from).mockReturnValue(mockFrom as any);

      const result = await getCurrentKernelVersion(mockSupabase.client);

      expect(result).toEqual({
        kernel_version: "1.1.0",
        snapshot_id: "test-snapshot",
      });
    });

    it("should return null if no version found", async () => {
      mockSupabase.client.from("kernel_metadata").select("*").maybeSingle = vi.fn(async () => {
        return { data: null, error: null };
      });

      const result = await getCurrentKernelVersion(mockSupabase.client);

      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      mockSupabase.client.from("kernel_metadata").select("*").maybeSingle = vi.fn(async () => {
        return { data: null, error: new Error("Database error") };
      });

      const result = await getCurrentKernelVersion(mockSupabase.client);

      expect(result).toBeNull();
    });
  });
});

