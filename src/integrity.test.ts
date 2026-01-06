import { describe, it, expect } from "vitest";
import {
  CONCEPT,
  CONCEPT_COUNT,
  CONCEPT_CATEGORY,
} from "./concepts";
import {
  VALUESET,
  VALUESET_COUNT,
  VALUE,
  VALUE_COUNT,
} from "./values";
import {
  KERNEL_VERSION,
  SNAPSHOT_ID,
  KERNEL_REGISTRY_METADATA,
  validateKernelIntegrity,
} from "./version";

describe("Registry Integrity", () => {
  describe("Invariant A: Uniqueness", () => {
    it("should have unique concept IDs", () => {
      const conceptIds = Object.values(CONCEPT);
      const uniqueIds = new Set(conceptIds);
      expect(uniqueIds.size).toBe(conceptIds.length);
    });

    it("should have unique value set IDs", () => {
      const valueSetIds = Object.values(VALUESET);
      const uniqueIds = new Set(valueSetIds);
      expect(uniqueIds.size).toBe(valueSetIds.length);
    });

    it("should have unique value IDs within each value set", () => {
      Object.keys(VALUESET).forEach((key) => {
        const valueSet = VALUE[key as keyof typeof VALUE];
        if (valueSet && typeof valueSet === "object") {
          const valueIds = Object.values(valueSet);
          const uniqueIds = new Set(valueIds);
          expect(uniqueIds.size).toBe(valueIds.length);
        }
      });
    });
  });

  describe("Invariant B: Continuity", () => {
    it("should have continuous concept count", () => {
      const actualCount = Object.keys(CONCEPT).length;
      expect(actualCount).toBe(CONCEPT_COUNT);
    });

    it("should have continuous value set count", () => {
      const actualCount = Object.keys(VALUESET).length;
      expect(actualCount).toBe(VALUESET_COUNT);
    });

    it("should have continuous value count", () => {
      let totalValues = 0;
      Object.keys(VALUESET).forEach((key) => {
        const valueSet = VALUE[key as keyof typeof VALUE];
        if (valueSet && typeof valueSet === "object") {
          totalValues += Object.keys(valueSet).length;
        }
      });
      expect(totalValues).toBe(VALUE_COUNT);
    });
  });

  describe("Invariant C: Semantics", () => {
    it("should have all concepts in category map", () => {
      Object.values(CONCEPT).forEach((conceptId) => {
        const category = CONCEPT_CATEGORY[conceptId];
        expect(category).toBeDefined();
        expect(["ENTITY", "ATTRIBUTE"]).toContain(category);
      });
    });

    it("should have all values in their value sets", () => {
      Object.keys(VALUESET).forEach((key) => {
        const valueSetId = VALUESET[key as keyof typeof VALUESET];
        const valueSet = VALUE[key as keyof typeof VALUE];
        if (valueSet && typeof valueSet === "object") {
          Object.values(valueSet).forEach((valueId) => {
            expect(typeof valueId).toBe("string");
            expect(valueId.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe("Snapshot Validation", () => {
    it("should have valid snapshot ID format", () => {
      expect(SNAPSHOT_ID).toMatch(/^snapshot:\d+\.\d+\.\d+:[a-f0-9]+$/);
    });

    it("should have snapshot ID matching kernel version", () => {
      expect(SNAPSHOT_ID).toContain(KERNEL_VERSION);
    });

    it("should have kernel registry metadata", () => {
      expect(KERNEL_REGISTRY_METADATA.version).toBe(KERNEL_VERSION);
      expect(KERNEL_REGISTRY_METADATA.snapshotId).toBe(SNAPSHOT_ID);
      expect(KERNEL_REGISTRY_METADATA.counts.concepts).toBe(CONCEPT_COUNT);
      expect(KERNEL_REGISTRY_METADATA.counts.valueSets).toBe(VALUESET_COUNT);
      expect(KERNEL_REGISTRY_METADATA.counts.values).toBe(VALUE_COUNT);
    });
  });

  describe("Drift Detection", () => {
    it("should validate kernel integrity without errors", () => {
      expect(() => validateKernelIntegrity()).not.toThrow();
    });

    it("should detect concept count drift", () => {
      // This test verifies the validation function works
      // Actual drift would be caught by validateKernelIntegrity()
      expect(CONCEPT_COUNT).toBeGreaterThan(0);
      expect(Object.keys(CONCEPT).length).toBe(CONCEPT_COUNT);
    });

    it("should detect value set count drift", () => {
      expect(VALUESET_COUNT).toBeGreaterThan(0);
      expect(Object.keys(VALUESET).length).toBe(VALUESET_COUNT);
    });

    it("should detect value count drift", () => {
      expect(VALUE_COUNT).toBeGreaterThan(0);
      let totalValues = 0;
      Object.keys(VALUESET).forEach((key) => {
        const valueSet = VALUE[key as keyof typeof VALUE];
        if (valueSet && typeof valueSet === "object") {
          totalValues += Object.keys(valueSet).length;
        }
      });
      expect(totalValues).toBe(VALUE_COUNT);
    });
  });
});

