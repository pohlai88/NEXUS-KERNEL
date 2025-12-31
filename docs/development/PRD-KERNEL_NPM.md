# PRD — AI-BOS Kernel NPM Package (SDK-Only SSOT)

**Project Code:** KERNEL-NPM-001
**Status:** APPROVED
**Version:** 1.0.0
**Date:** 2025-12-31
**Priority:** P0-CRITICAL
**Owner:** Nexus Canon / AI-BOS
**Scope:** L0 Kernel (Metadata Constitution)

---

## 1. Objective

Establish **`@aibos/kernel`** as a **public NPM package** that serves as the **single source of truth (SSOT)** for all platform metadata, eliminating semantic drift across:

- Frontend
- Backend
- Database
- Workflows
- AI / IDE-generated code

**The Kernel defines what exists.**
All downstream systems may **only derive, restrict, or execute** what the Kernel defines.

---

## 2. Non-Goals (Explicit)

| ❌ Excluded                | Reason                                                       |
| -------------------------- | ------------------------------------------------------------ |
| No CLI tooling             | MCP handles enforcement                                      |
| No domain logic            | Vendor → `@nexus/canon-vendor`, Claim → `@nexus/canon-claim` |
| No workflow orchestration  | Belongs to L2                                                |
| No runtime database writes | Kernel is read-only SDK                                      |
| No tenant-specific logic   | Belongs to L3                                                |

---

## 3. Architectural Principles (Hard Law)

### 3.1 Kernel is L0 (Constitution Layer)

- Immutable by default
- Rare-change, versioned, audited
- No downstream redefinition

### 3.2 Directionality is ONE-WAY

```
┌─────────────────────────────────────────────────────────┐
│           TRUTH FLOW (NEVER REVERSED)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   @aibos/kernel (NPM Package)                          │
│   ════════════════════════════                          │
│            │                                            │
│            │ generates                                  │
│            ▼                                            │
│   registry.snapshot.json                                │
│            │                                            │
│            │ seeds/validates                            │
│            ▼                                            │
│   Database (runtime state, NEVER authoritative)        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**⚠️ CRITICAL:** Database is **validated against** snapshot. Database is **NEVER** the source of truth.

### 3.3 No Redefinition Rule

| Layer      | May Do                             | May NOT Do               |
| ---------- | ---------------------------------- | ------------------------ |
| L0 Kernel  | Define concepts, values, identity  | N/A (this is the source) |
| L1 Domain  | Restrict usage, define permissions | Invent new concepts      |
| L2 Cluster | Define workflows, approvals        | Rename semantics         |
| L3 Cell    | Execute, render, log               | Modify meaning           |

> **⚠️ L0 SCOPE BOUNDARY:** Kernel (L0) defines existence only. Domain, Cluster, and Cell layers may restrict or execute Kernel definitions but may NEVER extend or redefine them. No domain logic (Finance, Vendor, Claim), workflow logic, scoring/risk logic, or tenant logic belongs in Kernel.

### 3.5 VPM (Vendor/Canon Package Manager) Architecture

Domain logic lives in VPM packages under `packages/vpm/`:

```
packages/
├── kernel/                    # L0: @aibos/kernel (Constitutional)
└── vpm/
    ├── canon-vendor/          # L1/L3: @nexus/canon-vendor
    │   └── src/
    │       ├── status.ts      # VendorStatus, VendorType (createStatusSet)
    │       └── schemas.ts     # VendorPayloadSchema (Zod)
    └── canon-claim/           # L1: @nexus/canon-claim
        └── src/
            ├── status.ts      # ClaimCategory, ClaimStatus
            ├── schemas.ts     # EmployeeClaimSchema
            └── policies.ts    # CLAIM_POLICY_LIMITS (domain policy)
```

**VPM packages depend on Kernel, never the reverse.**

### 3.4 No Raw Identifiers (Comprehensive Ban)

> **RULE:** No string literals, template literals, or computed strings representing `CONCEPT_*`, `VALUESET_*`, or `VALUE_*` identifiers are permitted anywhere in the codebase.

```typescript
// ❌ FORBIDDEN - String literal
const type = "CONCEPT_INVOICE";

// ❌ FORBIDDEN - Template literal
const set = `VALUESET_${name}`;

// ❌ FORBIDDEN - String concatenation
const val = "VALUE_" + code;

// ❌ FORBIDDEN - Computed property
const x = obj["CONCEPT_VENDOR"];

// ✅ REQUIRED - Type-safe import ONLY
import { CONCEPT, VALUESET, VALUE } from "@aibos/kernel";
const type = CONCEPT.INVOICE;
const set = VALUESET.DOCUMENT_TYPE;
const val = VALUE.DOCUMENT_TYPE.INVOICE;
```

---

## 4. Current State Analysis

### 4.1 Existing Registry (Supabase MCP Validated)

| Registry                    | Rows   | Status    |
| --------------------------- | ------ | --------- |
| `kernel_concept_registry`   | **30** | ✅ Active |
| `kernel_value_set_registry` | **12** | ✅ Active |
| `kernel_value_set_values`   | **62** | ✅ Active |

### 4.2 Current Concepts (30 total)

| Category         | Count | Concepts                                                                                           |
| ---------------- | ----- | -------------------------------------------------------------------------------------------------- |
| **ENTITY**       | 12    | BANK, CASE, CLAIM, COMPANY, COUNTRY, CURRENCY, DOCUMENT, EXCEPTION, INVOICE, PARTY, RATING, VENDOR |
| **ATTRIBUTE**    | 6     | APPROVAL_LEVEL, IDENTITY, PAYMENT_METHOD, PRIORITY, RISK, STATUS                                   |
| **OPERATION**    | 8     | APPROVAL, AUDIT, DOCUMENT_REQUEST, ESCALATION, ONBOARDING, PAYMENT, REJECTION, WORKFLOW            |
| **RELATIONSHIP** | 4     | GROUP_MEMBERSHIP, INVOICE_VENDOR_LINK, RELATIONSHIP, VENDOR_COMPANY_LINK                           |

### 4.3 Current Value Sets (12 total, 62 values)

| Value Set ID                        | Values | Jurisdiction |
| ----------------------------------- | ------ | ------------ |
| `VALUESET_GLOBAL_APPROVAL_ACTION`   | 5      | GLOBAL       |
| `VALUESET_GLOBAL_AUDIT_EVENT_TYPE`  | 7      | GLOBAL       |
| `VALUESET_GLOBAL_COUNTRIES`         | 4      | GLOBAL       |
| `VALUESET_GLOBAL_CURRENCIES`        | 5      | GLOBAL       |
| `VALUESET_GLOBAL_DOCUMENT_TYPE`     | 9      | GLOBAL       |
| `VALUESET_GLOBAL_IDENTITY_TYPE`     | 5      | GLOBAL       |
| `VALUESET_GLOBAL_PARTY_TYPE`        | 5      | GLOBAL       |
| `VALUESET_GLOBAL_PRIORITY_LEVEL`    | 4      | GLOBAL       |
| `VALUESET_GLOBAL_RELATIONSHIP_TYPE` | 4      | GLOBAL       |
| `VALUESET_GLOBAL_RISK_FLAG`         | 5      | GLOBAL       |
| `VALUESET_GLOBAL_STATUS_GENERAL`    | 4      | GLOBAL       |
| `VALUESET_GLOBAL_WORKFLOW_STATE`    | 5      | GLOBAL       |

---

## 5. Source of Truth Definition

### 5.1 Registry Source (Authoritative)

All truth originates from:

```
packages/kernel/src/
├── concepts.ts              # CONCEPT const object (30 concepts)
├── values.ts                # VALUESET + VALUE const objects (12 + 62)
├── registry.ts              # Runtime validation helpers
└── registry.snapshot.json   # Generated snapshot (version identity)
```

> **⚠️ CANONICAL ARTIFACT:** The snapshot file is `registry.snapshot.json`. This is the ONLY valid snapshot file name. Any other name is invalid.

### 5.2 Generated Artifacts (NEVER Edited Manually)

| Artifact                 | Location            | Purpose             |
| ------------------------ | ------------------- | ------------------- |
| `dist/`                  | Published to npm    | Compiled JS + types |
| `registry.snapshot.json` | Embedded in package | Version identity    |
| SQL seeds                | Generated on demand | DB seeding via MCP  |

### 5.3 Database Role (Validated, Not Authoritative)

```
┌─────────────────────────────────────────────────────────┐
│                  DATABASE IS RUNTIME STATE              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  • Stores current operational data                     │
│  • Validated AGAINST @aibos/kernel snapshot            │
│  • NEVER the source of truth                           │
│  • CI fails if DB diverges from snapshot               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Package Specification

### 6.1 Package Identity

```json
{
  "name": "@aibos/kernel",
  "version": "1.0.0",
  "description": "AIBOS Kernel - The Business Constitution (L0 SSOT)",
  "private": false,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "registry.snapshot.json", "README.md", "CHANGELOG.md"],
  "keywords": ["kernel", "aibos", "nexus", "ssot", "governance"],
  "license": "MIT"
}
```

### 6.2 Package Exports

```typescript
// @aibos/kernel v1.0.0
import {
  // L0 Concepts (immutable)
  CONCEPT, // 30 concept IDs as typed const
  type ConceptId, // Union type of all concept IDs

  // L0 Value Sets (immutable)
  VALUESET, // 12 value set IDs as typed const
  VALUE, // 62 values organized by value set
  type ValueSetId, // Union type of all value set IDs

  // Runtime helpers
  KernelRegistry, // Singleton for runtime validation
  kernelRegistry, // Pre-instantiated singleton

  // Validation utilities
  CanonId, // Zod schema for ID validation
  createStatusSet, // Status set factory
  validateOrThrow, // Validation helper
  CanonError, // Error class

  // Snapshot
  KERNEL_VERSION, // "1.0.0"
  SNAPSHOT_ID, // Content hash for CI validation
} from "@aibos/kernel";
```

### 6.3 Folder Structure (SDK-Only, NO CLI)

```
packages/kernel/
├── package.json              # @aibos/kernel v1.0.0
├── tsconfig.json             # Development config
├── tsconfig.build.json       # Production build (emit) [TO CREATE]
├── README.md                 # Package documentation
├── CHANGELOG.md              # Version history [TO CREATE]
├── registry.snapshot.json    # Generated snapshot [TO CREATE]
├── src/
│   ├── index.ts              # Main exports ✅ EXISTS
│   ├── concepts.ts           # CONCEPT const object [TO CREATE]
│   ├── values.ts             # VALUESET + VALUE const objects [TO CREATE]
│   ├── concept.ts            # Runtime helpers (defineConcept, registerValueSet) ✅ EXISTS
│   ├── version.ts            # KERNEL_VERSION + SNAPSHOT_ID [TO CREATE]
│   ├── canonId.ts            # CanonId Zod schema ✅ EXISTS
│   ├── status.ts             # Status set factory ✅ EXISTS
│   ├── schemaHeader.ts       # Schema header for JSONB ✅ EXISTS
│   ├── errors.ts             # CanonError class ✅ EXISTS
│   ├── zod.ts                # Validation utilities ✅ EXISTS
│   └── design_system.ts      # Design system tokens ✅ EXISTS
└── dist/                     # Built output (gitignored)
```

**⚠️ NOTE:** No `cli/` folder. MCP handles all enforcement.

---

## 7. Enforcement Model (MCP-First, No CLI)

### 7.1 Compile-Time (IDE / TypeScript)

| Check               | Enforcement |
| ------------------- | ----------- |
| Unknown concept     | Type error  |
| Unknown value       | Type error  |
| Wrong value for set | Type error  |

```typescript
// ✅ Compiles
const c = CONCEPT.INVOICE; // type: "CONCEPT_INVOICE"

// ❌ Type error: Property 'FAKE' does not exist
const c = CONCEPT.FAKE;
```

### 7.2 Lint-Time (ESLint)

**Rule:** `@aibos/no-kernel-string-literals`

```typescript
// ❌ ESLint error
const type = "CONCEPT_INVOICE";
const set = `VALUESET_${name}`;

// ✅ Passes
import { CONCEPT } from "@aibos/kernel";
const type = CONCEPT.INVOICE;
```

### 7.3 CI-Time (GitHub Actions)

| Gate | Check                         | Block Merge |
| ---- | ----------------------------- | ----------- |
| 1    | Snapshot consistency          | Yes         |
| 2    | Drift scan (code vs snapshot) | Yes         |
| 3    | Kernel version match          | Yes         |
| 4    | ESLint (no raw strings)       | Yes         |

### 7.4 MCP-Time (Supabase MCP)

| Tool                            | Purpose                      |
| ------------------------------- | ---------------------------- |
| `mcp_supabase2_execute_sql`     | Validate DB matches snapshot |
| `mcp_supabase2_apply_migration` | Apply generated seeds        |
| `mcp_supabase2_get_advisors`    | Audit FK/RLS integrity       |

### 7.5 DRY Separation (Runtime vs Enforcement)

> **CRITICAL:** The `@aibos/kernel` package is runtime SDK ONLY. Enforcement tooling lives OUTSIDE the package.

| Component       | Location                       | Purpose                              |
| --------------- | ------------------------------ | ------------------------------------ |
| `@aibos/kernel` | Published NPM                  | Runtime constants, types, validation |
| ESLint plugin   | `packages/eslint-plugin-canon` | Lint-time drift prevention           |
| CI scripts      | `.github/workflows/`           | Build-time gates                     |
| MCP workflows   | IDE/terminal                   | Runtime DB validation                |

### 7.6 Package Namespace Strategy

> **IMPORTANT:** The tooling and runtime packages use different namespaces intentionally.

| Namespace  | Packages                                           | Purpose                              |
| ---------- | -------------------------------------------------- | ------------------------------------ |
| `@aibos/*` | `@aibos/kernel`                                    | **Public NPM** (external consumers)  |
| `@nexus/*` | `@nexus/eslint-plugin-canon`, `@nexus/cruds`, etc. | **Internal tooling** (monorepo-only) |

**Rationale:**

- `@aibos/kernel` is the constitutional SDK meant for external consumption
- `@nexus/*` packages are internal enforcement/tooling that remain private
- ESLint rule `@nexus/canon/no-kernel-string-literals` enforces `@aibos/kernel` usage
- This separation prevents external dependencies on internal tooling

**The Kernel package MUST NOT contain:**

- ESLint rules or plugins
- CLI executables (`bin` entries)
- MCP scripts or database executors
- Migration runners
- Any code that writes to DB

---

## 8. Version Law (Mechanical Enforcement)

### 8.1 Kernel Version (Immutable Per Release)

```typescript
// packages/kernel/src/version.ts
export const KERNEL_VERSION = "1.0.0" as const;
```

- Defined by NPM package version
- Semantic Versioning enforced
- Breaking changes = major version bump
- **MUST** match `kernel_metadata.kernel_version` in DB

### 8.2 Snapshot Identity (Content Hash)

```typescript
// packages/kernel/src/version.ts
export const SNAPSHOT_ID = "sha256:abc123..." as const; // Deterministic content hash
```

- Computed from: `sha256(JSON.stringify({concepts, valueSets, values}))`
- Changes when ANY concept/value changes
- **MUST** match `kernel_metadata.snapshot_id` in DB

### 8.3 DB Compatibility Gate (CI FAILS IF NOT MET)

> **⚠️ INTEGRITY RULE:** `kernel_metadata` must have **exactly one active row** enforced by unique constraint on `is_current = true` or PK `id = 1`. Multiple active rows = data integrity violation.

```sql
-- CI gate query (via Supabase MCP)
-- This query MUST return exactly 1 row, otherwise CI FAILS
SELECT 1 FROM kernel_metadata
WHERE kernel_version = '1.0.0'
  AND snapshot_id = 'sha256:abc123...';

-- FAILURE CONDITIONS (any = CI blocked):
-- 1. kernel_metadata table does not exist
-- 2. No row matches both version AND snapshot_id
-- 3. Multiple rows exist (data integrity violation)
```

### 8.4 Version Law Violations

| Condition                            | Result       | Resolution                 |
| ------------------------------------ | ------------ | -------------------------- |
| Package version ≠ DB version         | **CI FAILS** | Run migration to update DB |
| Package snapshot_id ≠ DB snapshot_id | **CI FAILS** | Regenerate DB from package |
| DB has concepts not in package       | **CI FAILS** | DB is drifted, must reset  |
| Package has concepts not in DB       | **CI FAILS** | Run seeding migration      |

---

## 9. Downstream Usage Rules

### 9.1 Domain / Cluster / Cell Restrictions

| Layer      | May Reference      | May Define                   | May NOT Do       |
| ---------- | ------------------ | ---------------------------- | ---------------- |
| L1 Domain  | All Kernel exports | Allowed subsets, permissions | Invent concepts  |
| L2 Cluster | All Kernel exports | Workflows, approvals         | Rename semantics |
| L3 Cell    | All Kernel exports | UI, API, logs                | Modify meaning   |

### 9.2 Context Enforcement

All runtime usage must resolve context:

```typescript
interface RuntimeContext {
  domain_id: string;
  cluster_id: string;
  cell_id: string;
  tenant_id: string;
  actor_role: string;
}
```

Kernel + Domain rules validate context at write-time.

---

## 10. Definition of Done (DoD)

### 10.1 Package Deliverables (Binary Pass/Fail)

| Deliverable       | Requirement                                                  | Validation           | Pass/Fail |
| ----------------- | ------------------------------------------------------------ | -------------------- | --------- |
| `npm pack` output | Contains ONLY `dist/`, `registry.snapshot.json`, `README.md` | `npm pack --dry-run` | ☐         |
| No CLI artifacts  | Zero `bin` entries in package.json                           | JSON inspection      | ☐         |
| No domain code    | Zero L1/L2/L3 logic in src/                                  | Code review          | ☐         |
| Snapshot embedded | `registry.snapshot.json` exists in package root              | File check           | ☐         |
| Types included    | `dist/index.d.ts` exists                                     | File check           | ☐         |

### 10.2 Enforcement Active (Binary Pass/Fail)

| Gate                     | Requirement             | Validation | Pass/Fail |
| ------------------------ | ----------------------- | ---------- | --------- |
| ESLint drift rule        | Error mode (NOT warn)   | CI log     | ☐         |
| CI drift check           | Blocks merge on failure | PR status  | ☐         |
| Snapshot mismatch        | Blocks merge on failure | CI log     | ☐         |
| Version mismatch         | Blocks merge on failure | CI log     | ☐         |
| Raw identifier grep scan | Returns 0 matches       | CI script  | ☐         |

### 10.3 Adoption Proof (Binary Pass/Fail)

| Metric                                    | Target       | Validation      | Pass/Fail |
| ----------------------------------------- | ------------ | --------------- | --------- |
| Raw metadata strings in portal            | **= 0**      | ESLint + grep   | ☐         |
| Kernel import coverage                    | **= 100%**   | Static analysis | ☐         |
| Portal build with @aibos/kernel           | **Succeeds** | `pnpm build`    | ☐         |
| At least 1 downstream app zero-raw-string | **Yes**      | CI verification | ☐         |

---

## 11. KPIs (Anti-Drift Metrics — Numeric Only)

### 11.1 CI KPIs (Must Be Zero/100%)

| Metric                            | Target   | Current | Threshold |
| --------------------------------- | -------- | ------- | --------- |
| Drift violations per build        | **0**    | TBD     | = 0       |
| Snapshot mismatches per build     | **0**    | TBD     | = 0       |
| Kernel import coverage            | **100%** | TBD     | = 100%    |
| Raw identifier occurrences        | **0**    | TBD     | = 0       |
| CI gate failures (kernel-related) | **0**    | TBD     | = 0       |

### 11.2 Dev Experience KPIs (Measurable)

| Metric                           | Target        | Measurement                 |
| -------------------------------- | ------------- | --------------------------- |
| IDE autocomplete coverage        | **= 100%**    | All 30 concepts + 62 values |
| Manual code lookup required      | **= 0**       | Developer survey            |
| Type error on invalid identifier | **Immediate** | < 100ms in IDE              |

### 11.3 Runtime KPIs (Numeric Thresholds)

| Metric                               | Target | Threshold |
| ------------------------------------ | ------ | --------- |
| Metadata lookup latency p95          | < 50ms | ≤ 50ms    |
| Production hotfixes to kernel tables | **0**  | = 0       |
| DB drift incidents per quarter       | **0**  | = 0       |
| Kernel registry DB row count drift   | **0**  | = 0       |

---

## 12. Risks & Mitigations

| Risk                    | Impact          | Mitigation                                      |
| ----------------------- | --------------- | ----------------------------------------------- |
| Accidental DB hotfix    | Drift           | Snapshot mismatch CI gate                       |
| Developer bypass ESLint | Drift           | Type-level enforcement                          |
| AI hallucinated codes   | Runtime error   | Compile-time import only                        |
| Kernel bloat            | Complexity      | Strict L0 scope definition                      |
| Scope creep             | Drift           | Non-goals section enforced                      |
| NPM scope unavailable   | Publish blocked | Confirm `@aibos` scope ownership before Phase 5 |

---

## 13. Implementation Plan

### Phase 0: VPM Migration ✅ COMPLETE (2025-12-31)

- [x] Created `@nexus/canon-vendor` package (`packages/vpm/canon-vendor/`)
- [x] Created `@nexus/canon-claim` package (`packages/vpm/canon-claim/`)
- [x] Removed `vendor.ts` and `claim.ts` from kernel
- [x] Updated portal imports to use VPM packages
- [x] Removed unused `@nexus/ui-actions` package
- [x] Verified typecheck passes (7/7 packages)

### Phase 1: Package Infrastructure (30 min) ⏳ PENDING

- [ ] Rename package: `@nexus/kernel` → `@aibos/kernel`
- [ ] Update `package.json` (remove private, add files, version 1.0.0)
- [ ] Create `tsconfig.build.json`
- [ ] Create `registry.snapshot.json` generation script in `/apps/portal/scripts/` (repo tooling, NOT in package)

### Phase 2: Concept/Value Constants (1 hour) ⏳ PENDING

- [ ] Create `src/concepts.ts` (30 concepts from DB)
- [ ] Create `src/values.ts` (12 value sets, 62 values from DB)
- [ ] Create `src/version.ts` (version + snapshot ID)

### Phase 3: Registry Runtime (30 min) ⏳ PENDING

- [ ] Extend `src/concept.ts` with CONCEPT/VALUESET/VALUE const objects
- [ ] Update `src/index.ts` (exports)

### Phase 4: Build & Test (30 min) ⏳ PENDING

- [ ] Build package: `pnpm run build`
- [ ] Test locally: `pnpm add @aibos/kernel@workspace:*`
- [ ] Verify exports work

### Phase 5: Publish (15 min) ⏳ PENDING

- [ ] Verify `@aibos` NPM scope ownership
- [ ] `npm login`
- [ ] `npm publish --access public`

### Phase 6: ESLint Rule (30 min) ✅ COMPLETE

- [x] Create `no-kernel-string-literals` rule in `packages/eslint-plugin-canon`
- [x] Enable in portal ESLint config (error mode)
- [x] Verify CI fails on violations
- [x] Add file-level disables for legitimate exclusions (drift scanner, test fixtures)

---

## 14. MCP Optimization Guide (Verbose)

### 14.1 Supabase MCP — DB Validation

**Before publishing, validate DB matches snapshot:**

```bash
# Step 1: Get current DB state
mcp_supabase2_execute_sql "SELECT concept_id FROM kernel_concept_registry WHERE is_active = true"

# Step 2: Compare with package snapshot
# CI gate: count must equal 30

# Step 3: Validate value sets
mcp_supabase2_execute_sql "SELECT value_set_id FROM kernel_value_set_registry WHERE is_active = true"
# CI gate: count must equal 12

# Step 4: Validate values
mcp_supabase2_execute_sql "SELECT value_id FROM kernel_value_set_values WHERE is_active = true"
# CI gate: count must equal 62
```

**After publishing, seed DB from snapshot:**

```bash
# Generate idempotent migration from snapshot
mcp_supabase2_apply_migration {
  name: "kernel_v1_0_0_snapshot",
  query: "INSERT INTO kernel_metadata (kernel_version, snapshot_id, applied_at) VALUES ('1.0.0', 'sha256:...', NOW()) ON CONFLICT DO NOTHING;"
}
```

### 14.2 Next.js MCP — Runtime Validation

**Verify portal uses Kernel correctly:**

```bash
# Step 1: Get all routes
mcp_next-devtools_nextjs_call { port: 9000, toolName: "get_routes" }

# Step 2: Check for errors
mcp_next-devtools_nextjs_call { port: 9000, toolName: "get_errors" }
# Target: 0 errors

# Step 3: Validate import coverage
# Run ESLint with no-kernel-string-literals rule
```

---

## 15. Release Checklist

| Step | Action                                           | Status | Notes               |
| ---- | ------------------------------------------------ | ------ | ------------------- |
| 0    | VPM Migration (extract domain logic)             | ✅     | Done 2025-12-31     |
| 1    | Rename package @nexus/kernel → @aibos/kernel     | ✅     | Done 2025-12-31     |
| 2    | Create concepts.ts (30 CONCEPT consts)           | ✅     | Done 2025-12-31     |
| 3    | Create values.ts (12 VALUESET + 62 VALUE consts) | ✅     | Done 2025-12-31     |
| 4    | Create version.ts (KERNEL_VERSION, SNAPSHOT_ID)  | ✅     | Done 2025-12-31     |
| 5    | Generate registry.snapshot.json                  | ✅     | Done 2025-12-31     |
| 6    | Build package                                    | ✅     | Done 2025-12-31     |
| 7    | Test locally in portal                           | ✅     | Done 2025-12-31     |
| 8    | Verify @aibos NPM scope ownership                | ⏳     | BLOCKER for publish |
| 9    | Publish to npm                                   | ⏳     | Blocked by #8       |
| 10   | Update portal dependency                         | ⏳     | Blocked by #9       |
| 11   | Enable ESLint rule                               | ✅     | Done 2025-12-31     |
| 12   | Merge to main                                    | ⏳     |                     |
| 13   | Tag release                                      | ⏳     |                     |

---

## 16. Current State Summary (2025-12-31)

### Package Structure

| Package                      | Location                        | Status     | Purpose                    |
| ---------------------------- | ------------------------------- | ---------- | -------------------------- |
| `@aibos/kernel`              | `packages/kernel/`              | ✅ Active  | L0 Constitution (SDK-only) |
| `@nexus/canon-vendor`        | `packages/vpm/canon-vendor/`    | ✅ Active  | L1/L3 Vendor domain        |
| `@nexus/canon-claim`         | `packages/vpm/canon-claim/`     | ✅ Active  | L1 Claim domain            |
| `@nexus/cruds`               | `packages/cruds/`               | ✅ Active  | DB utilities               |
| `@nexus/eslint-plugin-canon` | `packages/eslint-plugin-canon/` | ✅ Active  | ESLint rules (v0.2.0)      |
| `@nexus/ui-actions`          | ~~packages/ui-actions/~~        | ❌ Deleted | Unused, caused noise       |

### Kernel Files Status

| File                     | Status     | Description                           |
| ------------------------ | ---------- | ------------------------------------- |
| `src/index.ts`           | ✅ EXISTS  | Main exports                          |
| `src/canonId.ts`         | ✅ EXISTS  | CanonId Zod schema                    |
| `src/concept.ts`         | ✅ EXISTS  | Runtime helpers (defineConcept, etc.) |
| `src/status.ts`          | ✅ EXISTS  | createStatusSet factory               |
| `src/errors.ts`          | ✅ EXISTS  | CanonError class                      |
| `src/schemaHeader.ts`    | ✅ EXISTS  | Schema header for JSONB               |
| `src/zod.ts`             | ✅ EXISTS  | Validation utilities                  |
| `src/design_system.ts`   | ✅ EXISTS  | Design system tokens                  |
| `src/concepts.ts`        | ❌ MISSING | CONCEPT const object (30)             |
| `src/values.ts`          | ❌ MISSING | VALUESET + VALUE const objects        |
| `src/version.ts`         | ❌ MISSING | KERNEL_VERSION, SNAPSHOT_ID           |
| `registry.snapshot.json` | ❌ MISSING | Embedded snapshot                     |
| `tsconfig.build.json`    | ❌ MISSING | Production build config               |

### DB Registry Status (Supabase)

| Registry                    | Rows   | Status    |
| --------------------------- | ------ | --------- |
| `kernel_concept_registry`   | **30** | ✅ Active |
| `kernel_value_set_registry` | **12** | ✅ Active |
| `kernel_value_set_values`   | **62** | ✅ Active |

---

## 17. Final Statement

> **If it is not defined in `@aibos/kernel`, it does not exist in AI-BOS.**

This PRD formalizes that law.

---

## Appendix A: Value Registry Reference

### A.1 Approval Action (5 values)

| Key       | Value           | Label     |
| --------- | --------------- | --------- |
| SUBMITTED | `APP_SUBMITTED` | Submitted |
| APPROVED  | `APP_APPROVED`  | Approved  |
| REJECTED  | `APP_REJECTED`  | Rejected  |
| RETURNED  | `APP_RETURNED`  | Returned  |
| CANCELLED | `APP_CANCELLED` | Cancelled |

### A.2 Audit Event Type (7 values)

| Key     | Value         | Label   |
| ------- | ------------- | ------- |
| CREATE  | `AUD_CREATE`  | Create  |
| UPDATE  | `AUD_UPDATE`  | Update  |
| DELETE  | `AUD_DELETE`  | Delete  |
| RESTORE | `AUD_RESTORE` | Restore |
| APPROVE | `AUD_APPROVE` | Approve |
| REJECT  | `AUD_REJECT`  | Reject  |
| LOGIN   | `AUD_LOGIN`   | Login   |

### A.3 Countries (4 values)

| Key            | Value        | Label          |
| -------------- | ------------ | -------------- |
| MALAYSIA       | `COUNTRY_MY` | Malaysia       |
| SINGAPORE      | `COUNTRY_SG` | Singapore      |
| UNITED_STATES  | `COUNTRY_US` | United States  |
| UNITED_KINGDOM | `COUNTRY_GB` | United Kingdom |

### A.4 Currencies (5 values)

| Key | Value          | Label             |
| --- | -------------- | ----------------- |
| USD | `CURRENCY_USD` | US Dollar         |
| EUR | `CURRENCY_EUR` | Euro              |
| MYR | `CURRENCY_MYR` | Malaysian Ringgit |
| SGD | `CURRENCY_SGD` | Singapore Dollar  |
| GBP | `CURRENCY_GBP` | British Pound     |

### A.5 Document Type (9 values)

| Key                  | Value          | Label                |
| -------------------- | -------------- | -------------------- |
| INVOICE              | `DOC_INVOICE`  | Invoice              |
| PURCHASE_ORDER       | `DOC_PO`       | Purchase Order       |
| GRN                  | `DOC_GRN`      | Goods Received Note  |
| DELIVERY_NOTE        | `DOC_DN`       | Delivery Note        |
| CREDIT_NOTE          | `DOC_CN`       | Credit Note          |
| CONTRACT             | `DOC_CONTRACT` | Contract             |
| PROOF_OF_DELIVERY    | `DOC_POD`      | Proof of Delivery    |
| STATEMENT_OF_ACCOUNT | `DOC_SOA`      | Statement of Account |
| OTHER                | `DOC_OTHER`    | Other                |

### A.6 Identity Type (5 values)

| Key             | Value       | Label           |
| --------------- | ----------- | --------------- |
| EMAIL           | `ID_EMAIL`  | Email           |
| PHONE           | `ID_PHONE`  | Phone           |
| REGISTRATION_NO | `ID_REG_NO` | Registration No |
| TAX_ID          | `ID_TAX_ID` | Tax ID          |
| UUID            | `ID_UUID`   | UUID            |

### A.7 Party Type (5 values)

| Key    | Value          | Label  |
| ------ | -------------- | ------ |
| TENANT | `PARTY_TENANT` | Tenant |
| CLIENT | `PARTY_CLIENT` | Client |
| VENDOR | `PARTY_VENDOR` | Vendor |
| USER   | `PARTY_USER`   | User   |
| AGENT  | `PARTY_AGENT`  | Agent  |

### A.8 Priority Level (4 values)

| Key    | Value        | Label  |
| ------ | ------------ | ------ |
| LOW    | `PRI_LOW`    | Low    |
| MEDIUM | `PRI_MEDIUM` | Medium |
| HIGH   | `PRI_HIGH`   | High   |
| URGENT | `PRI_URGENT` | Urgent |

### A.9 Relationship Type (4 values)

| Key        | Value            | Label      |
| ---------- | ---------------- | ---------- |
| CLIENT_OF  | `REL_CLIENT_OF`  | Client Of  |
| VENDOR_OF  | `REL_VENDOR_OF`  | Vendor Of  |
| BELONGS_TO | `REL_BELONGS_TO` | Belongs To |
| MANAGED_BY | `REL_MANAGED_BY` | Managed By |

### A.10 Risk Flag (5 values)

| Key      | Value           | Label    |
| -------- | --------------- | -------- |
| NONE     | `RISK_NONE`     | None     |
| LOW      | `RISK_LOW`      | Low      |
| MEDIUM   | `RISK_MEDIUM`   | Medium   |
| HIGH     | `RISK_HIGH`     | High     |
| CRITICAL | `RISK_CRITICAL` | Critical |

### A.11 Status General (4 values)

| Key       | Value              | Label     |
| --------- | ------------------ | --------- |
| ACTIVE    | `STATUS_ACTIVE`    | Active    |
| INACTIVE  | `STATUS_INACTIVE`  | Inactive  |
| SUSPENDED | `STATUS_SUSPENDED` | Suspended |
| ARCHIVED  | `STATUS_ARCHIVED`  | Archived  |

### A.12 Workflow State (5 values)

| Key       | Value          | Label     |
| --------- | -------------- | --------- |
| DRAFT     | `WF_DRAFT`     | Draft     |
| PENDING   | `WF_PENDING`   | Pending   |
| IN_REVIEW | `WF_IN_REVIEW` | In Review |
| COMPLETED | `WF_COMPLETED` | Completed |
| FAILED    | `WF_FAILED`    | Failed    |
