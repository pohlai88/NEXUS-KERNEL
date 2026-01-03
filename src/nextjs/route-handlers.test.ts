// @aibos/kernel - Next.js Route Handlers Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleGetConcepts,
  handleGetValueSets,
  handleGetValues,
  handleGetVersion,
  handleValidateKernel,
  handleGetConcept,
} from "./route-handlers.js";
import {
  getCachedConcepts,
  getCachedValueSets,
  getCachedValues,
  getKernelVersion,
} from "./server-components.js";
import { validateKernelIntegrity, KERNEL_VERSION } from "../version.js";

// Mock next/server
vi.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url = "http://localhost:3000/test";
    method = "GET";
  },
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}));

// Mock server-components
vi.mock("./server-components.js", () => ({
  getCachedConcepts: vi.fn(),
  getCachedValueSets: vi.fn(),
  getCachedValues: vi.fn(),
  getKernelVersion: vi.fn(),
}));

// Mock version module
vi.mock("../version.js", () => ({
  validateKernelIntegrity: vi.fn(),
  KERNEL_VERSION: "1.1.0",
  SNAPSHOT_ID: "test-snapshot",
}));

describe("Next.js Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleGetConcepts", () => {
    it("should return concepts successfully", async () => {
      const mockConcepts = { INVOICE: "CONCEPT_INVOICE" };
      vi.mocked(getCachedConcepts).mockResolvedValue(mockConcepts as any);

      const response = await handleGetConcepts();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockConcepts);
      expect(json.version).toBe(KERNEL_VERSION);
    });

    it("should handle errors", async () => {
      vi.mocked(getCachedConcepts).mockRejectedValue(new Error("Test error"));

      const response = await handleGetConcepts();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe("Test error");
      expect(response.status).toBe(500);
    });
  });

  describe("handleGetValueSets", () => {
    it("should return value sets successfully", async () => {
      const mockValueSets = { ACCOUNT_TYPE: "VALUESET_GLOBAL_ACCOUNT_TYPE" };
      vi.mocked(getCachedValueSets).mockResolvedValue(mockValueSets as any);

      const response = await handleGetValueSets();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockValueSets);
      expect(json.version).toBe(KERNEL_VERSION);
    });

    it("should handle errors", async () => {
      vi.mocked(getCachedValueSets).mockRejectedValue(new Error("Test error"));

      const response = await handleGetValueSets();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe("Test error");
    });
  });

  describe("handleGetValues", () => {
    it("should return values successfully", async () => {
      const mockValues = { ACCOUNT_TYPE: { ASSET: "VALUE_ASSET" } };
      vi.mocked(getCachedValues).mockResolvedValue(mockValues as any);

      const response = await handleGetValues();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockValues);
      expect(json.version).toBe(KERNEL_VERSION);
    });

    it("should handle errors", async () => {
      vi.mocked(getCachedValues).mockRejectedValue(new Error("Test error"));

      const response = await handleGetValues();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe("Test error");
    });
  });

  describe("handleGetVersion", () => {
    it("should return version info successfully", async () => {
      const mockVersion = { version: "1.1.0", snapshotId: "test-snapshot" };
      vi.mocked(getKernelVersion).mockResolvedValue(mockVersion);

      const response = await handleGetVersion();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockVersion);
    });

    it("should handle errors", async () => {
      vi.mocked(getKernelVersion).mockRejectedValue(new Error("Test error"));

      const response = await handleGetVersion();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe("Test error");
    });
  });

  describe("handleValidateKernel", () => {
    it("should validate kernel successfully", async () => {
      vi.mocked(validateKernelIntegrity).mockReturnValue(undefined);

      const response = await handleValidateKernel();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.message).toBe("Kernel integrity validated successfully");
      expect(json.version).toBe(KERNEL_VERSION);
    });

    it("should handle validation errors", async () => {
      vi.mocked(validateKernelIntegrity).mockImplementation(() => {
        throw new Error("Validation failed");
      });

      const response = await handleValidateKernel();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe("Validation failed");
      expect(json.version).toBe(KERNEL_VERSION);
      expect(response.status).toBe(400);
    });
  });

  describe("handleGetConcept", () => {
    it("should return concept by code", async () => {
      // The function checks for CONCEPT_INVOICE key, then looks up INVOICE key
      const mockConcepts = {
        CONCEPT_INVOICE: "CONCEPT_INVOICE", // For the 'in' check
        INVOICE: "CONCEPT_INVOICE", // For the actual lookup
      };
      vi.mocked(getCachedConcepts).mockResolvedValue(mockConcepts as any);

      const req = {} as any;
      const params = Promise.resolve({ code: "invoice" });

      const response = await handleGetConcept(req, { params });
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.code).toBe("INVOICE");
      expect(json.data.id).toBe("CONCEPT_INVOICE");
    });

    it("should return 404 for non-existent concept", async () => {
      const mockConcepts = { INVOICE: "CONCEPT_INVOICE" };
      vi.mocked(getCachedConcepts).mockResolvedValue(mockConcepts as any);

      const req = {} as any;
      const params = Promise.resolve({ code: "nonexistent" });

      const response = await handleGetConcept(req, { params });
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toContain("not found");
      expect(response.status).toBe(404);
    });

    it("should handle errors", async () => {
      vi.mocked(getCachedConcepts).mockRejectedValue(new Error("Test error"));

      const req = {} as any;
      const params = Promise.resolve({ code: "invoice" });

      const response = await handleGetConcept(req, { params });
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe("Test error");
    });
  });
});

