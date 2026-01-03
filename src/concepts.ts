// @aibos/kernel - L0 Concept Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ AUTO-GENERATED: Do not edit manually. Edit data sources instead.
// Generated: 2026-01-03T06:45:17.507Z
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Concept Categories
 * L0 taxonomy for organizing concepts.
 */
export type ConceptCategory =
  | "ENTITY"
  | "ATTRIBUTE";

/**
 * CONCEPT - The Business Ontology
 *
 * 182 canonical concepts organized by category.
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
  // ENTITY (129) - Core business objects
  // ─────────────────────────────────────────────────────────────────────────
  /** Chart of Accounts entry */
  ACCOUNT: "CONCEPT_ACCOUNT",
  /** Address record used for billing, shipping, legal, and operational locations */
  ADDRESS: "CONCEPT_ADDRESS",
  /** API key for integrations */
  API_KEY: "CONCEPT_API_KEY",
  /** Asset assignment record (assigned to employee/department/project) */
  ASSET_ASSIGNMENT: "CONCEPT_ASSET_ASSIGNMENT",
  /** Asset category/class (for grouping, depreciation rules, reporting) */
  ASSET_CATEGORY: "CONCEPT_ASSET_CATEGORY",
  /** Asset event transaction (acquisition, disposal, transfer, revaluation) */
  ASSET_EVENT: "CONCEPT_ASSET_EVENT",
  /** Asset event line item (accounts/amounts/details for event posting) */
  ASSET_EVENT_LINE: "CONCEPT_ASSET_EVENT_LINE",
  /** Asset location record (site, warehouse, office, farm, etc.) */
  ASSET_LOCATION: "CONCEPT_ASSET_LOCATION",
  /** Asset maintenance record (service, repair, inspection) */
  ASSET_MAINTENANCE: "CONCEPT_ASSET_MAINTENANCE",
  /** File attachment linked to any document or record (evidence, invoice PDF, image, etc.) */
  ATTACHMENT: "CONCEPT_ATTACHMENT",
  /** Attendance record */
  ATTENDANCE: "CONCEPT_ATTENDANCE",
  /** Audit log record (who did what, when, where, outcome) */
  AUDIT_LOG: "CONCEPT_AUDIT_LOG",
  /** Audit log line (detailed diff/field-level or multi-event expansion) */
  AUDIT_LOG_LINE: "CONCEPT_AUDIT_LOG_LINE",
  /** Bank master record */
  BANK: "CONCEPT_BANK",
  /** Bank account master record used for receipts and payments */
  BANK_ACCOUNT: "CONCEPT_BANK_ACCOUNT",
  /** Bank reconciliation session/document */
  BANK_RECONCILIATION: "CONCEPT_BANK_RECONCILIATION",
  /** Bank reconciliation line (matched/unmatched mapping) */
  BANK_RECONCILIATION_LINE: "CONCEPT_BANK_RECONCILIATION_LINE",
  /** Imported bank statement (header) */
  BANK_STATEMENT: "CONCEPT_BANK_STATEMENT",
  /** Imported bank statement line (transaction line) */
  BANK_STATEMENT_LINE: "CONCEPT_BANK_STATEMENT_LINE",
  /** Bill of Materials (structure defining components required to produce an item) */
  BOM: "CONCEPT_BOM",
  /** Bill of Materials line (component item, quantity, and UOM requirements) */
  BOM_LINE: "CONCEPT_BOM_LINE",
  /** Carrier/shipping provider */
  CARRIER: "CONCEPT_CARRIER",
  /** Contact person record linked to a party (customer/supplier/employee) */
  CONTACT: "CONCEPT_CONTACT",
  /** Control record (preventive/detective/corrective control) */
  CONTROL: "CONCEPT_CONTROL",
  /** Cost center for cost allocation */
  COST_CENTER: "CONCEPT_COST_CENTER",
  /** Sovereign nation per ISO 3166-1 */
  COUNTRY: "CONCEPT_COUNTRY",
  /** Customer master data */
  CUSTOMER: "CONCEPT_CUSTOMER",
  /** Delivery note/shipment */
  DELIVERY_NOTE: "CONCEPT_DELIVERY_NOTE",
  /** Delivery note line item */
  DELIVERY_NOTE_LINE: "CONCEPT_DELIVERY_NOTE_LINE",
  /** Delivery route definition (sequence or grouping for deliveries) */
  DELIVERY_ROUTE: "CONCEPT_DELIVERY_ROUTE",
  /** Delivery trip (a run using a vehicle/driver on a given date) */
  DELIVERY_TRIP: "CONCEPT_DELIVERY_TRIP",
  /** Delivery trip line (shipment stop/customer drop) */
  DELIVERY_TRIP_LINE: "CONCEPT_DELIVERY_TRIP_LINE",
  /** Organizational department/unit */
  DEPARTMENT: "CONCEPT_DEPARTMENT",
  /** Depreciation schedule definition for an asset/category */
  DEPRECIATION_SCHEDULE: "CONCEPT_DEPRECIATION_SCHEDULE",
  /** Job designation/title */
  DESIGNATION: "CONCEPT_DESIGNATION",
  /** Generic document container for ERP transactions and references */
  DOCUMENT: "CONCEPT_DOCUMENT",
  /** Employee master record */
  EMPLOYEE: "CONCEPT_EMPLOYEE",
  /** Evidence record used to prove control execution (files, logs, screenshots, attestations) */
  EVIDENCE: "CONCEPT_EVIDENCE",
  /** Evidence line item (multiple attachments/entries per evidence record) */
  EVIDENCE_LINE: "CONCEPT_EVIDENCE_LINE",
  /** Currency exchange rate */
  EXCHANGE_RATE: "CONCEPT_EXCHANGE_RATE",
  /** Project-related expense claim */
  EXPENSE_CLAIM: "CONCEPT_EXPENSE_CLAIM",
  /** Expense claim line item (date, amount, type, notes) */
  EXPENSE_CLAIM_LINE: "CONCEPT_EXPENSE_CLAIM_LINE",
  /** Feature flag toggle record */
  FEATURE_FLAG: "CONCEPT_FEATURE_FLAG",
  /** Financial period (month, quarter, year) */
  FISCAL_PERIOD: "CONCEPT_FISCAL_PERIOD",
  /** Financial year period */
  FISCAL_YEAR: "CONCEPT_FISCAL_YEAR",
  /** Fixed asset master record (asset register) */
  FIXED_ASSET: "CONCEPT_FIXED_ASSET",
  /** Goods receipt note */
  GOODS_RECEIPT: "CONCEPT_GOODS_RECEIPT",
  /** Goods receipt line item */
  GOODS_RECEIPT_LINE: "CONCEPT_GOODS_RECEIPT_LINE",
  /** Incident record (security/compliance incident or breach) */
  INCIDENT: "CONCEPT_INCIDENT",
  /** Product or service item */
  ITEM: "CONCEPT_ITEM",
  /** Accounting journal entry */
  JOURNAL_ENTRY: "CONCEPT_JOURNAL_ENTRY",
  /** Journal entry line item (debit/credit) */
  JOURNAL_ENTRY_LINE: "CONCEPT_JOURNAL_ENTRY_LINE",
  /** Leave application/request transaction */
  LEAVE_APPLICATION: "CONCEPT_LEAVE_APPLICATION",
  /** Leave type definition (annual, sick, etc.) */
  LEAVE_TYPE: "CONCEPT_LEAVE_TYPE",
  /** Material request (requisition of components for production or maintenance) */
  MATERIAL_REQUEST: "CONCEPT_MATERIAL_REQUEST",
  /** Project milestone record */
  MILESTONE: "CONCEPT_MILESTONE",
  /** Notification record (in-app/email) */
  NOTIFICATION: "CONCEPT_NOTIFICATION",
  /** Manufacturing operation step within a routing */
  OPERATION: "CONCEPT_OPERATION",
  /** Pack list document generated after picking */
  PACK_LIST: "CONCEPT_PACK_LIST",
  /** Pack list line (item, quantity, package reference) */
  PACK_LIST_LINE: "CONCEPT_PACK_LIST_LINE",
  /** Generic party master (person or organization). Can unify customer/supplier/employee later */
  PARTY: "CONCEPT_PARTY",
  /** Payment transaction (outgoing disbursement) */
  PAYMENT: "CONCEPT_PAYMENT",
  /** Payment batch for bulk processing (e.g., bank file export) */
  PAYMENT_BATCH: "CONCEPT_PAYMENT_BATCH",
  /** Payment batch line (individual payment within a batch) */
  PAYMENT_BATCH_LINE: "CONCEPT_PAYMENT_BATCH_LINE",
  /** Payment line item (allocation to invoices/transactions) */
  PAYMENT_LINE: "CONCEPT_PAYMENT_LINE",
  /** Payment terms (Net 30, etc.) */
  PAYMENT_TERM: "CONCEPT_PAYMENT_TERM",
  /** Payroll run / payroll document */
  PAYROLL: "CONCEPT_PAYROLL",
  /** Payroll line item (employee + salary component details) */
  PAYROLL_LINE: "CONCEPT_PAYROLL_LINE",
  /** Performance review record */
  PERFORMANCE_REVIEW: "CONCEPT_PERFORMANCE_REVIEW",
  /** Permission definition (action/resource) */
  PERMISSION: "CONCEPT_PERMISSION",
  /** Pick list document generated for fulfillment */
  PICK_LIST: "CONCEPT_PICK_LIST",
  /** Pick list line (item, quantity, bin, batch/lot reference) */
  PICK_LIST_LINE: "CONCEPT_PICK_LIST_LINE",
  /** Product plan definition (tiers, limits, features) */
  PLAN: "CONCEPT_PLAN",
  /** Policy record (security, finance, operations) */
  POLICY: "CONCEPT_POLICY",
  /** Production order (execution record of a work order, including consumption and output) */
  PRODUCTION_ORDER: "CONCEPT_PRODUCTION_ORDER",
  /** Production order line (item, quantity, consumption and output details) */
  PRODUCTION_ORDER_LINE: "CONCEPT_PRODUCTION_ORDER_LINE",
  /** Profit center for profit allocation */
  PROFIT_CENTER: "CONCEPT_PROFIT_CENTER",
  /** Project master record */
  PROJECT: "CONCEPT_PROJECT",
  /** Project template for standardized project setup */
  PROJECT_TEMPLATE: "CONCEPT_PROJECT_TEMPLATE",
  /** Purchase invoice */
  PURCHASE_INVOICE: "CONCEPT_PURCHASE_INVOICE",
  /** Purchase invoice line item */
  PURCHASE_INVOICE_LINE: "CONCEPT_PURCHASE_INVOICE_LINE",
  /** Purchase order */
  PURCHASE_ORDER: "CONCEPT_PURCHASE_ORDER",
  /** Purchase order line item */
  PURCHASE_ORDER_LINE: "CONCEPT_PURCHASE_ORDER_LINE",
  /** Purchase return */
  PURCHASE_RETURN: "CONCEPT_PURCHASE_RETURN",
  /** Receipt transaction (incoming cash collection) */
  RECEIPT: "CONCEPT_RECEIPT",
  /** Receipt line item (allocation to invoices/transactions) */
  RECEIPT_LINE: "CONCEPT_RECEIPT_LINE",
  /** Project resource (person, role, or asset) assigned to work */
  RESOURCE: "CONCEPT_RESOURCE",
  /** Request for Quotation */
  RFQ: "CONCEPT_RFQ",
  /** Risk record (risk register) */
  RISK: "CONCEPT_RISK",
  /** Role definition for RBAC */
  ROLE: "CONCEPT_ROLE",
  /** Role to permission assignment record */
  ROLE_PERMISSION: "CONCEPT_ROLE_PERMISSION",
  /** Manufacturing routing (sequence of operations required for production) */
  ROUTING: "CONCEPT_ROUTING",
  /** Salary component definition (basic, allowance, deduction, bonus) */
  SALARY_COMPONENT: "CONCEPT_SALARY_COMPONENT",
  /** Sales invoice */
  SALES_INVOICE: "CONCEPT_SALES_INVOICE",
  /** Sales invoice line item */
  SALES_INVOICE_LINE: "CONCEPT_SALES_INVOICE_LINE",
  /** Sales order */
  SALES_ORDER: "CONCEPT_SALES_ORDER",
  /** Sales order line item */
  SALES_ORDER_LINE: "CONCEPT_SALES_ORDER_LINE",
  /** Sales quotation/proposal */
  SALES_QUOTATION: "CONCEPT_SALES_QUOTATION",
  /** Sales quotation line item */
  SALES_QUOTATION_LINE: "CONCEPT_SALES_QUOTATION_LINE",
  /** Sales return */
  SALES_RETURN: "CONCEPT_SALES_RETURN",
  /** Scrap record (waste/loss generated during production) */
  SCRAP: "CONCEPT_SCRAP",
  /** Shipment document for outbound delivery */
  SHIPMENT: "CONCEPT_SHIPMENT",
  /** Shipment line (item, quantity, package reference) */
  SHIPMENT_LINE: "CONCEPT_SHIPMENT_LINE",
  /** Stock movement transaction */
  STOCK_ENTRY: "CONCEPT_STOCK_ENTRY",
  /** Stock entry line item */
  STOCK_ENTRY_LINE: "CONCEPT_STOCK_ENTRY_LINE",
  /** Subscription record for tenant plan and billing state */
  SUBSCRIPTION: "CONCEPT_SUBSCRIPTION",
  /** Supplier master data */
  SUPPLIER: "CONCEPT_SUPPLIER",
  /** System setting key/value (tenant-scoped) */
  SYSTEM_SETTING: "CONCEPT_SYSTEM_SETTING",
  /** Task within a project */
  TASK: "CONCEPT_TASK",
  /** Tax code master used for sales and purchase transactions */
  TAX_CODE: "CONCEPT_TAX_CODE",
  /** Tax jurisdiction (country/state authority) that owns a tax regime */
  TAX_JURISDICTION: "CONCEPT_TAX_JURISDICTION",
  /** Posting rule defining which accounts receive tax amounts (input/output/withholding) */
  TAX_POSTING_RULE: "CONCEPT_TAX_POSTING_RULE",
  /** Posting rule line details (debit/credit, account mapping, rounding behavior) */
  TAX_POSTING_RULE_LINE: "CONCEPT_TAX_POSTING_RULE_LINE",
  /** Tax rate definition (percentage, effective date range, jurisdiction) */
  TAX_RATE: "CONCEPT_TAX_RATE",
  /** Tenant/organization record */
  TENANT: "CONCEPT_TENANT",
  /** Timesheet for time tracking */
  TIMESHEET: "CONCEPT_TIMESHEET",
  /** Timesheet line item (date, hours, project/task reference) */
  TIMESHEET_LINE: "CONCEPT_TIMESHEET_LINE",
  /** Unit of Measure */
  UOM: "CONCEPT_UOM",
  /** User identity record */
  USER: "CONCEPT_USER",
  /** User to role assignment record */
  USER_ROLE: "CONCEPT_USER_ROLE",
  /** Storage location for inventory */
  WAREHOUSE: "CONCEPT_WAREHOUSE",
  /** Warehouse bin/location (put-away and picking location) */
  WAREHOUSE_BIN: "CONCEPT_WAREHOUSE_BIN",
  /** Warehouse zone (area grouping for bins/locations) */
  WAREHOUSE_ZONE: "CONCEPT_WAREHOUSE_ZONE",
  /** Withholding tax configuration (rate and applicability rules) */
  WITHHOLDING_TAX: "CONCEPT_WITHHOLDING_TAX",
  /** Manufacturing work center (machine, station, or production area) */
  WORK_CENTER: "CONCEPT_WORK_CENTER",
  /** Work order (instruction to produce a quantity of an item) */
  WORK_ORDER: "CONCEPT_WORK_ORDER",
  /** Work order line (item, quantity, scheduling and execution details) */
  WORK_ORDER_LINE: "CONCEPT_WORK_ORDER_LINE",
  /** Workflow definition for approvals and automation */
  WORKFLOW: "CONCEPT_WORKFLOW",
  /** Workflow step definition */
  WORKFLOW_STEP: "CONCEPT_WORKFLOW_STEP",

  // ─────────────────────────────────────────────────────────────────────────
  // ATTRIBUTE (53) - Properties of entities
  // ─────────────────────────────────────────────────────────────────────────
  /** Account classification type */
  ACCOUNT_TYPE: "CONCEPT_ACCOUNT_TYPE",
  /** Address usage type */
  ADDRESS_TYPE: "CONCEPT_ADDRESS_TYPE",
  /** API key lifecycle status */
  API_KEY_STATUS: "CONCEPT_API_KEY_STATUS",
  /** Generic approval workflow status */
  APPROVAL_STATUS: "CONCEPT_APPROVAL_STATUS",
  /** Asset lifecycle status */
  ASSET_STATUS: "CONCEPT_ASSET_STATUS",
  /** Asset type classification (tangible/intangible/right-of-use/etc.) */
  ASSET_TYPE: "CONCEPT_ASSET_TYPE",
  /** Attendance status classification */
  ATTENDANCE_STATUS: "CONCEPT_ATTENDANCE_STATUS",
  /** Contact usage type */
  CONTACT_TYPE: "CONCEPT_CONTACT_TYPE",
  /** Control type classification */
  CONTROL_TYPE: "CONCEPT_CONTROL_TYPE",
  /** Currency attribute for monetary values */
  CURRENCY: "CONCEPT_CURRENCY",
  /** Customer classification type */
  CUSTOMER_TYPE: "CONCEPT_CUSTOMER_TYPE",
  /** Delivery note document status */
  DELIVERY_NOTE_STATUS: "CONCEPT_DELIVERY_NOTE_STATUS",
  /** Delivery status classification */
  DELIVERY_STATUS: "CONCEPT_DELIVERY_STATUS",
  /** Depreciation method type */
  DEPRECIATION_METHOD: "CONCEPT_DEPRECIATION_METHOD",
  /** Document classification type */
  DOCUMENT_TYPE: "CONCEPT_DOCUMENT_TYPE",
  /** Employment type classification */
  EMPLOYEE_TYPE: "CONCEPT_EMPLOYEE_TYPE",
  /** Feature flag status (enabled/disabled) */
  FEATURE_FLAG_STATUS: "CONCEPT_FEATURE_FLAG_STATUS",
  /** Goods receipt status */
  GOODS_RECEIPT_STATUS: "CONCEPT_GOODS_RECEIPT_STATUS",
  /** Incident lifecycle status */
  INCIDENT_STATUS: "CONCEPT_INCIDENT_STATUS",
  /** Sales invoice status */
  INVOICE_STATUS: "CONCEPT_INVOICE_STATUS",
  /** Item classification type */
  ITEM_TYPE: "CONCEPT_ITEM_TYPE",
  /** Type of journal entry */
  JOURNAL_TYPE: "CONCEPT_JOURNAL_TYPE",
  /** Leave application status */
  LEAVE_STATUS: "CONCEPT_LEAVE_STATUS",
  /** Milestone status */
  MILESTONE_STATUS: "CONCEPT_MILESTONE_STATUS",
  /** Notification channel type */
  NOTIFICATION_CHANNEL: "CONCEPT_NOTIFICATION_CHANNEL",
  /** Notification delivery status */
  NOTIFICATION_STATUS: "CONCEPT_NOTIFICATION_STATUS",
  /** Party classification type */
  PARTY_TYPE: "CONCEPT_PARTY_TYPE",
  /** Payment method classification */
  PAYMENT_METHOD: "CONCEPT_PAYMENT_METHOD",
  /** Payroll processing status */
  PAYROLL_STATUS: "CONCEPT_PAYROLL_STATUS",
  /** Performance rating scale */
  PERFORMANCE_RATING: "CONCEPT_PERFORMANCE_RATING",
  /** Picking status classification */
  PICK_STATUS: "CONCEPT_PICK_STATUS",
  /** Policy lifecycle status */
  POLICY_STATUS: "CONCEPT_POLICY_STATUS",
  /** Price list type */
  PRICE_LIST_TYPE: "CONCEPT_PRICE_LIST_TYPE",
  /** Priority / severity level used across tasks, tickets, and workflows */
  PRIORITY_LEVEL: "CONCEPT_PRIORITY_LEVEL",
  /** Project lifecycle status */
  PROJECT_STATUS: "CONCEPT_PROJECT_STATUS",
  /** Project type classification */
  PROJECT_TYPE: "CONCEPT_PROJECT_TYPE",
  /** Purchase invoice status */
  PURCHASE_INVOICE_STATUS: "CONCEPT_PURCHASE_INVOICE_STATUS",
  /** Purchase order status */
  PURCHASE_ORDER_STATUS: "CONCEPT_PURCHASE_ORDER_STATUS",
  /** Quotation status */
  QUOTATION_STATUS: "CONCEPT_QUOTATION_STATUS",
  /** Resource type classification */
  RESOURCE_TYPE: "CONCEPT_RESOURCE_TYPE",
  /** RFQ status */
  RFQ_STATUS: "CONCEPT_RFQ_STATUS",
  /** Risk severity classification */
  RISK_SEVERITY: "CONCEPT_RISK_SEVERITY",
  /** Salary component type classification */
  SALARY_COMPONENT_TYPE: "CONCEPT_SALARY_COMPONENT_TYPE",
  /** Sales order status */
  SALES_ORDER_STATUS: "CONCEPT_SALES_ORDER_STATUS",
  /** Setting scope classification */
  SETTING_SCOPE: "CONCEPT_SETTING_SCOPE",
  /** Shipment lifecycle status classification */
  SHIPMENT_STATUS: "CONCEPT_SHIPMENT_STATUS",
  /** Supplier classification type */
  SUPPLIER_TYPE: "CONCEPT_SUPPLIER_TYPE",
  /** Task lifecycle status */
  TASK_STATUS: "CONCEPT_TASK_STATUS",
  /** Tax reporting category mapping for tax return boxes/lines */
  TAX_REPORTING_CATEGORY: "CONCEPT_TAX_REPORTING_CATEGORY",
  /** Tax treatment for a transaction line (standard/zero/exempt/out of scope) */
  TAX_TREATMENT: "CONCEPT_TAX_TREATMENT",
  /** Tax type classification (GST/VAT/SST/WHT etc.) */
  TAX_TYPE: "CONCEPT_TAX_TYPE",
  /** Generic lifecycle status for transactions and workflows */
  TRANSACTION_STATUS: "CONCEPT_TRANSACTION_STATUS",
  /** Workflow status classification */
  WORKFLOW_STATUS: "CONCEPT_WORKFLOW_STATUS",

} as const;

/**
 * ConceptId - Union type of all valid concept identifiers
 */
export type ConceptId = (typeof CONCEPT)[keyof typeof CONCEPT];

/**
 * CONCEPT_CATEGORY - Mapping of concepts to their categories
 */
export const CONCEPT_CATEGORY: Record<ConceptId, ConceptCategory> = {
  [CONCEPT.ACCOUNT]: "ENTITY",
  [CONCEPT.ACCOUNT_TYPE]: "ATTRIBUTE",
  [CONCEPT.ADDRESS]: "ENTITY",
  [CONCEPT.ADDRESS_TYPE]: "ATTRIBUTE",
  [CONCEPT.API_KEY]: "ENTITY",
  [CONCEPT.API_KEY_STATUS]: "ATTRIBUTE",
  [CONCEPT.APPROVAL_STATUS]: "ATTRIBUTE",
  [CONCEPT.ASSET_ASSIGNMENT]: "ENTITY",
  [CONCEPT.ASSET_CATEGORY]: "ENTITY",
  [CONCEPT.ASSET_EVENT]: "ENTITY",
  [CONCEPT.ASSET_EVENT_LINE]: "ENTITY",
  [CONCEPT.ASSET_LOCATION]: "ENTITY",
  [CONCEPT.ASSET_MAINTENANCE]: "ENTITY",
  [CONCEPT.ASSET_STATUS]: "ATTRIBUTE",
  [CONCEPT.ASSET_TYPE]: "ATTRIBUTE",
  [CONCEPT.ATTACHMENT]: "ENTITY",
  [CONCEPT.ATTENDANCE]: "ENTITY",
  [CONCEPT.ATTENDANCE_STATUS]: "ATTRIBUTE",
  [CONCEPT.AUDIT_LOG]: "ENTITY",
  [CONCEPT.AUDIT_LOG_LINE]: "ENTITY",
  [CONCEPT.BANK]: "ENTITY",
  [CONCEPT.BANK_ACCOUNT]: "ENTITY",
  [CONCEPT.BANK_RECONCILIATION]: "ENTITY",
  [CONCEPT.BANK_RECONCILIATION_LINE]: "ENTITY",
  [CONCEPT.BANK_STATEMENT]: "ENTITY",
  [CONCEPT.BANK_STATEMENT_LINE]: "ENTITY",
  [CONCEPT.BOM]: "ENTITY",
  [CONCEPT.BOM_LINE]: "ENTITY",
  [CONCEPT.CARRIER]: "ENTITY",
  [CONCEPT.CONTACT]: "ENTITY",
  [CONCEPT.CONTACT_TYPE]: "ATTRIBUTE",
  [CONCEPT.CONTROL]: "ENTITY",
  [CONCEPT.CONTROL_TYPE]: "ATTRIBUTE",
  [CONCEPT.COST_CENTER]: "ENTITY",
  [CONCEPT.COUNTRY]: "ENTITY",
  [CONCEPT.CURRENCY]: "ATTRIBUTE",
  [CONCEPT.CUSTOMER]: "ENTITY",
  [CONCEPT.CUSTOMER_TYPE]: "ATTRIBUTE",
  [CONCEPT.DELIVERY_NOTE]: "ENTITY",
  [CONCEPT.DELIVERY_NOTE_LINE]: "ENTITY",
  [CONCEPT.DELIVERY_NOTE_STATUS]: "ATTRIBUTE",
  [CONCEPT.DELIVERY_ROUTE]: "ENTITY",
  [CONCEPT.DELIVERY_STATUS]: "ATTRIBUTE",
  [CONCEPT.DELIVERY_TRIP]: "ENTITY",
  [CONCEPT.DELIVERY_TRIP_LINE]: "ENTITY",
  [CONCEPT.DEPARTMENT]: "ENTITY",
  [CONCEPT.DEPRECIATION_METHOD]: "ATTRIBUTE",
  [CONCEPT.DEPRECIATION_SCHEDULE]: "ENTITY",
  [CONCEPT.DESIGNATION]: "ENTITY",
  [CONCEPT.DOCUMENT]: "ENTITY",
  [CONCEPT.DOCUMENT_TYPE]: "ATTRIBUTE",
  [CONCEPT.EMPLOYEE]: "ENTITY",
  [CONCEPT.EMPLOYEE_TYPE]: "ATTRIBUTE",
  [CONCEPT.EVIDENCE]: "ENTITY",
  [CONCEPT.EVIDENCE_LINE]: "ENTITY",
  [CONCEPT.EXCHANGE_RATE]: "ENTITY",
  [CONCEPT.EXPENSE_CLAIM]: "ENTITY",
  [CONCEPT.EXPENSE_CLAIM_LINE]: "ENTITY",
  [CONCEPT.FEATURE_FLAG]: "ENTITY",
  [CONCEPT.FEATURE_FLAG_STATUS]: "ATTRIBUTE",
  [CONCEPT.FISCAL_PERIOD]: "ENTITY",
  [CONCEPT.FISCAL_YEAR]: "ENTITY",
  [CONCEPT.FIXED_ASSET]: "ENTITY",
  [CONCEPT.GOODS_RECEIPT]: "ENTITY",
  [CONCEPT.GOODS_RECEIPT_LINE]: "ENTITY",
  [CONCEPT.GOODS_RECEIPT_STATUS]: "ATTRIBUTE",
  [CONCEPT.INCIDENT]: "ENTITY",
  [CONCEPT.INCIDENT_STATUS]: "ATTRIBUTE",
  [CONCEPT.INVOICE_STATUS]: "ATTRIBUTE",
  [CONCEPT.ITEM]: "ENTITY",
  [CONCEPT.ITEM_TYPE]: "ATTRIBUTE",
  [CONCEPT.JOURNAL_ENTRY]: "ENTITY",
  [CONCEPT.JOURNAL_ENTRY_LINE]: "ENTITY",
  [CONCEPT.JOURNAL_TYPE]: "ATTRIBUTE",
  [CONCEPT.LEAVE_APPLICATION]: "ENTITY",
  [CONCEPT.LEAVE_STATUS]: "ATTRIBUTE",
  [CONCEPT.LEAVE_TYPE]: "ENTITY",
  [CONCEPT.MATERIAL_REQUEST]: "ENTITY",
  [CONCEPT.MILESTONE]: "ENTITY",
  [CONCEPT.MILESTONE_STATUS]: "ATTRIBUTE",
  [CONCEPT.NOTIFICATION]: "ENTITY",
  [CONCEPT.NOTIFICATION_CHANNEL]: "ATTRIBUTE",
  [CONCEPT.NOTIFICATION_STATUS]: "ATTRIBUTE",
  [CONCEPT.OPERATION]: "ENTITY",
  [CONCEPT.PACK_LIST]: "ENTITY",
  [CONCEPT.PACK_LIST_LINE]: "ENTITY",
  [CONCEPT.PARTY]: "ENTITY",
  [CONCEPT.PARTY_TYPE]: "ATTRIBUTE",
  [CONCEPT.PAYMENT]: "ENTITY",
  [CONCEPT.PAYMENT_BATCH]: "ENTITY",
  [CONCEPT.PAYMENT_BATCH_LINE]: "ENTITY",
  [CONCEPT.PAYMENT_LINE]: "ENTITY",
  [CONCEPT.PAYMENT_METHOD]: "ATTRIBUTE",
  [CONCEPT.PAYMENT_TERM]: "ENTITY",
  [CONCEPT.PAYROLL]: "ENTITY",
  [CONCEPT.PAYROLL_LINE]: "ENTITY",
  [CONCEPT.PAYROLL_STATUS]: "ATTRIBUTE",
  [CONCEPT.PERFORMANCE_RATING]: "ATTRIBUTE",
  [CONCEPT.PERFORMANCE_REVIEW]: "ENTITY",
  [CONCEPT.PERMISSION]: "ENTITY",
  [CONCEPT.PICK_LIST]: "ENTITY",
  [CONCEPT.PICK_LIST_LINE]: "ENTITY",
  [CONCEPT.PICK_STATUS]: "ATTRIBUTE",
  [CONCEPT.PLAN]: "ENTITY",
  [CONCEPT.POLICY]: "ENTITY",
  [CONCEPT.POLICY_STATUS]: "ATTRIBUTE",
  [CONCEPT.PRICE_LIST_TYPE]: "ATTRIBUTE",
  [CONCEPT.PRIORITY_LEVEL]: "ATTRIBUTE",
  [CONCEPT.PRODUCTION_ORDER]: "ENTITY",
  [CONCEPT.PRODUCTION_ORDER_LINE]: "ENTITY",
  [CONCEPT.PROFIT_CENTER]: "ENTITY",
  [CONCEPT.PROJECT]: "ENTITY",
  [CONCEPT.PROJECT_STATUS]: "ATTRIBUTE",
  [CONCEPT.PROJECT_TEMPLATE]: "ENTITY",
  [CONCEPT.PROJECT_TYPE]: "ATTRIBUTE",
  [CONCEPT.PURCHASE_INVOICE]: "ENTITY",
  [CONCEPT.PURCHASE_INVOICE_LINE]: "ENTITY",
  [CONCEPT.PURCHASE_INVOICE_STATUS]: "ATTRIBUTE",
  [CONCEPT.PURCHASE_ORDER]: "ENTITY",
  [CONCEPT.PURCHASE_ORDER_LINE]: "ENTITY",
  [CONCEPT.PURCHASE_ORDER_STATUS]: "ATTRIBUTE",
  [CONCEPT.PURCHASE_RETURN]: "ENTITY",
  [CONCEPT.QUOTATION_STATUS]: "ATTRIBUTE",
  [CONCEPT.RECEIPT]: "ENTITY",
  [CONCEPT.RECEIPT_LINE]: "ENTITY",
  [CONCEPT.RESOURCE]: "ENTITY",
  [CONCEPT.RESOURCE_TYPE]: "ATTRIBUTE",
  [CONCEPT.RFQ]: "ENTITY",
  [CONCEPT.RFQ_STATUS]: "ATTRIBUTE",
  [CONCEPT.RISK]: "ENTITY",
  [CONCEPT.RISK_SEVERITY]: "ATTRIBUTE",
  [CONCEPT.ROLE]: "ENTITY",
  [CONCEPT.ROLE_PERMISSION]: "ENTITY",
  [CONCEPT.ROUTING]: "ENTITY",
  [CONCEPT.SALARY_COMPONENT]: "ENTITY",
  [CONCEPT.SALARY_COMPONENT_TYPE]: "ATTRIBUTE",
  [CONCEPT.SALES_INVOICE]: "ENTITY",
  [CONCEPT.SALES_INVOICE_LINE]: "ENTITY",
  [CONCEPT.SALES_ORDER]: "ENTITY",
  [CONCEPT.SALES_ORDER_LINE]: "ENTITY",
  [CONCEPT.SALES_ORDER_STATUS]: "ATTRIBUTE",
  [CONCEPT.SALES_QUOTATION]: "ENTITY",
  [CONCEPT.SALES_QUOTATION_LINE]: "ENTITY",
  [CONCEPT.SALES_RETURN]: "ENTITY",
  [CONCEPT.SCRAP]: "ENTITY",
  [CONCEPT.SETTING_SCOPE]: "ATTRIBUTE",
  [CONCEPT.SHIPMENT]: "ENTITY",
  [CONCEPT.SHIPMENT_LINE]: "ENTITY",
  [CONCEPT.SHIPMENT_STATUS]: "ATTRIBUTE",
  [CONCEPT.STOCK_ENTRY]: "ENTITY",
  [CONCEPT.STOCK_ENTRY_LINE]: "ENTITY",
  [CONCEPT.SUBSCRIPTION]: "ENTITY",
  [CONCEPT.SUPPLIER]: "ENTITY",
  [CONCEPT.SUPPLIER_TYPE]: "ATTRIBUTE",
  [CONCEPT.SYSTEM_SETTING]: "ENTITY",
  [CONCEPT.TASK]: "ENTITY",
  [CONCEPT.TASK_STATUS]: "ATTRIBUTE",
  [CONCEPT.TAX_CODE]: "ENTITY",
  [CONCEPT.TAX_JURISDICTION]: "ENTITY",
  [CONCEPT.TAX_POSTING_RULE]: "ENTITY",
  [CONCEPT.TAX_POSTING_RULE_LINE]: "ENTITY",
  [CONCEPT.TAX_RATE]: "ENTITY",
  [CONCEPT.TAX_REPORTING_CATEGORY]: "ATTRIBUTE",
  [CONCEPT.TAX_TREATMENT]: "ATTRIBUTE",
  [CONCEPT.TAX_TYPE]: "ATTRIBUTE",
  [CONCEPT.TENANT]: "ENTITY",
  [CONCEPT.TIMESHEET]: "ENTITY",
  [CONCEPT.TIMESHEET_LINE]: "ENTITY",
  [CONCEPT.TRANSACTION_STATUS]: "ATTRIBUTE",
  [CONCEPT.UOM]: "ENTITY",
  [CONCEPT.USER]: "ENTITY",
  [CONCEPT.USER_ROLE]: "ENTITY",
  [CONCEPT.WAREHOUSE]: "ENTITY",
  [CONCEPT.WAREHOUSE_BIN]: "ENTITY",
  [CONCEPT.WAREHOUSE_ZONE]: "ENTITY",
  [CONCEPT.WITHHOLDING_TAX]: "ENTITY",
  [CONCEPT.WORK_CENTER]: "ENTITY",
  [CONCEPT.WORK_ORDER]: "ENTITY",
  [CONCEPT.WORK_ORDER_LINE]: "ENTITY",
  [CONCEPT.WORKFLOW]: "ENTITY",
  [CONCEPT.WORKFLOW_STATUS]: "ATTRIBUTE",
  [CONCEPT.WORKFLOW_STEP]: "ENTITY",
} as const;

/**
 * Concept count for validation
 */
export const CONCEPT_COUNT = 182 as const;
