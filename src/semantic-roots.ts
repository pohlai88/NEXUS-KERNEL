// @aibos/kernel - L0 Semantic Root Registry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHORITY: LAW-REG-001 §3.8 — Semantic Root Registry
// SSOT: These are the ONLY approved semantic roots in the AI-BOS platform.
// If a CONCEPT_* does not derive from a registered root, it is a violation.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Semantic Root Definition
 *
 * A semantic root is the approved meaning core from which concepts derive.
 * Roots prevent synonyms, abbreviation drift, and duplicate meanings.
 *
 * @example
 * ```typescript
 * // ROOT_BIOLOGICAL_ASSET is the root
 * // CONCEPT_BIOLOGICAL_ASSET derives from it
 * ```
 */
export interface SemanticRootDefinition {
  /** Unique root identifier (e.g., "ROOT_BIOLOGICAL_ASSET") */
  readonly code: SemanticRootId;
  /** Canonical definition — immutable meaning */
  readonly canonicalDefinition: string;
  /** External standard reference (e.g., "IFRS:IAS41") */
  readonly standardRef: string;
  /** Role that owns this root */
  readonly ownerRole: OwnerRole;
  /** Lifecycle stage */
  readonly lifecycleStage: "ACTIVE" | "DEPRECATED";
  /** Version (semantic versioning) */
  readonly version: string;
  /** Domain this root belongs to */
  readonly domain: DomainCode;
}

/**
 * Owner Roles - LAW-REG-001 §20
 * Personal ownership is prohibited.
 */
export type OwnerRole =
  | "ROLE_KERNEL_COUNCIL"
  | "ROLE_COMPLIANCE_AUTHORITY"
  | "ROLE_DOMAIN_OWNER"
  | "ROLE_GOVERNANCE_COMMITTEE"
  | "ROLE_FINANCE_COUNCIL"
  | "ROLE_OPS_COUNCIL"
  | "ROLE_DOCUMENT_AUTHOR";

/**
 * Domain Codes - LAW-REG-001 §6
 */
export type DomainCode =
  | "CORE"
  | "FINANCE"
  | "GOVERNANCE"
  | "WORKFLOW"
  | "IDENTITY"
  | "AUDIT"
  | "INTEGRATION"
  | "DOCUMENT"
  | "OPERATIONS";

/**
 * SEMANTIC_ROOT - Approved Meaning Cores
 *
 * Every CONCEPT_* must derive from exactly one root.
 * No root = no concept.
 *
 * @example
 * ```typescript
 * import { SEMANTIC_ROOT } from "@aibos/kernel";
 *
 * const root = SEMANTIC_ROOT.BIOLOGICAL_ASSET; // ✅ "ROOT_BIOLOGICAL_ASSET"
 * ```
 */
export const SEMANTIC_ROOT = {
  // ─────────────────────────────────────────────────────────────────────────
  // ENTITY ROOTS (Core Business Objects)
  // ─────────────────────────────────────────────────────────────────────────
  BANK: "ROOT_BANK",
  CASE: "ROOT_CASE",
  CLAIM: "ROOT_CLAIM",
  COMPANY: "ROOT_COMPANY",
  COUNTRY: "ROOT_COUNTRY",
  CURRENCY: "ROOT_CURRENCY",
  DOCUMENT: "ROOT_DOCUMENT",
  EXCEPTION: "ROOT_EXCEPTION",
  INVOICE: "ROOT_INVOICE",
  PARTY: "ROOT_PARTY",
  RATING: "ROOT_RATING",
  TENANT: "ROOT_TENANT",
  VENDOR: "ROOT_VENDOR",
  BIOLOGICAL_ASSET: "ROOT_BIOLOGICAL_ASSET",
  MANUFACTURING_FACILITY: "ROOT_MANUFACTURING_FACILITY",

  // ─────────────────────────────────────────────────────────────────────────
  // ATTRIBUTE ROOTS (Properties)
  // ─────────────────────────────────────────────────────────────────────────
  APPROVAL_LEVEL: "ROOT_APPROVAL_LEVEL",
  IDENTITY: "ROOT_IDENTITY",
  PAYMENT_METHOD: "ROOT_PAYMENT_METHOD",
  PRIORITY: "ROOT_PRIORITY",
  RISK: "ROOT_RISK",
  STATUS: "ROOT_STATUS",

  // ─────────────────────────────────────────────────────────────────────────
  // OPERATION ROOTS (Business Actions)
  // ─────────────────────────────────────────────────────────────────────────
  APPROVAL: "ROOT_APPROVAL",
  AUDIT: "ROOT_AUDIT",
  DOCUMENT_REQUEST: "ROOT_DOCUMENT_REQUEST",
  ESCALATION: "ROOT_ESCALATION",
  ONBOARDING: "ROOT_ONBOARDING",
  PAYMENT: "ROOT_PAYMENT",
  REJECTION: "ROOT_REJECTION",
  WORKFLOW: "ROOT_WORKFLOW",

  // ─────────────────────────────────────────────────────────────────────────
  // RELATIONSHIP ROOTS (Connections)
  // ─────────────────────────────────────────────────────────────────────────
  GROUP_MEMBERSHIP: "ROOT_GROUP_MEMBERSHIP",
  INVOICE_VENDOR_LINK: "ROOT_INVOICE_VENDOR_LINK",
  RELATIONSHIP: "ROOT_RELATIONSHIP",
  VENDOR_COMPANY_LINK: "ROOT_VENDOR_COMPANY_LINK",
} as const;

/**
 * SemanticRootId - Union type of all valid semantic root identifiers
 */
export type SemanticRootId = (typeof SEMANTIC_ROOT)[keyof typeof SEMANTIC_ROOT];

/**
 * SEMANTIC_ROOT_REGISTRY - Full definitions for all semantic roots
 *
 * This is the kernel-level truth. Changes require LAW amendment.
 */
export const SEMANTIC_ROOT_REGISTRY: Record<
  SemanticRootId,
  SemanticRootDefinition
> = {
  // ENTITY ROOTS
  [SEMANTIC_ROOT.BANK]: {
    code: SEMANTIC_ROOT.BANK,
    canonicalDefinition: "Financial institution that provides banking services",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.CASE]: {
    code: SEMANTIC_ROOT.CASE,
    canonicalDefinition:
      "Container for related business transactions requiring resolution",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "CORE",
  },
  [SEMANTIC_ROOT.CLAIM]: {
    code: SEMANTIC_ROOT.CLAIM,
    canonicalDefinition: "Formal request for payment or reimbursement",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.COMPANY]: {
    code: SEMANTIC_ROOT.COMPANY,
    canonicalDefinition: "Legal entity within a tenant",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "CORE",
  },
  [SEMANTIC_ROOT.COUNTRY]: {
    code: SEMANTIC_ROOT.COUNTRY,
    canonicalDefinition: "Sovereign nation per ISO 3166-1",
    standardRef: "ISO:3166-1",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "CORE",
  },
  [SEMANTIC_ROOT.CURRENCY]: {
    code: SEMANTIC_ROOT.CURRENCY,
    canonicalDefinition: "Medium of exchange per ISO 4217",
    standardRef: "ISO:4217",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.DOCUMENT]: {
    code: SEMANTIC_ROOT.DOCUMENT,
    canonicalDefinition: "Stored file or record with business significance",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "DOCUMENT",
  },
  [SEMANTIC_ROOT.EXCEPTION]: {
    code: SEMANTIC_ROOT.EXCEPTION,
    canonicalDefinition: "Deviation from standard process requiring attention",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "GOVERNANCE",
  },
  [SEMANTIC_ROOT.INVOICE]: {
    code: SEMANTIC_ROOT.INVOICE,
    canonicalDefinition: "Commercial demand for payment for goods or services",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.PARTY]: {
    code: SEMANTIC_ROOT.PARTY,
    canonicalDefinition: "Legal or natural person participating in business",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "CORE",
  },
  [SEMANTIC_ROOT.RATING]: {
    code: SEMANTIC_ROOT.RATING,
    canonicalDefinition: "Qualitative or quantitative assessment score",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "GOVERNANCE",
  },
  [SEMANTIC_ROOT.TENANT]: {
    code: SEMANTIC_ROOT.TENANT,
    canonicalDefinition:
      "Top-level organizational isolation unit in multi-tenant SaaS",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "CORE",
  },
  [SEMANTIC_ROOT.VENDOR]: {
    code: SEMANTIC_ROOT.VENDOR,
    canonicalDefinition: "External supplier of goods or services",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.BIOLOGICAL_ASSET]: {
    code: SEMANTIC_ROOT.BIOLOGICAL_ASSET,
    canonicalDefinition: "Living plants or animals governed by IAS 41",
    standardRef: "IFRS:IAS41",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.MANUFACTURING_FACILITY]: {
    code: SEMANTIC_ROOT.MANUFACTURING_FACILITY,
    canonicalDefinition: "Physical production site for manufacturing",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_OPS_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "OPERATIONS",
  },

  // ATTRIBUTE ROOTS
  [SEMANTIC_ROOT.APPROVAL_LEVEL]: {
    code: SEMANTIC_ROOT.APPROVAL_LEVEL,
    canonicalDefinition: "Hierarchical approval authority level",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "GOVERNANCE",
  },
  [SEMANTIC_ROOT.IDENTITY]: {
    code: SEMANTIC_ROOT.IDENTITY,
    canonicalDefinition:
      "Unique identifier for authentication and authorization",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "IDENTITY",
  },
  [SEMANTIC_ROOT.PAYMENT_METHOD]: {
    code: SEMANTIC_ROOT.PAYMENT_METHOD,
    canonicalDefinition: "Mechanism for transferring monetary value",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.PRIORITY]: {
    code: SEMANTIC_ROOT.PRIORITY,
    canonicalDefinition: "Relative importance or urgency ranking",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "WORKFLOW",
  },
  [SEMANTIC_ROOT.RISK]: {
    code: SEMANTIC_ROOT.RISK,
    canonicalDefinition: "Potential for adverse outcome or loss",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "GOVERNANCE",
  },
  [SEMANTIC_ROOT.STATUS]: {
    code: SEMANTIC_ROOT.STATUS,
    canonicalDefinition: "Lifecycle state of an entity",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "CORE",
  },

  // OPERATION ROOTS
  [SEMANTIC_ROOT.APPROVAL]: {
    code: SEMANTIC_ROOT.APPROVAL,
    canonicalDefinition: "Authorization action by competent authority",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "GOVERNANCE",
  },
  [SEMANTIC_ROOT.AUDIT]: {
    code: SEMANTIC_ROOT.AUDIT,
    canonicalDefinition: "Systematic examination of records or processes",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "AUDIT",
  },
  [SEMANTIC_ROOT.DOCUMENT_REQUEST]: {
    code: SEMANTIC_ROOT.DOCUMENT_REQUEST,
    canonicalDefinition: "Formal request for documentation from party",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "DOCUMENT",
  },
  [SEMANTIC_ROOT.ESCALATION]: {
    code: SEMANTIC_ROOT.ESCALATION,
    canonicalDefinition: "Elevation of issue to higher authority",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "WORKFLOW",
  },
  [SEMANTIC_ROOT.ONBOARDING]: {
    code: SEMANTIC_ROOT.ONBOARDING,
    canonicalDefinition: "Process of adding new entity to system",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "WORKFLOW",
  },
  [SEMANTIC_ROOT.PAYMENT]: {
    code: SEMANTIC_ROOT.PAYMENT,
    canonicalDefinition: "Transfer of monetary value",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.REJECTION]: {
    code: SEMANTIC_ROOT.REJECTION,
    canonicalDefinition: "Denial of request or submission",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "GOVERNANCE",
  },
  [SEMANTIC_ROOT.WORKFLOW]: {
    code: SEMANTIC_ROOT.WORKFLOW,
    canonicalDefinition: "Defined sequence of business process steps",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "WORKFLOW",
  },

  // RELATIONSHIP ROOTS
  [SEMANTIC_ROOT.GROUP_MEMBERSHIP]: {
    code: SEMANTIC_ROOT.GROUP_MEMBERSHIP,
    canonicalDefinition: "Membership in organizational group",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "IDENTITY",
  },
  [SEMANTIC_ROOT.INVOICE_VENDOR_LINK]: {
    code: SEMANTIC_ROOT.INVOICE_VENDOR_LINK,
    canonicalDefinition: "Relationship between invoice and vendor",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
  [SEMANTIC_ROOT.RELATIONSHIP]: {
    code: SEMANTIC_ROOT.RELATIONSHIP,
    canonicalDefinition: "Abstract connection between entities",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "CORE",
  },
  [SEMANTIC_ROOT.VENDOR_COMPANY_LINK]: {
    code: SEMANTIC_ROOT.VENDOR_COMPANY_LINK,
    canonicalDefinition: "Relationship between vendor and company",
    standardRef: "INTERNAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    lifecycleStage: "ACTIVE",
    version: "1.0.0",
    domain: "FINANCE",
  },
} as const;

/**
 * Semantic root count for validation
 */
export const SEMANTIC_ROOT_COUNT = Object.keys(SEMANTIC_ROOT).length as 33;

/**
 * Validate that a semantic root exists
 */
export function isValidSemanticRoot(code: string): code is SemanticRootId {
  return Object.values(SEMANTIC_ROOT).includes(code as SemanticRootId);
}

/**
 * Get semantic root definition
 */
export function getSemanticRoot(code: SemanticRootId): SemanticRootDefinition {
  return SEMANTIC_ROOT_REGISTRY[code];
}
