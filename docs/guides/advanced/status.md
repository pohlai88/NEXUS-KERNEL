# Status System

Complete guide to the status set system.

## Overview

The status system provides type-safe status sets with readable enum values. Status sets are created using Zod enums for validation.

*See Code:* [`src/status.ts`](../../../src/status.ts)

## Usage

### Creating a Status Set

```typescript
import { createStatusSet } from "@aibos/kernel";

const invoiceStatus = createStatusSet([
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "PAID",
  "CANCELLED"
] as const);
```

### Using Status Set

```typescript
// Parse input
const status = invoiceStatus.parse("APPROVED"); // ✅ "APPROVED"
const invalid = invoiceStatus.parse("INVALID"); // ❌ Throws error

// Safe parse
const result = invoiceStatus.safeParse("APPROVED");
if (result.success) {
  console.log(result.data); // "APPROVED"
}

// Type guard
if (invoiceStatus.is("APPROVED")) {
  // TypeScript knows this is "APPROVED"
}

// Get schema
const schema = invoiceStatus.schema; // Zod enum schema
```

## Type Safety

Status sets provide full TypeScript type safety:

```typescript
type InvoiceStatus = typeof invoiceStatus.values[number];
// InvoiceStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "PAID" | "CANCELLED"

function processInvoice(status: InvoiceStatus) {
  // TypeScript ensures only valid statuses
}
```

## Related Documentation

- **[Usage Guide](../usage.md)** - Practical examples
- **[Schema Reference](../../reference/schemas.md)** - Schema definitions

---

**Last Updated:** 2026-01-01  
**Source:** [`src/status.ts`](../../../src/status.ts)

