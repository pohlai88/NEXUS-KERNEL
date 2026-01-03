import { describe, it, expect } from "vitest";
import { CanonId } from "./canonId";

describe("CanonId Validation", () => {
  describe("Valid CanonIds", () => {
    it("should accept uppercase alphanumeric with underscores", () => {
      expect(CanonId.parse("CONCEPT_INVOICE")).toBe("CONCEPT_INVOICE");
      expect(CanonId.parse("VALUESET_GLOBAL_ACCOUNT_TYPE")).toBe(
        "VALUESET_GLOBAL_ACCOUNT_TYPE"
      );
      expect(CanonId.parse("ACC_ASSET")).toBe("ACC_ASSET");
    });

    it("should accept colons and hyphens", () => {
      expect(CanonId.parse("CONCEPT:INVOICE")).toBe("CONCEPT:INVOICE");
      expect(CanonId.parse("CONCEPT-INVOICE")).toBe("CONCEPT-INVOICE");
    });

    it("should accept minimum length (3 chars)", () => {
      expect(CanonId.parse("ABC")).toBe("ABC");
    });

    it("should accept maximum length (160 chars)", () => {
      const longId = "A".repeat(160);
      expect(CanonId.parse(longId)).toBe(longId);
    });
  });

  describe("Invalid CanonIds", () => {
    it("should reject lowercase letters", () => {
      expect(() => CanonId.parse("concept_invoice")).toThrow();
      expect(() => CanonId.parse("CONCEPT_invoice")).toThrow();
    });

    it("should reject special characters", () => {
      expect(() => CanonId.parse("CONCEPT@INVOICE")).toThrow();
      expect(() => CanonId.parse("CONCEPT#INVOICE")).toThrow();
      expect(() => CanonId.parse("CONCEPT$INVOICE")).toThrow();
      expect(() => CanonId.parse("CONCEPT%INVOICE")).toThrow();
    });

    it("should reject too short (< 3 chars)", () => {
      expect(() => CanonId.parse("AB")).toThrow();
      expect(() => CanonId.parse("A")).toThrow();
      expect(() => CanonId.parse("")).toThrow();
    });

    it("should reject too long (> 160 chars)", () => {
      const tooLongId = "A".repeat(161);
      expect(() => CanonId.parse(tooLongId)).toThrow();
    });

    it("should reject spaces", () => {
      expect(() => CanonId.parse("CONCEPT INVOICE")).toThrow();
    });
  });

  describe("CanonId Format Compliance", () => {
    it("should enforce uppercase requirement", () => {
      expect(() => CanonId.parse("concept_invoice")).toThrow();
    });

    it("should enforce machine-safe characters only", () => {
      expect(() => CanonId.parse("CONCEPT.INVOICE")).toThrow();
      expect(() => CanonId.parse("CONCEPT/INVOICE")).toThrow();
    });

    it("should allow stable identifiers", () => {
      // Stable = no changing parts like timestamps
      expect(CanonId.parse("CONCEPT_INVOICE_V1")).toBe("CONCEPT_INVOICE_V1");
    });
  });
});

