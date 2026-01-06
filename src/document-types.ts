// @aibos/kernel - L0 Document Type Registry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHORITY: LAW-REG-001 §4.2, §4.4, §14 — Document Authority Chain
// SSOT: These are the ONLY document types in the AI-BOS governance system.
// Document types define the LAW→PRD→SRS→ADR→TSD→SOP hierarchy.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { OwnerRole } from "./semantic-roots";

/**
 * Document Type Definition
 *
 * Document types form a strict authority hierarchy.
 * Lower-level documents may reference higher-level, never the reverse.
 */
export interface DocumentTypeDefinition {
  /** Unique document type identifier (e.g., "DOCTYPE_LAW") */
  readonly code: DocumentTypeId;
  /** The document code pattern (e.g., "LAW-XXX") */
  readonly pattern: string;
  /** Human-readable name */
  readonly name: string;
  /** Purpose of this document type */
  readonly purpose: string;
  /** Authority level (1 = highest, 6 = lowest) */
  readonly authorityLevel: 1 | 2 | 3 | 4 | 5 | 6;
  /** Parent document type (null for LAW) */
  readonly parentType: DocumentTypeId | null;
  /** Whether document is immutable after approval */
  readonly immutableOnApproval: boolean;
  /** Role required for approval */
  readonly approvalRole: OwnerRole;
  /** Version */
  readonly version: string;
}

/**
 * DOCUMENT_TYPE - Document Classifications
 *
 * These define the governance document hierarchy.
 * LAW → PRD → SRS → ADR → TSD → SOP
 *
 * @example
 * ```typescript
 * import { DOCUMENT_TYPE } from "@aibos/kernel";
 *
 * const type = DOCUMENT_TYPE.LAW; // ✅ "DOCTYPE_LAW"
 * ```
 */
export const DOCUMENT_TYPE = {
  // ─────────────────────────────────────────────────────────────────────────
  // Constitutional Documents (Immutable)
  // ─────────────────────────────────────────────────────────────────────────
  LAW: "DOCTYPE_LAW",
  LAW_REG: "DOCTYPE_LAW_REG",

  // ─────────────────────────────────────────────────────────────────────────
  // Requirements Documents
  // ─────────────────────────────────────────────────────────────────────────
  PRD: "DOCTYPE_PRD",
  SRS: "DOCTYPE_SRS",

  // ─────────────────────────────────────────────────────────────────────────
  // Design Documents
  // ─────────────────────────────────────────────────────────────────────────
  ADR: "DOCTYPE_ADR",
  TSD: "DOCTYPE_TSD",

  // ─────────────────────────────────────────────────────────────────────────
  // Operational Documents
  // ─────────────────────────────────────────────────────────────────────────
  SOP: "DOCTYPE_SOP",
} as const;

/**
 * DocumentTypeId - Union type of all valid document type identifiers
 */
export type DocumentTypeId = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

/**
 * DOCUMENT_TYPE_REGISTRY - Full definitions for all document types
 *
 * This is the kernel-level truth. Changes require LAW amendment.
 */
export const DOCUMENT_TYPE_REGISTRY: Record<
  DocumentTypeId,
  DocumentTypeDefinition
> = {
  [DOCUMENT_TYPE.LAW]: {
    code: DOCUMENT_TYPE.LAW,
    pattern: "LAW-XXX",
    name: "Law",
    purpose: "Constitutional philosophy (immutable)",
    authorityLevel: 1,
    parentType: null,
    immutableOnApproval: true,
    approvalRole: "ROLE_KERNEL_COUNCIL",
    version: "1.0.0",
  },
  [DOCUMENT_TYPE.LAW_REG]: {
    code: DOCUMENT_TYPE.LAW_REG,
    pattern: "LAW-REG-XXX",
    name: "Registry Constitution",
    purpose: "Registry constitution (immutable, supreme)",
    authorityLevel: 1,
    parentType: DOCUMENT_TYPE.LAW,
    immutableOnApproval: true,
    approvalRole: "ROLE_KERNEL_COUNCIL",
    version: "1.0.0",
  },
  [DOCUMENT_TYPE.PRD]: {
    code: DOCUMENT_TYPE.PRD,
    pattern: "PRD-XXX",
    name: "Product Requirements Document",
    purpose: "Product intent and boundaries",
    authorityLevel: 2,
    parentType: DOCUMENT_TYPE.LAW,
    immutableOnApproval: false,
    approvalRole: "ROLE_DOMAIN_OWNER",
    version: "1.0.0",
  },
  [DOCUMENT_TYPE.SRS]: {
    code: DOCUMENT_TYPE.SRS,
    pattern: "SRS-XXX",
    name: "System Requirements Specification",
    purpose: "System obligations and invariants",
    authorityLevel: 3,
    parentType: DOCUMENT_TYPE.PRD,
    immutableOnApproval: false,
    approvalRole: "ROLE_DOMAIN_OWNER",
    version: "1.0.0",
  },
  [DOCUMENT_TYPE.ADR]: {
    code: DOCUMENT_TYPE.ADR,
    pattern: "ADR-XXX",
    name: "Architecture Decision Record",
    purpose: "Architectural choices and rationale",
    authorityLevel: 4,
    parentType: DOCUMENT_TYPE.SRS,
    immutableOnApproval: true,
    approvalRole: "ROLE_DOMAIN_OWNER",
    version: "1.0.0",
  },
  [DOCUMENT_TYPE.TSD]: {
    code: DOCUMENT_TYPE.TSD,
    pattern: "TSD-XXX",
    name: "Technical Specification Document",
    purpose: "Concrete technical design",
    authorityLevel: 5,
    parentType: DOCUMENT_TYPE.ADR,
    immutableOnApproval: false,
    approvalRole: "ROLE_DOCUMENT_AUTHOR",
    version: "1.0.0",
  },
  [DOCUMENT_TYPE.SOP]: {
    code: DOCUMENT_TYPE.SOP,
    pattern: "SOP-XXX",
    name: "Standard Operating Procedure",
    purpose: "Human execution procedures",
    authorityLevel: 6,
    parentType: DOCUMENT_TYPE.TSD,
    immutableOnApproval: false,
    approvalRole: "ROLE_DOCUMENT_AUTHOR",
    version: "1.0.0",
  },
} as const;

/**
 * Document type count for validation
 */
export const DOCUMENT_TYPE_COUNT = Object.keys(DOCUMENT_TYPE).length as 7;

/**
 * Document Status - LAW-REG-001 REGISTRY.md
 */
export type DocumentStatus =
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "IMPLEMENTED"
  | "SUPERSEDED"
  | "DEPRECATED";

/**
 * Derivation Declaration - LAW-REG-001 §18
 *
 * Every controlled document must declare its lineage.
 */
export interface DerivationDeclaration {
  /** Document IDs this document derives from (LAW parents, PRD parents, etc.) */
  readonly derivesFrom: readonly string[];
  /** Registry IDs this document governs */
  readonly governs: readonly string[];
}

/**
 * Validate that a document type exists
 */
export function isValidDocumentType(code: string): code is DocumentTypeId {
  return Object.values(DOCUMENT_TYPE).includes(code as DocumentTypeId);
}

/**
 * Get document type definition
 */
export function getDocumentType(code: DocumentTypeId): DocumentTypeDefinition {
  return DOCUMENT_TYPE_REGISTRY[code];
}

/**
 * Validate document type hierarchy - ensures child cannot override parent
 */
export function canReference(
  childType: DocumentTypeId,
  parentType: DocumentTypeId
): boolean {
  const child = DOCUMENT_TYPE_REGISTRY[childType];
  const parent = DOCUMENT_TYPE_REGISTRY[parentType];
  // Child can only reference same level or higher authority (lower number)
  return child.authorityLevel >= parent.authorityLevel;
}

/**
 * Validate derivation chain - ensures no cycles and correct authority direction
 */
export function validateDerivationChain(
  documentType: DocumentTypeId,
  derivesFrom: readonly string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const docDef = DOCUMENT_TYPE_REGISTRY[documentType];

  for (const parentId of derivesFrom) {
    // Extract document type from ID (e.g., "LAW-001" → "LAW")
    const parentTypeCode = parentId.split("-")[0];
    const fullParentType = `DOCTYPE_${parentTypeCode}` as DocumentTypeId;

    if (!isValidDocumentType(fullParentType)) {
      errors.push(`Invalid parent document type: ${parentTypeCode}`);
      continue;
    }

    const parentDef = DOCUMENT_TYPE_REGISTRY[fullParentType];
    if (parentDef.authorityLevel > docDef.authorityLevel) {
      errors.push(
        `Document ${documentType} (level ${docDef.authorityLevel}) cannot derive from ${parentId} (level ${parentDef.authorityLevel})`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
