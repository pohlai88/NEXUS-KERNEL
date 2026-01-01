// @aibos/kernel - L0 Value Set Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ AUTO-GENERATED: Do not edit manually. Edit data sources instead.
// Generated: 2026-01-01T19:18:56.933Z
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * VALUESET - The Value Set Registry
 *
 * 68 canonical value sets.
 * These define ALLOWED VALUES for concepts.
 *
 * @example
 * ```typescript
 * import { VALUESET, VALUE } from "@aibos/kernel";
 *
 * const setId = VALUESET.ACCOUNT_TYPE; // ✅ Type-safe
 * const value = VALUE.ACCOUNT_TYPE.ASSET; // ✅ Type-safe
 * ```
 */
export const VALUESET = {
  ACCOUNT_TYPE: "VALUESET_GLOBAL_ACCOUNT_TYPE",
  ADDRESS_TYPE: "VALUESET_GLOBAL_ADDRESS_TYPE",
  API_KEY_STATUS: "VALUESET_GLOBAL_API_KEY_STATUS",
  APPROVAL_STATUS: "VALUESET_GLOBAL_APPROVAL_STATUS",
  ASSET_EVENT_TYPE: "VALUESET_GLOBAL_ASSET_EVENT_TYPE",
  ASSET_STATUS: "VALUESET_GLOBAL_ASSET_STATUS",
  ASSET_TYPE: "VALUESET_GLOBAL_ASSET_TYPE",
  ATTENDANCE_STATUS: "VALUESET_GLOBAL_ATTENDANCE_STATUS",
  BANK_STATEMENT_STATUS: "VALUESET_GLOBAL_BANK_STATEMENT_STATUS",
  BOM_TYPE: "VALUESET_GLOBAL_BOM_TYPE",
  CONTACT_TYPE: "VALUESET_GLOBAL_CONTACT_TYPE",
  CONTROL_TYPE: "VALUESET_GLOBAL_CONTROL_TYPE",
  CUSTOMER_TYPE: "VALUESET_GLOBAL_CUSTOMER_TYPE",
  DELIVERY_NOTE_STATUS: "VALUESET_GLOBAL_DELIVERY_NOTE_STATUS",
  DELIVERY_STATUS: "VALUESET_GLOBAL_DELIVERY_STATUS",
  DEPRECIATION_METHOD: "VALUESET_GLOBAL_DEPRECIATION_METHOD",
  EMPLOYEE_TYPE: "VALUESET_GLOBAL_EMPLOYEE_TYPE",
  FEATURE_FLAG_STATUS: "VALUESET_GLOBAL_FEATURE_FLAG_STATUS",
  FISCAL_PERIOD: "VALUESET_GLOBAL_FISCAL_PERIOD",
  GOODS_RECEIPT_STATUS: "VALUESET_GLOBAL_GOODS_RECEIPT_STATUS",
  INCIDENT_STATUS: "VALUESET_GLOBAL_INCIDENT_STATUS",
  INVOICE_STATUS: "VALUESET_GLOBAL_INVOICE_STATUS",
  ITEM_TYPE: "VALUESET_GLOBAL_ITEM_TYPE",
  JOURNAL_TYPE: "VALUESET_GLOBAL_JOURNAL_TYPE",
  LEAVE_STATUS: "VALUESET_GLOBAL_LEAVE_STATUS",
  MAINTENANCE_STATUS: "VALUESET_GLOBAL_MAINTENANCE_STATUS",
  MATCHING_METHOD: "VALUESET_GLOBAL_MATCHING_METHOD",
  MILESTONE_STATUS: "VALUESET_GLOBAL_MILESTONE_STATUS",
  NOTIFICATION_CHANNEL: "VALUESET_GLOBAL_NOTIFICATION_CHANNEL",
  NOTIFICATION_STATUS: "VALUESET_GLOBAL_NOTIFICATION_STATUS",
  OPERATION_TYPE: "VALUESET_GLOBAL_OPERATION_TYPE",
  PARTY_TYPE: "VALUESET_GLOBAL_PARTY_TYPE",
  PAYMENT_BATCH_STATUS: "VALUESET_GLOBAL_PAYMENT_BATCH_STATUS",
  PAYMENT_METHOD: "VALUESET_GLOBAL_PAYMENT_METHOD",
  PAYMENT_STATUS: "VALUESET_GLOBAL_PAYMENT_STATUS",
  PAYROLL_STATUS: "VALUESET_GLOBAL_PAYROLL_STATUS",
  PERFORMANCE_RATING: "VALUESET_GLOBAL_PERFORMANCE_RATING",
  PICK_STATUS: "VALUESET_GLOBAL_PICK_STATUS",
  POLICY_STATUS: "VALUESET_GLOBAL_POLICY_STATUS",
  PRICE_LIST_TYPE: "VALUESET_GLOBAL_PRICE_LIST_TYPE",
  PRIORITY_LEVEL: "VALUESET_GLOBAL_PRIORITY_LEVEL",
  PRODUCTION_STATUS: "VALUESET_GLOBAL_PRODUCTION_STATUS",
  PROJECT_STATUS: "VALUESET_GLOBAL_PROJECT_STATUS",
  PROJECT_TYPE: "VALUESET_GLOBAL_PROJECT_TYPE",
  PURCHASE_INVOICE_STATUS: "VALUESET_GLOBAL_PURCHASE_INVOICE_STATUS",
  PURCHASE_ORDER_STATUS: "VALUESET_GLOBAL_PURCHASE_ORDER_STATUS",
  QUOTATION_STATUS: "VALUESET_GLOBAL_QUOTATION_STATUS",
  RECEIPT_STATUS: "VALUESET_GLOBAL_RECEIPT_STATUS",
  RECONCILIATION_STATUS: "VALUESET_GLOBAL_RECONCILIATION_STATUS",
  RESOURCE_TYPE: "VALUESET_GLOBAL_RESOURCE_TYPE",
  RFQ_STATUS: "VALUESET_GLOBAL_RFQ_STATUS",
  RISK_SEVERITY: "VALUESET_GLOBAL_RISK_SEVERITY",
  ROUNDING_METHOD: "VALUESET_GLOBAL_ROUNDING_METHOD",
  SALARY_COMPONENT_TYPE: "VALUESET_GLOBAL_SALARY_COMPONENT_TYPE",
  SALES_ORDER_STATUS: "VALUESET_GLOBAL_SALES_ORDER_STATUS",
  SETTING_SCOPE: "VALUESET_GLOBAL_SETTING_SCOPE",
  SHIPMENT_STATUS: "VALUESET_GLOBAL_SHIPMENT_STATUS",
  STOCK_ENTRY_TYPE: "VALUESET_GLOBAL_STOCK_ENTRY_TYPE",
  SUPPLIER_TYPE: "VALUESET_GLOBAL_SUPPLIER_TYPE",
  TASK_STATUS: "VALUESET_GLOBAL_TASK_STATUS",
  TAX_REPORTING_CATEGORY: "VALUESET_GLOBAL_TAX_REPORTING_CATEGORY",
  TAX_TREATMENT: "VALUESET_GLOBAL_TAX_TREATMENT",
  TAX_TYPE: "VALUESET_GLOBAL_TAX_TYPE",
  TRANSACTION_STATUS: "VALUESET_GLOBAL_TRANSACTION_STATUS",
  TRANSFER_TYPE: "VALUESET_GLOBAL_TRANSFER_TYPE",
  UOM_CATEGORY: "VALUESET_GLOBAL_UOM_CATEGORY",
  WORK_ORDER_STATUS: "VALUESET_GLOBAL_WORK_ORDER_STATUS",
  WORKFLOW_STATUS: "VALUESET_GLOBAL_WORKFLOW_STATUS",
} as const;

/**
 * ValueSetId - Union type of all valid value set identifiers
 */
export type ValueSetId = (typeof VALUESET)[keyof typeof VALUESET];

/**
 * VALUE - The Value Registry
 *
 * 307 canonical values organized by value set.
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
  // ACCOUNT_TYPE (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  ACCOUNT_TYPE: {
    ASSET: "ACC_ASSET",
    LIABILITY: "ACC_LIABILITY",
    EQUITY: "ACC_EQUITY",
    INCOME: "ACC_INCOME",
    EXPENSE: "ACC_EXPENSE",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ADDRESS_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  ADDRESS_TYPE: {
    BILLING: "ADR_BILLING",
    SHIPPING: "ADR_SHIPPING",
    REGISTERED: "ADR_REGISTERED",
    OPERATIONAL: "ADR_OPERATIONAL",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // API_KEY_STATUS (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  API_KEY_STATUS: {
    ACTIVE: "AKS_ACTIVE",
    REVOKED: "AKS_REVOKED",
    EXPIRED: "AKS_EXPIRED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // APPROVAL_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  APPROVAL_STATUS: {
    PENDING: "APR_PENDING",
    APPROVED: "APR_APPROVED",
    REJECTED: "APR_REJECTED",
    WITHDRAWN: "APR_WITHDRAWN",
    CANCELLED: "APR_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ASSET_EVENT_TYPE (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  ASSET_EVENT_TYPE: {
    ACQUISITION: "AET_ACQUISITION",
    DISPOSAL: "AET_DISPOSAL",
    TRANSFER: "AET_TRANSFER",
    REVALUATION: "AET_REVALUATION",
    IMPAIRMENT: "AET_IMPAIRMENT",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ASSET_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  ASSET_STATUS: {
    DRAFT: "ASS_DRAFT",
    ACTIVE: "ASS_ACTIVE",
    SUSPENDED: "ASS_SUSPENDED",
    DISPOSED: "ASS_DISPOSED",
    CLOSED: "ASS_CLOSED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ASSET_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  ASSET_TYPE: {
    TANGIBLE: "AST_TANGIBLE",
    INTANGIBLE: "AST_INTANGIBLE",
    RIGHT_OF_USE: "AST_RIGHT_OF_USE",
    INVESTMENT_PROPERTY: "AST_INVESTMENT_PROPERTY",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ATTENDANCE_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  ATTENDANCE_STATUS: {
    PRESENT: "ATS_PRESENT",
    ABSENT: "ATS_ABSENT",
    LATE: "ATS_LATE",
    HALF_DAY: "ATS_HALF_DAY",
    COMPLETED: "ATS_COMPLETED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BANK_STATEMENT_STATUS (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  BANK_STATEMENT_STATUS: {
    IMPORTED: "BSS_IMPORTED",
    VALIDATED: "BSS_VALIDATED",
    POSTED: "BSS_POSTED",
    CLOSED: "BSS_CLOSED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BOM_TYPE (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  BOM_TYPE: {
    STANDARD: "BOM_STANDARD",
    VARIANT: "BOM_VARIANT",
    PHANTOM: "BOM_PHANTOM",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONTACT_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  CONTACT_TYPE: {
    PRIMARY: "CON_PRIMARY",
    BILLING: "CON_BILLING",
    SHIPPING: "CON_SHIPPING",
    TECHNICAL: "CON_TECHNICAL",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONTROL_TYPE (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  CONTROL_TYPE: {
    PREVENTIVE: "CTL_PREVENTIVE",
    DETECTIVE: "CTL_DETECTIVE",
    CORRECTIVE: "CTL_CORRECTIVE",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMER_TYPE (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  CUSTOMER_TYPE: {
    INDIVIDUAL: "CUS_INDIVIDUAL",
    COMPANY: "CUS_COMPANY",
    GOVERNMENT: "CUS_GOVERNMENT",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DELIVERY_NOTE_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  DELIVERY_NOTE_STATUS: {
    PENDING: "DNS_PENDING",
    PICKED: "DNS_PICKED",
    SHIPPED: "DNS_SHIPPED",
    DELIVERED: "DNS_DELIVERED",
    RETURNED: "DNS_RETURNED",
    CANCELLED: "DNS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DELIVERY_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  DELIVERY_STATUS: {
    PLANNED: "DLS_PLANNED",
    OUT_FOR_DELIVERY: "DLS_OUT_FOR_DELIVERY",
    DELIVERED: "DLS_DELIVERED",
    FAILED: "DLS_FAILED",
    CANCELLED: "DLS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DEPRECIATION_METHOD (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  DEPRECIATION_METHOD: {
    STRAIGHT_LINE: "DPM_STRAIGHT_LINE",
    DECLINING_BALANCE: "DPM_DECLINING_BALANCE",
    UNITS_OF_PRODUCTION: "DPM_UNITS_OF_PRODUCTION",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EMPLOYEE_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  EMPLOYEE_TYPE: {
    FULL_TIME: "EMP_FULL_TIME",
    PART_TIME: "EMP_PART_TIME",
    CONTRACTOR: "EMP_CONTRACTOR",
    INTERN: "EMP_INTERN",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FEATURE_FLAG_STATUS (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  FEATURE_FLAG_STATUS: {
    ENABLED: "FFS_ENABLED",
    DISABLED: "FFS_DISABLED",
    RETIRED: "FFS_RETIRED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FISCAL_PERIOD (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  FISCAL_PERIOD: {
    MONTH: "PER_MONTH",
    QUARTER: "PER_QUARTER",
    YEAR: "PER_YEAR",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GOODS_RECEIPT_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  GOODS_RECEIPT_STATUS: {
    PENDING: "GRS_PENDING",
    PARTIAL: "GRS_PARTIAL",
    RECEIVED: "GRS_RECEIVED",
    REJECTED: "GRS_REJECTED",
    CANCELLED: "GRS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INCIDENT_STATUS (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  INCIDENT_STATUS: {
    OPEN: "INS_OPEN",
    INVESTIGATING: "INS_INVESTIGATING",
    RESOLVED: "INS_RESOLVED",
    CLOSED: "INS_CLOSED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INVOICE_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  INVOICE_STATUS: {
    DRAFT: "INV_DRAFT",
    ISSUED: "INV_ISSUED",
    PARTIALLY_PAID: "INV_PARTIALLY_PAID",
    PAID: "INV_PAID",
    VOIDED: "INV_VOIDED",
    OVERDUE: "INV_OVERDUE",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ITEM_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  ITEM_TYPE: {
    STOCK: "ITM_STOCK",
    SERVICE: "ITM_SERVICE",
    BUNDLE: "ITM_BUNDLE",
    ASSEMBLY: "ITM_ASSEMBLY",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // JOURNAL_TYPE (10 values)
  // ─────────────────────────────────────────────────────────────────────────
  JOURNAL_TYPE: {
    SALES: "JRN_SALES",
    PURCHASE: "JRN_PURCHASE",
    PAYMENT: "JRN_PAYMENT",
    RECEIPT: "JRN_RECEIPT",
    GENERAL: "JRN_GENERAL",
    ADJUSTMENT: "JRN_ADJUSTMENT",
    OPENING: "JRN_OPENING",
    CLOSING: "JRN_CLOSING",
    ACCRUAL: "JRN_ACCRUAL",
    REVERSAL: "JRN_REVERSAL",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEAVE_STATUS (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  LEAVE_STATUS: {
    PENDING: "LVS_PENDING",
    APPROVED: "LVS_APPROVED",
    REJECTED: "LVS_REJECTED",
    CANCELLED: "LVS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MAINTENANCE_STATUS (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  MAINTENANCE_STATUS: {
    PLANNED: "MTS_PLANNED",
    IN_PROGRESS: "MTS_IN_PROGRESS",
    COMPLETED: "MTS_COMPLETED",
    CANCELLED: "MTS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MATCHING_METHOD (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  MATCHING_METHOD: {
    AUTO: "MTM_AUTO",
    MANUAL: "MTM_MANUAL",
    RULE_BASED: "MTM_RULE_BASED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MILESTONE_STATUS (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  MILESTONE_STATUS: {
    PENDING: "MLS_PENDING",
    ACHIEVED: "MLS_ACHIEVED",
    DELAYED: "MLS_DELAYED",
    CLOSED: "MLS_CLOSED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATION_CHANNEL (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  NOTIFICATION_CHANNEL: {
    IN_APP: "NTC_IN_APP",
    EMAIL: "NTC_EMAIL",
    SMS: "NTC_SMS",
    WEBHOOK: "NTC_WEBHOOK",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATION_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  NOTIFICATION_STATUS: {
    QUEUED: "NTS_QUEUED",
    SENT: "NTS_SENT",
    DELIVERED: "NTS_DELIVERED",
    FAILED: "NTS_FAILED",
    CANCELLED: "NTS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OPERATION_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  OPERATION_TYPE: {
    SETUP: "OPT_SETUP",
    MACHINING: "OPT_MACHINING",
    ASSEMBLY: "OPT_ASSEMBLY",
    INSPECTION: "OPT_INSPECTION",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PARTY_TYPE (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  PARTY_TYPE: {
    INDIVIDUAL: "PTY_INDIVIDUAL",
    COMPANY: "PTY_COMPANY",
    GOVERNMENT: "PTY_GOVERNMENT",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PAYMENT_BATCH_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  PAYMENT_BATCH_STATUS: {
    DRAFT: "PBS_DRAFT",
    APPROVED: "PBS_APPROVED",
    EXPORTED: "PBS_EXPORTED",
    SUBMITTED: "PBS_SUBMITTED",
    COMPLETED: "PBS_COMPLETED",
    CANCELLED: "PBS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PAYMENT_METHOD (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  PAYMENT_METHOD: {
    CASH: "PAY_CASH",
    BANK_TRANSFER: "PAY_BANK_TRANSFER",
    CREDIT_CARD: "PAY_CREDIT_CARD",
    DEBIT_CARD: "PAY_DEBIT_CARD",
    CHEQUE: "PAY_CHEQUE",
    E_WALLET: "PAY_E_WALLET",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PAYMENT_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  PAYMENT_STATUS: {
    DRAFT: "PST_DRAFT",
    APPROVED: "PST_APPROVED",
    PROCESSING: "PST_PROCESSING",
    PAID: "PST_PAID",
    FAILED: "PST_FAILED",
    CANCELLED: "PST_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PAYROLL_STATUS (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  PAYROLL_STATUS: {
    DRAFT: "PYS_DRAFT",
    PROCESSED: "PYS_PROCESSED",
    PAID: "PYS_PAID",
    CANCELLED: "PYS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PERFORMANCE_RATING (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  PERFORMANCE_RATING: {
    EXCELLENT: "PFR_EXCELLENT",
    GOOD: "PFR_GOOD",
    SATISFACTORY: "PFR_SATISFACTORY",
    NEEDS_IMPROVEMENT: "PFR_NEEDS_IMPROVEMENT",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PICK_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  PICK_STATUS: {
    DRAFT: "PKS_DRAFT",
    RELEASED: "PKS_RELEASED",
    PICKING: "PKS_PICKING",
    PICKED: "PKS_PICKED",
    CANCELLED: "PKS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // POLICY_STATUS (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  POLICY_STATUS: {
    DRAFT: "PLS_DRAFT",
    ACTIVE: "PLS_ACTIVE",
    RETIRED: "PLS_RETIRED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRICE_LIST_TYPE (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  PRICE_LIST_TYPE: {
    STANDARD: "PLT_STANDARD",
    PROMOTIONAL: "PLT_PROMOTIONAL",
    VOLUME_DISCOUNT: "PLT_VOLUME_DISCOUNT",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITY_LEVEL (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  PRIORITY_LEVEL: {
    LOW: "PRI_LOW",
    MEDIUM: "PRI_MEDIUM",
    HIGH: "PRI_HIGH",
    URGENT: "PRI_URGENT",
    CRITICAL: "PRI_CRITICAL",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCTION_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  PRODUCTION_STATUS: {
    PLANNED: "PRS_PLANNED",
    IN_PROGRESS: "PRS_IN_PROGRESS",
    COMPLETED: "PRS_COMPLETED",
    SCRAPPED: "PRS_SCRAPPED",
    CANCELLED: "PRS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROJECT_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  PROJECT_STATUS: {
    PLANNING: "PJS_PLANNING",
    ACTIVE: "PJS_ACTIVE",
    ON_HOLD: "PJS_ON_HOLD",
    COMPLETED: "PJS_COMPLETED",
    CANCELLED: "PJS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROJECT_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  PROJECT_TYPE: {
    INTERNAL: "PRT_INTERNAL",
    CUSTOMER: "PRT_CUSTOMER",
    R_AND_D: "PRT_R_AND_D",
    MAINTENANCE: "PRT_MAINTENANCE",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PURCHASE_INVOICE_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  PURCHASE_INVOICE_STATUS: {
    DRAFT: "PIS_DRAFT",
    POSTED: "PIS_POSTED",
    PARTIALLY_PAID: "PIS_PARTIALLY_PAID",
    PAID: "PIS_PAID",
    VOIDED: "PIS_VOIDED",
    OVERDUE: "PIS_OVERDUE",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PURCHASE_ORDER_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  PURCHASE_ORDER_STATUS: {
    DRAFT: "POS_DRAFT",
    APPROVED: "POS_APPROVED",
    RECEIVED: "POS_RECEIVED",
    COMPLETED: "POS_COMPLETED",
    CANCELLED: "POS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // QUOTATION_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  QUOTATION_STATUS: {
    DRAFT: "QTN_DRAFT",
    SENT: "QTN_SENT",
    ACCEPTED: "QTN_ACCEPTED",
    REJECTED: "QTN_REJECTED",
    EXPIRED: "QTN_EXPIRED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RECEIPT_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  RECEIPT_STATUS: {
    DRAFT: "RPT_DRAFT",
    CONFIRMED: "RPT_CONFIRMED",
    DEPOSITED: "RPT_DEPOSITED",
    ALLOCATED: "RPT_ALLOCATED",
    REVERSED: "RPT_REVERSED",
    CLOSED: "RPT_CLOSED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RECONCILIATION_STATUS (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  RECONCILIATION_STATUS: {
    OPEN: "RCS_OPEN",
    IN_PROGRESS: "RCS_IN_PROGRESS",
    COMPLETED: "RCS_COMPLETED",
    CLOSED: "RCS_CLOSED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RESOURCE_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  RESOURCE_TYPE: {
    PERSON: "RST_PERSON",
    ROLE: "RST_ROLE",
    ASSET: "RST_ASSET",
    VENDOR: "RST_VENDOR",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RFQ_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  RFQ_STATUS: {
    DRAFT: "RFQ_DRAFT",
    SENT: "RFQ_SENT",
    RECEIVED: "RFQ_RECEIVED",
    AWARDED: "RFQ_AWARDED",
    CANCELLED: "RFQ_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RISK_SEVERITY (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  RISK_SEVERITY: {
    LOW: "RSK_LOW",
    MEDIUM: "RSK_MEDIUM",
    HIGH: "RSK_HIGH",
    CRITICAL: "RSK_CRITICAL",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ROUNDING_METHOD (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  ROUNDING_METHOD: {
    ROUND_HALF_UP: "RND_ROUND_HALF_UP",
    ROUND_HALF_EVEN: "RND_ROUND_HALF_EVEN",
    ROUND_UP: "RND_ROUND_UP",
    ROUND_DOWN: "RND_ROUND_DOWN",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SALARY_COMPONENT_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  SALARY_COMPONENT_TYPE: {
    BASIC: "SCT_BASIC",
    ALLOWANCE: "SCT_ALLOWANCE",
    BONUS: "SCT_BONUS",
    DEDUCTION: "SCT_DEDUCTION",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SALES_ORDER_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  SALES_ORDER_STATUS: {
    DRAFT: "SOS_DRAFT",
    CONFIRMED: "SOS_CONFIRMED",
    DELIVERED: "SOS_DELIVERED",
    COMPLETED: "SOS_COMPLETED",
    CANCELLED: "SOS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SETTING_SCOPE (3 values)
  // ─────────────────────────────────────────────────────────────────────────
  SETTING_SCOPE: {
    TENANT: "SSC_TENANT",
    USER: "SSC_USER",
    GLOBAL: "SSC_GLOBAL",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SHIPMENT_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  SHIPMENT_STATUS: {
    DRAFT: "SPS_DRAFT",
    PACKED: "SPS_PACKED",
    SHIPPED: "SPS_SHIPPED",
    DELIVERED: "SPS_DELIVERED",
    RETURNED: "SPS_RETURNED",
    CANCELLED: "SPS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STOCK_ENTRY_TYPE (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  STOCK_ENTRY_TYPE: {
    RECEIPT: "STE_RECEIPT",
    ISSUE: "STE_ISSUE",
    TRANSFER: "STE_TRANSFER",
    ADJUSTMENT: "STE_ADJUSTMENT",
    RETURN: "STE_RETURN",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SUPPLIER_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  SUPPLIER_TYPE: {
    MANUFACTURER: "SUP_MANUFACTURER",
    DISTRIBUTOR: "SUP_DISTRIBUTOR",
    RETAILER: "SUP_RETAILER",
    SERVICE: "SUP_SERVICE",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TASK_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  TASK_STATUS: {
    TODO: "TSK_TODO",
    IN_PROGRESS: "TSK_IN_PROGRESS",
    REVIEW: "TSK_REVIEW",
    DONE: "TSK_DONE",
    BLOCKED: "TSK_BLOCKED",
    CANCELLED: "TSK_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TAX_REPORTING_CATEGORY (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  TAX_REPORTING_CATEGORY: {
    OUTPUT_TAX: "TRC_OUTPUT_TAX",
    INPUT_TAX: "TRC_INPUT_TAX",
    WITHHOLDING_TAX: "TRC_WITHHOLDING_TAX",
    REVERSE_CHARGE: "TRC_REVERSE_CHARGE",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TAX_TREATMENT (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  TAX_TREATMENT: {
    STANDARD: "TRT_STANDARD",
    ZERO_RATED: "TRT_ZERO_RATED",
    EXEMPT: "TRT_EXEMPT",
    OUT_OF_SCOPE: "TRT_OUT_OF_SCOPE",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TAX_TYPE (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  TAX_TYPE: {
    GST: "TXT_GST",
    VAT: "TXT_VAT",
    SST: "TXT_SST",
    WITHHOLDING: "TXT_WITHHOLDING",
    CUSTOMS_DUTY: "TXT_CUSTOMS_DUTY",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSACTION_STATUS (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  TRANSACTION_STATUS: {
    DRAFT: "TXN_DRAFT",
    SUBMITTED: "TXN_SUBMITTED",
    PROCESSING: "TXN_PROCESSING",
    COMPLETED: "TXN_COMPLETED",
    CANCELLED: "TXN_CANCELLED",
    FAILED: "TXN_FAILED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSFER_TYPE (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  TRANSFER_TYPE: {
    INTERNAL: "TRF_INTERNAL",
    INTER_WAREHOUSE: "TRF_INTER_WAREHOUSE",
    CUSTOMER_RETURN: "TRF_CUSTOMER_RETURN",
    SUPPLIER_RETURN: "TRF_SUPPLIER_RETURN",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UOM_CATEGORY (6 values)
  // ─────────────────────────────────────────────────────────────────────────
  UOM_CATEGORY: {
    WEIGHT: "UOM_WEIGHT",
    VOLUME: "UOM_VOLUME",
    LENGTH: "UOM_LENGTH",
    COUNT: "UOM_COUNT",
    AREA: "UOM_AREA",
    TIME: "UOM_TIME",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WORK_ORDER_STATUS (5 values)
  // ─────────────────────────────────────────────────────────────────────────
  WORK_ORDER_STATUS: {
    DRAFT: "WOS_DRAFT",
    RELEASED: "WOS_RELEASED",
    IN_PROGRESS: "WOS_IN_PROGRESS",
    COMPLETED: "WOS_COMPLETED",
    CANCELLED: "WOS_CANCELLED",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WORKFLOW_STATUS (4 values)
  // ─────────────────────────────────────────────────────────────────────────
  WORKFLOW_STATUS: {
    DRAFT: "WFS_DRAFT",
    ACTIVE: "WFS_ACTIVE",
    SUSPENDED: "WFS_SUSPENDED",
    RETIRED: "WFS_RETIRED",
  },

} as const;

/**
 * Counts for validation
 */
export const VALUESET_COUNT = 68 as const;
export const VALUE_COUNT = 307 as const;
