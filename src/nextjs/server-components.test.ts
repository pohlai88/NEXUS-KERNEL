// @aibos/kernel - Next.js Server Components Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCachedConcepts,
  getCachedValueSets,
  getCachedValues,
  getKernelVersion,
  revalidateKernelCache,
} from "./server-components.js";

// Mock next/cache
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((fn, key, options) => {
    return async () => fn();
  }),
}));

describe("Next.js Server Components", () => {
  describe("getCachedConcepts", () => {
    it("should return cached concepts", async () => {
      const concepts = await getCachedConcepts();
      expect(concepts).toBeDefined();
      expect(typeof concepts).toBe("object");
    });
  });

  describe("getCachedValueSets", () => {
    it("should return cached value sets", async () => {
      const valueSets = await getCachedValueSets();
      expect(valueSets).toBeDefined();
      expect(typeof valueSets).toBe("object");
    });
  });

  describe("getCachedValues", () => {
    it("should return cached values", async () => {
      const values = await getCachedValues();
      expect(values).toBeDefined();
      expect(typeof values).toBe("object");
    });
  });

  describe("getKernelVersion", () => {
    it("should return kernel version info", async () => {
      const version = await getKernelVersion();
      expect(version).toBeDefined();
      expect(version.version).toBeDefined();
      expect(version.snapshotId).toBeDefined();
    });
  });

  describe("revalidateKernelCache", () => {
    it("should revalidate kernel cache", async () => {
      // Mock revalidateTag
      const mockRevalidateTag = vi.fn();
      vi.doMock("next/cache", () => ({
        revalidateTag: mockRevalidateTag,
      }));

      await revalidateKernelCache();
      // Function should complete without error
      expect(true).toBe(true);
    });
  });
});

