import { describe, it, expect } from "vitest";
import { CONCEPT, CONCEPT_COUNT } from "./concepts";
import { VALUESET, VALUE, VALUESET_COUNT, VALUE_COUNT } from "./values";
import {
  KERNEL_VERSION,
  SNAPSHOT_ID,
  validateKernelIntegrity,
} from "./version";
import { getAllConceptIds, getAllValueSetIds } from "./__tests__/helpers/test-helpers";

describe("Concept-Value Set Relationships", () => {
  it("should have value sets for relevant concepts", () => {
    // Verify that concepts have corresponding value sets where applicable
    expect(VALUESET.ACCOUNT_TYPE).toBeDefined();
    expect(VALUESET.INVOICE_STATUS).toBeDefined();
  });

  it("should have values for all value sets", () => {
    const valueSetIds = getAllValueSetIds();
    valueSetIds.forEach((valueSetId) => {
      const valueSetKey = Object.keys(VALUESET).find(
        (key) => VALUESET[key as keyof typeof VALUESET] === valueSetId
      );
      if (valueSetKey) {
        const valueSet = VALUE[valueSetKey as keyof typeof VALUE];
        expect(valueSet).toBeDefined();
        if (valueSet && typeof valueSet === "object") {
          expect(Object.keys(valueSet).length).toBeGreaterThan(0);
        }
      }
    });
  });
});

describe("Pack Merging", () => {
  it("should have consistent concept count after merging", () => {
    const conceptIds = getAllConceptIds();
    expect(conceptIds.length).toBe(CONCEPT_COUNT);
  });

  it("should have consistent value set count after merging", () => {
    const valueSetIds = getAllValueSetIds();
    expect(valueSetIds.length).toBe(VALUESET_COUNT);
  });

  it("should have consistent value count after merging", () => {
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

describe("Registry Generation Workflow", () => {
  it("should generate valid registry structure", () => {
    expect(CONCEPT).toBeDefined();
    expect(VALUESET).toBeDefined();
    expect(VALUE).toBeDefined();
  });

  it("should have valid version in registry", () => {
    expect(KERNEL_VERSION).toBeDefined();
    expect(KERNEL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("should have valid snapshot ID in registry", () => {
    expect(SNAPSHOT_ID).toBeDefined();
    expect(SNAPSHOT_ID).toMatch(/^snapshot:/);
  });

  it("should pass integrity validation after generation", () => {
    expect(() => validateKernelIntegrity()).not.toThrow();
  });
});

describe("End-to-End Registry Validation", () => {
  it("should have all concepts accessible", () => {
    const conceptIds = getAllConceptIds();
    expect(conceptIds.length).toBe(CONCEPT_COUNT);
    conceptIds.forEach((id) => {
      expect(id).toMatch(/^CONCEPT_/);
    });
  });

  it("should have all value sets accessible", () => {
    const valueSetIds = getAllValueSetIds();
    expect(valueSetIds.length).toBe(VALUESET_COUNT);
    valueSetIds.forEach((id) => {
      expect(id).toMatch(/^VALUESET_/);
    });
  });

  it("should have all values accessible", () => {
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

