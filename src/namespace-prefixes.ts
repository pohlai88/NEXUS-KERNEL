// @aibos/kernel - L0 Namespace Prefix Registry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHORITY: LAW-REG-001 §3.5, §3.7 — Namespace Ownership Law
// SSOT: These are the ONLY approved namespace prefixes in the AI-BOS platform.
// If a prefix is not here, it cannot be used.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { DomainCode, OwnerRole } from "./semantic-roots";

/**
 * Namespace Type - LAW-REG-001 §3.7
 */
export type NamespaceType =
  | "GLOBAL" // Kernel Council only, LAW amendment required
  | "JURISDICTION" // Compliance Lead, PRD + Compliance Review
  | "DOMAIN" // Domain Owner, PRD + Domain Review
  | "TENANT"; // Tenant Admin, aliases only

/**
 * Namespace Prefix Definition
 */
export interface NamespacePrefixDefinition {
  /** Unique prefix identifier (e.g., "PREFIX_CONCEPT") */
  readonly code: NamespacePrefixId;
  /** The actual prefix string (e.g., "CONCEPT_") */
  readonly prefix: string;
  /** Human-readable description */
  readonly description: string;
  /** Namespace type determining governance */
  readonly namespaceType: NamespaceType;
  /** Role that owns this prefix */
  readonly ownerRole: OwnerRole;
  /** Domain this prefix belongs to */
  readonly domain: DomainCode;
  /** Regex pattern for values using this prefix */
  readonly pattern: string;
  /** Change authority - what is required to modify */
  readonly changeAuthority: "LAW_AMENDMENT" | "PRD_APPROVAL" | "RUNTIME";
  /** Version */
  readonly version: string;
}

/**
 * NAMESPACE_PREFIX - Approved Prefixes
 *
 * Every value in the registry must use an approved prefix.
 * Unregistered prefixes are violations.
 *
 * @example
 * ```typescript
 * import { NAMESPACE_PREFIX } from "@aibos/kernel";
 *
 * const prefix = NAMESPACE_PREFIX.CONCEPT; // ✅ "PREFIX_CONCEPT"
 * ```
 */
export const NAMESPACE_PREFIX = {
  // ─────────────────────────────────────────────────────────────────────────
  // REGISTRY TYPE PREFIXES (LAW-REG-001 §4)
  // ─────────────────────────────────────────────────────────────────────────
  CONCEPT: "PREFIX_CONCEPT",
  VALUESET: "PREFIX_VALUESET",
  RELATION: "PREFIX_RELATION",
  EVENT: "PREFIX_EVENT",
  POLICY: "PREFIX_POLICY",
  ROOT: "PREFIX_ROOT",
  DOCTYPE: "PREFIX_DOCTYPE",

  // ─────────────────────────────────────────────────────────────────────────
  // VALUE PREFIXES (LAW-REG-001 §3.5)
  // ─────────────────────────────────────────────────────────────────────────
  STATUS: "PREFIX_STATUS",
  WF: "PREFIX_WF",
  APP: "PREFIX_APP",
  DOC: "PREFIX_DOC",
  PRI: "PREFIX_PRI",
  RISK: "PREFIX_RISK",
  COUNTRY: "PREFIX_COUNTRY",
  CURRENCY: "PREFIX_CURRENCY",
  ID: "PREFIX_ID",
  PARTY: "PREFIX_PARTY",
  REL: "PREFIX_REL",
  AUD: "PREFIX_AUD",
  OVERRIDE: "PREFIX_OVERRIDE",
  ROLE: "PREFIX_ROLE",
} as const;

/**
 * NamespacePrefixId - Union type of all valid namespace prefix identifiers
 */
export type NamespacePrefixId =
  (typeof NAMESPACE_PREFIX)[keyof typeof NAMESPACE_PREFIX];

/**
 * NAMESPACE_PREFIX_REGISTRY - Full definitions for all prefixes
 *
 * This is the kernel-level truth. Changes require LAW amendment.
 */
export const NAMESPACE_PREFIX_REGISTRY: Record<
  NamespacePrefixId,
  NamespacePrefixDefinition
> = {
  // REGISTRY TYPE PREFIXES
  [NAMESPACE_PREFIX.CONCEPT]: {
    code: NAMESPACE_PREFIX.CONCEPT,
    prefix: "CONCEPT_",
    description: "Business or system noun",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^CONCEPT_[A-Z][A-Z0-9_]{2,50}$",
    changeAuthority: "LAW_AMENDMENT",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.VALUESET]: {
    code: NAMESPACE_PREFIX.VALUESET,
    prefix: "VALUESET_",
    description: "Controlled enumeration",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^VALUESET_(GLOBAL|[A-Z]{2})_[A-Z][A-Z0-9_]{2,50}$",
    changeAuthority: "LAW_AMENDMENT",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.RELATION]: {
    code: NAMESPACE_PREFIX.RELATION,
    prefix: "RELATION_",
    description: "Relationship contract",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^RELATION_[A-Z][A-Z0-9_]{2,50}$",
    changeAuthority: "LAW_AMENDMENT",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.EVENT]: {
    code: NAMESPACE_PREFIX.EVENT,
    prefix: "EVENT_",
    description: "Domain or system event",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^EVENT_[A-Z][A-Z0-9_]{2,50}$",
    changeAuthority: "LAW_AMENDMENT",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.POLICY]: {
    code: NAMESPACE_PREFIX.POLICY,
    prefix: "POLICY_",
    description: "Governance rule",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    domain: "GOVERNANCE",
    pattern: "^POLICY_[A-Z][A-Z0-9_]{2,50}$",
    changeAuthority: "LAW_AMENDMENT",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.ROOT]: {
    code: NAMESPACE_PREFIX.ROOT,
    prefix: "ROOT_",
    description: "Approved meaning core (semantic root)",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^ROOT_[A-Z][A-Z0-9_]{2,50}$",
    changeAuthority: "LAW_AMENDMENT",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.DOCTYPE]: {
    code: NAMESPACE_PREFIX.DOCTYPE,
    prefix: "DOCTYPE_",
    description: "Document classification",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "DOCUMENT",
    pattern: "^DOCTYPE_[A-Z][A-Z0-9_]{2,20}$",
    changeAuthority: "LAW_AMENDMENT",
    version: "1.0.0",
  },

  // VALUE PREFIXES
  [NAMESPACE_PREFIX.STATUS]: {
    code: NAMESPACE_PREFIX.STATUS,
    prefix: "STATUS_",
    description: "General status values",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^STATUS_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.WF]: {
    code: NAMESPACE_PREFIX.WF,
    prefix: "WF_",
    description: "Workflow states",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "WORKFLOW",
    pattern: "^WF_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.APP]: {
    code: NAMESPACE_PREFIX.APP,
    prefix: "APP_",
    description: "Approval actions",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    domain: "GOVERNANCE",
    pattern: "^APP_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.DOC]: {
    code: NAMESPACE_PREFIX.DOC,
    prefix: "DOC_",
    description: "Document types",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "DOCUMENT",
    pattern: "^DOC_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.PRI]: {
    code: NAMESPACE_PREFIX.PRI,
    prefix: "PRI_",
    description: "Priority levels",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "WORKFLOW",
    pattern: "^PRI_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.RISK]: {
    code: NAMESPACE_PREFIX.RISK,
    prefix: "RISK_",
    description: "Risk flags",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    domain: "GOVERNANCE",
    pattern: "^RISK_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.COUNTRY]: {
    code: NAMESPACE_PREFIX.COUNTRY,
    prefix: "COUNTRY_",
    description: "Country codes",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^COUNTRY_[A-Z]{2}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.CURRENCY]: {
    code: NAMESPACE_PREFIX.CURRENCY,
    prefix: "CURRENCY_",
    description: "Currency codes",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_FINANCE_COUNCIL",
    domain: "FINANCE",
    pattern: "^CURRENCY_[A-Z]{3}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.ID]: {
    code: NAMESPACE_PREFIX.ID,
    prefix: "ID_",
    description: "Identity types",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "IDENTITY",
    pattern: "^ID_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.PARTY]: {
    code: NAMESPACE_PREFIX.PARTY,
    prefix: "PARTY_",
    description: "Party types",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^PARTY_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.REL]: {
    code: NAMESPACE_PREFIX.REL,
    prefix: "REL_",
    description: "Relationship types",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "CORE",
    pattern: "^REL_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.AUD]: {
    code: NAMESPACE_PREFIX.AUD,
    prefix: "AUD_",
    description: "Audit events",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    domain: "AUDIT",
    pattern: "^AUD_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.OVERRIDE]: {
    code: NAMESPACE_PREFIX.OVERRIDE,
    prefix: "OVERRIDE_",
    description: "Override types",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_GOVERNANCE_COMMITTEE",
    domain: "GOVERNANCE",
    pattern: "^OVERRIDE_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "PRD_APPROVAL",
    version: "1.0.0",
  },
  [NAMESPACE_PREFIX.ROLE]: {
    code: NAMESPACE_PREFIX.ROLE,
    prefix: "ROLE_",
    description: "System roles",
    namespaceType: "GLOBAL",
    ownerRole: "ROLE_KERNEL_COUNCIL",
    domain: "IDENTITY",
    pattern: "^ROLE_[A-Z][A-Z0-9_]{1,30}$",
    changeAuthority: "LAW_AMENDMENT",
    version: "1.0.0",
  },
} as const;

/**
 * Namespace prefix count for validation
 */
export const NAMESPACE_PREFIX_COUNT = Object.keys(NAMESPACE_PREFIX)
  .length as 21;

/**
 * Validate that a namespace prefix exists
 */
export function isValidNamespacePrefix(
  code: string
): code is NamespacePrefixId {
  return Object.values(NAMESPACE_PREFIX).includes(code as NamespacePrefixId);
}

/**
 * Get namespace prefix definition
 */
export function getNamespacePrefix(
  code: NamespacePrefixId
): NamespacePrefixDefinition {
  return NAMESPACE_PREFIX_REGISTRY[code];
}

/**
 * Validate a value against its prefix pattern
 */
export function validateValueAgainstPrefix(
  value: string,
  prefixCode: NamespacePrefixId
): boolean {
  const def = NAMESPACE_PREFIX_REGISTRY[prefixCode];
  const regex = new RegExp(def.pattern);
  return regex.test(value);
}
