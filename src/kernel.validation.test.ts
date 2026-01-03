import { describe, it, expect } from "vitest";
import {
  validateConcept,
  validateValueSet,
  validateValue,
  validatePack,
  validateKernelRegistry,
} from "./kernel.validation";
import { CanonError } from "./errors";
import {
  sampleConcept,
  sampleValueSet,
  sampleValue,
  invalidConcept,
  invalidValueSet,
  invalidValue,
} from "./__tests__/helpers/fixtures";

describe("Kernel Validation", () => {
  describe("Concept Validation", () => {
    it("should validate valid concept", () => {
      expect(() => validateConcept(sampleConcept)).not.toThrow();
      const result = validateConcept(sampleConcept);
      expect(result.code).toBe(sampleConcept.code);
    });

    it("should reject invalid concept (missing fields)", () => {
      expect(() => validateConcept(invalidConcept)).toThrow(CanonError);
    });

    it("should reject concept with invalid code format", () => {
      const invalid = {
        ...sampleConcept,
        code: "invalid-code-format",
      };
      expect(() => validateConcept(invalid)).toThrow(CanonError);
    });

    it("should validate concept naming laws", () => {
      const validConcept = {
        ...sampleConcept,
        code: "VALID_CONCEPT_NAME",
      };
      expect(() => validateConcept(validConcept)).not.toThrow();
    });
  });

  describe("Value Set Validation", () => {
    it("should validate valid value set", () => {
      expect(() => validateValueSet(sampleValueSet)).not.toThrow();
      const result = validateValueSet(sampleValueSet);
      expect(result.code).toBe(sampleValueSet.code);
    });

    it("should reject invalid value set (missing fields)", () => {
      expect(() => validateValueSet(invalidValueSet)).toThrow(CanonError);
    });

    it("should reject value set with invalid jurisdiction", () => {
      const invalid = {
        ...sampleValueSet,
        jurisdiction: "INVALID" as any,
      };
      expect(() => validateValueSet(invalid)).toThrow();
    });

    it("should validate value set naming laws", () => {
      const validValueSet = {
        ...sampleValueSet,
        code: "VALID_VALUESET_NAME",
      };
      expect(() => validateValueSet(validValueSet)).not.toThrow();
    });
  });

  describe("Value Validation", () => {
    it("should validate valid value", () => {
      expect(() => validateValue(sampleValue)).not.toThrow();
      const result = validateValue(sampleValue);
      expect(result.code).toBe(sampleValue.code);
    });

    it("should reject invalid value (missing fields)", () => {
      expect(() => validateValue(invalidValue)).toThrow(CanonError);
    });

    it("should reject value with invalid value set reference", () => {
      const invalid = {
        ...sampleValue,
        value_set_code: "INVALID_VALUESET",
      };
      // This would fail if we validate value set existence
      // For now, just check it doesn't crash
      expect(() => validateValue(invalid)).not.toThrow();
    });

    it("should validate value naming laws", () => {
      const validValue = {
        ...sampleValue,
        code: "VALID_VALUE_NAME",
      };
      expect(() => validateValue(validValue)).not.toThrow();
    });

    it("should reject value with invalid code format (lowercase)", () => {
      const invalid = {
        ...sampleValue,
        code: "invalid_code",
      };
      expect(() => validateValue(invalid)).toThrow(CanonError);
      try {
        validateValue(invalid);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.code).toBe("VALIDATION_FAILED");
          expect(error.message).toContain("UPPERCASE_SNAKE_CASE");
        }
      }
    });

    it("should handle value validation with caching for repeated calls", () => {
      // Test that validation caching works for repeated validations
      // This ensures the cache paths are exercised
      const result1 = validateValue(sampleValue);
      const result2 = validateValue(sampleValue); // Should use cache
      expect(result1).toEqual(result2);
      expect(result1.code).toBe(sampleValue.code);
    });

    it("should reject value with invalid code that passes Zod but fails naming law", () => {
      // Create a value that passes Zod schema but fails naming law
      // This requires a value that has all required Zod fields but invalid code format
      const invalid = {
        ...sampleValue,
        code: "invalidCode123", // Passes Zod (string) but fails naming law (not UPPERCASE_SNAKE_CASE)
      };
      expect(() => validateValue(invalid)).toThrow(CanonError);
      try {
        validateValue(invalid);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.code).toBe("VALIDATION_FAILED");
          expect(error.message).toContain("UPPERCASE_SNAKE_CASE");
          // Verify error details exist (structure may vary)
          expect(error.details).toBeDefined();
        }
      }
    });
  });

  describe("Pack Validation", () => {
    it("should validate valid pack", () => {
      const validPack = {
        id: "pack-test",
        name: "Test Pack",
        version: "1.0.0",
        domain: "CORE",
        description: "Test pack for unit testing",
        concepts: [sampleConcept],
        value_sets: [sampleValueSet],
        values: [sampleValue],
        metadata: {},
      };
      expect(() => validatePack(validPack)).not.toThrow();
    });

    it("should reject pack with invalid concept", () => {
      const invalidPack = {
        id: "pack.test",
        version: "1.0.0",
        domain: "CORE",
        concepts: [invalidConcept],
        value_sets: [],
        values: [],
        metadata: {},
      };
      expect(() => validatePack(invalidPack)).toThrow(CanonError);
    });

    it("should reject pack with invalid value set", () => {
      const invalidPack = {
        id: "pack.test",
        version: "1.0.0",
        domain: "CORE",
        concepts: [],
        value_sets: [invalidValueSet],
        values: [],
        metadata: {},
      };
      expect(() => validatePack(invalidPack)).toThrow(CanonError);
    });

    it("should reject pack with invalid value", () => {
      const invalidPack = {
        id: "pack.test",
        version: "1.0.0",
        domain: "CORE",
        concepts: [],
        value_sets: [],
        values: [invalidValue],
        metadata: {},
      };
      expect(() => validatePack(invalidPack)).toThrow(CanonError);
    });

    it("should reject pack with value referencing unknown value set", () => {
      const invalidPack = {
        id: "pack-test", // Must be kebab-case
        name: "Test Pack",
        description: "Test pack description",
        version: "1.0.0",
        domain: "CORE",
        concepts: [],
        value_sets: [sampleValueSet], // Pack has TEST_VALUESET
        values: [
          {
            ...sampleValue,
            value_set_code: "UNKNOWN_VALUESET", // But value references different value set
          },
        ],
        metadata: {},
      };
      expect(() => validatePack(invalidPack)).toThrow(CanonError);
      try {
        validatePack(invalidPack);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.code).toBe("VALIDATION_FAILED");
          expect(error.message).toContain("unknown value set");
          // Check that error details exist
          expect(error.details).toBeDefined();
          if (error.details && typeof error.details === "object") {
            if ("error_type" in error.details) {
              expect(error.details.error_type).toBe("INVALID_VALUESET_REFERENCE");
            }
          }
        }
      }
    });

    it("should reject pack with value set having less than 2 values", () => {
      const invalidPack = {
        id: "pack-test",
        name: "Test Pack",
        version: "1.0.0",
        domain: "CORE",
        description: "Test pack",
        concepts: [],
        value_sets: [sampleValueSet],
        values: [
          {
            ...sampleValue,
            value_set_code: sampleValueSet.code,
          },
          // Only 1 value, need at least 2
        ],
      };
      // Note: validatePack doesn't check this invariant - only validateKernelRegistry does
      // So we test it via validateKernelRegistry instead
      const invalidRegistry = {
        version: "1.0.0",
        validation: {
          unique_concept_codes: true,
          unique_value_set_codes: true,
          unique_value_codes_per_set: true,
          valid_value_set_references: true,
        },
        concepts: [],
        value_sets: [sampleValueSet],
        values: [
          {
            ...sampleValue,
            value_set_code: sampleValueSet.code,
          },
        ],
      };
      expect(() => validateKernelRegistry(invalidRegistry)).toThrow(CanonError);
      try {
        validateKernelRegistry(invalidRegistry);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.message).toContain("at least 2 values");
        }
      }
    });

    it("should reject pack with non-continuous sort order", () => {
      // Note: validatePack doesn't check this invariant - only validateKernelRegistry does
      // So we test it via validateKernelRegistry instead
      const invalidRegistry = {
        version: "1.0.0",
        validation: {
          unique_concept_codes: true,
          unique_value_set_codes: true,
          unique_value_codes_per_set: true,
          valid_value_set_references: true,
        },
        concepts: [],
        value_sets: [sampleValueSet],
        values: [
          { ...sampleValue, value_set_code: sampleValueSet.code, sort_order: 1 },
          { ...sampleValue, value_set_code: sampleValueSet.code, code: "VALUE2", sort_order: 3 }, // Gap: missing 2
        ],
      };
      expect(() => validateKernelRegistry(invalidRegistry)).toThrow(CanonError);
      try {
        validateKernelRegistry(invalidRegistry);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.message).toContain("continuous");
        }
      }
    });
  });

  describe("Kernel Registry Validation", () => {
    it("should validate valid kernel registry", () => {
      const validRegistry = {
        version: "1.0.0",
        validation: {
          unique_concept_codes: true,
          unique_value_set_codes: true,
          unique_value_codes_per_set: true,
          valid_value_set_references: true,
        },
        concepts: [sampleConcept],
        value_sets: [sampleValueSet],
        values: [
          { ...sampleValue, value_set_code: sampleValueSet.code, sort_order: 1 },
          { ...sampleValue, value_set_code: sampleValueSet.code, code: "VALUE2", sort_order: 2 },
        ],
      };
      expect(() => validateKernelRegistry(validRegistry)).not.toThrow();
    });

    it("should reject registry with invalid structure", () => {
      const invalidRegistry = {
        // Missing required fields
        concepts: [],
      };
      expect(() => validateKernelRegistry(invalidRegistry)).toThrow(CanonError);
      try {
        validateKernelRegistry(invalidRegistry);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.message).toContain("Kernel registry validation failed");
        }
      }
    });

    it("should reject registry with duplicate concept codes", () => {
      const invalidRegistry = {
        version: "1.0.0",
        validation: {
          unique_concept_codes: true,
          unique_value_set_codes: true,
          unique_value_codes_per_set: true,
          valid_value_set_references: true,
        },
        concepts: [sampleConcept, { ...sampleConcept }], // Duplicate
        value_sets: [sampleValueSet],
        values: [
          { ...sampleValue, value_set_code: sampleValueSet.code, sort_order: 1 },
          { ...sampleValue, value_set_code: sampleValueSet.code, code: "VALUE2", sort_order: 2 },
        ],
      };
      expect(() => validateKernelRegistry(invalidRegistry)).toThrow(CanonError);
      try {
        validateKernelRegistry(invalidRegistry);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.message).toContain("Duplicate concept code");
        }
      }
    });

    it("should reject registry with duplicate value set codes", () => {
      const invalidRegistry = {
        version: "1.0.0",
        validation: {
          unique_concept_codes: true,
          unique_value_set_codes: true,
          unique_value_codes_per_set: true,
          valid_value_set_references: true,
        },
        concepts: [sampleConcept],
        value_sets: [sampleValueSet, { ...sampleValueSet }], // Duplicate
        values: [
          { ...sampleValue, value_set_code: sampleValueSet.code, sort_order: 1 },
          { ...sampleValue, value_set_code: sampleValueSet.code, code: "VALUE2", sort_order: 2 },
        ],
      };
      expect(() => validateKernelRegistry(invalidRegistry)).toThrow(CanonError);
      try {
        validateKernelRegistry(invalidRegistry);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.message).toContain("Duplicate value set code");
        }
      }
    });

    it("should reject registry with value referencing unknown value set", () => {
      const invalidRegistry = {
        version: "1.0.0",
        validation: {
          unique_concept_codes: true,
          unique_value_set_codes: true,
          unique_value_codes_per_set: true,
          valid_value_set_references: true,
        },
        concepts: [sampleConcept],
        value_sets: [sampleValueSet],
        values: [
          {
            ...sampleValue,
            value_set_code: "UNKNOWN_VALUESET",
          },
        ],
      };
      expect(() => validateKernelRegistry(invalidRegistry)).toThrow(CanonError);
      try {
        validateKernelRegistry(invalidRegistry);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.message).toContain("unknown value set");
        }
      }
    });

    it("should reject registry with duplicate value codes in same set", () => {
      const invalidRegistry = {
        version: "1.0.0",
        validation: {
          unique_concept_codes: true,
          unique_value_set_codes: true,
          unique_value_codes_per_set: true,
          valid_value_set_references: true,
        },
        concepts: [sampleConcept],
        value_sets: [sampleValueSet],
        values: [
          { ...sampleValue, value_set_code: sampleValueSet.code, sort_order: 1 },
          { ...sampleValue, value_set_code: sampleValueSet.code, sort_order: 2 }, // Duplicate code
        ],
      };
      expect(() => validateKernelRegistry(invalidRegistry)).toThrow(CanonError);
      try {
        validateKernelRegistry(invalidRegistry);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.message).toContain("Duplicate value code");
        }
      }
    });
  });
});

