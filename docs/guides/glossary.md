# Glossary (Ubiquitous Language)

This glossary defines the **Ubiquitous Language** for `@aibos/kernel` - the vocabulary that all developers, product owners, and stakeholders must use consistently. Every term links to its TypeScript definition in the codebase.

## Core Concepts

### Concept

A business object type defined in the Kernel. Concepts are organized into categories: Entity, Attribute, Operation, and Relationship.

*See Code:* [`src/concepts.ts`](../../src/concepts.ts) - `CONCEPT` constant object

**Examples:**
- `CONCEPT.INVOICE` - Invoice entity
- `CONCEPT.VENDOR` - Vendor entity
- `CONCEPT.STATUS` - Status attribute

### Value Set

A collection of allowed values for a concept. Value sets define the valid options that can be assigned to concepts.

*See Code:* [`src/values.ts`](../../src/values.ts) - `VALUESET` constant object

**Examples:**
- `VALUESET.CURRENCIES` - Global currency value set
- `VALUESET.COUNTRIES` - Country value set
- `VALUESET.ACCOUNT_TYPE` - Account type value set

### Value

A specific allowed value within a value set. Values are the actual options that can be used.

*See Code:* [`src/values.ts`](../../src/values.ts) - `VALUE` constant object

**Examples:**
- `VALUE.CURRENCIES.MYR` - Malaysian Ringgit
- `VALUE.COUNTRIES.MALAYSIA` - Malaysia country code
- `VALUE.ACCOUNT_TYPE.ASSET` - Asset account type

### Concept Category

The classification of a concept into one of four categories: Entity, Attribute, Operation, or Relationship.

*See Code:* [`src/kernel.contract.ts`](../../src/kernel.contract.ts) - `ConceptCategorySchema`

**Categories:**
- **ENTITY** - Business objects (INVOICE, VENDOR, CUSTOMER, ACCOUNT, BANK)
- **ATTRIBUTE** - Properties (STATUS, PRIORITY, RISK, CURRENCY, COUNTRY)
- **OPERATION** - Actions (APPROVAL, AUDIT, PAYMENT, WORKFLOW)
- **RELATIONSHIP** - Connections (GROUP_MEMBERSHIP, VENDOR_COMPANY_LINK)

**Note:** Current kernel has 128 ENTITY concepts and 53 ATTRIBUTE concepts (181 total).

### Domain

The ERP module classification for concepts and value sets. Domains organize the kernel into functional areas.

*See Code:* [`src/kernel.contract.ts`](../../src/kernel.contract.ts) - `DomainSchema`

**Domains:**
- CORE, FINANCE, INVENTORY, SALES, PURCHASE, MANUFACTURING, HR, PROJECT, ASSET, TAX, PAYMENTS, WAREHOUSE, ADMIN, COMPLIANCE, SYSTEM, GLOBAL

## Layer Terminology

### L0 (Kernel Layer)

The constitutional layer that defines what exists in the platform. This is `@aibos/kernel`.

*See Code:* [`src/index.ts`](../../src/index.ts) - Main exports

**Authority:** Absolute  
**Purpose:** Define existence

### L1 (Domain Canon Layer)

The policy layer that restricts how L0 concepts may be used. Domain-specific packages like `@nexus/canon-vendor`.

**Authority:** Derived from L0  
**Purpose:** Restrict usage, define permissions

### L2 (Cluster Layer)

The operational layer that defines workflows and approvals.

**Authority:** Derived from L1  
**Purpose:** Define workflows, orchestrate

### L3 (Cell Layer)

The execution layer that renders UI, handles API requests, and executes workflows.

**Authority:** Derived from L2  
**Purpose:** Execute, render, log

## Kernel-Specific Terms

### Pack

A domain-specific collection of concepts, value sets, and values. Packs are JSON files that define a functional area of the ERP.

*See Code:* [`packs/`](../../packs/) - Pack JSON files

**Example:** `finance.pack.json` contains finance-related concepts, value sets, and values.

### Snapshot

A deterministic hash of the kernel registry contents. Used for drift detection between package and database.

*See Code:* [`src/version.ts`](../../src/version.ts) - `SNAPSHOT_ID`

### Kernel Integrity

The validation that ensures kernel counts match expected values and there is no drift.

*See Code:* [`src/version.ts`](../../src/version.ts) - `validateKernelIntegrity()`

### Canon ID

A standardized ID format for concepts, value sets, and values following naming laws.

*See Code:* [`src/canonId.ts`](../../src/canonId.ts)

**Format:**
- Concept: `CONCEPT_{CODE}`
- Value Set: `VALUESET_{JURISDICTION}_{CODE}`
- Value: `{PREFIX}_{CODE}`

### Frozen Contract

The immutable schema definitions in `kernel.contract.ts` that define the structure of concepts, value sets, values, and packs.

*See Code:* [`src/kernel.contract.ts`](../../src/kernel.contract.ts) - `ConceptShapeSchema`, `ValueSetShapeSchema`, etc.

## Common Business Terms

### Tenant

An isolated organizational unit within the platform. Each tenant has its own data and configuration.

*See Code:* [`src/concepts.ts`](../../src/concepts.ts) - `CONCEPT.TENANT`

### Invoice

A document requesting payment for goods or services provided.

*See Code:* [`src/concepts.ts`](../../src/concepts.ts) - `CONCEPT.INVOICE`

### Vendor

A supplier or service provider from whom goods or services are purchased.

*See Code:* [`src/concepts.ts`](../../src/concepts.ts) - `CONCEPT.VENDOR`

### Account

A Chart of Accounts entry used for financial reporting and categorization.

*See Code:* [`src/concepts.ts`](../../src/concepts.ts) - `CONCEPT.ACCOUNT`

### Document

A generic document type that can represent invoices, purchase orders, receipts, etc.

*See Code:* [`src/concepts.ts`](../../src/concepts.ts) - `CONCEPT.DOCUMENT`

## Validation Terms

### Drift Detection

The process of comparing database contents against the kernel snapshot to detect inconsistencies.

*See Code:* [`src/version.ts`](../../src/version.ts) - `SNAPSHOT_ID` comparison

### Type Safety

The guarantee that all concepts and values are TypeScript constants, preventing raw string usage.

*See Code:* [`src/concepts.ts`](../../src/concepts.ts), [`src/values.ts`](../../src/values.ts)

## Related Documentation

- **[Getting Started](./getting-started.md)** - Quick start tutorial
- **[Usage Guide](./usage.md)** - Practical examples
- **[Architecture Layer Model](../architecture/layer-model.md)** - L0/L1/L2/L3 details
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Architecture Decision Records](../adr/README.md)** - Design decisions

