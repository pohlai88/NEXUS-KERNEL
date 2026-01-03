import { describe, it, expect } from "vitest";
import {
  NAMESPACE_PREFIX,
  NAMESPACE_PREFIX_REGISTRY,
  NAMESPACE_PREFIX_COUNT,
  type NamespacePrefixId,
  type NamespaceType,
  isValidNamespacePrefix,
  getNamespacePrefix,
  validateValueAgainstPrefix,
} from "./namespace-prefixes";

describe("namespace-prefixes", () => {
  describe("NAMESPACE_PREFIX", () => {
    it("should export all registry type prefixes", () => {
      expect(NAMESPACE_PREFIX.CONCEPT).toBe("PREFIX_CONCEPT");
      expect(NAMESPACE_PREFIX.VALUESET).toBe("PREFIX_VALUESET");
      expect(NAMESPACE_PREFIX.RELATION).toBe("PREFIX_RELATION");
      expect(NAMESPACE_PREFIX.EVENT).toBe("PREFIX_EVENT");
      expect(NAMESPACE_PREFIX.POLICY).toBe("PREFIX_POLICY");
      expect(NAMESPACE_PREFIX.ROOT).toBe("PREFIX_ROOT");
      expect(NAMESPACE_PREFIX.DOCTYPE).toBe("PREFIX_DOCTYPE");
    });

    it("should export all value prefixes", () => {
      expect(NAMESPACE_PREFIX.STATUS).toBe("PREFIX_STATUS");
      expect(NAMESPACE_PREFIX.WF).toBe("PREFIX_WF");
      expect(NAMESPACE_PREFIX.APP).toBe("PREFIX_APP");
      expect(NAMESPACE_PREFIX.DOC).toBe("PREFIX_DOC");
      expect(NAMESPACE_PREFIX.PRI).toBe("PREFIX_PRI");
      expect(NAMESPACE_PREFIX.RISK).toBe("PREFIX_RISK");
      expect(NAMESPACE_PREFIX.COUNTRY).toBe("PREFIX_COUNTRY");
      expect(NAMESPACE_PREFIX.CURRENCY).toBe("PREFIX_CURRENCY");
      expect(NAMESPACE_PREFIX.ID).toBe("PREFIX_ID");
      expect(NAMESPACE_PREFIX.PARTY).toBe("PREFIX_PARTY");
      expect(NAMESPACE_PREFIX.REL).toBe("PREFIX_REL");
      expect(NAMESPACE_PREFIX.AUD).toBe("PREFIX_AUD");
      expect(NAMESPACE_PREFIX.OVERRIDE).toBe("PREFIX_OVERRIDE");
      expect(NAMESPACE_PREFIX.ROLE).toBe("PREFIX_ROLE");
    });

    it("should have correct count", () => {
      expect(NAMESPACE_PREFIX_COUNT).toBe(21);
      expect(Object.keys(NAMESPACE_PREFIX).length).toBe(21);
    });
  });

  describe("NAMESPACE_PREFIX_REGISTRY", () => {
    it("should contain all prefix definitions", () => {
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.CONCEPT]).toBeDefined();
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.VALUESET]).toBeDefined();
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.STATUS]).toBeDefined();
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.ROLE]).toBeDefined();
    });

    it("should have correct structure for registry type prefixes", () => {
      const concept = NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.CONCEPT];
      expect(concept.code).toBe(NAMESPACE_PREFIX.CONCEPT);
      expect(concept.prefix).toBe("CONCEPT_");
      expect(concept.namespaceType).toBe("GLOBAL");
      expect(concept.ownerRole).toBe("ROLE_KERNEL_COUNCIL");
      expect(concept.domain).toBe("CORE");
      expect(concept.changeAuthority).toBe("LAW_AMENDMENT");
    });

    it("should have correct structure for value prefixes", () => {
      const status = NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.STATUS];
      expect(status.code).toBe(NAMESPACE_PREFIX.STATUS);
      expect(status.prefix).toBe("STATUS_");
      expect(status.namespaceType).toBe("GLOBAL");
      expect(status.changeAuthority).toBe("PRD_APPROVAL");
    });

    it("should have correct patterns", () => {
      const concept = NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.CONCEPT];
      expect(concept.pattern).toBe("^CONCEPT_[A-Z][A-Z0-9_]{2,50}$");

      const country = NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.COUNTRY];
      expect(country.pattern).toBe("^COUNTRY_[A-Z]{2}$");

      const currency = NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.CURRENCY];
      expect(currency.pattern).toBe("^CURRENCY_[A-Z]{3}$");
    });

    it("should have correct domain assignments", () => {
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.CONCEPT].domain).toBe("CORE");
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.CURRENCY].domain).toBe("FINANCE");
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.POLICY].domain).toBe("GOVERNANCE");
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.WF].domain).toBe("WORKFLOW");
    });
  });

  describe("isValidNamespacePrefix", () => {
    it("should return true for valid prefix codes", () => {
      expect(isValidNamespacePrefix("PREFIX_CONCEPT")).toBe(true);
      expect(isValidNamespacePrefix("PREFIX_STATUS")).toBe(true);
      expect(isValidNamespacePrefix("PREFIX_ROLE")).toBe(true);
    });

    it("should return false for invalid prefix codes", () => {
      expect(isValidNamespacePrefix("INVALID")).toBe(false);
      expect(isValidNamespacePrefix("")).toBe(false);
      expect(isValidNamespacePrefix("PREFIX_INVALID")).toBe(false);
    });
  });

  describe("getNamespacePrefix", () => {
    it("should return prefix definition", () => {
      const concept = getNamespacePrefix(NAMESPACE_PREFIX.CONCEPT);
      expect(concept.code).toBe(NAMESPACE_PREFIX.CONCEPT);
      expect(concept.prefix).toBe("CONCEPT_");

      const status = getNamespacePrefix(NAMESPACE_PREFIX.STATUS);
      expect(status.code).toBe(NAMESPACE_PREFIX.STATUS);
      expect(status.prefix).toBe("STATUS_");
    });
  });

  describe("validateValueAgainstPrefix", () => {
    it("should validate values matching CONCEPT pattern", () => {
      expect(validateValueAgainstPrefix("CONCEPT_PARTY", NAMESPACE_PREFIX.CONCEPT)).toBe(
        true
      );
      expect(validateValueAgainstPrefix("CONCEPT_INVOICE", NAMESPACE_PREFIX.CONCEPT)).toBe(
        true
      );
      expect(validateValueAgainstPrefix("INVALID", NAMESPACE_PREFIX.CONCEPT)).toBe(false);
      expect(validateValueAgainstPrefix("concept_party", NAMESPACE_PREFIX.CONCEPT)).toBe(
        false
      );
    });

    it("should validate values matching COUNTRY pattern", () => {
      expect(validateValueAgainstPrefix("COUNTRY_MY", NAMESPACE_PREFIX.COUNTRY)).toBe(true);
      expect(validateValueAgainstPrefix("COUNTRY_SG", NAMESPACE_PREFIX.COUNTRY)).toBe(true);
      expect(validateValueAgainstPrefix("COUNTRY_XYZ", NAMESPACE_PREFIX.COUNTRY)).toBe(false);
      expect(validateValueAgainstPrefix("COUNTRY_M", NAMESPACE_PREFIX.COUNTRY)).toBe(false);
    });

    it("should validate values matching CURRENCY pattern", () => {
      expect(validateValueAgainstPrefix("CURRENCY_MYR", NAMESPACE_PREFIX.CURRENCY)).toBe(
        true
      );
      expect(validateValueAgainstPrefix("CURRENCY_USD", NAMESPACE_PREFIX.CURRENCY)).toBe(
        true
      );
      expect(validateValueAgainstPrefix("CURRENCY_XY", NAMESPACE_PREFIX.CURRENCY)).toBe(
        false
      );
      expect(validateValueAgainstPrefix("CURRENCY_ABCD", NAMESPACE_PREFIX.CURRENCY)).toBe(
        false
      );
    });

    it("should validate values matching STATUS pattern", () => {
      expect(validateValueAgainstPrefix("STATUS_ACTIVE", NAMESPACE_PREFIX.STATUS)).toBe(
        true
      );
      expect(validateValueAgainstPrefix("STATUS_DRAFT", NAMESPACE_PREFIX.STATUS)).toBe(true);
      expect(validateValueAgainstPrefix("STATUS", NAMESPACE_PREFIX.STATUS)).toBe(false);
      expect(validateValueAgainstPrefix("status_active", NAMESPACE_PREFIX.STATUS)).toBe(
        false
      );
    });

    it("should validate values matching WF pattern", () => {
      expect(validateValueAgainstPrefix("WF_PENDING", NAMESPACE_PREFIX.WF)).toBe(true);
      expect(validateValueAgainstPrefix("WF_COMPLETED", NAMESPACE_PREFIX.WF)).toBe(true);
      expect(validateValueAgainstPrefix("WF", NAMESPACE_PREFIX.WF)).toBe(false);
    });
  });

  describe("NamespaceType", () => {
    it("should accept valid namespace types", () => {
      const types: NamespaceType[] = ["GLOBAL", "JURISDICTION", "DOMAIN", "TENANT"];

      types.forEach((type) => {
        expect(type).toBeDefined();
      });
    });

    it("should have GLOBAL type for most prefixes", () => {
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.CONCEPT].namespaceType).toBe(
        "GLOBAL"
      );
      expect(NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.STATUS].namespaceType).toBe("GLOBAL");
    });
  });
});

