# Kernel Naming Rules (FROZEN)

**Status:** ⚠️ IMMUTABLE — Changes here = breaking changes  
**Version:** 1.0.0 (Frozen)  
**Authority:** Absolute (L0 Constitutional)

---

## Core Principle

> **If it can be expressed as data, it must never be written as code.**

The kernel is **data wearing TypeScript clothes**. All naming follows mechanical rules.

---

## 1. Concept Naming

### Format
```
CONCEPT_{CODE}
```

### Rules
- Code: `UPPERCASE_SNAKE_CASE`
- Must start with uppercase letter
- Only letters, numbers, underscores
- No spaces, no hyphens
- Examples: `ACCOUNT`, `SALES_ORDER`, `INVOICE`

### TypeScript Export
```typescript
export const CONCEPT = {
  ACCOUNT: "CONCEPT_ACCOUNT",
  SALES_ORDER: "CONCEPT_SALES_ORDER",
} as const;
```

### Validation
- All codes must be unique
- Must match regex: `/^[A-Z][A-Z0-9_]*$/`

---

## 2. Value Set Naming

### Format
```
VALUESET_{JURISDICTION}_{CODE}
```

### Jurisdiction
- `GLOBAL` — Universal (default)
- `REGIONAL` — Regional scope (e.g., `VALUESET_REGIONAL_MALAYSIA_BANKS`)
- `LOCAL` — Tenant-specific (rare, L3 only)

### Rules
- Code: `UPPERCASE_SNAKE_CASE`
- Must start with uppercase letter
- Examples: `ACCOUNT_TYPE`, `DOCUMENT_STATUS`, `PAYMENT_METHOD`

### TypeScript Export
```typescript
export const VALUESET = {
  ACCOUNT_TYPE: "VALUESET_GLOBAL_ACCOUNT_TYPE",
  DOCUMENT_STATUS: "VALUESET_GLOBAL_DOCUMENT_STATUS",
} as const;
```

### Validation
- All codes must be unique
- Must match regex: `/^[A-Z][A-Z0-9_]*$/`

---

## 3. Value Naming

### Format
```
{PREFIX}_{CODE}
```

### Prefix Derivation
Prefix is derived from value set code:
- `ACCOUNT_TYPE` → `ACC`
- `DOCUMENT_STATUS` → `DOC`
- `PAYMENT_METHOD` → `PAY`

### Rules
- Code: `UPPERCASE_SNAKE_CASE`
- Must start with uppercase letter
- Prefix is 2-4 uppercase letters
- Examples: `ACC_ASSET`, `DOC_DRAFT`, `PAY_CASH`

### TypeScript Export
```typescript
export const VALUE = {
  ACCOUNT_TYPE: {
    ASSET: "ACC_ASSET",
    LIABILITY: "ACC_LIABILITY",
  },
  DOCUMENT_STATUS: {
    DRAFT: "DOC_DRAFT",
    APPROVED: "DOC_APPROVED",
  },
} as const;
```

### Validation
- All codes must be unique within value set
- Must match regex: `/^[A-Z][A-Z0-9_]*$/`
- Must reference valid value set

---

## 4. Pack Naming

### Format
```
{domain}.pack.json
```

### Rules
- Lowercase kebab-case
- Domain-based naming
- Examples: `finance.pack.json`, `inventory.pack.json`

### Structure
```json
{
  "id": "finance",
  "name": "Finance & Accounting",
  "version": "1.0.0",
  "domain": "FINANCE",
  "description": "...",
  "concepts": [...],
  "value_sets": [...],
  "values": [...]
}
```

---

## 5. Export Pattern (Immutable)

### Concepts
```typescript
export const CONCEPT = {
  {CODE}: "CONCEPT_{CODE}",
} as const;

export type ConceptId = (typeof CONCEPT)[keyof typeof CONCEPT];
```

### Value Sets
```typescript
export const VALUESET = {
  {CODE}: "VALUESET_GLOBAL_{CODE}",
} as const;

export type ValueSetId = (typeof VALUESET)[keyof typeof VALUESET];
```

### Values
```typescript
export const VALUE = {
  {VALUE_SET_CODE}: {
    {VALUE_CODE}: "{PREFIX}_{CODE}",
  },
} as const;
```

---

## 6. Validation Rules (Absolute)

### Uniqueness
- ✅ All concept codes must be unique
- ✅ All value set codes must be unique
- ✅ All value codes must be unique within value set

### References
- ✅ All values must reference valid value set
- ✅ All value set references must exist

### Format
- ✅ All codes must match regex patterns
- ✅ All IDs must follow naming laws

### Type Safety
- ✅ All exports must use `as const`
- ✅ No string literals allowed
- ✅ No template literals allowed
- ✅ No string concatenation allowed

---

## 7. Breaking Change Rules

### Major Version (v3.0.0)
- Changing naming format
- Changing export pattern
- Changing validation rules
- Removing naming laws

### Minor Version (v2.x.0)
- Adding new naming patterns (backward compatible)
- Extending validation rules (backward compatible)

### Patch Version (v2.0.x)
- Bug fixes in naming validation
- Documentation updates

---

## 8. Code Generation Rules

### Source of Truth
- ✅ CSV/Table → Code (not reverse)
- ✅ Pack JSON → Code (not reverse)
- ✅ Never hand-edit generated code

### Generation Pattern
1. Read source data (CSV/JSON)
2. Validate against contract
3. Generate TypeScript code
4. Generate tests
5. Generate documentation

### Regeneration
- ✅ Always regenerate from source
- ✅ Never merge manual edits
- ✅ Source data is authoritative

---

## 9. Examples

### ✅ Valid
```typescript
CONCEPT.ACCOUNT              // "CONCEPT_ACCOUNT"
VALUESET.ACCOUNT_TYPE        // "VALUESET_GLOBAL_ACCOUNT_TYPE"
VALUE.ACCOUNT_TYPE.ASSET     // "ACC_ASSET"
```

### ❌ Invalid
```typescript
"CONCEPT_ACCOUNT"            // Raw string
`CONCEPT_${code}`            // Template literal
"CONCEPT_" + code            // String concatenation
CONCEPT["ACCOUNT"]           // Computed property
```

---

## 10. Enforcement

### Compile-Time
- TypeScript types enforce structure
- No string literals compile

### Lint-Time
- ESLint rule: `@nexus/canon/no-kernel-string-literals`
- Blocks raw strings

### CI-Time
- Validation script checks all rules
- Snapshot hash validates structure
- Drift detection blocks merge

### Runtime
- Kernel is read-only
- No runtime string construction
- Validation throws on invalid

---

**This document is FROZEN. Changes require v3.0.0.**

