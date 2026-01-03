import { describe, it, expect } from "vitest";
import {
  DOCUMENT_TYPE,
  DOCUMENT_TYPE_REGISTRY,
  DOCUMENT_TYPE_COUNT,
  type DocumentTypeId,
  type DocumentStatus,
  type DerivationDeclaration,
  isValidDocumentType,
  getDocumentType,
  canReference,
  validateDerivationChain,
} from "./document-types";

describe("document-types", () => {
  describe("DOCUMENT_TYPE", () => {
    it("should export all document type constants", () => {
      expect(DOCUMENT_TYPE.LAW).toBe("DOCTYPE_LAW");
      expect(DOCUMENT_TYPE.LAW_REG).toBe("DOCTYPE_LAW_REG");
      expect(DOCUMENT_TYPE.PRD).toBe("DOCTYPE_PRD");
      expect(DOCUMENT_TYPE.SRS).toBe("DOCTYPE_SRS");
      expect(DOCUMENT_TYPE.ADR).toBe("DOCTYPE_ADR");
      expect(DOCUMENT_TYPE.TSD).toBe("DOCTYPE_TSD");
      expect(DOCUMENT_TYPE.SOP).toBe("DOCTYPE_SOP");
    });

    it("should have correct count", () => {
      expect(DOCUMENT_TYPE_COUNT).toBe(7);
      expect(Object.keys(DOCUMENT_TYPE).length).toBe(7);
    });
  });

  describe("DOCUMENT_TYPE_REGISTRY", () => {
    it("should contain all document types", () => {
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.LAW]).toBeDefined();
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.LAW_REG]).toBeDefined();
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.PRD]).toBeDefined();
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.SRS]).toBeDefined();
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.ADR]).toBeDefined();
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.TSD]).toBeDefined();
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.SOP]).toBeDefined();
    });

    it("should have correct hierarchy structure", () => {
      const law = DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.LAW];
      expect(law.authorityLevel).toBe(1);
      expect(law.parentType).toBeNull();
      expect(law.immutableOnApproval).toBe(true);

      const prd = DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.PRD];
      expect(prd.authorityLevel).toBe(2);
      expect(prd.parentType).toBe(DOCUMENT_TYPE.LAW);
      expect(prd.immutableOnApproval).toBe(false);

      const sop = DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.SOP];
      expect(sop.authorityLevel).toBe(6);
      expect(sop.parentType).toBe(DOCUMENT_TYPE.TSD);
    });

    it("should have correct patterns", () => {
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.LAW].pattern).toBe("LAW-XXX");
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.PRD].pattern).toBe("PRD-XXX");
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.SRS].pattern).toBe("SRS-XXX");
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.ADR].pattern).toBe("ADR-XXX");
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.TSD].pattern).toBe("TSD-XXX");
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.SOP].pattern).toBe("SOP-XXX");
    });

    it("should have correct approval roles", () => {
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.LAW].approvalRole).toBe(
        "ROLE_KERNEL_COUNCIL"
      );
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.PRD].approvalRole).toBe(
        "ROLE_DOMAIN_OWNER"
      );
      expect(DOCUMENT_TYPE_REGISTRY[DOCUMENT_TYPE.SOP].approvalRole).toBe(
        "ROLE_DOCUMENT_AUTHOR"
      );
    });
  });

  describe("isValidDocumentType", () => {
    it("should return true for valid document types", () => {
      expect(isValidDocumentType("DOCTYPE_LAW")).toBe(true);
      expect(isValidDocumentType("DOCTYPE_PRD")).toBe(true);
      expect(isValidDocumentType("DOCTYPE_SOP")).toBe(true);
    });

    it("should return false for invalid document types", () => {
      expect(isValidDocumentType("INVALID")).toBe(false);
      expect(isValidDocumentType("")).toBe(false);
      expect(isValidDocumentType("DOCTYPE_INVALID")).toBe(false);
    });
  });

  describe("getDocumentType", () => {
    it("should return document type definition", () => {
      const law = getDocumentType(DOCUMENT_TYPE.LAW);
      expect(law.code).toBe(DOCUMENT_TYPE.LAW);
      expect(law.name).toBe("Law");
      expect(law.authorityLevel).toBe(1);

      const prd = getDocumentType(DOCUMENT_TYPE.PRD);
      expect(prd.code).toBe(DOCUMENT_TYPE.PRD);
      expect(prd.name).toBe("Product Requirements Document");
      expect(prd.authorityLevel).toBe(2);
    });
  });

  describe("canReference", () => {
    it("should allow child to reference parent (higher authority)", () => {
      // SOP (level 6) can reference LAW (level 1)
      expect(canReference(DOCUMENT_TYPE.SOP, DOCUMENT_TYPE.LAW)).toBe(true);
      // PRD (level 2) can reference LAW (level 1)
      expect(canReference(DOCUMENT_TYPE.PRD, DOCUMENT_TYPE.LAW)).toBe(true);
    });

    it("should allow same level references", () => {
      // Same level can reference each other
      expect(canReference(DOCUMENT_TYPE.PRD, DOCUMENT_TYPE.PRD)).toBe(true);
    });

    it("should prevent child from referencing lower authority", () => {
      // LAW (level 1) cannot reference SOP (level 6)
      expect(canReference(DOCUMENT_TYPE.LAW, DOCUMENT_TYPE.SOP)).toBe(false);
      // PRD (level 2) cannot reference SRS (level 3)
      expect(canReference(DOCUMENT_TYPE.PRD, DOCUMENT_TYPE.SRS)).toBe(false);
    });
  });

  describe("validateDerivationChain", () => {
    it("should validate correct derivation chain", () => {
      // PRD deriving from LAW is valid
      const result1 = validateDerivationChain(DOCUMENT_TYPE.PRD, ["LAW-001"]);
      expect(result1.valid).toBe(true);
      expect(result1.errors).toHaveLength(0);

      // SRS deriving from PRD is valid
      const result2 = validateDerivationChain(DOCUMENT_TYPE.SRS, ["PRD-001"]);
      expect(result2.valid).toBe(true);
      expect(result2.errors).toHaveLength(0);
    });

    it("should reject invalid derivation chain", () => {
      // LAW cannot derive from SOP (wrong direction)
      const result1 = validateDerivationChain(DOCUMENT_TYPE.LAW, ["SOP-001"]);
      expect(result1.valid).toBe(false);
      expect(result1.errors.length).toBeGreaterThan(0);
      expect(result1.errors[0]).toContain("cannot derive from");

      // PRD cannot derive from SRS (wrong direction)
      const result2 = validateDerivationChain(DOCUMENT_TYPE.PRD, ["SRS-001"]);
      expect(result2.valid).toBe(false);
    });

    it("should reject invalid document type codes", () => {
      const result = validateDerivationChain(DOCUMENT_TYPE.PRD, ["INVALID-001"]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid parent document type"))).toBe(
        true
      );
    });

    it("should handle multiple parent documents", () => {
      const result = validateDerivationChain(DOCUMENT_TYPE.SRS, [
        "PRD-001",
        "PRD-002",
        "LAW-001",
      ]);
      expect(result.valid).toBe(true);
    });

    it("should handle mixed valid and invalid derivations", () => {
      const result = validateDerivationChain(DOCUMENT_TYPE.PRD, [
        "LAW-001", // Valid
        "SOP-001", // Invalid - wrong direction
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("DocumentStatus", () => {
    it("should accept valid document status values", () => {
      const statuses: DocumentStatus[] = [
        "DRAFT",
        "REVIEW",
        "APPROVED",
        "IMPLEMENTED",
        "SUPERSEDED",
        "DEPRECATED",
      ];

      statuses.forEach((status) => {
        expect(status).toBeDefined();
      });
    });
  });

  describe("DerivationDeclaration", () => {
    it("should have correct structure", () => {
      const declaration: DerivationDeclaration = {
        derivesFrom: ["LAW-001", "PRD-002"],
        governs: ["registry-1", "registry-2"],
      };

      expect(declaration.derivesFrom).toHaveLength(2);
      expect(declaration.governs).toHaveLength(2);
    });

    it("should allow empty arrays", () => {
      const declaration: DerivationDeclaration = {
        derivesFrom: [],
        governs: [],
      };

      expect(declaration.derivesFrom).toHaveLength(0);
      expect(declaration.governs).toHaveLength(0);
    });
  });
});

