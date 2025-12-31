// @aibos/kernel - L0 Value Set Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SSOT: These are the ONLY valid value identifiers in the AI-BOS platform.
// If it's not here, it doesn't exist.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * VALUESET - The Value Set Registry
 *
 * 12 canonical value sets.
 * These define ALLOWED VALUES for concepts.
 *
 * @example
 * ```typescript
 * import { VALUESET, VALUE } from "@aibos/kernel";
 *
 * const setId = VALUESET.APPROVAL_ACTION; // ✅ Type-safe
 * const value = VALUE.APPROVAL_ACTION.APPROVED; // ✅ Type-safe
 * ```
 */
export const VALUESET = {
  APPROVAL_ACTION: "VALUESET_GLOBAL_APPROVAL_ACTION",
  AUDIT_EVENT_TYPE: "VALUESET_GLOBAL_AUDIT_EVENT_TYPE",
  COUNTRIES: "VALUESET_GLOBAL_COUNTRIES",
  CURRENCIES: "VALUESET_GLOBAL_CURRENCIES",
  DOCUMENT_TYPE: "VALUESET_GLOBAL_DOCUMENT_TYPE",
  IDENTITY_TYPE: "VALUESET_GLOBAL_IDENTITY_TYPE",
  PARTY_TYPE: "VALUESET_GLOBAL_PARTY_TYPE",
  PRIORITY_LEVEL: "VALUESET_GLOBAL_PRIORITY_LEVEL",
  RELATIONSHIP_TYPE: "VALUESET_GLOBAL_RELATIONSHIP_TYPE",
  RISK_FLAG: "VALUESET_GLOBAL_RISK_FLAG",
  STATUS_GENERAL: "VALUESET_GLOBAL_STATUS_GENERAL",
  WORKFLOW_STATE: "VALUESET_GLOBAL_WORKFLOW_STATE",
} as const;

/**
 * ValueSetId - Union type of all valid value set identifiers
 */
export type ValueSetId = (typeof VALUESET)[keyof typeof VALUESET];

/**
 * VALUE - The Value Registry
 *
 * 62 canonical values organized by value set.
 * Nested structure: VALUE.<ValueSet>.<Value>
 *
 * @example
 * ```typescript
 * import { VALUE } from "@aibos/kernel";
 *
 * const status = VALUE.APPROVAL_ACTION.APPROVED; // "APP_APPROVED"
 * const country = VALUE.COUNTRIES.MALAYSIA; // "COUNTRY_MY"
 * ```
 */
export const VALUE = {
  // ─────────────────────────────────────────────────────────────────────────
  // APPROVAL_ACTION (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  APPROVAL_ACTION: {
    SUBMITTED: "APP_SUBMITTED",
    APPROVED: "APP_APPROVED",
    REJECTED: "APP_REJECTED",
    RETURNED: "APP_RETURNED",
    CANCELLED: "APP_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT_EVENT_TYPE (7 values)
  // ─────────────────────────────────────────────────────────────────────────
  AUDIT_EVENT_TYPE: {
    CREATE: "AUD_CREATE",
    UPDATE: "AUD_UPDATE",
    DELETE: "AUD_DELETE",
    RESTORE: "AUD_RESTORE",
    APPROVE: "AUD_APPROVE",
    REJECT: "AUD_REJECT",
    LOGIN: "AUD_LOGIN",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COUNTRIES (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  COUNTRIES: {
    MALAYSIA: "COUNTRY_MY",
    SINGAPORE: "COUNTRY_SG",
    UNITED_STATES: "COUNTRY_US",
    UNITED_KINGDOM: "COUNTRY_GB",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CURRENCIES (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  CURRENCIES: {
    USD: "CURRENCY_USD",
    EUR: "CURRENCY_EUR",
    MYR: "CURRENCY_MYR",
    SGD: "CURRENCY_SGD",
    GBP: "CURRENCY_GBP",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOCUMENT_TYPE (9 values)
  // ─────────────────────────────────────────────────────────────────────────
  DOCUMENT_TYPE: {
    INVOICE: "DOC_INVOICE",
    PURCHASE_ORDER: "DOC_PO",
    GRN: "DOC_GRN",
    DELIVERY_NOTE: "DOC_DN",
    CREDIT_NOTE: "DOC_CN",
    CONTRACT: "DOC_CONTRACT",
    PROOF_OF_DELIVERY: "DOC_POD",
    STATEMENT_OF_ACCOUNT: "DOC_SOA",
    OTHER: "DOC_OTHER",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // IDENTITY_TYPE (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  IDENTITY_TYPE: {
    EMAIL: "ID_EMAIL",
    PHONE: "ID_PHONE",
    REGISTRATION_NO: "ID_REG_NO",
    TAX_ID: "ID_TAX_ID",
    UUID: "ID_UUID",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PARTY_TYPE (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  PARTY_TYPE: {
    TENANT: "PARTY_TENANT",
    CLIENT: "PARTY_CLIENT",
    VENDOR: "PARTY_VENDOR",
    USER: "PARTY_USER",
    AGENT: "PARTY_AGENT",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITY_LEVEL (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  PRIORITY_LEVEL: {
    LOW: "PRI_LOW",
    MEDIUM: "PRI_MEDIUM",
    HIGH: "PRI_HIGH",
    URGENT: "PRI_URGENT",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RELATIONSHIP_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  RELATIONSHIP_TYPE: {
    CLIENT_OF: "REL_CLIENT_OF",
    VENDOR_OF: "REL_VENDOR_OF",
    BELONGS_TO: "REL_BELONGS_TO",
    MANAGED_BY: "REL_MANAGED_BY",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RISK_FLAG (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  RISK_FLAG: {
    NONE: "RISK_NONE",
    LOW: "RISK_LOW",
    MEDIUM: "RISK_MEDIUM",
    HIGH: "RISK_HIGH",
    CRITICAL: "RISK_CRITICAL",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STATUS_GENERAL (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  STATUS_GENERAL: {
    ACTIVE: "STATUS_ACTIVE",
    INACTIVE: "STATUS_INACTIVE",
    SUSPENDED: "STATUS_SUSPENDED",
    ARCHIVED: "STATUS_ARCHIVED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WORKFLOW_STATE (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  WORKFLOW_STATE: {
    DRAFT: "WF_DRAFT",
    PENDING: "WF_PENDING",
    IN_REVIEW: "WF_IN_REVIEW",
    COMPLETED: "WF_COMPLETED",
    FAILED: "WF_FAILED",
  },
} as const;

/**
 * Value type extractors for type-safe usage
 */
export type ApprovalActionValue =
  (typeof VALUE.APPROVAL_ACTION)[keyof typeof VALUE.APPROVAL_ACTION];
export type AuditEventTypeValue =
  (typeof VALUE.AUDIT_EVENT_TYPE)[keyof typeof VALUE.AUDIT_EVENT_TYPE];
export type CountryValue =
  (typeof VALUE.COUNTRIES)[keyof typeof VALUE.COUNTRIES];
export type CurrencyValue =
  (typeof VALUE.CURRENCIES)[keyof typeof VALUE.CURRENCIES];
export type DocumentTypeValue =
  (typeof VALUE.DOCUMENT_TYPE)[keyof typeof VALUE.DOCUMENT_TYPE];
export type IdentityTypeValue =
  (typeof VALUE.IDENTITY_TYPE)[keyof typeof VALUE.IDENTITY_TYPE];
export type PartyTypeValue =
  (typeof VALUE.PARTY_TYPE)[keyof typeof VALUE.PARTY_TYPE];
export type PriorityLevelValue =
  (typeof VALUE.PRIORITY_LEVEL)[keyof typeof VALUE.PRIORITY_LEVEL];
export type RelationshipTypeValue =
  (typeof VALUE.RELATIONSHIP_TYPE)[keyof typeof VALUE.RELATIONSHIP_TYPE];
export type RiskFlagValue =
  (typeof VALUE.RISK_FLAG)[keyof typeof VALUE.RISK_FLAG];
export type StatusGeneralValue =
  (typeof VALUE.STATUS_GENERAL)[keyof typeof VALUE.STATUS_GENERAL];
export type WorkflowStateValue =
  (typeof VALUE.WORKFLOW_STATE)[keyof typeof VALUE.WORKFLOW_STATE];

/**
 * Counts for validation
 */
export const VALUESET_COUNT = 12 as const;
export const VALUE_COUNT = 62 as const;
