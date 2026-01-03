# @aibos/kernel

> **The Business Constitution (L0 SSOT)**

[![npm version](https://img.shields.io/npm/v/@aibos/kernel.svg)](https://www.npmjs.com/package/@aibos/kernel)
[![CI](https://github.com/pohlai88/NEXUS-KERNEL/workflows/CI/badge.svg)](https://github.com/pohlai88/NEXUS-KERNEL/actions/workflows/ci.yml)
[![Security Scan](https://github.com/pohlai88/NEXUS-KERNEL/workflows/Security%20Scan/badge.svg)](https://github.com/pohlai88/NEXUS-KERNEL/actions/workflows/security.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-96.81%25-brightgreen)](https://github.com/pohlai88/NEXUS-KERNEL)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Overview

`@aibos/kernel` is the **Single Source of Truth (SSOT)** for all platform metadata in AI-BOS. It defines:

- **182 Concepts** - What business objects exist (Entity, Attribute, Operation, Relationship)
- **72 Value Sets** - Allowed value collections
- **553 Values** - The actual allowed values

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
  // Concepts (181)
  CONCEPT,
  ConceptId,
  CONCEPT_CATEGORY,

  // Value Sets (68)
  VALUESET,
  ValueSetId,

  // Values (307)
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
| ENTITY       | 128   | INVOICE, VENDOR, CLAIM, DOCUMENT, TENANT, ACCOUNT, BANK, CUSTOMER |
| ATTRIBUTE    | 53    | STATUS, PRIORITY, RISK, IDENTITY, CURRENCY, COUNTRY |

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

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Getting Started](./docs/guides/getting-started.md)** - Quick start tutorial
- **[Usage Guide](./docs/guides/usage.md)** - Practical examples and patterns
- **[Architecture](./docs/architecture/overview.md)** - System design and layer model
- **[Glossary](./docs/guides/glossary.md)** - Ubiquitous Language with code references
- **[Contributing](./CONTRIBUTING.md)** - How to contribute
- **[Architecture Decision Records](./docs/adr/README.md)** - Design decisions

## License

MIT
