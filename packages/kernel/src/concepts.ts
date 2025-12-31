// @aibos/kernel - L0 Concept Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SSOT: These are the ONLY valid concept identifiers in the AI-BOS platform.
// If it's not here, it doesn't exist.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Concept Categories
 * L0 taxonomy for organizing concepts.
 */
export type ConceptCategory =
  | "ENTITY"
  | "ATTRIBUTE"
  | "OPERATION"
  | "RELATIONSHIP";

/**
 * CONCEPT - The Business Ontology
 *
 * 30 canonical concepts organized by category.
 * These define WHAT EXISTS in AI-BOS.
 *
 * @example
 * ```typescript
 * import { CONCEPT } from "@aibos/kernel";
 *
 * const type = CONCEPT.INVOICE; // ✅ Type-safe: "CONCEPT_INVOICE"
 * const type = "CONCEPT_INVOICE"; // ❌ Forbidden: Raw string
 * ```
 */
export const CONCEPT = {
  // ─────────────────────────────────────────────────────────────────────────
  // ENTITY (12) - Core business objects
  // ─────────────────────────────────────────────────────────────────────────
  BANK: "CONCEPT_BANK",
  CASE: "CONCEPT_CASE",
  CLAIM: "CONCEPT_CLAIM",
  COMPANY: "CONCEPT_COMPANY",
  COUNTRY: "CONCEPT_COUNTRY",
  CURRENCY: "CONCEPT_CURRENCY",
  DOCUMENT: "CONCEPT_DOCUMENT",
  EXCEPTION: "CONCEPT_EXCEPTION",
  INVOICE: "CONCEPT_INVOICE",
  PARTY: "CONCEPT_PARTY",
  RATING: "CONCEPT_RATING",
  VENDOR: "CONCEPT_VENDOR",

  // ─────────────────────────────────────────────────────────────────────────
  // ATTRIBUTE (6) - Properties of entities
  // ─────────────────────────────────────────────────────────────────────────
  APPROVAL_LEVEL: "CONCEPT_APPROVAL_LEVEL",
  IDENTITY: "CONCEPT_IDENTITY",
  PAYMENT_METHOD: "CONCEPT_PAYMENT_METHOD",
  PRIORITY: "CONCEPT_PRIORITY",
  RISK: "CONCEPT_RISK",
  STATUS: "CONCEPT_STATUS",

  // ─────────────────────────────────────────────────────────────────────────
  // OPERATION (8) - Business actions
  // ─────────────────────────────────────────────────────────────────────────
  APPROVAL: "CONCEPT_APPROVAL",
  AUDIT: "CONCEPT_AUDIT",
  DOCUMENT_REQUEST: "CONCEPT_DOCUMENT_REQUEST",
  ESCALATION: "CONCEPT_ESCALATION",
  ONBOARDING: "CONCEPT_ONBOARDING",
  PAYMENT: "CONCEPT_PAYMENT",
  REJECTION: "CONCEPT_REJECTION",
  WORKFLOW: "CONCEPT_WORKFLOW",

  // ─────────────────────────────────────────────────────────────────────────
  // RELATIONSHIP (4) - Connections between entities
  // ─────────────────────────────────────────────────────────────────────────
  GROUP_MEMBERSHIP: "CONCEPT_GROUP_MEMBERSHIP",
  INVOICE_VENDOR_LINK: "CONCEPT_INVOICE_VENDOR_LINK",
  RELATIONSHIP: "CONCEPT_RELATIONSHIP",
  VENDOR_COMPANY_LINK: "CONCEPT_VENDOR_COMPANY_LINK",
} as const;

/**
 * ConceptId - Union type of all valid concept identifiers
 *
 * @example
 * ```typescript
 * function handleConcept(id: ConceptId) { ... }
 * handleConcept(CONCEPT.INVOICE); // ✅
 * handleConcept("CONCEPT_FAKE"); // ❌ Type error
 * ```
 */
export type ConceptId = (typeof CONCEPT)[keyof typeof CONCEPT];

/**
 * CONCEPT_CATEGORY - Mapping of concepts to their categories
 */
export const CONCEPT_CATEGORY: Record<ConceptId, ConceptCategory> = {
  // ENTITY
  [CONCEPT.BANK]: "ENTITY",
  [CONCEPT.CASE]: "ENTITY",
  [CONCEPT.CLAIM]: "ENTITY",
  [CONCEPT.COMPANY]: "ENTITY",
  [CONCEPT.COUNTRY]: "ENTITY",
  [CONCEPT.CURRENCY]: "ENTITY",
  [CONCEPT.DOCUMENT]: "ENTITY",
  [CONCEPT.EXCEPTION]: "ENTITY",
  [CONCEPT.INVOICE]: "ENTITY",
  [CONCEPT.PARTY]: "ENTITY",
  [CONCEPT.RATING]: "ENTITY",
  [CONCEPT.VENDOR]: "ENTITY",
  // ATTRIBUTE
  [CONCEPT.APPROVAL_LEVEL]: "ATTRIBUTE",
  [CONCEPT.IDENTITY]: "ATTRIBUTE",
  [CONCEPT.PAYMENT_METHOD]: "ATTRIBUTE",
  [CONCEPT.PRIORITY]: "ATTRIBUTE",
  [CONCEPT.RISK]: "ATTRIBUTE",
  [CONCEPT.STATUS]: "ATTRIBUTE",
  // OPERATION
  [CONCEPT.APPROVAL]: "OPERATION",
  [CONCEPT.AUDIT]: "OPERATION",
  [CONCEPT.DOCUMENT_REQUEST]: "OPERATION",
  [CONCEPT.ESCALATION]: "OPERATION",
  [CONCEPT.ONBOARDING]: "OPERATION",
  [CONCEPT.PAYMENT]: "OPERATION",
  [CONCEPT.REJECTION]: "OPERATION",
  [CONCEPT.WORKFLOW]: "OPERATION",
  // RELATIONSHIP
  [CONCEPT.GROUP_MEMBERSHIP]: "RELATIONSHIP",
  [CONCEPT.INVOICE_VENDOR_LINK]: "RELATIONSHIP",
  [CONCEPT.RELATIONSHIP]: "RELATIONSHIP",
  [CONCEPT.VENDOR_COMPANY_LINK]: "RELATIONSHIP",
} as const;

/**
 * Concept count for validation
 */
export const CONCEPT_COUNT = 30 as const;
