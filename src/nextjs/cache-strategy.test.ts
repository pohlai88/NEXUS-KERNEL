// @aibos/kernel - Next.js Cache Strategy Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createKernelCache,
  revalidateKernelTag,
  revalidateAllKernelCaches,
} from "./cache-strategy.js";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";

// Mock next/cache
const mockUnstableCache = vi.fn();
const mockRevalidateTag = vi.fn();

vi.mock("next/cache", () => ({
  unstable_cache: (...args: unknown[]) => mockUnstableCache(...args),
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}));

// Mock version module
vi.mock("../version.js", () => ({
  KERNEL_VERSION: "1.1.0",
  SNAPSHOT_ID: "test-snapshot",
}));

describe("Next.js Cache Strategy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnstableCache.mockImplementation((fn) => async () => fn());
  });

  describe("createKernelCache", () => {
    it("should create a cached function with default config", () => {
      const fetcher = vi.fn(() => "test-data");
      const cached = createKernelCache("test-key", fetcher);

      expect(mockUnstableCache).toHaveBeenCalledWith(
        fetcher,
        [`kernel-test-key`, KERNEL_VERSION, SNAPSHOT_ID],
        {
          revalidate: 3600,
          tags: ["kernel", `kernel-${KERNEL_VERSION}`],
        }
      );
    });

    it("should create a cached function with custom config", () => {
      const fetcher = vi.fn(() => "test-data");
      const cached = createKernelCache("test-key", fetcher, {
        revalidate: 1800,
        tags: ["custom-tag"],
      });

      expect(mockUnstableCache).toHaveBeenCalledWith(
        fetcher,
        [`kernel-test-key`, KERNEL_VERSION, SNAPSHOT_ID],
        {
          revalidate: 1800,
          tags: ["kernel", `kernel-${KERNEL_VERSION}`, "custom-tag"],
        }
      );
    });

    it("should return a function that calls the fetcher", async () => {
      const fetcher = vi.fn(() => "test-data");
      const cached = createKernelCache("test-key", fetcher);

      const result = await cached();

      expect(fetcher).toHaveBeenCalled();
      expect(result).toBe("test-data");
    });

    it("should handle async fetchers", async () => {
      const fetcher = vi.fn(async () => "async-data");
      const cached = createKernelCache("test-key", fetcher);

      const result = await cached();

      expect(fetcher).toHaveBeenCalled();
      expect(result).toBe("async-data");
    });
  });

  describe("revalidateKernelTag", () => {
    it("should revalidate default kernel tag", async () => {
      await revalidateKernelTag();

      expect(mockRevalidateTag).toHaveBeenCalledWith("kernel");
    });

    it("should revalidate custom tag", async () => {
      await revalidateKernelTag("custom-tag");

      expect(mockRevalidateTag).toHaveBeenCalledWith("custom-tag");
    });
  });

  describe("revalidateAllKernelCaches", () => {
    it("should revalidate all kernel cache tags", async () => {
      await revalidateAllKernelCaches();

      expect(mockRevalidateTag).toHaveBeenCalledWith("kernel");
      expect(mockRevalidateTag).toHaveBeenCalledWith(`kernel-${KERNEL_VERSION}`);
      expect(mockRevalidateTag).toHaveBeenCalledTimes(2);
    });
  });
});

