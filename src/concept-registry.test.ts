import { describe, it, expect, beforeEach } from "vitest";
import {
  defineConcept,
  registerValueSet,
  getConcept,
  getValueSet,
  listConcepts,
  listValueSets,
  type ConceptDefinition,
  type JurisdictionalValueSet,
} from "./concept-registry";
import { CanonId } from "./canonId";

describe("Concept Registry", () => {
  beforeEach(() => {
    // Clear registries before each test
    // Note: In a real implementation, we'd need a reset function
    // For now, we'll test with fresh instances
  });

  describe("defineConcept", () => {
    it("should register a new concept", () => {
      const concept: ConceptDefinition = {
        id: "CONCEPT_TEST" as CanonId,
        name: "Test Concept",
        description: "A test concept",
        version: "1.0.0",
      };

      const result = defineConcept(concept);
      expect(result).toEqual(concept);
    });

    it("should throw error if concept already registered", () => {
      const concept: ConceptDefinition = {
        id: "CONCEPT_DUPLICATE" as CanonId,
        name: "Duplicate Concept",
        version: "1.0.0",
      };

      defineConcept(concept);
      expect(() => defineConcept(concept)).toThrow(
        "Concept CONCEPT_DUPLICATE already registered"
      );
    });
  });

  describe("registerValueSet", () => {
    it("should register a value set for a concept", () => {
      const concept: ConceptDefinition = {
        id: "CONCEPT_VALUESET_TEST" as CanonId,
        name: "Value Set Test Concept",
        version: "1.0.0",
      };

      defineConcept(concept);

      const valueSet: JurisdictionalValueSet = {
        conceptId: "CONCEPT_VALUESET_TEST" as CanonId,
        jurisdiction: "GLOBAL",
        values: ["VALUE1", "VALUE2"],
      };

      expect(() => registerValueSet(valueSet)).not.toThrow();
    });

    it("should throw error if value set already registered", () => {
      const concept: ConceptDefinition = {
        id: "CONCEPT_VALUESET_DUPLICATE" as CanonId,
        name: "Duplicate Value Set Concept",
        version: "1.0.0",
      };

      defineConcept(concept);

      const valueSet: JurisdictionalValueSet = {
        conceptId: "CONCEPT_VALUESET_DUPLICATE" as CanonId,
        jurisdiction: "GLOBAL",
        values: ["VALUE1"],
      };

      registerValueSet(valueSet);
      expect(() => registerValueSet(valueSet)).toThrow(
        "Value set CONCEPT_VALUESET_DUPLICATE:GLOBAL already registered"
      );
    });
  });

  describe("getConcept", () => {
    it("should return concept if registered", () => {
      const concept: ConceptDefinition = {
        id: "CONCEPT_GET_TEST" as CanonId,
        name: "Get Test Concept",
        version: "1.0.0",
      };

      defineConcept(concept);
      const result = getConcept("CONCEPT_GET_TEST" as CanonId);
      expect(result).toEqual(concept);
    });

    it("should return undefined if concept not registered", () => {
      const result = getConcept("CONCEPT_NOT_FOUND" as CanonId);
      expect(result).toBeUndefined();
    });
  });

  describe("getValueSet", () => {
    it("should return value set if registered", () => {
      const concept: ConceptDefinition = {
        id: "CONCEPT_GET_VALUESET" as CanonId,
        name: "Get Value Set Concept",
        version: "1.0.0",
      };

      defineConcept(concept);

      const valueSet: JurisdictionalValueSet = {
        conceptId: "CONCEPT_GET_VALUESET" as CanonId,
        jurisdiction: "MY",
        values: ["VALUE1", "VALUE2"],
      };

      registerValueSet(valueSet);
      const result = getValueSet("CONCEPT_GET_VALUESET" as CanonId, "MY");
      expect(result).toEqual(valueSet);
    });

    it("should return undefined if value set not registered", () => {
      const result = getValueSet("CONCEPT_NOT_FOUND" as CanonId, "GLOBAL");
      expect(result).toBeUndefined();
    });
  });

  describe("listConcepts", () => {
    it("should return all registered concepts", () => {
      const concept1: ConceptDefinition = {
        id: "CONCEPT_LIST_1" as CanonId,
        name: "List Concept 1",
        version: "1.0.0",
      };

      const concept2: ConceptDefinition = {
        id: "CONCEPT_LIST_2" as CanonId,
        name: "List Concept 2",
        version: "1.0.0",
      };

      defineConcept(concept1);
      defineConcept(concept2);

      const concepts = listConcepts();
      expect(concepts.length).toBeGreaterThanOrEqual(2);
      expect(concepts).toContainEqual(concept1);
      expect(concepts).toContainEqual(concept2);
    });
  });

  describe("listValueSets", () => {
    it("should return all value sets for a concept", () => {
      const concept: ConceptDefinition = {
        id: "CONCEPT_LIST_VALUESETS" as CanonId,
        name: "List Value Sets Concept",
        version: "1.0.0",
      };

      defineConcept(concept);

      const valueSet1: JurisdictionalValueSet = {
        conceptId: "CONCEPT_LIST_VALUESETS" as CanonId,
        jurisdiction: "GLOBAL",
        values: ["VALUE1"],
      };

      const valueSet2: JurisdictionalValueSet = {
        conceptId: "CONCEPT_LIST_VALUESETS" as CanonId,
        jurisdiction: "MY",
        values: ["VALUE2"],
      };

      registerValueSet(valueSet1);
      registerValueSet(valueSet2);

      const valueSets = listValueSets("CONCEPT_LIST_VALUESETS" as CanonId);
      expect(valueSets.length).toBeGreaterThanOrEqual(2);
      expect(valueSets).toContainEqual(valueSet1);
      expect(valueSets).toContainEqual(valueSet2);
    });

    it("should return empty array if no value sets registered", () => {
      const concept: ConceptDefinition = {
        id: "CONCEPT_NO_VALUESETS" as CanonId,
        name: "No Value Sets Concept",
        version: "1.0.0",
      };

      defineConcept(concept);

      const valueSets = listValueSets("CONCEPT_NO_VALUESETS" as CanonId);
      expect(valueSets).toEqual([]);
    });
  });
});

