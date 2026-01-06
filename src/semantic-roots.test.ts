import { describe, it, expect } from "vitest";
import {
  SEMANTIC_ROOT,
  SEMANTIC_ROOT_REGISTRY,
  SEMANTIC_ROOT_COUNT,
  type SemanticRootId,
  type OwnerRole,
  type DomainCode,
  isValidSemanticRoot,
  getSemanticRoot,
} from "./semantic-roots";

describe("semantic-roots", () => {
  describe("SEMANTIC_ROOT", () => {
    it("should export all entity roots", () => {
      expect(SEMANTIC_ROOT.BANK).toBe("ROOT_BANK");
      expect(SEMANTIC_ROOT.CASE).toBe("ROOT_CASE");
      expect(SEMANTIC_ROOT.CLAIM).toBe("ROOT_CLAIM");
      expect(SEMANTIC_ROOT.COMPANY).toBe("ROOT_COMPANY");
      expect(SEMANTIC_ROOT.COUNTRY).toBe("ROOT_COUNTRY");
      expect(SEMANTIC_ROOT.CURRENCY).toBe("ROOT_CURRENCY");
      expect(SEMANTIC_ROOT.DOCUMENT).toBe("ROOT_DOCUMENT");
      expect(SEMANTIC_ROOT.PARTY).toBe("ROOT_PARTY");
      expect(SEMANTIC_ROOT.VENDOR).toBe("ROOT_VENDOR");
      expect(SEMANTIC_ROOT.BIOLOGICAL_ASSET).toBe("ROOT_BIOLOGICAL_ASSET");
    });

    it("should export all attribute roots", () => {
      expect(SEMANTIC_ROOT.APPROVAL_LEVEL).toBe("ROOT_APPROVAL_LEVEL");
      expect(SEMANTIC_ROOT.IDENTITY).toBe("ROOT_IDENTITY");
      expect(SEMANTIC_ROOT.PAYMENT_METHOD).toBe("ROOT_PAYMENT_METHOD");
      expect(SEMANTIC_ROOT.PRIORITY).toBe("ROOT_PRIORITY");
      expect(SEMANTIC_ROOT.RISK).toBe("ROOT_RISK");
      expect(SEMANTIC_ROOT.STATUS).toBe("ROOT_STATUS");
    });

    it("should export all operation roots", () => {
      expect(SEMANTIC_ROOT.APPROVAL).toBe("ROOT_APPROVAL");
      expect(SEMANTIC_ROOT.AUDIT).toBe("ROOT_AUDIT");
      expect(SEMANTIC_ROOT.PAYMENT).toBe("ROOT_PAYMENT");
      expect(SEMANTIC_ROOT.WORKFLOW).toBe("ROOT_WORKFLOW");
    });

    it("should export all relationship roots", () => {
      expect(SEMANTIC_ROOT.RELATIONSHIP).toBe("ROOT_RELATIONSHIP");
      expect(SEMANTIC_ROOT.GROUP_MEMBERSHIP).toBe("ROOT_GROUP_MEMBERSHIP");
      expect(SEMANTIC_ROOT.INVOICE_VENDOR_LINK).toBe("ROOT_INVOICE_VENDOR_LINK");
      expect(SEMANTIC_ROOT.VENDOR_COMPANY_LINK).toBe("ROOT_VENDOR_COMPANY_LINK");
    });

    it("should have correct count", () => {
      expect(SEMANTIC_ROOT_COUNT).toBe(33);
      expect(Object.keys(SEMANTIC_ROOT).length).toBe(33);
    });
  });

  describe("SEMANTIC_ROOT_REGISTRY", () => {
    it("should contain all root definitions", () => {
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.BANK]).toBeDefined();
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.PARTY]).toBeDefined();
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.STATUS]).toBeDefined();
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.APPROVAL]).toBeDefined();
    });

    it("should have correct structure for entity roots", () => {
      const party = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.PARTY];
      expect(party.code).toBe(SEMANTIC_ROOT.PARTY);
      expect(party.canonicalDefinition).toContain("Legal or natural person");
      expect(party.ownerRole).toBe("ROLE_KERNEL_COUNCIL");
      expect(party.domain).toBe("CORE");
      expect(party.lifecycleStage).toBe("ACTIVE");
      expect(party.version).toBe("1.0.0");
    });

    it("should have correct structure for attribute roots", () => {
      const status = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.STATUS];
      expect(status.code).toBe(SEMANTIC_ROOT.STATUS);
      expect(status.canonicalDefinition).toContain("Lifecycle state");
      expect(status.domain).toBe("CORE");
    });

    it("should have correct structure for operation roots", () => {
      const approval = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.APPROVAL];
      expect(approval.code).toBe(SEMANTIC_ROOT.APPROVAL);
      expect(approval.canonicalDefinition).toContain("Authorization action");
      expect(approval.domain).toBe("GOVERNANCE");
    });

    it("should have correct standard references", () => {
      const country = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.COUNTRY];
      expect(country.standardRef).toBe("ISO:3166-1");

      const currency = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.CURRENCY];
      expect(currency.standardRef).toBe("ISO:4217");

      const biologicalAsset = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.BIOLOGICAL_ASSET];
      expect(biologicalAsset.standardRef).toBe("IFRS:IAS41");
    });

    it("should have correct domain assignments", () => {
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.PARTY].domain).toBe("CORE");
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.BANK].domain).toBe("FINANCE");
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.APPROVAL].domain).toBe("GOVERNANCE");
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.WORKFLOW].domain).toBe("WORKFLOW");
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.IDENTITY].domain).toBe("IDENTITY");
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.AUDIT].domain).toBe("AUDIT");
    });

    it("should have correct owner roles", () => {
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.PARTY].ownerRole).toBe(
        "ROLE_KERNEL_COUNCIL"
      );
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.BANK].ownerRole).toBe(
        "ROLE_FINANCE_COUNCIL"
      );
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.APPROVAL].ownerRole).toBe(
        "ROLE_GOVERNANCE_COMMITTEE"
      );
    });

    it("should have all roots in ACTIVE lifecycle stage", () => {
      Object.values(SEMANTIC_ROOT_REGISTRY).forEach((root) => {
        expect(root.lifecycleStage).toBe("ACTIVE");
      });
    });
  });

  describe("isValidSemanticRoot", () => {
    it("should return true for valid root codes", () => {
      expect(isValidSemanticRoot("ROOT_PARTY")).toBe(true);
      expect(isValidSemanticRoot("ROOT_STATUS")).toBe(true);
      expect(isValidSemanticRoot("ROOT_APPROVAL")).toBe(true);
      expect(isValidSemanticRoot("ROOT_BIOLOGICAL_ASSET")).toBe(true);
    });

    it("should return false for invalid root codes", () => {
      expect(isValidSemanticRoot("INVALID")).toBe(false);
      expect(isValidSemanticRoot("")).toBe(false);
      expect(isValidSemanticRoot("ROOT_INVALID")).toBe(false);
      expect(isValidSemanticRoot("PARTY")).toBe(false);
    });
  });

  describe("getSemanticRoot", () => {
    it("should return root definition", () => {
      const party = getSemanticRoot(SEMANTIC_ROOT.PARTY);
      expect(party.code).toBe(SEMANTIC_ROOT.PARTY);
      expect(party.canonicalDefinition).toBeDefined();
      expect(party.domain).toBe("CORE");

      const status = getSemanticRoot(SEMANTIC_ROOT.STATUS);
      expect(status.code).toBe(SEMANTIC_ROOT.STATUS);
      expect(status.canonicalDefinition).toBeDefined();
    });
  });

  describe("OwnerRole", () => {
    it("should accept valid owner roles", () => {
      const roles: OwnerRole[] = [
        "ROLE_KERNEL_COUNCIL",
        "ROLE_COMPLIANCE_AUTHORITY",
        "ROLE_DOMAIN_OWNER",
        "ROLE_GOVERNANCE_COMMITTEE",
        "ROLE_FINANCE_COUNCIL",
        "ROLE_OPS_COUNCIL",
        "ROLE_DOCUMENT_AUTHOR",
      ];

      roles.forEach((role) => {
        expect(role).toBeDefined();
      });
    });

    it("should have correct role assignments in registry", () => {
      const party = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.PARTY];
      expect(party.ownerRole).toBe("ROLE_KERNEL_COUNCIL");

      const bank = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.BANK];
      expect(bank.ownerRole).toBe("ROLE_FINANCE_COUNCIL");
    });
  });

  describe("DomainCode", () => {
    it("should accept valid domain codes", () => {
      const domains: DomainCode[] = [
        "CORE",
        "FINANCE",
        "GOVERNANCE",
        "WORKFLOW",
        "IDENTITY",
        "AUDIT",
        "INTEGRATION",
        "DOCUMENT",
        "OPERATIONS",
      ];

      domains.forEach((domain) => {
        expect(domain).toBeDefined();
      });
    });

    it("should have correct domain assignments in registry", () => {
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.PARTY].domain).toBe("CORE");
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.BANK].domain).toBe("FINANCE");
      expect(SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.APPROVAL].domain).toBe("GOVERNANCE");
    });
  });
});

