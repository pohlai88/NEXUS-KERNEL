// @aibos/kernel - L1-L3 Manifest Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRD: PRD-KERNEL_MANIFEST_NPM.md
// Purpose: Zod schemas for runtime manifest validation
// Layer: L1 (Domain), L2 (Cluster), L3 (Cell/Tenant)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";
import { CONCEPT, type ConceptId } from "./concepts";
import { CanonError } from "./errors";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. BASE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Manifest Layer - Authority hierarchy
 * L1 = Domain (restricts business meaning)
 * L2 = Cluster (enforces regulation & workflow)
 * L3 = Cell (executes per tenant)
 */
export const ManifestLayerSchema = z.enum(["L1", "L2", "L3"]);
export type ManifestLayer = z.infer<typeof ManifestLayerSchema>;

/**
 * Target Type - What the manifest governs
 */
export const TargetTypeSchema = z.enum(["domain", "cluster", "tenant"]);
export type TargetType = z.infer<typeof TargetTypeSchema>;

/**
 * Business Standard - Regulatory framework reference
 */
export const BusinessStandardSchema = z.enum([
  "IFRS",
  "MFRS",
  "LOCAL",
  "INTERNAL",
]);
export type BusinessStandard = z.infer<typeof BusinessStandardSchema>;

/**
 * CRUD-S Operation - Extended CRUD with Soft-delete and Restore
 */
export const CrudOperationSchema = z.enum([
  "create",
  "read",
  "update",
  "delete", // SOFT-DELETE ONLY
  "restore",
]);
export type CrudOperation = z.infer<typeof CrudOperationSchema>;

/**
 * ConceptId Schema - Validates against known concepts
 */
const conceptValues = Object.values(CONCEPT) as [ConceptId, ...ConceptId[]];
export const ConceptIdSchema = z.enum(conceptValues);

/**
 * Role ID - Reference to RBAC role
 * Can be "*" for any role (use sparingly)
 */
export const RoleIdSchema = z.string().min(1).max(64);

/**
 * Value Set ID - Reference to kernel value set
 */
export const ValueSetIdSchema = z
  .string()
  .regex(/^VALUESET_[A-Z0-9_]+$/, "Invalid ValueSet ID format");

/**
 * Value ID - Reference to value within a value set
 */
export const ValueIdSchema = z
  .string()
  .regex(/^[A-Z0-9_]+$/, "Invalid Value ID format");

/**
 * Semver - Semantic versioning pattern
 */
export const SemverSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "Must be valid semver (e.g., 1.0.0)");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. CRUD-S PERMISSIONS SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * CRUD-S Permission - Roles allowed for each operation
 *
 * @example
 * ```typescript
 * const crud: CrudPermission = {
 *   create: ["admin", "manager"],
 *   read: ["*"], // Any role can read
 *   update: ["admin", "manager"],
 *   delete: ["admin"], // Soft-delete only
 *   restore: ["admin"],
 * };
 * ```
 */
export const CrudPermissionSchema = z.object({
  create: z.array(RoleIdSchema).default([]),
  read: z.array(RoleIdSchema).default([]),
  update: z.array(RoleIdSchema).default([]),
  delete: z.array(RoleIdSchema).default([]), // SOFT-DELETE ONLY
  restore: z.array(RoleIdSchema).optional().default([]),
});
export type CrudPermission = z.infer<typeof CrudPermissionSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. INTEGRITY CONSTRAINTS SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Integrity Constraints - Field immutability and required relations
 *
 * @example
 * ```typescript
 * const integrity: IntegrityConstraint = {
 *   immutable_fields: ["id", "created_at", "vendor_id"],
 *   required_relations: ["CONCEPT_VENDOR", "CONCEPT_COMPANY"],
 * };
 * ```
 */
export const IntegrityConstraintSchema = z.object({
  /** Fields that cannot be updated after creation */
  immutable_fields: z.array(z.string()).default([]),
  /** Related concepts that must exist (ACID atomicity) */
  required_relations: z.array(ConceptIdSchema).default([]),
});
export type IntegrityConstraint = z.infer<typeof IntegrityConstraintSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. WORKFLOW SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Workflow Definition - State machine for concept lifecycle
 *
 * @example
 * ```typescript
 * const workflow: WorkflowDefinition = {
 *   states: "VALUESET_INVOICE_STATUS",
 *   initial: "RECEIVED",
 *   transitions: {
 *     RECEIVED: ["UNDER_REVIEW", "REJECTED"],
 *     UNDER_REVIEW: ["APPROVED_FOR_PAYMENT", "REJECTED"],
 *     APPROVED_FOR_PAYMENT: ["PAID"],
 *     REJECTED: [], // Terminal state
 *     PAID: [], // Terminal state
 *   },
 *   requires_comment: {
 *     REJECTED: true,
 *   },
 * };
 * ```
 */
export const WorkflowDefinitionSchema = z.object({
  /** Value set containing valid states */
  states: ValueSetIdSchema,
  /** Initial state for new entities */
  initial: ValueIdSchema,
  /** Allowed state transitions (from -> [to]) */
  transitions: z.record(ValueIdSchema, z.array(ValueIdSchema)),
  /** States that require a comment when entering */
  requires_comment: z.record(ValueIdSchema, z.boolean()).optional(),
});
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. BUSINESS REFERENCE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Business Reference - Regulatory/standard alignment
 *
 * @example
 * ```typescript
 * const ref: BusinessReference = {
 *   standard: "IFRS",
 *   reference: "IAS 41 - Agriculture",
 *   notes: "Biological assets valuation",
 * };
 * ```
 */
export const BusinessReferenceSchema = z.object({
  standard: BusinessStandardSchema,
  reference: z.string().min(1).max(256),
  notes: z.string().max(1024).optional(),
});
export type BusinessReference = z.infer<typeof BusinessReferenceSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. CONCEPT POLICY SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Concept Policy - Full governance rules for a single concept
 *
 * @example
 * ```typescript
 * const invoicePolicy: ConceptPolicy = {
 *   crud: {
 *     create: ["vendor", "admin"],
 *     read: ["*"],
 *     update: ["admin", "manager"],
 *     delete: ["admin"],
 *     restore: ["admin"],
 *   },
 *   integrity: {
 *     immutable_fields: ["id", "invoice_number", "vendor_id"],
 *     required_relations: ["CONCEPT_VENDOR"],
 *   },
 *   workflow: {
 *     states: "VALUESET_INVOICE_STATUS",
 *     initial: "RECEIVED",
 *     transitions: { ... },
 *   },
 *   business_reference: {
 *     standard: "IFRS",
 *     reference: "IFRS 15 - Revenue Recognition",
 *   },
 * };
 * ```
 */
export const ConceptPolicySchema = z.object({
  /** CRUD-S permissions */
  crud: CrudPermissionSchema,
  /** Integrity constraints */
  integrity: IntegrityConstraintSchema.optional(),
  /** Workflow definition */
  workflow: WorkflowDefinitionSchema.optional(),
  /** Business/regulatory reference */
  business_reference: BusinessReferenceSchema.optional(),
});
export type ConceptPolicy = z.infer<typeof ConceptPolicySchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. MANIFEST DEFINITION SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Manifest Definition - The governance rules within the JSONB `definition` column
 *
 * This is what gets stored in `sys_manifests.definition`
 */
export const ManifestDefinitionSchema = z.object({
  /** Human-readable name */
  name: z.string().min(1).max(128),
  /** Description */
  description: z.string().max(1024).optional(),
  /** Concept allowlist - only these concepts can be used in this scope */
  allowlist: z.array(ConceptIdSchema).min(1),
  /** Per-concept policies */
  policies: z.record(ConceptIdSchema, ConceptPolicySchema).optional(),
  /** Metadata for extensibility */
  metadata: z.record(z.unknown()).optional(),
});
export type ManifestDefinition = z.infer<typeof ManifestDefinitionSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. FULL MANIFEST SCHEMA (Database Row)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Manifest - Full manifest record as stored in `sys_manifests` table
 *
 * @example
 * ```typescript
 * const manifest: Manifest = {
 *   id: "bb47987f-0217-4b42-9fcb-132b85152d67",
 *   layer: "L1",
 *   target_id: "VPM",
 *   target_type: "domain",
 *   kernel_snapshot_id: "sha256:abc123...",
 *   version: "1.0.0",
 *   is_active: true,
 *   is_current: true,
 *   definition: { ... },
 * };
 * ```
 */
export const ManifestSchema = z.object({
  /** UUID primary key */
  id: z.string().uuid(),

  /** Manifest layer (L1/L2/L3) */
  layer: ManifestLayerSchema,

  /** Target identifier (domain ID, cluster ID, or tenant ID) */
  target_id: z.string().min(1).max(64),

  /** Target type */
  target_type: TargetTypeSchema,

  /** Kernel snapshot ID for version compliance */
  kernel_snapshot_id: z.string().min(1),

  /** Manifest semantic version */
  version: SemverSchema,

  /** Is this manifest active? */
  is_active: z.boolean().default(false),

  /** Is this the current version? */
  is_current: z.boolean().default(true),

  /** Manifest definition (the actual rules) */
  definition: ManifestDefinitionSchema,

  /** Soft-delete timestamp */
  deleted_at: z.string().datetime().nullable().optional(),

  /** Who soft-deleted this manifest */
  deleted_by: z.string().uuid().nullable().optional(),

  /** Parent manifest ID (for inheritance) */
  parent_manifest_id: z.string().uuid().nullable().optional(),

  /** Replacement manifest ID */
  replaced_by_id: z.string().uuid().nullable().optional(),

  /** Audit: who created */
  created_by: z.string().uuid().nullable().optional(),

  /** Audit: when created */
  created_at: z.string().datetime().optional(),

  /** Audit: who last updated */
  updated_by: z.string().uuid().nullable().optional(),

  /** Audit: when last updated */
  updated_at: z.string().datetime().optional(),
});
export type Manifest = z.infer<typeof ManifestSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. MANIFEST CREATE INPUT SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * ManifestCreateInput - Schema for creating a new manifest
 * Omits auto-generated fields
 */
export const ManifestCreateInputSchema = ManifestSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  deleted_by: true,
  replaced_by_id: true,
});
export type ManifestCreateInput = z.infer<typeof ManifestCreateInputSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. VALIDATION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Validate a manifest definition
 * @throws CanonError on validation failure
 */
export function validateManifestDefinition(input: unknown): ManifestDefinition {
  const result = ManifestDefinitionSchema.safeParse(input);
  if (!result.success) {
    throw new CanonError(
      "VALIDATION_FAILED",
      `Manifest definition validation failed: ${result.error.message}`,
      { errors: result.error.errors }
    );
  }
  return result.data;
}

/**
 * Validate a full manifest record
 * @throws CanonError on validation failure
 */
export function validateManifest(input: unknown): Manifest {
  const result = ManifestSchema.safeParse(input);
  if (!result.success) {
    throw new CanonError(
      "VALIDATION_FAILED",
      `Manifest validation failed: ${result.error.message}`,
      { errors: result.error.errors }
    );
  }
  return result.data;
}

/**
 * Validate manifest create input
 * @throws CanonError on validation failure
 */
export function validateManifestCreateInput(
  input: unknown
): ManifestCreateInput {
  const result = ManifestCreateInputSchema.safeParse(input);
  if (!result.success) {
    throw new CanonError(
      "VALIDATION_FAILED",
      `Manifest create input validation failed: ${result.error.message}`,
      { errors: result.error.errors }
    );
  }
  return result.data;
}

/**
 * Check if a concept is in the manifest allowlist
 */
export function isConceptAllowed(
  manifest: Manifest | ManifestDefinition,
  conceptId: ConceptId
): boolean {
  const definition = "definition" in manifest ? manifest.definition : manifest;
  return definition.allowlist.includes(conceptId);
}

/**
 * Get the policy for a concept from a manifest
 */
export function getConceptPolicy(
  manifest: Manifest | ManifestDefinition,
  conceptId: ConceptId
): ConceptPolicy | undefined {
  const definition = "definition" in manifest ? manifest.definition : manifest;
  return definition.policies?.[conceptId];
}

/**
 * Check if a role can perform an operation on a concept
 */
export function canPerformOperation(
  manifest: Manifest | ManifestDefinition,
  conceptId: ConceptId,
  operation: CrudOperation,
  roleId: string
): boolean {
  if (!isConceptAllowed(manifest, conceptId)) {
    return false;
  }

  const policy = getConceptPolicy(manifest, conceptId);
  if (!policy) {
    // No explicit policy = allow if in allowlist (default open for read)
    return operation === "read";
  }

  const allowedRoles = policy.crud[operation] ?? [];
  return allowedRoles.includes("*") || allowedRoles.includes(roleId);
}

/**
 * Validate a workflow state transition
 */
export function isValidTransition(
  workflow: WorkflowDefinition,
  fromState: string,
  toState: string
): boolean {
  const allowedNextStates = workflow.transitions[fromState];
  if (!allowedNextStates) {
    return false;
  }
  return allowedNextStates.includes(toState);
}

/**
 * Check if a state transition requires a comment
 */
export function transitionRequiresComment(
  workflow: WorkflowDefinition,
  toState: string
): boolean {
  return workflow.requires_comment?.[toState] ?? false;
}
