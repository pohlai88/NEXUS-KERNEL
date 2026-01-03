# Semantic Roots System

Complete guide to semantic roots and concept derivation.

## Overview

Semantic roots are approved meaning cores from which concepts derive. They prevent synonyms, abbreviation drift, and duplicate meanings. Every `CONCEPT_*` must derive from exactly one registered semantic root.

*See Code:* [`src/semantic-roots.ts`](../../../src/semantic-roots.ts)

## What are Semantic Roots?

A semantic root is the **immutable meaning core** that defines what a concept fundamentally represents. Concepts derive from roots to ensure consistent terminology across the platform.

**Example:**
- **Root:** `ROOT_INVOICE` - "A document requesting payment for goods or services"
- **Concept:** `CONCEPT_INVOICE` - Derives from `ROOT_INVOICE`

## Semantic Root Structure

```typescript
interface SemanticRootDefinition {
  code: SemanticRootId;              // e.g., "ROOT_INVOICE"
  canonicalDefinition: string;       // Immutable meaning
  standardRef: string;                // External standard (e.g., "IFRS:IAS41")
  ownerRole: OwnerRole;              // Who owns this root
  lifecycleStage: "ACTIVE" | "DEPRECATED";
  version: string;                    // Semantic version
  domain: DomainCode;                // Domain classification
}
```

## Root Categories

### Entity Roots (Business Objects)

- `ROOT_BANK` - Banking institution
- `ROOT_CASE` - Case/incident
- `ROOT_CLAIM` - Insurance claim
- `ROOT_COMPANY` - Company/organization
- `ROOT_DOCUMENT` - Document
- `ROOT_INVOICE` - Invoice document
- `ROOT_PARTY` - Party (person/organization)
- `ROOT_TENANT` - Tenant/organization
- `ROOT_VENDOR` - Vendor/supplier
- `ROOT_BIOLOGICAL_ASSET` - Biological asset (IAS 41)
- `ROOT_MANUFACTURING_FACILITY` - Manufacturing facility

### Attribute Roots (Properties)

- `ROOT_APPROVAL_LEVEL` - Approval level
- `ROOT_IDENTITY` - Identity classification
- `ROOT_PAYMENT_METHOD` - Payment method
- `ROOT_PRIORITY` - Priority level
- `ROOT_RISK` - Risk classification
- `ROOT_STATUS` - Status classification

### Operation Roots (Business Actions)

- `ROOT_APPROVAL` - Approval action
- `ROOT_AUDIT` - Audit action
- `ROOT_PAYMENT` - Payment action
- `ROOT_WORKFLOW` - Workflow action

## Owner Roles

Semantic roots are owned by specific roles:

- `ROLE_KERNEL_COUNCIL` - Kernel council (highest authority)
- `ROLE_COMPLIANCE_AUTHORITY` - Compliance authority
- `ROLE_DOMAIN_OWNER` - Domain owner
- `ROLE_GOVERNANCE_COMMITTEE` - Governance committee
- `ROLE_FINANCE_COUNCIL` - Finance council
- `ROLE_OPS_COUNCIL` - Operations council
- `ROLE_DOCUMENT_AUTHOR` - Document author

## Usage

### Getting Semantic Root

```typescript
import { SEMANTIC_ROOT, SEMANTIC_ROOT_REGISTRY } from "@aibos/kernel";

// Get root constant
const invoiceRoot = SEMANTIC_ROOT.INVOICE; // "ROOT_INVOICE"

// Get full definition
const rootDef = SEMANTIC_ROOT_REGISTRY[SEMANTIC_ROOT.INVOICE];
console.log(rootDef.canonicalDefinition);
console.log(rootDef.ownerRole);
```

### Validating Concept Derivation

```typescript
import { SEMANTIC_ROOT_REGISTRY, CONCEPT } from "@aibos/kernel";

function getConceptRoot(conceptCode: string): SemanticRootId | null {
  // Concepts should reference their semantic root
  // This is validated during pack generation
  const concept = CONCEPT[conceptCode];
  // Return semantic root if concept has one
}
```

## Derivation Rules

1. **One Root Per Concept** - Each concept derives from exactly one root
2. **Root Must Exist** - Concept cannot reference non-existent root
3. **Root Must Be Active** - Concepts cannot derive from deprecated roots
4. **Domain Alignment** - Concept domain should align with root domain

## Lifecycle

### Active Roots

- Can be used by new concepts
- Can be referenced in packs
- Cannot be modified (immutable)

### Deprecated Roots

- Cannot be used by new concepts
- Existing concepts can still reference them
- Marked for eventual removal

## Related Documentation

- **[Document Types](./document-types.md)** - Document type system
- **[Namespace Prefixes](./namespace-prefixes.md)** - Namespace prefix system
- **[Packs Guide](../packs.md)** - How to reference roots in packs
- **[Kernel Doctrine](../../NEXUS_CANON_V5_KERNEL_DOCTRINE.md)** - Core doctrine

---

**Last Updated:** 2026-01-01  
**Source:** [`src/semantic-roots.ts`](../../../src/semantic-roots.ts)

