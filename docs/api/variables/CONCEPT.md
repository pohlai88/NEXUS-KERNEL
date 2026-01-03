[**@aibos/kernel**](../README.md)

***

[@aibos/kernel](../README.md) / CONCEPT

# Variable: CONCEPT

> `const` **CONCEPT**: `object`

Defined in: [src/concepts.ts:29](https://github.com/pohlai88/NEXUS-KERNEL/blob/536b1ee182a1f0e1cca915c7ff0a36317c6af611/src/concepts.ts#L29)

CONCEPT - The Business Ontology

181 canonical concepts organized by category.
These define WHAT EXISTS in AI-BOS.

## Type Declaration

### ACCOUNT

> `readonly` **ACCOUNT**: `"CONCEPT_ACCOUNT"` = `"CONCEPT_ACCOUNT"`

Chart of Accounts entry

### ACCOUNT\_TYPE

> `readonly` **ACCOUNT\_TYPE**: `"CONCEPT_ACCOUNT_TYPE"` = `"CONCEPT_ACCOUNT_TYPE"`

Account classification type

### ADDRESS

> `readonly` **ADDRESS**: `"CONCEPT_ADDRESS"` = `"CONCEPT_ADDRESS"`

Address record used for billing, shipping, legal, and operational locations

### ADDRESS\_TYPE

> `readonly` **ADDRESS\_TYPE**: `"CONCEPT_ADDRESS_TYPE"` = `"CONCEPT_ADDRESS_TYPE"`

Address usage type

### API\_KEY

> `readonly` **API\_KEY**: `"CONCEPT_API_KEY"` = `"CONCEPT_API_KEY"`

API key for integrations

### API\_KEY\_STATUS

> `readonly` **API\_KEY\_STATUS**: `"CONCEPT_API_KEY_STATUS"` = `"CONCEPT_API_KEY_STATUS"`

API key lifecycle status

### APPROVAL\_STATUS

> `readonly` **APPROVAL\_STATUS**: `"CONCEPT_APPROVAL_STATUS"` = `"CONCEPT_APPROVAL_STATUS"`

Generic approval workflow status

### ASSET\_ASSIGNMENT

> `readonly` **ASSET\_ASSIGNMENT**: `"CONCEPT_ASSET_ASSIGNMENT"` = `"CONCEPT_ASSET_ASSIGNMENT"`

Asset assignment record (assigned to employee/department/project)

### ASSET\_CATEGORY

> `readonly` **ASSET\_CATEGORY**: `"CONCEPT_ASSET_CATEGORY"` = `"CONCEPT_ASSET_CATEGORY"`

Asset category/class (for grouping, depreciation rules, reporting)

### ASSET\_EVENT

> `readonly` **ASSET\_EVENT**: `"CONCEPT_ASSET_EVENT"` = `"CONCEPT_ASSET_EVENT"`

Asset event transaction (acquisition, disposal, transfer, revaluation)

### ASSET\_EVENT\_LINE

> `readonly` **ASSET\_EVENT\_LINE**: `"CONCEPT_ASSET_EVENT_LINE"` = `"CONCEPT_ASSET_EVENT_LINE"`

Asset event line item (accounts/amounts/details for event posting)

### ASSET\_LOCATION

> `readonly` **ASSET\_LOCATION**: `"CONCEPT_ASSET_LOCATION"` = `"CONCEPT_ASSET_LOCATION"`

Asset location record (site, warehouse, office, farm, etc.)

### ASSET\_MAINTENANCE

> `readonly` **ASSET\_MAINTENANCE**: `"CONCEPT_ASSET_MAINTENANCE"` = `"CONCEPT_ASSET_MAINTENANCE"`

Asset maintenance record (service, repair, inspection)

### ASSET\_STATUS

> `readonly` **ASSET\_STATUS**: `"CONCEPT_ASSET_STATUS"` = `"CONCEPT_ASSET_STATUS"`

Asset lifecycle status

### ASSET\_TYPE

> `readonly` **ASSET\_TYPE**: `"CONCEPT_ASSET_TYPE"` = `"CONCEPT_ASSET_TYPE"`

Asset type classification (tangible/intangible/right-of-use/etc.)

### ATTACHMENT

> `readonly` **ATTACHMENT**: `"CONCEPT_ATTACHMENT"` = `"CONCEPT_ATTACHMENT"`

File attachment linked to any document or record (evidence, invoice PDF, image, etc.)

### ATTENDANCE

> `readonly` **ATTENDANCE**: `"CONCEPT_ATTENDANCE"` = `"CONCEPT_ATTENDANCE"`

Attendance record

### ATTENDANCE\_STATUS

> `readonly` **ATTENDANCE\_STATUS**: `"CONCEPT_ATTENDANCE_STATUS"` = `"CONCEPT_ATTENDANCE_STATUS"`

Attendance status classification

### AUDIT\_LOG

> `readonly` **AUDIT\_LOG**: `"CONCEPT_AUDIT_LOG"` = `"CONCEPT_AUDIT_LOG"`

Audit log record (who did what, when, where, outcome)

### AUDIT\_LOG\_LINE

> `readonly` **AUDIT\_LOG\_LINE**: `"CONCEPT_AUDIT_LOG_LINE"` = `"CONCEPT_AUDIT_LOG_LINE"`

Audit log line (detailed diff/field-level or multi-event expansion)

### BANK

> `readonly` **BANK**: `"CONCEPT_BANK"` = `"CONCEPT_BANK"`

Bank master record

### BANK\_ACCOUNT

> `readonly` **BANK\_ACCOUNT**: `"CONCEPT_BANK_ACCOUNT"` = `"CONCEPT_BANK_ACCOUNT"`

Bank account master record used for receipts and payments

### BANK\_RECONCILIATION

> `readonly` **BANK\_RECONCILIATION**: `"CONCEPT_BANK_RECONCILIATION"` = `"CONCEPT_BANK_RECONCILIATION"`

Bank reconciliation session/document

### BANK\_RECONCILIATION\_LINE

> `readonly` **BANK\_RECONCILIATION\_LINE**: `"CONCEPT_BANK_RECONCILIATION_LINE"` = `"CONCEPT_BANK_RECONCILIATION_LINE"`

Bank reconciliation line (matched/unmatched mapping)

### BANK\_STATEMENT

> `readonly` **BANK\_STATEMENT**: `"CONCEPT_BANK_STATEMENT"` = `"CONCEPT_BANK_STATEMENT"`

Imported bank statement (header)

### BANK\_STATEMENT\_LINE

> `readonly` **BANK\_STATEMENT\_LINE**: `"CONCEPT_BANK_STATEMENT_LINE"` = `"CONCEPT_BANK_STATEMENT_LINE"`

Imported bank statement line (transaction line)

### BOM

> `readonly` **BOM**: `"CONCEPT_BOM"` = `"CONCEPT_BOM"`

Bill of Materials (structure defining components required to produce an item)

### BOM\_LINE

> `readonly` **BOM\_LINE**: `"CONCEPT_BOM_LINE"` = `"CONCEPT_BOM_LINE"`

Bill of Materials line (component item, quantity, and UOM requirements)

### CARRIER

> `readonly` **CARRIER**: `"CONCEPT_CARRIER"` = `"CONCEPT_CARRIER"`

Carrier/shipping provider

### CONTACT

> `readonly` **CONTACT**: `"CONCEPT_CONTACT"` = `"CONCEPT_CONTACT"`

Contact person record linked to a party (customer/supplier/employee)

### CONTACT\_TYPE

> `readonly` **CONTACT\_TYPE**: `"CONCEPT_CONTACT_TYPE"` = `"CONCEPT_CONTACT_TYPE"`

Contact usage type

### CONTROL

> `readonly` **CONTROL**: `"CONCEPT_CONTROL"` = `"CONCEPT_CONTROL"`

Control record (preventive/detective/corrective control)

### CONTROL\_TYPE

> `readonly` **CONTROL\_TYPE**: `"CONCEPT_CONTROL_TYPE"` = `"CONCEPT_CONTROL_TYPE"`

Control type classification

### COST\_CENTER

> `readonly` **COST\_CENTER**: `"CONCEPT_COST_CENTER"` = `"CONCEPT_COST_CENTER"`

Cost center for cost allocation

### CURRENCY

> `readonly` **CURRENCY**: `"CONCEPT_CURRENCY"` = `"CONCEPT_CURRENCY"`

Currency attribute for monetary values

### CUSTOMER

> `readonly` **CUSTOMER**: `"CONCEPT_CUSTOMER"` = `"CONCEPT_CUSTOMER"`

Customer master data

### CUSTOMER\_TYPE

> `readonly` **CUSTOMER\_TYPE**: `"CONCEPT_CUSTOMER_TYPE"` = `"CONCEPT_CUSTOMER_TYPE"`

Customer classification type

### DELIVERY\_NOTE

> `readonly` **DELIVERY\_NOTE**: `"CONCEPT_DELIVERY_NOTE"` = `"CONCEPT_DELIVERY_NOTE"`

Delivery note/shipment

### DELIVERY\_NOTE\_LINE

> `readonly` **DELIVERY\_NOTE\_LINE**: `"CONCEPT_DELIVERY_NOTE_LINE"` = `"CONCEPT_DELIVERY_NOTE_LINE"`

Delivery note line item

### DELIVERY\_NOTE\_STATUS

> `readonly` **DELIVERY\_NOTE\_STATUS**: `"CONCEPT_DELIVERY_NOTE_STATUS"` = `"CONCEPT_DELIVERY_NOTE_STATUS"`

Delivery note document status

### DELIVERY\_ROUTE

> `readonly` **DELIVERY\_ROUTE**: `"CONCEPT_DELIVERY_ROUTE"` = `"CONCEPT_DELIVERY_ROUTE"`

Delivery route definition (sequence or grouping for deliveries)

### DELIVERY\_STATUS

> `readonly` **DELIVERY\_STATUS**: `"CONCEPT_DELIVERY_STATUS"` = `"CONCEPT_DELIVERY_STATUS"`

Delivery status classification

### DELIVERY\_TRIP

> `readonly` **DELIVERY\_TRIP**: `"CONCEPT_DELIVERY_TRIP"` = `"CONCEPT_DELIVERY_TRIP"`

Delivery trip (a run using a vehicle/driver on a given date)

### DELIVERY\_TRIP\_LINE

> `readonly` **DELIVERY\_TRIP\_LINE**: `"CONCEPT_DELIVERY_TRIP_LINE"` = `"CONCEPT_DELIVERY_TRIP_LINE"`

Delivery trip line (shipment stop/customer drop)

### DEPARTMENT

> `readonly` **DEPARTMENT**: `"CONCEPT_DEPARTMENT"` = `"CONCEPT_DEPARTMENT"`

Organizational department/unit

### DEPRECIATION\_METHOD

> `readonly` **DEPRECIATION\_METHOD**: `"CONCEPT_DEPRECIATION_METHOD"` = `"CONCEPT_DEPRECIATION_METHOD"`

Depreciation method type

### DEPRECIATION\_SCHEDULE

> `readonly` **DEPRECIATION\_SCHEDULE**: `"CONCEPT_DEPRECIATION_SCHEDULE"` = `"CONCEPT_DEPRECIATION_SCHEDULE"`

Depreciation schedule definition for an asset/category

### DESIGNATION

> `readonly` **DESIGNATION**: `"CONCEPT_DESIGNATION"` = `"CONCEPT_DESIGNATION"`

Job designation/title

### DOCUMENT

> `readonly` **DOCUMENT**: `"CONCEPT_DOCUMENT"` = `"CONCEPT_DOCUMENT"`

Generic document container for ERP transactions and references

### DOCUMENT\_TYPE

> `readonly` **DOCUMENT\_TYPE**: `"CONCEPT_DOCUMENT_TYPE"` = `"CONCEPT_DOCUMENT_TYPE"`

Document classification type

### EMPLOYEE

> `readonly` **EMPLOYEE**: `"CONCEPT_EMPLOYEE"` = `"CONCEPT_EMPLOYEE"`

Employee master record

### EMPLOYEE\_TYPE

> `readonly` **EMPLOYEE\_TYPE**: `"CONCEPT_EMPLOYEE_TYPE"` = `"CONCEPT_EMPLOYEE_TYPE"`

Employment type classification

### EVIDENCE

> `readonly` **EVIDENCE**: `"CONCEPT_EVIDENCE"` = `"CONCEPT_EVIDENCE"`

Evidence record used to prove control execution (files, logs, screenshots, attestations)

### EVIDENCE\_LINE

> `readonly` **EVIDENCE\_LINE**: `"CONCEPT_EVIDENCE_LINE"` = `"CONCEPT_EVIDENCE_LINE"`

Evidence line item (multiple attachments/entries per evidence record)

### EXCHANGE\_RATE

> `readonly` **EXCHANGE\_RATE**: `"CONCEPT_EXCHANGE_RATE"` = `"CONCEPT_EXCHANGE_RATE"`

Currency exchange rate

### EXPENSE\_CLAIM

> `readonly` **EXPENSE\_CLAIM**: `"CONCEPT_EXPENSE_CLAIM"` = `"CONCEPT_EXPENSE_CLAIM"`

Project-related expense claim

### EXPENSE\_CLAIM\_LINE

> `readonly` **EXPENSE\_CLAIM\_LINE**: `"CONCEPT_EXPENSE_CLAIM_LINE"` = `"CONCEPT_EXPENSE_CLAIM_LINE"`

Expense claim line item (date, amount, type, notes)

### FEATURE\_FLAG

> `readonly` **FEATURE\_FLAG**: `"CONCEPT_FEATURE_FLAG"` = `"CONCEPT_FEATURE_FLAG"`

Feature flag toggle record

### FEATURE\_FLAG\_STATUS

> `readonly` **FEATURE\_FLAG\_STATUS**: `"CONCEPT_FEATURE_FLAG_STATUS"` = `"CONCEPT_FEATURE_FLAG_STATUS"`

Feature flag status (enabled/disabled)

### FISCAL\_PERIOD

> `readonly` **FISCAL\_PERIOD**: `"CONCEPT_FISCAL_PERIOD"` = `"CONCEPT_FISCAL_PERIOD"`

Financial period (month, quarter, year)

### FISCAL\_YEAR

> `readonly` **FISCAL\_YEAR**: `"CONCEPT_FISCAL_YEAR"` = `"CONCEPT_FISCAL_YEAR"`

Financial year period

### FIXED\_ASSET

> `readonly` **FIXED\_ASSET**: `"CONCEPT_FIXED_ASSET"` = `"CONCEPT_FIXED_ASSET"`

Fixed asset master record (asset register)

### GOODS\_RECEIPT

> `readonly` **GOODS\_RECEIPT**: `"CONCEPT_GOODS_RECEIPT"` = `"CONCEPT_GOODS_RECEIPT"`

Goods receipt note

### GOODS\_RECEIPT\_LINE

> `readonly` **GOODS\_RECEIPT\_LINE**: `"CONCEPT_GOODS_RECEIPT_LINE"` = `"CONCEPT_GOODS_RECEIPT_LINE"`

Goods receipt line item

### GOODS\_RECEIPT\_STATUS

> `readonly` **GOODS\_RECEIPT\_STATUS**: `"CONCEPT_GOODS_RECEIPT_STATUS"` = `"CONCEPT_GOODS_RECEIPT_STATUS"`

Goods receipt status

### INCIDENT

> `readonly` **INCIDENT**: `"CONCEPT_INCIDENT"` = `"CONCEPT_INCIDENT"`

Incident record (security/compliance incident or breach)

### INCIDENT\_STATUS

> `readonly` **INCIDENT\_STATUS**: `"CONCEPT_INCIDENT_STATUS"` = `"CONCEPT_INCIDENT_STATUS"`

Incident lifecycle status

### INVOICE\_STATUS

> `readonly` **INVOICE\_STATUS**: `"CONCEPT_INVOICE_STATUS"` = `"CONCEPT_INVOICE_STATUS"`

Sales invoice status

### ITEM

> `readonly` **ITEM**: `"CONCEPT_ITEM"` = `"CONCEPT_ITEM"`

Product or service item

### ITEM\_TYPE

> `readonly` **ITEM\_TYPE**: `"CONCEPT_ITEM_TYPE"` = `"CONCEPT_ITEM_TYPE"`

Item classification type

### JOURNAL\_ENTRY

> `readonly` **JOURNAL\_ENTRY**: `"CONCEPT_JOURNAL_ENTRY"` = `"CONCEPT_JOURNAL_ENTRY"`

Accounting journal entry

### JOURNAL\_ENTRY\_LINE

> `readonly` **JOURNAL\_ENTRY\_LINE**: `"CONCEPT_JOURNAL_ENTRY_LINE"` = `"CONCEPT_JOURNAL_ENTRY_LINE"`

Journal entry line item (debit/credit)

### JOURNAL\_TYPE

> `readonly` **JOURNAL\_TYPE**: `"CONCEPT_JOURNAL_TYPE"` = `"CONCEPT_JOURNAL_TYPE"`

Type of journal entry

### LEAVE\_APPLICATION

> `readonly` **LEAVE\_APPLICATION**: `"CONCEPT_LEAVE_APPLICATION"` = `"CONCEPT_LEAVE_APPLICATION"`

Leave application/request transaction

### LEAVE\_STATUS

> `readonly` **LEAVE\_STATUS**: `"CONCEPT_LEAVE_STATUS"` = `"CONCEPT_LEAVE_STATUS"`

Leave application status

### LEAVE\_TYPE

> `readonly` **LEAVE\_TYPE**: `"CONCEPT_LEAVE_TYPE"` = `"CONCEPT_LEAVE_TYPE"`

Leave type definition (annual, sick, etc.)

### MATERIAL\_REQUEST

> `readonly` **MATERIAL\_REQUEST**: `"CONCEPT_MATERIAL_REQUEST"` = `"CONCEPT_MATERIAL_REQUEST"`

Material request (requisition of components for production or maintenance)

### MILESTONE

> `readonly` **MILESTONE**: `"CONCEPT_MILESTONE"` = `"CONCEPT_MILESTONE"`

Project milestone record

### MILESTONE\_STATUS

> `readonly` **MILESTONE\_STATUS**: `"CONCEPT_MILESTONE_STATUS"` = `"CONCEPT_MILESTONE_STATUS"`

Milestone status

### NOTIFICATION

> `readonly` **NOTIFICATION**: `"CONCEPT_NOTIFICATION"` = `"CONCEPT_NOTIFICATION"`

Notification record (in-app/email)

### NOTIFICATION\_CHANNEL

> `readonly` **NOTIFICATION\_CHANNEL**: `"CONCEPT_NOTIFICATION_CHANNEL"` = `"CONCEPT_NOTIFICATION_CHANNEL"`

Notification channel type

### NOTIFICATION\_STATUS

> `readonly` **NOTIFICATION\_STATUS**: `"CONCEPT_NOTIFICATION_STATUS"` = `"CONCEPT_NOTIFICATION_STATUS"`

Notification delivery status

### OPERATION

> `readonly` **OPERATION**: `"CONCEPT_OPERATION"` = `"CONCEPT_OPERATION"`

Manufacturing operation step within a routing

### PACK\_LIST

> `readonly` **PACK\_LIST**: `"CONCEPT_PACK_LIST"` = `"CONCEPT_PACK_LIST"`

Pack list document generated after picking

### PACK\_LIST\_LINE

> `readonly` **PACK\_LIST\_LINE**: `"CONCEPT_PACK_LIST_LINE"` = `"CONCEPT_PACK_LIST_LINE"`

Pack list line (item, quantity, package reference)

### PARTY

> `readonly` **PARTY**: `"CONCEPT_PARTY"` = `"CONCEPT_PARTY"`

Generic party master (person or organization). Can unify customer/supplier/employee later

### PARTY\_TYPE

> `readonly` **PARTY\_TYPE**: `"CONCEPT_PARTY_TYPE"` = `"CONCEPT_PARTY_TYPE"`

Party classification type

### PAYMENT

> `readonly` **PAYMENT**: `"CONCEPT_PAYMENT"` = `"CONCEPT_PAYMENT"`

Payment transaction (outgoing disbursement)

### PAYMENT\_BATCH

> `readonly` **PAYMENT\_BATCH**: `"CONCEPT_PAYMENT_BATCH"` = `"CONCEPT_PAYMENT_BATCH"`

Payment batch for bulk processing (e.g., bank file export)

### PAYMENT\_BATCH\_LINE

> `readonly` **PAYMENT\_BATCH\_LINE**: `"CONCEPT_PAYMENT_BATCH_LINE"` = `"CONCEPT_PAYMENT_BATCH_LINE"`

Payment batch line (individual payment within a batch)

### PAYMENT\_LINE

> `readonly` **PAYMENT\_LINE**: `"CONCEPT_PAYMENT_LINE"` = `"CONCEPT_PAYMENT_LINE"`

Payment line item (allocation to invoices/transactions)

### PAYMENT\_METHOD

> `readonly` **PAYMENT\_METHOD**: `"CONCEPT_PAYMENT_METHOD"` = `"CONCEPT_PAYMENT_METHOD"`

Payment method classification

### PAYMENT\_TERM

> `readonly` **PAYMENT\_TERM**: `"CONCEPT_PAYMENT_TERM"` = `"CONCEPT_PAYMENT_TERM"`

Payment terms (Net 30, etc.)

### PAYROLL

> `readonly` **PAYROLL**: `"CONCEPT_PAYROLL"` = `"CONCEPT_PAYROLL"`

Payroll run / payroll document

### PAYROLL\_LINE

> `readonly` **PAYROLL\_LINE**: `"CONCEPT_PAYROLL_LINE"` = `"CONCEPT_PAYROLL_LINE"`

Payroll line item (employee + salary component details)

### PAYROLL\_STATUS

> `readonly` **PAYROLL\_STATUS**: `"CONCEPT_PAYROLL_STATUS"` = `"CONCEPT_PAYROLL_STATUS"`

Payroll processing status

### PERFORMANCE\_RATING

> `readonly` **PERFORMANCE\_RATING**: `"CONCEPT_PERFORMANCE_RATING"` = `"CONCEPT_PERFORMANCE_RATING"`

Performance rating scale

### PERFORMANCE\_REVIEW

> `readonly` **PERFORMANCE\_REVIEW**: `"CONCEPT_PERFORMANCE_REVIEW"` = `"CONCEPT_PERFORMANCE_REVIEW"`

Performance review record

### PERMISSION

> `readonly` **PERMISSION**: `"CONCEPT_PERMISSION"` = `"CONCEPT_PERMISSION"`

Permission definition (action/resource)

### PICK\_LIST

> `readonly` **PICK\_LIST**: `"CONCEPT_PICK_LIST"` = `"CONCEPT_PICK_LIST"`

Pick list document generated for fulfillment

### PICK\_LIST\_LINE

> `readonly` **PICK\_LIST\_LINE**: `"CONCEPT_PICK_LIST_LINE"` = `"CONCEPT_PICK_LIST_LINE"`

Pick list line (item, quantity, bin, batch/lot reference)

### PICK\_STATUS

> `readonly` **PICK\_STATUS**: `"CONCEPT_PICK_STATUS"` = `"CONCEPT_PICK_STATUS"`

Picking status classification

### PLAN

> `readonly` **PLAN**: `"CONCEPT_PLAN"` = `"CONCEPT_PLAN"`

Product plan definition (tiers, limits, features)

### POLICY

> `readonly` **POLICY**: `"CONCEPT_POLICY"` = `"CONCEPT_POLICY"`

Policy record (security, finance, operations)

### POLICY\_STATUS

> `readonly` **POLICY\_STATUS**: `"CONCEPT_POLICY_STATUS"` = `"CONCEPT_POLICY_STATUS"`

Policy lifecycle status

### PRICE\_LIST\_TYPE

> `readonly` **PRICE\_LIST\_TYPE**: `"CONCEPT_PRICE_LIST_TYPE"` = `"CONCEPT_PRICE_LIST_TYPE"`

Price list type

### PRIORITY\_LEVEL

> `readonly` **PRIORITY\_LEVEL**: `"CONCEPT_PRIORITY_LEVEL"` = `"CONCEPT_PRIORITY_LEVEL"`

Priority / severity level used across tasks, tickets, and workflows

### PRODUCTION\_ORDER

> `readonly` **PRODUCTION\_ORDER**: `"CONCEPT_PRODUCTION_ORDER"` = `"CONCEPT_PRODUCTION_ORDER"`

Production order (execution record of a work order, including consumption and output)

### PRODUCTION\_ORDER\_LINE

> `readonly` **PRODUCTION\_ORDER\_LINE**: `"CONCEPT_PRODUCTION_ORDER_LINE"` = `"CONCEPT_PRODUCTION_ORDER_LINE"`

Production order line (item, quantity, consumption and output details)

### PROFIT\_CENTER

> `readonly` **PROFIT\_CENTER**: `"CONCEPT_PROFIT_CENTER"` = `"CONCEPT_PROFIT_CENTER"`

Profit center for profit allocation

### PROJECT

> `readonly` **PROJECT**: `"CONCEPT_PROJECT"` = `"CONCEPT_PROJECT"`

Project master record

### PROJECT\_STATUS

> `readonly` **PROJECT\_STATUS**: `"CONCEPT_PROJECT_STATUS"` = `"CONCEPT_PROJECT_STATUS"`

Project lifecycle status

### PROJECT\_TEMPLATE

> `readonly` **PROJECT\_TEMPLATE**: `"CONCEPT_PROJECT_TEMPLATE"` = `"CONCEPT_PROJECT_TEMPLATE"`

Project template for standardized project setup

### PROJECT\_TYPE

> `readonly` **PROJECT\_TYPE**: `"CONCEPT_PROJECT_TYPE"` = `"CONCEPT_PROJECT_TYPE"`

Project type classification

### PURCHASE\_INVOICE

> `readonly` **PURCHASE\_INVOICE**: `"CONCEPT_PURCHASE_INVOICE"` = `"CONCEPT_PURCHASE_INVOICE"`

Purchase invoice

### PURCHASE\_INVOICE\_LINE

> `readonly` **PURCHASE\_INVOICE\_LINE**: `"CONCEPT_PURCHASE_INVOICE_LINE"` = `"CONCEPT_PURCHASE_INVOICE_LINE"`

Purchase invoice line item

### PURCHASE\_INVOICE\_STATUS

> `readonly` **PURCHASE\_INVOICE\_STATUS**: `"CONCEPT_PURCHASE_INVOICE_STATUS"` = `"CONCEPT_PURCHASE_INVOICE_STATUS"`

Purchase invoice status

### PURCHASE\_ORDER

> `readonly` **PURCHASE\_ORDER**: `"CONCEPT_PURCHASE_ORDER"` = `"CONCEPT_PURCHASE_ORDER"`

Purchase order

### PURCHASE\_ORDER\_LINE

> `readonly` **PURCHASE\_ORDER\_LINE**: `"CONCEPT_PURCHASE_ORDER_LINE"` = `"CONCEPT_PURCHASE_ORDER_LINE"`

Purchase order line item

### PURCHASE\_ORDER\_STATUS

> `readonly` **PURCHASE\_ORDER\_STATUS**: `"CONCEPT_PURCHASE_ORDER_STATUS"` = `"CONCEPT_PURCHASE_ORDER_STATUS"`

Purchase order status

### PURCHASE\_RETURN

> `readonly` **PURCHASE\_RETURN**: `"CONCEPT_PURCHASE_RETURN"` = `"CONCEPT_PURCHASE_RETURN"`

Purchase return

### QUOTATION\_STATUS

> `readonly` **QUOTATION\_STATUS**: `"CONCEPT_QUOTATION_STATUS"` = `"CONCEPT_QUOTATION_STATUS"`

Quotation status

### RECEIPT

> `readonly` **RECEIPT**: `"CONCEPT_RECEIPT"` = `"CONCEPT_RECEIPT"`

Receipt transaction (incoming cash collection)

### RECEIPT\_LINE

> `readonly` **RECEIPT\_LINE**: `"CONCEPT_RECEIPT_LINE"` = `"CONCEPT_RECEIPT_LINE"`

Receipt line item (allocation to invoices/transactions)

### RESOURCE

> `readonly` **RESOURCE**: `"CONCEPT_RESOURCE"` = `"CONCEPT_RESOURCE"`

Project resource (person, role, or asset) assigned to work

### RESOURCE\_TYPE

> `readonly` **RESOURCE\_TYPE**: `"CONCEPT_RESOURCE_TYPE"` = `"CONCEPT_RESOURCE_TYPE"`

Resource type classification

### RFQ

> `readonly` **RFQ**: `"CONCEPT_RFQ"` = `"CONCEPT_RFQ"`

Request for Quotation

### RFQ\_STATUS

> `readonly` **RFQ\_STATUS**: `"CONCEPT_RFQ_STATUS"` = `"CONCEPT_RFQ_STATUS"`

RFQ status

### RISK

> `readonly` **RISK**: `"CONCEPT_RISK"` = `"CONCEPT_RISK"`

Risk record (risk register)

### RISK\_SEVERITY

> `readonly` **RISK\_SEVERITY**: `"CONCEPT_RISK_SEVERITY"` = `"CONCEPT_RISK_SEVERITY"`

Risk severity classification

### ROLE

> `readonly` **ROLE**: `"CONCEPT_ROLE"` = `"CONCEPT_ROLE"`

Role definition for RBAC

### ROLE\_PERMISSION

> `readonly` **ROLE\_PERMISSION**: `"CONCEPT_ROLE_PERMISSION"` = `"CONCEPT_ROLE_PERMISSION"`

Role to permission assignment record

### ROUTING

> `readonly` **ROUTING**: `"CONCEPT_ROUTING"` = `"CONCEPT_ROUTING"`

Manufacturing routing (sequence of operations required for production)

### SALARY\_COMPONENT

> `readonly` **SALARY\_COMPONENT**: `"CONCEPT_SALARY_COMPONENT"` = `"CONCEPT_SALARY_COMPONENT"`

Salary component definition (basic, allowance, deduction, bonus)

### SALARY\_COMPONENT\_TYPE

> `readonly` **SALARY\_COMPONENT\_TYPE**: `"CONCEPT_SALARY_COMPONENT_TYPE"` = `"CONCEPT_SALARY_COMPONENT_TYPE"`

Salary component type classification

### SALES\_INVOICE

> `readonly` **SALES\_INVOICE**: `"CONCEPT_SALES_INVOICE"` = `"CONCEPT_SALES_INVOICE"`

Sales invoice

### SALES\_INVOICE\_LINE

> `readonly` **SALES\_INVOICE\_LINE**: `"CONCEPT_SALES_INVOICE_LINE"` = `"CONCEPT_SALES_INVOICE_LINE"`

Sales invoice line item

### SALES\_ORDER

> `readonly` **SALES\_ORDER**: `"CONCEPT_SALES_ORDER"` = `"CONCEPT_SALES_ORDER"`

Sales order

### SALES\_ORDER\_LINE

> `readonly` **SALES\_ORDER\_LINE**: `"CONCEPT_SALES_ORDER_LINE"` = `"CONCEPT_SALES_ORDER_LINE"`

Sales order line item

### SALES\_ORDER\_STATUS

> `readonly` **SALES\_ORDER\_STATUS**: `"CONCEPT_SALES_ORDER_STATUS"` = `"CONCEPT_SALES_ORDER_STATUS"`

Sales order status

### SALES\_QUOTATION

> `readonly` **SALES\_QUOTATION**: `"CONCEPT_SALES_QUOTATION"` = `"CONCEPT_SALES_QUOTATION"`

Sales quotation/proposal

### SALES\_QUOTATION\_LINE

> `readonly` **SALES\_QUOTATION\_LINE**: `"CONCEPT_SALES_QUOTATION_LINE"` = `"CONCEPT_SALES_QUOTATION_LINE"`

Sales quotation line item

### SALES\_RETURN

> `readonly` **SALES\_RETURN**: `"CONCEPT_SALES_RETURN"` = `"CONCEPT_SALES_RETURN"`

Sales return

### SCRAP

> `readonly` **SCRAP**: `"CONCEPT_SCRAP"` = `"CONCEPT_SCRAP"`

Scrap record (waste/loss generated during production)

### SETTING\_SCOPE

> `readonly` **SETTING\_SCOPE**: `"CONCEPT_SETTING_SCOPE"` = `"CONCEPT_SETTING_SCOPE"`

Setting scope classification

### SHIPMENT

> `readonly` **SHIPMENT**: `"CONCEPT_SHIPMENT"` = `"CONCEPT_SHIPMENT"`

Shipment document for outbound delivery

### SHIPMENT\_LINE

> `readonly` **SHIPMENT\_LINE**: `"CONCEPT_SHIPMENT_LINE"` = `"CONCEPT_SHIPMENT_LINE"`

Shipment line (item, quantity, package reference)

### SHIPMENT\_STATUS

> `readonly` **SHIPMENT\_STATUS**: `"CONCEPT_SHIPMENT_STATUS"` = `"CONCEPT_SHIPMENT_STATUS"`

Shipment lifecycle status classification

### STOCK\_ENTRY

> `readonly` **STOCK\_ENTRY**: `"CONCEPT_STOCK_ENTRY"` = `"CONCEPT_STOCK_ENTRY"`

Stock movement transaction

### STOCK\_ENTRY\_LINE

> `readonly` **STOCK\_ENTRY\_LINE**: `"CONCEPT_STOCK_ENTRY_LINE"` = `"CONCEPT_STOCK_ENTRY_LINE"`

Stock entry line item

### SUBSCRIPTION

> `readonly` **SUBSCRIPTION**: `"CONCEPT_SUBSCRIPTION"` = `"CONCEPT_SUBSCRIPTION"`

Subscription record for tenant plan and billing state

### SUPPLIER

> `readonly` **SUPPLIER**: `"CONCEPT_SUPPLIER"` = `"CONCEPT_SUPPLIER"`

Supplier master data

### SUPPLIER\_TYPE

> `readonly` **SUPPLIER\_TYPE**: `"CONCEPT_SUPPLIER_TYPE"` = `"CONCEPT_SUPPLIER_TYPE"`

Supplier classification type

### SYSTEM\_SETTING

> `readonly` **SYSTEM\_SETTING**: `"CONCEPT_SYSTEM_SETTING"` = `"CONCEPT_SYSTEM_SETTING"`

System setting key/value (tenant-scoped)

### TASK

> `readonly` **TASK**: `"CONCEPT_TASK"` = `"CONCEPT_TASK"`

Task within a project

### TASK\_STATUS

> `readonly` **TASK\_STATUS**: `"CONCEPT_TASK_STATUS"` = `"CONCEPT_TASK_STATUS"`

Task lifecycle status

### TAX\_CODE

> `readonly` **TAX\_CODE**: `"CONCEPT_TAX_CODE"` = `"CONCEPT_TAX_CODE"`

Tax code master used for sales and purchase transactions

### TAX\_JURISDICTION

> `readonly` **TAX\_JURISDICTION**: `"CONCEPT_TAX_JURISDICTION"` = `"CONCEPT_TAX_JURISDICTION"`

Tax jurisdiction (country/state authority) that owns a tax regime

### TAX\_POSTING\_RULE

> `readonly` **TAX\_POSTING\_RULE**: `"CONCEPT_TAX_POSTING_RULE"` = `"CONCEPT_TAX_POSTING_RULE"`

Posting rule defining which accounts receive tax amounts (input/output/withholding)

### TAX\_POSTING\_RULE\_LINE

> `readonly` **TAX\_POSTING\_RULE\_LINE**: `"CONCEPT_TAX_POSTING_RULE_LINE"` = `"CONCEPT_TAX_POSTING_RULE_LINE"`

Posting rule line details (debit/credit, account mapping, rounding behavior)

### TAX\_RATE

> `readonly` **TAX\_RATE**: `"CONCEPT_TAX_RATE"` = `"CONCEPT_TAX_RATE"`

Tax rate definition (percentage, effective date range, jurisdiction)

### TAX\_REPORTING\_CATEGORY

> `readonly` **TAX\_REPORTING\_CATEGORY**: `"CONCEPT_TAX_REPORTING_CATEGORY"` = `"CONCEPT_TAX_REPORTING_CATEGORY"`

Tax reporting category mapping for tax return boxes/lines

### TAX\_TREATMENT

> `readonly` **TAX\_TREATMENT**: `"CONCEPT_TAX_TREATMENT"` = `"CONCEPT_TAX_TREATMENT"`

Tax treatment for a transaction line (standard/zero/exempt/out of scope)

### TAX\_TYPE

> `readonly` **TAX\_TYPE**: `"CONCEPT_TAX_TYPE"` = `"CONCEPT_TAX_TYPE"`

Tax type classification (GST/VAT/SST/WHT etc.)

### TENANT

> `readonly` **TENANT**: `"CONCEPT_TENANT"` = `"CONCEPT_TENANT"`

Tenant/organization record

### TIMESHEET

> `readonly` **TIMESHEET**: `"CONCEPT_TIMESHEET"` = `"CONCEPT_TIMESHEET"`

Timesheet for time tracking

### TIMESHEET\_LINE

> `readonly` **TIMESHEET\_LINE**: `"CONCEPT_TIMESHEET_LINE"` = `"CONCEPT_TIMESHEET_LINE"`

Timesheet line item (date, hours, project/task reference)

### TRANSACTION\_STATUS

> `readonly` **TRANSACTION\_STATUS**: `"CONCEPT_TRANSACTION_STATUS"` = `"CONCEPT_TRANSACTION_STATUS"`

Generic lifecycle status for transactions and workflows

### UOM

> `readonly` **UOM**: `"CONCEPT_UOM"` = `"CONCEPT_UOM"`

Unit of Measure

### USER

> `readonly` **USER**: `"CONCEPT_USER"` = `"CONCEPT_USER"`

User identity record

### USER\_ROLE

> `readonly` **USER\_ROLE**: `"CONCEPT_USER_ROLE"` = `"CONCEPT_USER_ROLE"`

User to role assignment record

### WAREHOUSE

> `readonly` **WAREHOUSE**: `"CONCEPT_WAREHOUSE"` = `"CONCEPT_WAREHOUSE"`

Storage location for inventory

### WAREHOUSE\_BIN

> `readonly` **WAREHOUSE\_BIN**: `"CONCEPT_WAREHOUSE_BIN"` = `"CONCEPT_WAREHOUSE_BIN"`

Warehouse bin/location (put-away and picking location)

### WAREHOUSE\_ZONE

> `readonly` **WAREHOUSE\_ZONE**: `"CONCEPT_WAREHOUSE_ZONE"` = `"CONCEPT_WAREHOUSE_ZONE"`

Warehouse zone (area grouping for bins/locations)

### WITHHOLDING\_TAX

> `readonly` **WITHHOLDING\_TAX**: `"CONCEPT_WITHHOLDING_TAX"` = `"CONCEPT_WITHHOLDING_TAX"`

Withholding tax configuration (rate and applicability rules)

### WORK\_CENTER

> `readonly` **WORK\_CENTER**: `"CONCEPT_WORK_CENTER"` = `"CONCEPT_WORK_CENTER"`

Manufacturing work center (machine, station, or production area)

### WORK\_ORDER

> `readonly` **WORK\_ORDER**: `"CONCEPT_WORK_ORDER"` = `"CONCEPT_WORK_ORDER"`

Work order (instruction to produce a quantity of an item)

### WORK\_ORDER\_LINE

> `readonly` **WORK\_ORDER\_LINE**: `"CONCEPT_WORK_ORDER_LINE"` = `"CONCEPT_WORK_ORDER_LINE"`

Work order line (item, quantity, scheduling and execution details)

### WORKFLOW

> `readonly` **WORKFLOW**: `"CONCEPT_WORKFLOW"` = `"CONCEPT_WORKFLOW"`

Workflow definition for approvals and automation

### WORKFLOW\_STATUS

> `readonly` **WORKFLOW\_STATUS**: `"CONCEPT_WORKFLOW_STATUS"` = `"CONCEPT_WORKFLOW_STATUS"`

Workflow status classification

### WORKFLOW\_STEP

> `readonly` **WORKFLOW\_STEP**: `"CONCEPT_WORKFLOW_STEP"` = `"CONCEPT_WORKFLOW_STEP"`

Workflow step definition

## Example

```typescript
import { CONCEPT } from "@aibos/kernel";

const type = CONCEPT.INVOICE; // ✅ Type-safe: "CONCEPT_INVOICE"
const type = "CONCEPT_INVOICE"; // ❌ Forbidden: Raw string
```
