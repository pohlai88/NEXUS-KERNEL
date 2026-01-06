import { describe, it, expect } from "vitest";
import { CONCEPT, CONCEPT_COUNT, type ConceptId } from "./concepts";
import { getAllConceptIds, isValidConceptId } from "./__tests__/helpers/test-helpers";

describe("CONCEPT Registry", () => {
  describe("Registry Completeness", () => {
    it("should have all concepts defined", () => {
      const conceptIds = getAllConceptIds();
      expect(conceptIds.length).toBeGreaterThan(0);
      expect(conceptIds.length).toBe(CONCEPT_COUNT);
    });

    it("should have CONCEPT_COUNT matching actual count", () => {
      const actualCount = Object.keys(CONCEPT).length;
      expect(actualCount).toBe(CONCEPT_COUNT);
    });

    it("should have unique concept IDs", () => {
      const conceptIds = getAllConceptIds();
      const uniqueIds = new Set(conceptIds);
      expect(uniqueIds.size).toBe(conceptIds.length);
    });

    it("should have all concept IDs in valid format", () => {
      const conceptIds = getAllConceptIds();
      conceptIds.forEach((id) => {
        expect(isValidConceptId(id)).toBe(true);
      });
    });
  });

  describe("Concept ID Format", () => {
    it("should start with CONCEPT_ prefix", () => {
      const conceptIds = getAllConceptIds();
      conceptIds.forEach((id) => {
        expect(id).toMatch(/^CONCEPT_/);
      });
    });

    it("should be uppercase snake case", () => {
      const conceptIds = getAllConceptIds();
      conceptIds.forEach((id) => {
        expect(id).toMatch(/^CONCEPT_[A-Z][A-Z0-9_]*$/);
      });
    });

    it("should not contain lowercase letters", () => {
      const conceptIds = getAllConceptIds();
      conceptIds.forEach((id) => {
        expect(id).not.toMatch(/[a-z]/);
      });
    });
  });

  describe("Concept Registry Access", () => {
    it("should allow type-safe access to concepts", () => {
      const documentConcept: ConceptId = CONCEPT.DOCUMENT;
      expect(documentConcept).toBe("CONCEPT_DOCUMENT");
    });

    it("should have DOCUMENT concept", () => {
      expect(CONCEPT.DOCUMENT).toBe("CONCEPT_DOCUMENT");
    });

    it("should have ACCOUNT concept", () => {
      expect(CONCEPT.ACCOUNT).toBe("CONCEPT_ACCOUNT");
    });

    it("should have PARTY concept", () => {
      expect(CONCEPT.PARTY).toBe("CONCEPT_PARTY");
    });
  });

  describe("Concept Count Validation", () => {
    it("should have CONCEPT_COUNT constant defined", () => {
      expect(CONCEPT_COUNT).toBeDefined();
      expect(typeof CONCEPT_COUNT).toBe("number");
      expect(CONCEPT_COUNT).toBeGreaterThan(0);
    });

    it("should match expected minimum count (180+)", () => {
      expect(CONCEPT_COUNT).toBeGreaterThanOrEqual(180);
    });
  });
});

