/**
 * KERNEL GLOBAL CONFIG REQUIREMENTS MAP (FROZEN)
 * 
 * Purpose: Defines the minimum global primitives that MUST exist in the Kernel
 * before any ERP Canon can be considered safe to build.
 * 
 * If a required item is missing → Kernel is NOT READY.
 * 
 * Status: LOCKED - This is policy-as-code
 */

export const KERNEL_GLOBAL_CONFIG_REQUIREMENTS = {
  GLOBAL_ISO: {
    description: "Global identity and truth anchors shared by all Canons",
    required: [
      "COUNTRIES",        // ISO 3166-1
      "CURRENCIES",       // ISO 4217
      "LANGUAGES",        // ISO 639-1
      "TIMEZONES"         // IANA TZ database  ← 🔴 SILENT KILLER #3
    ],
    optional: [
      "REGIONS"
    ],
    standard: ["ISO", "IANA"]
  },

  GLOBAL_NUMERIC_POLICY: {
    description: "Mathematical and financial integrity rules",
    required: [
      "ROUNDING_METHOD",
      "UOM_CODES",        // UNECE Rec 20        ← 🔴 SILENT KILLER #1
      "PRECISION_RULES"   // currency + quantity precision ← 🔴 SILENT KILLER #2
    ],
    optional: [
      "NUMBER_FORMAT"
    ],
    standard: ["UNECE", "ISO"]
  },

  GLOBAL_TEXT_LOCALE_UI: {
    description: "Shared language, formatting, and literals",
    required: [
      "LOCALE_FORMAT"
    ],
    optional: [
      "FONT_FAMILY",
      "LITERAL_DICTIONARY"
    ],
    standard: ["BCP-47"]
  },

  GLOBAL_IDENTITY_PRIMITIVES: {
    description: "Canonical identity modeling shared across Canons",
    required: [
      "PARTY_TYPE",
      "ADDRESS_TYPE",
      "CONTACT_TYPE"
    ],
    optional: [
      "IDENTIFIER_TYPE",
      "ORG_TYPE"
    ],
    standard: []
  },

  GLOBAL_WORKFLOW_PRIMITIVES: {
    description: "Shared workflow semantics",
    required: [
      "DOCUMENT_STATUS",
      "APPROVAL_STATUS",
      "TRANSACTION_STATUS",
      "PRIORITY_LEVEL"
    ],
    optional: [
      "RISK_LEVEL",
      "SEVERITY_LEVEL"
    ],
    standard: []
  },

  GLOBAL_TIME_CALENDAR: {
    description: "Business time and fiscal structure",
    required: [
      "FISCAL_PERIOD"
    ],
    optional: [
      "FISCAL_YEAR",
      "WEEK_START_DAY",
      "HOLIDAY_CALENDAR"
    ],
    standard: []
  }
} as const;

export type GlobalPackName = keyof typeof KERNEL_GLOBAL_CONFIG_REQUIREMENTS;

