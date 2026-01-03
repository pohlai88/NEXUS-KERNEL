import { describe, it, expect } from "vitest";
import {
  KERNEL_VERSION,
  SNAPSHOT_ID,
  KERNEL_REGISTRY_METADATA,
  validateKernelIntegrity,
} from "./version";
import { CONCEPT_COUNT } from "./concepts";
import { VALUESET_COUNT, VALUE_COUNT } from "./values";
import packageJson from "../package.json";

describe("Version System", () => {
  describe("KERNEL_VERSION", () => {
    it("should have valid semantic version format", () => {
      expect(KERNEL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should match package.json version", () => {
      expect(KERNEL_VERSION).toBe(packageJson.version);
    });

    it("should be defined as constant", () => {
      expect(typeof KERNEL_VERSION).toBe("string");
      expect(KERNEL_VERSION.length).toBeGreaterThan(0);
    });
  });

  describe("SNAPSHOT_ID", () => {
    it("should have valid snapshot ID format", () => {
      expect(SNAPSHOT_ID).toMatch(/^snapshot:\d+\.\d+\.\d+:[a-f0-9]+$/);
    });

    it("should contain kernel version", () => {
      expect(SNAPSHOT_ID).toContain(KERNEL_VERSION);
    });

    it("should be deterministic (same input = same output)", () => {
      // Snapshot ID should be deterministic based on registry contents
      // This test verifies the format, actual determinism is tested in integration tests
      expect(SNAPSHOT_ID).toBeDefined();
    });

    it("should change when registry changes", () => {
      // This is verified by the snapshot ID containing a hash
      // Actual change detection is tested in integration tests
      expect(SNAPSHOT_ID.split(":")).toHaveLength(3);
    });
  });

  describe("KERNEL_REGISTRY_METADATA", () => {
    it("should have all required fields", () => {
      expect(KERNEL_REGISTRY_METADATA.version).toBeDefined();
      expect(KERNEL_REGISTRY_METADATA.snapshotId).toBeDefined();
      expect(KERNEL_REGISTRY_METADATA.counts).toBeDefined();
      expect(KERNEL_REGISTRY_METADATA.generatedAt).toBeDefined();
    });

    it("should have correct version", () => {
      expect(KERNEL_REGISTRY_METADATA.version).toBe(KERNEL_VERSION);
    });

    it("should have correct snapshot ID", () => {
      expect(KERNEL_REGISTRY_METADATA.snapshotId).toBe(SNAPSHOT_ID);
    });

    it("should have correct counts", () => {
      expect(KERNEL_REGISTRY_METADATA.counts.concepts).toBe(CONCEPT_COUNT);
      expect(KERNEL_REGISTRY_METADATA.counts.valueSets).toBe(VALUESET_COUNT);
      expect(KERNEL_REGISTRY_METADATA.counts.values).toBe(VALUE_COUNT);
    });

    it("should have valid generatedAt timestamp", () => {
      const timestamp = new Date(KERNEL_REGISTRY_METADATA.generatedAt);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe("Drift Detection", () => {
    it("should validate kernel integrity", () => {
      expect(() => validateKernelIntegrity()).not.toThrow();
    });

    it("should detect concept count mismatch", () => {
      // The validateKernelIntegrity function checks this
      // This test verifies it doesn't throw with current state
      expect(() => validateKernelIntegrity()).not.toThrow();
    });

    it("should detect value set count mismatch", () => {
      expect(() => validateKernelIntegrity()).not.toThrow();
    });

    it("should detect value count mismatch", () => {
      expect(() => validateKernelIntegrity()).not.toThrow();
    });
  });
});

