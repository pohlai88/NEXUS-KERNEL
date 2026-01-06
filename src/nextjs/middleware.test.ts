// @aibos/kernel - Next.js Middleware Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  withKernelValidation,
  kernelValidationMiddleware,
} from "./middleware.js";
import { validateKernelIntegrity } from "../version.js";

// Mock next/server
vi.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url = "http://localhost:3000/test";
    method = "GET";
  },
  NextResponse: {
    next: vi.fn(() => ({ status: 200 })),
    json: vi.fn((data) => ({ status: 200, json: () => Promise.resolve(data) })),
  },
}));

// Mock version module
vi.mock("../version.js", () => ({
  validateKernelIntegrity: vi.fn(),
  KERNEL_VERSION: "1.1.0",
  SNAPSHOT_ID: "test-snapshot",
}));

describe("Next.js Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("withKernelValidation", () => {
    it("should wrap middleware and validate kernel", async () => {
      const mockMiddleware = vi.fn(async () => {
        return { status: 200 } as any;
      });

      const wrapped = withKernelValidation(mockMiddleware);
      const req = { url: "http://localhost:3000/test" } as any;

      await wrapped(req);

      expect(validateKernelIntegrity).toHaveBeenCalled();
      expect(mockMiddleware).toHaveBeenCalledWith(req);
    });

    it("should continue even if kernel validation fails", async () => {
      vi.mocked(validateKernelIntegrity).mockImplementation(() => {
        throw new Error("Kernel validation failed");
      });

      const mockMiddleware = vi.fn(async () => {
        return { status: 200 } as any;
      });

      const wrapped = withKernelValidation(mockMiddleware);
      const req = { url: "http://localhost:3000/test" } as any;

      const result = await wrapped(req);

      expect(validateKernelIntegrity).toHaveBeenCalled();
      expect(mockMiddleware).toHaveBeenCalledWith(req);
      expect(result.status).toBe(200);
      expect(console.error).toHaveBeenCalled();
    });

    it("should handle synchronous middleware", async () => {
      const mockMiddleware = vi.fn(() => {
        return { status: 200 } as any;
      });

      const wrapped = withKernelValidation(mockMiddleware);
      const req = { url: "http://localhost:3000/test" } as any;

      await wrapped(req);

      expect(validateKernelIntegrity).toHaveBeenCalled();
      expect(mockMiddleware).toHaveBeenCalledWith(req);
    });
  });

  describe("kernelValidationMiddleware", () => {
    it("should validate kernel without throwing", async () => {
      const req = { url: "http://localhost:3000/test" } as any;

      await kernelValidationMiddleware(req);

      expect(validateKernelIntegrity).toHaveBeenCalled();
    });

    it("should not throw on validation failure", async () => {
      vi.mocked(validateKernelIntegrity).mockImplementation(() => {
        throw new Error("Kernel validation failed");
      });

      const req = { url: "http://localhost:3000/test" } as any;

      await expect(kernelValidationMiddleware(req)).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});

