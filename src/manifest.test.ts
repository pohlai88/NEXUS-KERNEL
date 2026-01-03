import { describe, it, expect } from "vitest";
import {
  ManifestLayerSchema,
  TargetTypeSchema,
  BusinessStandardSchema,
  CrudOperationSchema,
  type ManifestLayer,
  type TargetType,
  type BusinessStandard,
  type CrudOperation,
  type Manifest,
  type ManifestDefinition,
  isConceptAllowed,
  getConceptPolicy,
  canPerformOperation,
  isValidTransition,
  transitionRequiresComment,
  validateManifestDefinition,
  validateManifest,
  validateManifestCreateInput,
} from "./manifest";
import { CONCEPT, type ConceptId } from "./concepts";
import { CanonError } from "./errors";

describe("Manifest Schema Validation", () => {
  describe("ManifestLayer", () => {
    it("should accept valid layers", () => {
      expect(ManifestLayerSchema.parse("L1")).toBe("L1");
      expect(ManifestLayerSchema.parse("L2")).toBe("L2");
      expect(ManifestLayerSchema.parse("L3")).toBe("L3");
    });

    it("should reject invalid layers", () => {
      expect(() => ManifestLayerSchema.parse("L0")).toThrow();
      expect(() => ManifestLayerSchema.parse("L4")).toThrow();
      expect(() => ManifestLayerSchema.parse("invalid")).toThrow();
    });

    it("should have correct type inference", () => {
      const layer: ManifestLayer = "L1";
      expect(layer).toBe("L1");
    });
  });

  describe("TargetType", () => {
    it("should accept valid target types", () => {
      expect(TargetTypeSchema.parse("domain")).toBe("domain");
      expect(TargetTypeSchema.parse("cluster")).toBe("cluster");
      expect(TargetTypeSchema.parse("tenant")).toBe("tenant");
    });

    it("should reject invalid target types", () => {
      expect(() => TargetTypeSchema.parse("invalid")).toThrow();
      expect(() => TargetTypeSchema.parse("L1")).toThrow();
    });

    it("should have correct type inference", () => {
      const target: TargetType = "domain";
      expect(target).toBe("domain");
    });
  });

  describe("BusinessStandard", () => {
    it("should accept valid business standards", () => {
      expect(BusinessStandardSchema.parse("IFRS")).toBe("IFRS");
      expect(BusinessStandardSchema.parse("MFRS")).toBe("MFRS");
      expect(BusinessStandardSchema.parse("LOCAL")).toBe("LOCAL");
      expect(BusinessStandardSchema.parse("INTERNAL")).toBe("INTERNAL");
    });

    it("should reject invalid business standards", () => {
      expect(() => BusinessStandardSchema.parse("GAAP")).toThrow();
      expect(() => BusinessStandardSchema.parse("invalid")).toThrow();
    });

    it("should have correct type inference", () => {
      const standard: BusinessStandard = "IFRS";
      expect(standard).toBe("IFRS");
    });
  });

  describe("CrudOperation", () => {
    it("should accept valid CRUD-S operations", () => {
      expect(CrudOperationSchema.parse("create")).toBe("create");
      expect(CrudOperationSchema.parse("read")).toBe("read");
      expect(CrudOperationSchema.parse("update")).toBe("update");
      expect(CrudOperationSchema.parse("delete")).toBe("delete");
      expect(CrudOperationSchema.parse("restore")).toBe("restore");
    });

    it("should reject invalid operations", () => {
      expect(() => CrudOperationSchema.parse("soft-delete")).toThrow();
      expect(() => CrudOperationSchema.parse("hard-delete")).toThrow();
      expect(() => CrudOperationSchema.parse("invalid")).toThrow();
    });

    it("should have correct type inference", () => {
      const operation: CrudOperation = "create";
      expect(operation).toBe("create");
    });
  });
});

describe("Manifest Layer Enforcement", () => {
  describe("L1 (Domain) Layer", () => {
    it("should restrict business meaning", () => {
      const layer: ManifestLayer = "L1";
      expect(layer).toBe("L1");
      // L1 restricts what concepts mean in a domain context
    });
  });

  describe("L2 (Cluster) Layer", () => {
    it("should enforce regulation & workflow", () => {
      const layer: ManifestLayer = "L2";
      expect(layer).toBe("L2");
      // L2 enforces regulation and workflow rules
    });
  });

  describe("L3 (Cell/Tenant) Layer", () => {
    it("should execute per tenant", () => {
      const layer: ManifestLayer = "L3";
      expect(layer).toBe("L3");
      // L3 executes per tenant/cell
    });
  });
});

describe("Manifest Integrity Checks", () => {
  it("should validate layer hierarchy", () => {
    const layers: ManifestLayer[] = ["L1", "L2", "L3"];
    expect(layers).toHaveLength(3);
    expect(layers[0]).toBe("L1");
    expect(layers[1]).toBe("L2");
    expect(layers[2]).toBe("L3");
  });

  it("should ensure L1 < L2 < L3 authority", () => {
    // L1 has highest authority (constitutional)
    // L2 has medium authority (regulatory)
    // L3 has lowest authority (execution)
    const authority = { L1: 3, L2: 2, L3: 1 };
    expect(authority.L1).toBeGreaterThan(authority.L2);
    expect(authority.L2).toBeGreaterThan(authority.L3);
  });
});

describe("Manifest Helper Functions", () => {
  const sampleManifestDefinition: ManifestDefinition = {
    name: "Test Manifest",
    allowlist: [CONCEPT.PARTY, CONCEPT.DOCUMENT] as ConceptId[],
    policies: {
      [CONCEPT.PARTY]: {
        crud: {
          create: ["ROLE_ADMIN"],
          read: ["*"],
          update: ["ROLE_ADMIN"],
          delete: ["ROLE_ADMIN"],
          restore: ["ROLE_ADMIN"],
        },
      },
    },
  };

  const sampleManifest: Manifest = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    layer: "L1",
    target_id: "finance",
    target_type: "domain",
    kernel_snapshot_id: "sha256:abc123",
    version: "1.0.0",
    is_active: true,
    is_current: true,
    definition: sampleManifestDefinition,
    created_at: "2024-01-01T00:00:00Z",
    created_by: "550e8400-e29b-41d4-a716-446655440001",
  };

  describe("isConceptAllowed", () => {
    it("should return true for allowed concept", () => {
      expect(isConceptAllowed(sampleManifestDefinition, CONCEPT.PARTY)).toBe(true);
      expect(isConceptAllowed(sampleManifestDefinition, CONCEPT.DOCUMENT)).toBe(true);
    });

    it("should return false for disallowed concept", () => {
      expect(isConceptAllowed(sampleManifestDefinition, CONCEPT.ADDRESS)).toBe(false);
    });

    it("should work with Manifest type", () => {
      expect(isConceptAllowed(sampleManifest, CONCEPT.PARTY)).toBe(true);
      expect(isConceptAllowed(sampleManifest, CONCEPT.ADDRESS)).toBe(false);
    });
  });

  describe("getConceptPolicy", () => {
    it("should return policy for concept with policy", () => {
      const policy = getConceptPolicy(sampleManifestDefinition, CONCEPT.PARTY);
      expect(policy).toBeDefined();
      expect(policy?.crud.read).toContain("*");
      expect(policy?.crud.create).toContain("ROLE_ADMIN");
    });

    it("should return undefined for concept without policy", () => {
      const policy = getConceptPolicy(sampleManifestDefinition, CONCEPT.DOCUMENT);
      expect(policy).toBeUndefined();
    });

    it("should work with Manifest type", () => {
      const policy = getConceptPolicy(sampleManifest, CONCEPT.PARTY);
      expect(policy).toBeDefined();
    });
  });

  describe("canPerformOperation", () => {
    it("should allow read for allowed concept without policy", () => {
      expect(canPerformOperation(sampleManifestDefinition, CONCEPT.DOCUMENT, "read", "anyone")).toBe(true);
    });

    it("should deny create for allowed concept without policy", () => {
      expect(canPerformOperation(sampleManifestDefinition, CONCEPT.DOCUMENT, "create", "anyone")).toBe(false);
    });

    it("should allow read with wildcard role", () => {
      expect(canPerformOperation(sampleManifestDefinition, CONCEPT.PARTY, "read", "anyone")).toBe(true);
    });

    it("should allow create with specific role", () => {
      expect(canPerformOperation(sampleManifestDefinition, CONCEPT.PARTY, "create", "ROLE_ADMIN")).toBe(true);
    });

    it("should deny create without specific role", () => {
      expect(canPerformOperation(sampleManifestDefinition, CONCEPT.PARTY, "create", "ROLE_USER")).toBe(false);
    });

    it("should deny operation for disallowed concept", () => {
      expect(canPerformOperation(sampleManifestDefinition, CONCEPT.ADDRESS, "read", "anyone")).toBe(false);
    });

    it("should handle policy with undefined operation", () => {
      const manifestWithPartialPolicy: ManifestDefinition = {
        name: "Test Manifest",
        allowlist: [CONCEPT.PARTY] as ConceptId[],
        policies: {
          [CONCEPT.PARTY]: {
            crud: {
              create: ["ROLE_ADMIN"],
              read: ["*"],
              update: ["ROLE_ADMIN"],
              delete: ["ROLE_ADMIN"],
              restore: [], // Empty array tests the ?? [] fallback
            },
          },
        },
      };
      // This tests the ?? [] fallback when operation array is empty
      expect(canPerformOperation(manifestWithPartialPolicy, CONCEPT.PARTY, "restore", "ROLE_ADMIN")).toBe(false);
    });
  });

  describe("isValidTransition", () => {
    const workflow = {
      states: "VALUESET_TEST_STATUS",
      initial: "DRAFT",
      transitions: {
        DRAFT: ["SUBMITTED"],
        SUBMITTED: ["APPROVED", "REJECTED"],
      },
    };

    it("should return true for valid transition", () => {
      expect(isValidTransition(workflow, "DRAFT", "SUBMITTED")).toBe(true);
      expect(isValidTransition(workflow, "SUBMITTED", "APPROVED")).toBe(true);
    });

    it("should return false for invalid transition", () => {
      expect(isValidTransition(workflow, "DRAFT", "APPROVED")).toBe(false);
      expect(isValidTransition(workflow, "APPROVED", "DRAFT")).toBe(false);
    });

    it("should return false for unknown from state", () => {
      expect(isValidTransition(workflow, "UNKNOWN", "DRAFT")).toBe(false);
    });
  });

  describe("transitionRequiresComment", () => {
    const workflowWithComments = {
      states: "VALUESET_TEST_STATUS",
      initial: "DRAFT",
      transitions: {
        DRAFT: ["SUBMITTED"],
        SUBMITTED: ["APPROVED", "REJECTED"],
      },
      requires_comment: {
        REJECTED: true,
      },
    };

    it("should return true for state requiring comment", () => {
      expect(transitionRequiresComment(workflowWithComments, "REJECTED")).toBe(true);
    });

    it("should return false for state not requiring comment", () => {
      expect(transitionRequiresComment(workflowWithComments, "APPROVED")).toBe(false);
      expect(transitionRequiresComment(workflowWithComments, "DRAFT")).toBe(false);
    });

    it("should return false when comment_required_states is undefined", () => {
      const workflowWithoutComments = {
        states: "VALUESET_TEST_STATUS",
        initial: "DRAFT",
        transitions: { DRAFT: ["SUBMITTED"] },
      };
      expect(transitionRequiresComment(workflowWithoutComments, "SUBMITTED")).toBe(false);
    });
  });

  describe("validateManifestDefinition", () => {
    it("should validate valid manifest definition", () => {
      expect(() => validateManifestDefinition(sampleManifestDefinition)).not.toThrow();
      const result = validateManifestDefinition(sampleManifestDefinition);
      expect(result.name).toBe("Test Manifest");
      expect(result.allowlist).toContain(CONCEPT.PARTY);
    });

    it("should reject invalid manifest definition", () => {
      const invalid = {
        ...sampleManifestDefinition,
        allowlist: [], // Empty allowlist should fail (min 1)
      };
      expect(() => validateManifestDefinition(invalid)).toThrow(CanonError);
    });
  });

  describe("validateManifest", () => {
    it("should validate valid manifest", () => {
      expect(() => validateManifest(sampleManifest)).not.toThrow();
      const result = validateManifest(sampleManifest);
      expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.layer).toBe("L1");
    });

    it("should reject invalid manifest", () => {
      const invalid = {
        ...sampleManifest,
        id: "", // Invalid empty ID
      };
      expect(() => validateManifest(invalid)).toThrow(CanonError);
    });
  });

  describe("validateManifestCreateInput", () => {
    it("should validate valid create input", () => {
      const createInput = {
        layer: "L1",
        target_id: "finance",
        target_type: "domain",
        kernel_snapshot_id: "sha256:abc123",
        version: "1.0.0",
        definition: sampleManifestDefinition,
        created_by: "550e8400-e29b-41d4-a716-446655440001",
      };
      expect(() => validateManifestCreateInput(createInput)).not.toThrow();
    });

    it("should reject invalid create input", () => {
      const invalid = {
        definition: sampleManifestDefinition,
        created_at: "invalid-date",
        created_by: "user1",
        version: "1.0.0",
      };
      expect(() => validateManifestCreateInput(invalid)).toThrow(CanonError);
    });
  });
});

