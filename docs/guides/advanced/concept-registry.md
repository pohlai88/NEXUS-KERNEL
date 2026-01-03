# Concept Registry

Complete guide to the in-memory concept registry.

## Overview

The concept registry is an in-memory helper registry used for validation, testing, and build-time snapshotting. It is **NOT** an alternative source of truth - the database (`kernel_concept_registry`) remains the runtime state, and Kernel constants (`concepts.ts`) remain the L0 truth.

*See Code:* [`src/concept-registry.ts`](../../../src/concept-registry.ts)

## Purpose

The concept registry provides:

- ✅ **Local validation** without DB access
- ✅ **Unit test support** (no network dependency)
- ✅ **Build-time snapshot generation** (`registry.snapshot.json`)
- ✅ **Fallback behavior** for read-only/offline modes

## Important Note

**This registry must never compete with DB for runtime state.**

The database is the source of truth for runtime. This registry is a helper for development and testing.

## Usage

### Defining a Concept

```typescript
import { defineConcept } from "@aibos/kernel";

const concept = defineConcept({
  id: "CONCEPT_INVOICE",
  name: "Invoice",
  description: "Invoice document requesting payment",
  version: "1.0.0"
});
```

### Getting a Concept

```typescript
import { getConcept } from "@aibos/kernel";

const concept = getConcept("CONCEPT_INVOICE");
if (concept) {
  console.log(concept.name); // "Invoice"
}
```

### Registering Value Sets

```typescript
import { registerValueSet } from "@aibos/kernel";

registerValueSet({
  conceptId: "CONCEPT_INVOICE",
  jurisdiction: "GLOBAL",
  values: ["DRAFT", "APPROVED", "PAID"],
  metadata: { prefix: "INV" }
});
```

## Related Documentation

- **[Concepts Guide](../usage.md)** - Using concepts
- **[Packs Guide](../packs.md)** - Pack structure
- **[Development Guide](../development.md)** - Development workflow

---

**Last Updated:** 2026-01-01  
**Source:** [`src/concept-registry.ts`](../../../src/concept-registry.ts)

