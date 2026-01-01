# @aibos/kernel

> **The Business Constitution (L0 SSOT)**

[![npm version](https://img.shields.io/npm/v/@aibos/kernel.svg)](https://www.npmjs.com/package/@aibos/kernel)

## Overview

`@aibos/kernel` is the **Single Source of Truth (SSOT)** for all platform metadata in AI-BOS. It defines:

- **31 Concepts** - What business objects exist (Entity, Attribute, Operation, Relationship)
- **12 Value Sets** - Allowed value collections
- **62 Values** - The actual allowed values

**If it's not defined in `@aibos/kernel`, it doesn't exist in AI-BOS.**

## Installation

```bash
npm install @aibos/kernel
# or
pnpm add @aibos/kernel
```

## Usage

```typescript
import {
  // Concepts (31)
  CONCEPT,
  ConceptId,
  CONCEPT_CATEGORY,

  // Value Sets (12)
  VALUESET,
  ValueSetId,

  // Values (62)
  VALUE,

  // Version
  KERNEL_VERSION,
  SNAPSHOT_ID,
} from "@aibos/kernel";

// Type-safe concept usage
const invoiceConcept = CONCEPT.INVOICE; // "CONCEPT_INVOICE"
const vendorConcept = CONCEPT.VENDOR; // "CONCEPT_VENDOR"

// Type-safe value usage
const currency = VALUE.CURRENCIES.MYR; // "CURRENCY_MYR"
const status = VALUE.APPROVAL_ACTION.APPROVED; // "APP_APPROVED"
const country = VALUE.COUNTRIES.MALAYSIA; // "COUNTRY_MY"

// Value set references
const currencySet = VALUESET.CURRENCIES; // "VALUESET_GLOBAL_CURRENCIES"
```

## Architecture

```
L0 Kernel (Constitutional) ← @aibos/kernel
    │
    ├─► L1 Domain Canon    ← @nexus/canon-claim, @nexus/canon-vendor
    │
    ├─► L2 Cluster         ← Workflows, Approvals
    │
    └─► L3 Cell            ← UI, API, Runtime
```

**Truth flows ONE-WAY. Downstream may restrict but never redefine.**

## Exports

### Concepts

| Category     | Count | Examples                              |
| ------------ | ----- | ------------------------------------- |
| ENTITY       | 13    | INVOICE, VENDOR, CLAIM, DOCUMENT, TENANT |
| ATTRIBUTE    | 6     | STATUS, PRIORITY, RISK, IDENTITY      |
| OPERATION    | 8     | APPROVAL, AUDIT, PAYMENT, WORKFLOW    |
| RELATIONSHIP | 4     | GROUP_MEMBERSHIP, VENDOR_COMPANY_LINK |

### Value Sets

| Value Set       | Count | Example Values                |
| --------------- | ----- | ----------------------------- |
| APPROVAL_ACTION | 5     | SUBMITTED, APPROVED, REJECTED |
| CURRENCIES      | 5     | USD, EUR, MYR, SGD, GBP       |
| COUNTRIES       | 4     | MALAYSIA, SINGAPORE, US, UK   |
| DOCUMENT_TYPE   | 9     | INVOICE, PO, GRN, CONTRACT    |
| STATUS_GENERAL  | 4     | ACTIVE, INACTIVE, SUSPENDED   |
| WORKFLOW_STATE  | 5     | DRAFT, PENDING, IN_REVIEW     |

## Validation

```typescript
import {
  validateKernelIntegrity,
  KERNEL_VERSION,
  SNAPSHOT_ID,
} from "@aibos/kernel";

// Throws if counts don't match expected
validateKernelIntegrity();

console.log(`Kernel v${KERNEL_VERSION} (${SNAPSHOT_ID})`);
```

## CI Integration

The `registry.snapshot.json` file is embedded in the package and should be used for:

1. **DB Validation** - Compare DB contents against snapshot
2. **Drift Detection** - CI fails if DB diverges from snapshot
3. **Version Verification** - Ensure `kernel_metadata` table matches

## License

MIT
