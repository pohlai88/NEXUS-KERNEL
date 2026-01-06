import { describe, it, expect } from "vitest";
import { NamingLaws, ExportPattern } from "./kernel.contract";

describe("kernel.contract", () => {
  describe("NamingLaws", () => {
    describe("conceptId", () => {
      it("should generate concept ID with CONCEPT_ prefix", () => {
        expect(NamingLaws.conceptId("PARTY")).toBe("CONCEPT_PARTY");
        expect(NamingLaws.conceptId("INVOICE")).toBe("CONCEPT_INVOICE");
      });
    });

    describe("valueSetId", () => {
      it("should generate value set ID with GLOBAL jurisdiction", () => {
        expect(NamingLaws.valueSetId("STATUS")).toBe("VALUESET_GLOBAL_STATUS");
        expect(NamingLaws.valueSetId("STATUS", "GLOBAL")).toBe("VALUESET_GLOBAL_STATUS");
      });

      it("should generate value set ID with REGIONAL jurisdiction", () => {
        expect(NamingLaws.valueSetId("STATUS", "REGIONAL")).toBe("VALUESET_REGIONAL_STATUS");
      });

      it("should generate value set ID with LOCAL jurisdiction", () => {
        expect(NamingLaws.valueSetId("STATUS", "LOCAL")).toBe("VALUESET_LOCAL_STATUS");
      });
    });

    describe("valueId", () => {
      it("should generate value ID with prefix", () => {
        expect(NamingLaws.valueId("ACTIVE", "STATUS")).toBe("STATUS_ACTIVE");
        expect(NamingLaws.valueId("DRAFT", "DOC")).toBe("DOC_DRAFT");
      });
    });

    describe("isValidConceptCode", () => {
      it("should accept valid concept codes", () => {
        expect(NamingLaws.isValidConceptCode("PARTY")).toBe(true);
        expect(NamingLaws.isValidConceptCode("INVOICE")).toBe(true);
        expect(NamingLaws.isValidConceptCode("PARTY_TYPE")).toBe(true);
        expect(NamingLaws.isValidConceptCode("ACCOUNT_123")).toBe(true);
      });

      it("should reject invalid concept codes", () => {
        expect(NamingLaws.isValidConceptCode("party")).toBe(false); // lowercase
        expect(NamingLaws.isValidConceptCode("party_type")).toBe(false); // lowercase
        expect(NamingLaws.isValidConceptCode("123PARTY")).toBe(false); // starts with number
        expect(NamingLaws.isValidConceptCode("PARTY-TYPE")).toBe(false); // hyphen
        expect(NamingLaws.isValidConceptCode("")).toBe(false); // empty
      });
    });

    describe("isValidValueSetCode", () => {
      it("should accept valid value set codes", () => {
        expect(NamingLaws.isValidValueSetCode("STATUS")).toBe(true);
        expect(NamingLaws.isValidValueSetCode("PARTY_TYPE")).toBe(true);
        expect(NamingLaws.isValidValueSetCode("ACCOUNT_123")).toBe(true);
      });

      it("should reject invalid value set codes", () => {
        expect(NamingLaws.isValidValueSetCode("status")).toBe(false); // lowercase
        expect(NamingLaws.isValidValueSetCode("123STATUS")).toBe(false); // starts with number
        expect(NamingLaws.isValidValueSetCode("STATUS-TYPE")).toBe(false); // hyphen
      });
    });

    describe("isValidValueCode", () => {
      it("should accept valid value codes", () => {
        expect(NamingLaws.isValidValueCode("ACTIVE")).toBe(true);
        expect(NamingLaws.isValidValueCode("DRAFT")).toBe(true);
        expect(NamingLaws.isValidValueCode("HIGH_PRIORITY")).toBe(true);
        expect(NamingLaws.isValidValueCode("ACCOUNT_123")).toBe(true);
      });

      it("should reject invalid value codes", () => {
        expect(NamingLaws.isValidValueCode("active")).toBe(false); // lowercase
        expect(NamingLaws.isValidValueCode("123ACTIVE")).toBe(false); // starts with number
        expect(NamingLaws.isValidValueCode("ACTIVE-STATUS")).toBe(false); // hyphen
      });
    });
  });

  describe("ExportPattern", () => {
    describe("concept", () => {
      it("should export concept using NamingLaws", () => {
        expect(ExportPattern.concept("PARTY")).toBe("CONCEPT_PARTY");
        expect(ExportPattern.concept("INVOICE")).toBe("CONCEPT_INVOICE");
      });
    });

    describe("valueSet", () => {
      it("should export value set with GLOBAL jurisdiction by default", () => {
        expect(ExportPattern.valueSet("STATUS")).toBe("VALUESET_GLOBAL_STATUS");
      });

      it("should export value set with specified jurisdiction", () => {
        expect(ExportPattern.valueSet("STATUS", "GLOBAL")).toBe("VALUESET_GLOBAL_STATUS");
        expect(ExportPattern.valueSet("STATUS", "REGIONAL")).toBe("VALUESET_REGIONAL_STATUS");
        expect(ExportPattern.valueSet("STATUS", "LOCAL")).toBe("VALUESET_LOCAL_STATUS");
      });
    });

    describe("value", () => {
      it("should export value with prefix", () => {
        expect(ExportPattern.value("STATUS", "ACTIVE", "STATUS")).toBe("STATUS_ACTIVE");
        expect(ExportPattern.value("DOC", "DRAFT", "DOC")).toBe("DOC_DRAFT");
      });
    });
  });
});

