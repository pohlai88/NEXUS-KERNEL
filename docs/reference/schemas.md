# Schema Reference

> **Auto-generated** from Zod schemas in `src/kernel.contract.ts`  
> **Last Generated:** 2026-01-03T02:42:09.267Z  
> **Source:** [kernel.contract.ts](../../src/kernel.contract.ts)

This document provides a complete reference for all Zod schemas used in `@aibos/kernel`. These schemas define the frozen contract structure.

## Overview

The kernel uses Zod for runtime validation of:
- Concepts (181 total)
- Value Sets (68 total)
- Values (307 total)
- Packs (domain-specific collections)
- Kernel Registry (complete registry structure)

## Schemas

### ConceptCategory

**Type:** `enum`

**Allowed Values:**

- `"ENTITY"`
- `"ATTRIBUTE"`
- `"OPERATION"`
- `"RELATIONSHIP"`

---

### Domain

**Type:** `enum`

**Allowed Values:**

- `"CORE"`
- `"FINANCE"`
- `"INVENTORY"`
- `"SALES"`
- `"PURCHASE"`
- `"MANUFACTURING"`
- `"HR"`
- `"PROJECT"`
- `"ASSET"`
- `"TAX"`
- `"PAYMENTS"`
- `"WAREHOUSE"`
- `"ADMIN"`
- `"COMPLIANCE"`
- `"SYSTEM"`
- `"GLOBAL"`

---

### ConceptShape

**Type:** `object`

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | ✅ Yes | - |
| `category` | `enum` | ✅ Yes | - |
| `domain` | `enum` | ✅ Yes | - |
| `description` | `string` | ✅ Yes | - |
| `tags` | `array<string>? (default)` | ❌ No | - |
| `semantic_root` | `string?` | ❌ No | - |

---

### ValueSetShape

**Type:** `object`

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | ✅ Yes | - |
| `domain` | `enum` | ✅ Yes | - |
| `description` | `string` | ✅ Yes | - |
| `jurisdiction` | `enum (default)` | ❌ No | - |
| `tags` | `array<string>? (default)` | ❌ No | - |
| `metadata` | `object?` | ❌ No | - |

---

### ValueShape

**Type:** `object`

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | ✅ Yes | - |
| `value_set_code` | `string` | ✅ Yes | - |
| `label` | `string` | ✅ Yes | - |
| `description` | `string?` | ❌ No | - |
| `sort_order` | `number?` | ❌ No | - |
| `metadata` | `unknown?` | ❌ No | - |

---

### PackShape

**Type:** `object`

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ Yes | - |
| `name` | `string` | ✅ Yes | - |
| `version` | `string` | ✅ Yes | - |
| `domain` | `enum` | ✅ Yes | - |
| `description` | `string` | ✅ Yes | - |
| `priority` | `number (default)` | ❌ No | - |
| `authoritative_for` | `object? (default)` | ❌ No | - |
| `concepts` | `array<object>` | ✅ Yes | - |
| `value_sets` | `array<object>` | ✅ Yes | - |
| `values` | `array<object>` | ✅ Yes | - |

---

### KernelRegistryShape

**Type:** `object`

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | `string` | ✅ Yes | - |
| `concepts` | `array<object>` | ✅ Yes | - |
| `value_sets` | `array<object>` | ✅ Yes | - |
| `values` | `array<object>` | ✅ Yes | - |
| `validation` | `object` | ✅ Yes | - |

---

## Usage Example

```typescript
import { ConceptShapeSchema, ValueSetShapeSchema } from "@aibos/kernel";

// Validate concept shape
const concept = ConceptShapeSchema.parse({
  code: "INVOICE",
  category: "ENTITY",
  domain: "FINANCE",
  description: "Invoice document",
});

// Validate value set shape
const valueSet = ValueSetShapeSchema.parse({
  code: "CURRENCIES",
  domain: "GLOBAL",
  description: "Global currency codes",
  jurisdiction: "GLOBAL",
});
```

## Related Documentation

- [Kernel Contract Source](../../src/kernel.contract.ts)
- [Architecture Overview](../architecture/overview.md)
- [Design Principles](../architecture/design-principles.md)
- [API Reference](../api/README.md)

---

**Note:** This file is auto-generated. Do not edit manually.  
To regenerate: `pnpm docs:schema`
