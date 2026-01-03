# Getting Started

A quick "Hello World" tutorial to get you started with `@aibos/kernel`.

## Installation

```bash
npm install @aibos/kernel
# or
pnpm add @aibos/kernel
# or
yarn add @aibos/kernel
```

## Your First Import

```typescript
import { CONCEPT, VALUE } from "@aibos/kernel";

// Use a concept
const invoiceType = CONCEPT.INVOICE;
console.log(invoiceType); // "CONCEPT_INVOICE"

// Use a value
const currency = VALUE.CURRENCIES.MYR;
console.log(currency); // "CURRENCY_MYR"
```

## Type Safety in Action

The kernel provides compile-time type safety:

```typescript
import { CONCEPT, VALUE } from "@aibos/kernel";

// ✅ Type-safe - IDE autocomplete works
const vendorType = CONCEPT.VENDOR;

// ✅ Type-safe - IDE autocomplete works
const country = VALUE.COUNTRIES.MALAYSIA;

// ❌ TypeScript error - raw strings are forbidden
const invalid = "CONCEPT_INVOICE"; // Error: Use CONCEPT.INVOICE instead
```

## Basic Usage Pattern

```typescript
import { CONCEPT, VALUE, VALUESET } from "@aibos/kernel";

// 1. Define what type of entity you're working with
const entityType = CONCEPT.INVOICE;

// 2. Use value sets for allowed options
const currencySet = VALUESET.CURRENCIES;

// 3. Use specific values
const currency = VALUE.CURRENCIES.MYR;
const status = VALUE.INVOICE_STATUS.DRAFT;
```

## Validation

Validate kernel integrity at runtime:

```typescript
import { validateKernelIntegrity, KERNEL_VERSION, SNAPSHOT_ID } from "@aibos/kernel";

// Throws if kernel counts don't match expected
validateKernelIntegrity();

console.log(`Kernel v${KERNEL_VERSION} (${SNAPSHOT_ID})`);
```

## Next Steps

- **[Usage Guide](./usage.md)** - Practical examples and patterns
- **[Glossary](./glossary.md)** - Understand the Ubiquitous Language
- **[Architecture Overview](../architecture/overview.md)** - System design and layer model
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## Common Patterns

### Working with Concepts

```typescript
import { CONCEPT } from "@aibos/kernel";

// Check if a concept exists
if (CONCEPT.INVOICE) {
  // Use the invoice concept
}

// Use in type definitions
type InvoiceData = {
  type: typeof CONCEPT.INVOICE;
  // ... other fields
};
```

### Working with Values

```typescript
import { VALUE } from "@aibos/kernel";

// Get all currencies
const currencies = Object.values(VALUE.CURRENCIES);

// Use in validation
const allowedCurrencies = [
  VALUE.CURRENCIES.MYR,
  VALUE.CURRENCIES.USD,
  VALUE.CURRENCIES.SGD,
];
```

### Working with Value Sets

```typescript
import { VALUESET } from "@aibos/kernel";

// Reference a value set
const accountTypeSet = VALUESET.ACCOUNT_TYPE;

// Use in schemas (with Zod)
import { z } from "zod";
import { VALUE } from "@aibos/kernel";

const AccountSchema = z.object({
  type: z.enum([
    VALUE.ACCOUNT_TYPE.ASSET,
    VALUE.ACCOUNT_TYPE.LIABILITY,
    VALUE.ACCOUNT_TYPE.EQUITY,
  ]),
});
```

## Troubleshooting

If you encounter issues, see the [Troubleshooting Guide](./troubleshooting.md).

## Related Documentation

- [Usage Guide](./usage.md)
- [API Reference](../api/) - Auto-generated API docs
- [Architecture](../architecture/overview.md)

