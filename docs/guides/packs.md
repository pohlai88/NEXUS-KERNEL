# Packs System Guide

Complete guide to understanding and working with kernel packs.

## Overview

Packs are domain-specific JSON files that define concepts, value sets, and values for a functional area of the ERP. The kernel generator (`pnpm generate`) reads all packs, merges them, and generates TypeScript code.

**Key Principle:** Source of truth = Pack JSON files, not hand-written TypeScript code.

## Pack Structure

A pack is a JSON file following the `PackShape` schema:

```json
{
  "id": "finance",
  "name": "Finance & Accounting",
  "version": "1.0.0",
  "domain": "FINANCE",
  "description": "Core finance concepts for accounting, invoicing, and financial reporting",
  "priority": 10,
  "authoritative_for": {
    "concepts": ["INVOICE", "ACCOUNT"],
    "value_sets": ["CURRENCIES", "ACCOUNT_TYPE"]
  },
  "concepts": [...],
  "value_sets": [...],
  "values": [...]
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique pack identifier (lowercase-kebab-case, e.g., "finance") |
| `name` | `string` | Human-readable pack name |
| `version` | `string` | Semantic version (e.g., "1.0.0") |
| `domain` | `DomainCode` | ERP domain (CORE, FINANCE, INVENTORY, etc.) |
| `description` | `string` | Pack purpose and scope |
| `priority` | `number` | Pack priority (0-1000, higher wins conflicts, default: 10) |
| `authoritative_for` | `object` | Concepts/value sets this pack can overwrite |
| `concepts` | `ConceptShape[]` | Array of concept definitions |
| `value_sets` | `ValueSetShape[]` | Array of value set definitions |
| `values` | `ValueShape[]` | Array of value definitions |

### Concept Shape

```json
{
  "code": "INVOICE",
  "category": "ENTITY",
  "domain": "FINANCE",
  "description": "Invoice document requesting payment",
  "tags": ["finance", "document"],
  "semantic_root": "ROOT_DOCUMENT"
}
```

**Fields:**
- `code` - UPPERCASE_SNAKE_CASE (e.g., "INVOICE")
- `category` - "ENTITY" | "ATTRIBUTE" | "OPERATION" | "RELATIONSHIP"
- `domain` - Domain code (must match pack domain)
- `description` - Human-readable description (1-256 chars)
- `tags` - Optional array of tags for grouping/search
- `semantic_root` - Optional semantic root reference

### Value Set Shape

```json
{
  "code": "CURRENCIES",
  "domain": "GLOBAL",
  "description": "Global currency codes",
  "jurisdiction": "GLOBAL",
  "tags": ["finance", "currency"],
  "metadata": {
    "prefix": "CURRENCY"
  }
}
```

**Fields:**
- `code` - UPPERCASE_SNAKE_CASE (e.g., "CURRENCIES")
- `domain` - Domain code
- `description` - Human-readable description (1-256 chars)
- `jurisdiction` - "GLOBAL" | "REGIONAL" | "LOCAL" (default: "GLOBAL")
- `tags` - Optional array of tags
- `metadata.prefix` - Optional prefix override (2-4 uppercase letters)

### Value Shape

```json
{
  "code": "MYR",
  "value_set_code": "CURRENCIES",
  "label": "Malaysian Ringgit",
  "description": "Official currency of Malaysia",
  "sort_order": 1,
  "metadata": {
    "iso_code": "MYR",
    "symbol": "RM"
  }
}
```

**Fields:**
- `code` - UPPERCASE_SNAKE_CASE (e.g., "MYR")
- `value_set_code` - Parent value set code (must exist)
- `label` - Human-readable label (1-128 chars)
- `description` - Optional description (max 512 chars)
- `sort_order` - Optional numeric sort order
- `metadata` - Optional key-value metadata

## Pack Priority System

Packs have a `priority` field (0-1000) that determines conflict resolution:

- **Higher priority wins** - If two packs define the same concept, the pack with higher priority is used
- **Default priority: 10** - Most packs use default priority
- **Core pack priority: 100** - Core pack has highest priority to prevent conflicts

### Authoritative For

The `authoritative_for` field allows a pack to declare ownership over specific concepts/value sets:

```json
{
  "authoritative_for": {
    "concepts": ["INVOICE", "ACCOUNT"],
    "value_sets": ["CURRENCIES"]
  }
}
```

**Rules:**
- Only the authoritative pack can modify these concepts/value sets
- Other packs cannot redefine authoritative items
- Prevents accidental overwrites

## Pack Merging Logic

When `pnpm generate` runs:

1. **Load all packs** - Reads all `.pack.json` files from `packs/` directory
2. **Sort by priority** - Higher priority packs processed first
3. **Merge concepts** - Deduplicates by concept code, higher priority wins
4. **Merge value sets** - Deduplicates by value set code, higher priority wins
5. **Merge values** - Deduplicates by value code within value set, higher priority wins
6. **Validate invariants** - Ensures no conflicts, valid references
7. **Generate TypeScript** - Creates `concepts.ts` and `values.ts`

### Conflict Resolution

| Scenario | Resolution |
|----------|------------|
| Same concept in 2 packs | Higher priority pack wins |
| Same value set in 2 packs | Higher priority pack wins |
| Same value in 2 packs | Higher priority pack wins |
| Value references non-existent value set | Generation fails with error |
| Concept code invalid format | Generation fails with error |

## Creating a New Pack

### Step 1: Create Pack File

Create `packs/your-domain.pack.json`:

```json
{
  "id": "your-domain",
  "name": "Your Domain Name",
  "version": "1.0.0",
  "domain": "YOUR_DOMAIN",
  "description": "Description of your domain",
  "priority": 10,
  "authoritative_for": {
    "concepts": [],
    "value_sets": []
  },
  "concepts": [],
  "value_sets": [],
  "values": []
}
```

### Step 2: Define Concepts

Add concepts to the `concepts` array:

```json
{
  "concepts": [
    {
      "code": "YOUR_CONCEPT",
      "category": "ENTITY",
      "domain": "YOUR_DOMAIN",
      "description": "Description of your concept",
      "tags": ["your", "tags"]
    }
  ]
}
```

### Step 3: Define Value Sets

Add value sets to the `value_sets` array:

```json
{
  "value_sets": [
    {
      "code": "YOUR_VALUE_SET",
      "domain": "YOUR_DOMAIN",
      "description": "Description of value set",
      "jurisdiction": "GLOBAL",
      "metadata": {
        "prefix": "YOUR"
      }
    }
  ]
}
```

### Step 4: Define Values

Add values to the `values` array:

```json
{
  "values": [
    {
      "code": "VALUE1",
      "value_set_code": "YOUR_VALUE_SET",
      "label": "Value 1 Label",
      "description": "Description of value"
    }
  ]
}
```

### Step 5: Validate and Generate

```bash
# Validate pack structure
pnpm generate

# Check for errors
# If successful, concepts.ts and values.ts are updated
```

## Pack Examples

### Core Pack (Highest Priority)

```json
{
  "id": "core",
  "name": "Core / Common Primitives",
  "version": "1.0.0",
  "domain": "CORE",
  "priority": 100,
  "authoritative_for": {
    "concepts": ["PARTY", "ADDRESS", "DOCUMENT"],
    "value_sets": ["PARTY_TYPE", "ADDRESS_TYPE"]
  },
  "concepts": [...],
  "value_sets": [...],
  "values": [...]
}
```

**Why priority 100?** Core concepts are foundational and should never be overwritten.

### Finance Pack

```json
{
  "id": "finance",
  "name": "Finance & Accounting",
  "version": "1.0.1",
  "domain": "FINANCE",
  "priority": 10,
  "authoritative_for": {
    "concepts": ["INVOICE", "ACCOUNT"],
    "value_sets": ["ACCOUNT_TYPE"]
  },
  "concepts": [...],
  "value_sets": [...],
  "values": [...]
}
```

## Best Practices

### 1. Domain Alignment

- Pack `domain` must match concept/value set domains
- One pack per domain (or logical grouping)

### 2. Naming Conventions

- Pack `id`: lowercase-kebab-case (`finance`, `sales-order`)
- Concept `code`: UPPERCASE_SNAKE_CASE (`INVOICE`, `SALES_ORDER`)
- Value Set `code`: UPPERCASE_SNAKE_CASE (`CURRENCIES`, `ACCOUNT_TYPE`)
- Value `code`: UPPERCASE_SNAKE_CASE (`MYR`, `ASSET`)

### 3. Priority Guidelines

- **Core pack:** 100 (foundational, never overwritten)
- **Standard packs:** 10 (default)
- **Extension packs:** 5 (extend standard packs)
- **Custom packs:** 1 (lowest priority, can be overridden)

### 4. Authoritative For

- Only declare authoritative for concepts/value sets you own
- Don't declare authoritative for shared/common items
- Use to prevent accidental overwrites

### 5. Versioning

- Follow semantic versioning
- Increment version when pack structure changes
- Document breaking changes

## Validation

The generator validates:

- ✅ Pack structure matches `PackShapeSchema`
- ✅ Concept codes are unique (after priority resolution)
- ✅ Value set codes are unique (after priority resolution)
- ✅ Value codes are unique within value set
- ✅ All values reference valid value sets
- ✅ Concept categories are valid
- ✅ Domains are valid
- ✅ Naming conventions are followed

## Troubleshooting

### Error: "Concept code already exists"

**Cause:** Two packs define the same concept code with same priority.

**Solution:**
- Adjust pack priorities
- Use `authoritative_for` to declare ownership
- Remove duplicate concept

### Error: "Value set not found"

**Cause:** Value references a value set that doesn't exist.

**Solution:**
- Ensure value set is defined in same or earlier pack
- Check value set code spelling
- Verify value set is not filtered out by priority

### Error: "Invalid concept code format"

**Cause:** Concept code doesn't match UPPERCASE_SNAKE_CASE pattern.

**Solution:**
- Use format: `UPPERCASE_SNAKE_CASE`
- No lowercase letters
- No spaces or special characters

## Related Documentation

- **[Schema Reference](../reference/schemas.md)** - PackShape schema details
- **[Kernel Contract](../../src/kernel.contract.ts)** - Source schema definitions
- **[Scripts Guide](./scripts.md)** - How generation works
- **[Development Guide](./development.md)** - Development workflow
- **[Glossary](./glossary.md)** - Terminology

---

**Last Updated:** 2026-01-01  
**Source:** [`packs/`](../../packs/) directory

