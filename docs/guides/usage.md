# Usage Guide

Practical examples and patterns for using `@aibos/kernel` in your applications.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Type Safety Patterns](#type-safety-patterns)
- [Schema Validation](#schema-validation)
- [Working with Packs](#working-with-packs)
- [Layer Integration](#layer-integration)

## Basic Usage

### Importing Exports

```typescript
import {
  // Concepts
  CONCEPT,
  ConceptId,
  CONCEPT_CATEGORY,
  
  // Value Sets
  VALUESET,
  ValueSetId,
  
  // Values
  VALUE,
  
  // Version & Validation
  KERNEL_VERSION,
  SNAPSHOT_ID,
  validateKernelIntegrity,
} from "@aibos/kernel";
```

### Using Concepts

```typescript
import { CONCEPT } from "@aibos/kernel";

// Type-safe concept usage
const invoiceConcept = CONCEPT.INVOICE; // "CONCEPT_INVOICE"
const vendorConcept = CONCEPT.VENDOR; // "CONCEPT_VENDOR"

// Use in type definitions
type Invoice = {
  type: typeof CONCEPT.INVOICE;
  number: string;
  amount: number;
};

// Use in function parameters
function processInvoice(invoiceType: typeof CONCEPT.INVOICE) {
  // Process invoice
}
```

### Using Values

```typescript
import { VALUE } from "@aibos/kernel";

// Currency values
const myr = VALUE.CURRENCIES.MYR; // "CURRENCY_MYR"
const usd = VALUE.CURRENCIES.USD; // "CURRENCY_USD"

// Country values
const malaysia = VALUE.COUNTRIES.MALAYSIA; // "COUNTRY_MY"
const singapore = VALUE.COUNTRIES.SINGAPORE; // "COUNTRY_SG"

// Status values
const draft = VALUE.INVOICE_STATUS.DRAFT; // "INV_DRAFT"
const approved = VALUE.INVOICE_STATUS.APPROVED; // "INV_APPROVED"
```

### Using Value Sets

```typescript
import { VALUESET } from "@aibos/kernel";

// Reference value sets
const currencySet = VALUESET.CURRENCIES; // "VALUESET_GLOBAL_CURRENCIES"
const countrySet = VALUESET.COUNTRIES; // "VALUESET_GLOBAL_COUNTRIES"
```

## Type Safety Patterns

### Preventing Raw Strings

```typescript
import { CONCEPT, VALUE } from "@aibos/kernel";

// ✅ Good - Type-safe
const type = CONCEPT.INVOICE;

// ❌ Bad - Raw string (forbidden)
const type = "CONCEPT_INVOICE";

// ✅ Good - Type-safe
const currency = VALUE.CURRENCIES.MYR;

// ❌ Bad - Raw string (forbidden)
const currency = "CURRENCY_MYR";
```

### Type Guards

```typescript
import { CONCEPT } from "@aibos/kernel";

function isInvoice(concept: string): concept is typeof CONCEPT.INVOICE {
  return concept === CONCEPT.INVOICE;
}

// Usage
const concept = CONCEPT.INVOICE;
if (isInvoice(concept)) {
  // TypeScript knows this is CONCEPT.INVOICE
}
```

## Schema Validation

### Using with Zod

```typescript
import { z } from "zod";
import { CONCEPT, VALUE } from "@aibos/kernel";

// Invoice schema using kernel concepts
const InvoiceSchema = z.object({
  type: z.literal(CONCEPT.INVOICE),
  currency: z.enum([
    VALUE.CURRENCIES.MYR,
    VALUE.CURRENCIES.USD,
    VALUE.CURRENCIES.SGD,
  ]),
  status: z.enum([
    VALUE.INVOICE_STATUS.DRAFT,
    VALUE.INVOICE_STATUS.APPROVED,
    VALUE.INVOICE_STATUS.PAID,
  ]),
  amount: z.number().positive(),
});

// Validate data
const invoiceData = {
  type: CONCEPT.INVOICE,
  currency: VALUE.CURRENCIES.MYR,
  status: VALUE.INVOICE_STATUS.DRAFT,
  amount: 1000,
};

const result = InvoiceSchema.parse(invoiceData); // ✅ Valid
```

### Using Kernel Contract

```typescript
import { ConceptShapeSchema, ValueSetShapeSchema } from "@aibos/kernel";

// Validate concept shape
const conceptData = {
  code: "INVOICE",
  category: "ENTITY",
  domain: "FINANCE",
  description: "Invoice document",
};

const concept = ConceptShapeSchema.parse(conceptData); // ✅ Valid
```

## Working with Packs

### Loading Pack Data

```typescript
import { PackShapeSchema } from "@aibos/kernel";
import financePack from "./packs/finance.pack.json";

// Validate pack structure
const pack = PackShapeSchema.parse(financePack);

// Access pack concepts
pack.concepts.forEach((concept) => {
  console.log(concept.code, concept.category);
});

// Access pack value sets
pack.value_sets.forEach((valueSet) => {
  console.log(valueSet.code, valueSet.jurisdiction);
});
```

## Layer Integration

### L1: Domain Canon Usage

```typescript
// In @nexus/canon-vendor package
import { CONCEPT, VALUE } from "@aibos/kernel";
import { z } from "zod";

// Use L0 concepts in L1 schemas
const VendorSchema = z.object({
  type: z.literal(CONCEPT.VENDOR), // Must use L0 concept
  status: z.enum([
    "ACTIVE", // Domain-specific status (not in L0)
    "SUSPENDED",
  ]),
  country: z.enum([
    VALUE.COUNTRIES.MALAYSIA, // Use L0 value
    VALUE.COUNTRIES.SINGAPORE,
  ]),
});
```

### L2: Workflow Usage

```typescript
// In workflow system
import { CONCEPT, VALUE } from "@aibos/kernel";
import { VendorSchema } from "@nexus/canon-vendor";

const approvalWorkflow = {
  entityType: CONCEPT.VENDOR, // Use L0 concept
  steps: [
    {
      action: VALUE.APPROVAL_ACTION.SUBMIT, // Use L0 value
      schema: VendorSchema, // Use L1 schema
    },
    {
      action: VALUE.APPROVAL_ACTION.APPROVE,
      schema: VendorSchema,
    },
  ],
};
```

### L3: UI/API Usage

```typescript
// In React component
import { CONCEPT, VALUE } from "@aibos/kernel";

function InvoiceForm() {
  return (
    <form data-concept={CONCEPT.INVOICE}>
      <select name="currency">
        <option value={VALUE.CURRENCIES.MYR}>MYR</option>
        <option value={VALUE.CURRENCIES.USD}>USD</option>
      </select>
    </form>
  );
}
```

## Validation Patterns

### Kernel Integrity Check

```typescript
import { validateKernelIntegrity } from "@aibos/kernel";

// Validate at application startup
try {
  validateKernelIntegrity();
  console.log("✅ Kernel integrity validated");
} catch (error) {
  console.error("❌ Kernel drift detected:", error);
  process.exit(1);
}
```

### Version Checking

```typescript
import { KERNEL_VERSION, SNAPSHOT_ID } from "@aibos/kernel";

// Log kernel version
console.log(`Using kernel v${KERNEL_VERSION}`);
console.log(`Snapshot: ${SNAPSHOT_ID}`);

// Compare with database
const dbSnapshot = await getDbSnapshot();
if (dbSnapshot !== SNAPSHOT_ID) {
  console.warn("⚠️ Database snapshot mismatch");
}
```

## Best Practices

1. **Always use kernel exports** - Never use raw strings
2. **Validate at boundaries** - Check kernel integrity at startup
3. **Use type guards** - Ensure type safety in runtime code
4. **Follow layer rules** - L0 defines, L1 restricts, L2 orchestrates, L3 executes
5. **Reference code** - Link to kernel source when documenting

## Related Documentation

- **[Getting Started](./getting-started.md)** - Quick start tutorial
- **[Glossary](./glossary.md)** - Ubiquitous Language
- **[Troubleshooting](./troubleshooting.md)** - Common issues
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Layer Model](../architecture/layer-model.md)** - L0/L1/L2/L3 explanation
- **[Code Standards](../governance/code-standards.md)** - Coding conventions

