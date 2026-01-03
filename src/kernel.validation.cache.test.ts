import { describe, it, expect, beforeEach } from "vitest";
import { validationCache } from "./kernel.validation.cache";
import type { ConceptShape, ValueSetShape, ValueShape } from "./kernel.contract";

describe("ValidationCache", () => {
  beforeEach(() => {
    validationCache.clear();
    validationCache.setEnabled(true);
  });

  describe("Object-based caching", () => {
    it("should cache and retrieve concepts by object", () => {
      const concept: ConceptShape = {
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test concept",
        tags: [],
      };

      // First call - cache miss
      expect(validationCache.getConcept(concept)).toBeUndefined();

      // Cache it
      validationCache.setConcept(concept, concept);

      // Second call - cache hit
      expect(validationCache.getConcept(concept)).toBe(concept);
    });

    it("should cache and retrieve value sets by object", () => {
      const valueSet: ValueSetShape = {
        code: "TEST_VALUESET",
        domain: "CORE",
        description: "Test value set",
        jurisdiction: "GLOBAL",
        tags: [],
      };

      expect(validationCache.getValueSet(valueSet)).toBeUndefined();
      validationCache.setValueSet(valueSet, valueSet);
      expect(validationCache.getValueSet(valueSet)).toBe(valueSet);
    });

    it("should cache and retrieve values by object", () => {
      const value: ValueShape = {
        code: "TEST_VALUE",
        value_set_code: "TEST_VALUESET",
        label: "Test Value",
        description: "Test value",
        sort_order: 1,
      };

      expect(validationCache.getValue(value)).toBeUndefined();
      validationCache.setValue(value, value);
      expect(validationCache.getValue(value)).toBe(value);
    });
  });

  describe("String-based caching (LRU)", () => {
    it("should cache and retrieve concepts by code", () => {
      const concept: ConceptShape = {
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test concept",
        tags: [],
      };

      expect(validationCache.getConcept("TEST_CONCEPT")).toBeUndefined();
      validationCache.setConcept("TEST_CONCEPT", concept);
      expect(validationCache.getConcept("TEST_CONCEPT")).toBe(concept);
    });

    it("should cache and retrieve value sets by code", () => {
      const valueSet: ValueSetShape = {
        code: "TEST_VALUESET",
        domain: "CORE",
        description: "Test value set",
        jurisdiction: "GLOBAL",
        tags: [],
      };

      expect(validationCache.getValueSet("TEST_VALUESET")).toBeUndefined();
      validationCache.setValueSet("TEST_VALUESET", valueSet);
      expect(validationCache.getValueSet("TEST_VALUESET")).toBe(valueSet);
    });

    it("should cache and retrieve values by code", () => {
      const value: ValueShape = {
        code: "TEST_VALUE",
        value_set_code: "TEST_VALUESET",
        label: "Test Value",
        description: "Test value",
        sort_order: 1,
      };

      expect(validationCache.getValue("TEST_VALUESET:TEST_VALUE")).toBeUndefined();
      validationCache.setValue("TEST_VALUESET:TEST_VALUE", value);
      expect(validationCache.getValue("TEST_VALUESET:TEST_VALUE")).toBe(value);
    });
  });

  describe("LRU eviction", () => {
    it("should evict least recently used items when cache is full", () => {
      // Fill cache beyond max size (500 for concepts)
      for (let i = 0; i < 600; i++) {
        const concept: ConceptShape = {
          code: `CONCEPT_${i}`,
          category: "ENTITY",
          domain: "CORE",
          description: `Concept ${i}`,
          tags: [],
        };
        validationCache.setConcept(`CONCEPT_${i}`, concept);
      }

      // First items should be evicted
      expect(validationCache.getConcept("CONCEPT_0")).toBeUndefined();
      
      // Recent items should still be cached
      expect(validationCache.getConcept("CONCEPT_599")).toBeDefined();
    });
  });

  describe("Statistics", () => {
    it("should track cache hits and misses", () => {
      const concept: ConceptShape = {
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test concept",
        tags: [],
      };

      // Miss
      validationCache.getConcept(concept);
      // Hit
      validationCache.setConcept(concept, concept);
      validationCache.getConcept(concept);
      // Miss
      validationCache.getConcept({ ...concept });

      const stats = validationCache.getStats();
      expect(stats.concepts.hits).toBe(1);
      expect(stats.concepts.misses).toBe(2);
      expect(stats.concepts.hitRate).toBeCloseTo(1 / 3, 2);
    });

    it("should reset statistics without clearing cache", () => {
      const concept: ConceptShape = {
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test concept",
        tags: [],
      };

      validationCache.setConcept(concept, concept);
      validationCache.getConcept(concept);

      validationCache.resetStats();
      const stats = validationCache.getStats();
      expect(stats.concepts.hits).toBe(0);
      expect(stats.concepts.misses).toBe(0);
      
      // Cache should still work
      expect(validationCache.getConcept(concept)).toBe(concept);
    });
  });

  describe("Cache control", () => {
    it("should disable caching when setEnabled(false)", () => {
      const concept: ConceptShape = {
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test concept",
        tags: [],
      };

      validationCache.setEnabled(false);
      validationCache.setConcept(concept, concept);
      expect(validationCache.getConcept(concept)).toBeUndefined();

      validationCache.setEnabled(true);
      validationCache.setConcept(concept, concept);
      expect(validationCache.getConcept(concept)).toBe(concept);
    });

    it("should clear all caches", () => {
      const concept: ConceptShape = {
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test concept",
        tags: [],
      };

      validationCache.setConcept(concept, concept);
      validationCache.clear();
      expect(validationCache.getConcept(concept)).toBeUndefined();
      
      const stats = validationCache.getStats();
      expect(stats.total.size).toBe(0);
    });
  });

  describe("Dual caching", () => {
    it("should cache both object and code when setting by object", () => {
      const concept: ConceptShape = {
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test concept",
        tags: [],
      };

      // Set by object
      validationCache.setConcept(concept, concept);

      // Should be retrievable by both object and code
      expect(validationCache.getConcept(concept)).toBe(concept);
      expect(validationCache.getConcept("TEST_CONCEPT")).toBe(concept);
    });
  });
});

