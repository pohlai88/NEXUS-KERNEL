# Schema Header

Complete guide to schema headers for versioned data structures.

## Overview

Schema headers provide versioning and context metadata for data structures. They ensure data can be validated against specific schema versions and track creation/update history.

*See Code:* [`src/schemaHeader.ts`](../../../src/schemaHeader.ts)

## Schema Header Structure

```typescript
interface SchemaHeader {
  _schema_id: CanonId;              // Schema identifier
  _schema_version: SchemaVersion;    // Semantic version (x.y.z)
  _context: {
    created_by: string;              // Creator identifier
    created_at: string;              // ISO datetime
    updated_by?: string;              // Updater identifier
    updated_at?: string;             // ISO datetime
    reason?: string;                  // Change reason
    source?: string;                  // Data source
  };
  type: string;                      // Schema type
}
```

## Usage

### Creating a Schema Header

```typescript
import { createSchemaHeader } from "@aibos/kernel";

const header = createSchemaHeader(
  "schema:invoice:v1",              // Schema ID
  "1.0.0",                          // Schema version
  {
    created_by: "user-123",
    created_at: new Date(),
    reason: "Initial invoice creation",
    source: "api/v1/invoices"
  }
);
```

### Using Schema Header

```typescript
// Add header to data structure
const invoice = {
  ...header,
  invoice_number: "INV-001",
  amount: 1000,
  currency: "MYR"
};

// Validate schema version
if (invoice._schema_version === "1.0.0") {
  // Handle v1.0.0 format
} else if (invoice._schema_version === "2.0.0") {
  // Handle v2.0.0 format
}
```

## Schema Versioning

Schema versions follow semantic versioning:

- **Major (x.0.0)** - Breaking changes
- **Minor (0.x.0)** - New features, backwards compatible
- **Patch (0.0.x)** - Bug fixes, backwards compatible

## Related Documentation

- **[Canon ID](./glossary.md#canon-id)** - Canonical identifier format
- **[Versioning](../governance/release-process.md)** - Versioning strategy

---

**Last Updated:** 2026-01-01  
**Source:** [`src/schemaHeader.ts`](../../../src/schemaHeader.ts)

