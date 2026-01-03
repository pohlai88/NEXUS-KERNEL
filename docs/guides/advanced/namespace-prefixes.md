# Namespace Prefixes System

Complete guide to namespace prefixes and value ID generation.

## Overview

Namespace prefixes define approved prefixes for value IDs. Every value in the registry must use an approved prefix. Unregistered prefixes are violations.

*See Code:* [`src/namespace-prefixes.ts`](../../../src/namespace-prefixes.ts)

## What are Namespace Prefixes?

A namespace prefix is a short identifier (2-4 uppercase letters) used to generate value IDs. Prefixes ensure consistent value naming and prevent conflicts.

**Example:**
- **Prefix:** `CURRENCY` → Value ID: `CURRENCY_MYR`
- **Prefix:** `APP` → Value ID: `APP_APPROVED`

## Namespace Types

Prefixes are organized by namespace type, which determines governance:

| Type | Authority | Change Authority | Example |
|------|-----------|------------------|---------|
| **GLOBAL** | Kernel Council | LAW Amendment | `CONCEPT_`, `VALUESET_` |
| **JURISDICTION** | Compliance Lead | PRD + Compliance Review | `COUNTRY_`, `CURRENCY_` |
| **DOMAIN** | Domain Owner | PRD + Domain Review | `INV_`, `VND_` |
| **TENANT** | Tenant Admin | Runtime (aliases only) | Custom tenant prefixes |

## Prefix Structure

```typescript
interface NamespacePrefixDefinition {
  code: NamespacePrefixId;           // e.g., "PREFIX_CONCEPT"
  prefix: string;                    // e.g., "CONCEPT_"
  description: string;                // Human-readable description
  namespaceType: NamespaceType;      // GLOBAL | JURISDICTION | DOMAIN | TENANT
  ownerRole: OwnerRole;              // Who owns this prefix
  domain: DomainCode;                 // Domain classification
  pattern: string;                    // Regex pattern for validation
  changeAuthority: string;            // What's required to modify
  version: string;                    // Semantic version
}
```

## Registry Type Prefixes

These prefixes are used for registry-level identifiers:

- `PREFIX_CONCEPT` → `CONCEPT_` - Concept IDs
- `PREFIX_VALUESET` → `VALUESET_` - Value set IDs
- `PREFIX_RELATION` → `REL_` - Relationship IDs
- `PREFIX_EVENT` → `EVT_` - Event IDs
- `PREFIX_POLICY` → `POL_` - Policy IDs
- `PREFIX_ROOT` → `ROOT_` - Semantic root IDs
- `PREFIX_DOCTYPE` → `DOCTYPE_` - Document type IDs

## Value Prefixes

These prefixes are used for value IDs:

- `PREFIX_STATUS` → `STATUS_` - Status values
- `PREFIX_WF` → `WF_` - Workflow values
- `PREFIX_APP` → `APP_` - Approval values
- `PREFIX_DOC` → `DOC_` - Document values
- `PREFIX_PRI` → `PRI_` - Priority values
- `PREFIX_RISK` → `RISK_` - Risk values
- `PREFIX_COUNTRY` → `COUNTRY_` - Country codes
- `PREFIX_CURRENCY` → `CURRENCY_` - Currency codes
- `PREFIX_ID` → `ID_` - Identity values
- `PREFIX_PARTY` → `PARTY_` - Party values
- `PREFIX_REL` → `REL_` - Relationship values
- `PREFIX_AUD` → `AUD_` - Audit values
- `PREFIX_OVERRIDE` → `OVR_` - Override values
- `PREFIX_ROLE` → `ROLE_` - Role values

## Usage

### Getting Prefix

```typescript
import { NAMESPACE_PREFIX, NAMESPACE_PREFIX_REGISTRY } from "@aibos/kernel";

// Get prefix constant
const conceptPrefix = NAMESPACE_PREFIX.CONCEPT; // "PREFIX_CONCEPT"

// Get full definition
const prefixDef = NAMESPACE_PREFIX_REGISTRY[NAMESPACE_PREFIX.CONCEPT];
console.log(prefixDef.prefix); // "CONCEPT_"
console.log(prefixDef.namespaceType); // "GLOBAL"
```

### Validating Value ID

```typescript
import { NAMESPACE_PREFIX_REGISTRY, validateValueAgainstPrefix } from "@aibos/kernel";

// Validate value ID uses correct prefix
const isValid = validateValueAgainstPrefix(
  "CURRENCY_MYR",
  NAMESPACE_PREFIX.CURRENCY
); // true
```

## Prefix Assignment

### Automatic Derivation

If a value set doesn't specify a prefix in `metadata.prefix`, the generator derives it:

```typescript
// Value set: "ACCOUNT_TYPE"
// Derived prefix: "ACC" (first 3 letters)

// Value set: "DOCUMENT_STATUS"
// Derived prefix: "DOC" (first letter of each word)
```

### Explicit Prefix

Value sets can specify a prefix in metadata:

```json
{
  "code": "CURRENCIES",
  "metadata": {
    "prefix": "CURRENCY"
  }
}
```

## Change Authority

| Namespace Type | Change Authority | Process |
|----------------|------------------|---------|
| GLOBAL | LAW Amendment | Requires kernel council approval |
| JURISDICTION | PRD + Compliance Review | Requires compliance lead approval |
| DOMAIN | PRD + Domain Review | Requires domain owner approval |
| TENANT | Runtime | Tenant admin can create aliases |

## Related Documentation

- **[Document Types](./document-types.md)** - Document type system
- **[Semantic Roots](./semantic-roots.md)** - Semantic root registry
- **[Packs Guide](../packs.md)** - How prefixes are used in packs
- **[Kernel Doctrine](../../NEXUS_CANON_V5_KERNEL_DOCTRINE.md)** - Core doctrine

---

**Last Updated:** 2026-01-01  
**Source:** [`src/namespace-prefixes.ts`](../../../src/namespace-prefixes.ts)

