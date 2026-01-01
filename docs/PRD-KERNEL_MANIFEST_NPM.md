## Kernel Manifest Metadata Governance Layer (Executable)

**Project Code:** KERNEL-MANIFEST-NPM-001
**Parent PRD:** PRD-KERNEL_NPM.md
**ADR:** [ADR-001-MANIFEST-RESOLVER-PLACEMENT](../architecture/kernel/ADR-001-MANIFEST-RESOLVER-PLACEMENT.md)
**Status:** ✅ IMPLEMENTED
**Version:** 1.2.0
**Date:** 2025-12-31
**Verified:** 2026-01-01
**Migration:** `20251231_kernel_manifest_governance_layer`
**Priority:** P0-CRITICAL
**Owner:** Nexus Canon / AI-BOS
**Scope:** L1–L3 Runtime Governance (derived from L0 Kernel)
**Phase:** P1 (Executable Governance)

---

## 1. Objective (Why this exists)

Establish the **Manifest Metadata Layer** as the **Operational Law Book** that:

- Converts **L0 Kernel (Truth)** into **runtime-enforceable governance**
- Prevents semantic ambiguity (_Plant = biological asset vs factory_)
- Ensures **business definitions always win** over technical naming
- Enforces **CRUD-S, RBAC, ACID, Workflow, Audit** at runtime
- Eliminates schema leakage, hard-coded permissions, and silent drift

> **Kernel defines WHAT exists.
> Manifest defines HOW it may exist, WHERE, WHEN, and by WHOM.**

---

## 2. Non-Goals (Anti-Drift Law)

| ❌ Excluded                 | Reason                          |
| --------------------------- | ------------------------------- |
| No schema inference         | Runtime never “guesses” meaning |
| No DB-as-truth              | DB is execution state only      |
| No business logic in Kernel | Kernel stays constitutional     |
| No raw strings in Manifest  | All refs are Kernel IDs         |
| No bypass of Manifest       | API never touches DB directly   |

---

## 3. Authority & Directionality (Hard Law)

```
L0  Kernel  (@aibos/kernel)        → defines existence
 ↓
L1  Domain Manifest               → restricts business meaning
 ↓
L2  Cluster Manifest              → enforces regulation & workflow
 ↓
L3  Cell Manifest                 → executes per tenant
 ↓
Runtime (Next.js / API / DB)      → MUST comply
```

**Direction is ONE-WAY.**
No downstream layer may redefine or invent meaning.

---

## 4. Business-First Semantic Governance (Critical)

### Example: “Plant”

| Context        | Meaning               | Authority    |
| -------------- | --------------------- | ------------ |
| IFRS / Finance | **Biological Asset**  | IAS 41       |
| Manufacturing  | Factory / Facility    | Ops Manifest |
| UI Label       | “Farm” / “Plantation” | L3 Cell      |

**Rule:**

> **Kernel defines `CONCEPT.BIOLOGICAL_ASSET`.**
> Manifest decides whether UI may _alias_ it as “Plant”.

**No domain may invent `CONCEPT.PLANT`.**

---

## 5. Manifest Metadata Standard (4W1H + Law)

Every Manifest MUST declare:

| Dimension | Mandatory                       |
| --------- | ------------------------------- |
| **What**  | Allowed Kernel Concepts         |
| **Where** | Domain / Cluster / Tenant       |
| **When**  | Workflow states                 |
| **Who**   | RBAC roles                      |
| **How**   | CRUD-S + ACID                   |
| **Why**   | Business / Regulatory reference |

---

## 6. CRUD-S (Upgraded)

### 6.1 CRUD-S Definition

| Operation  | Rule                        |
| ---------- | --------------------------- |
| Create     | Manifest RBAC enforced      |
| Read       | Context-aware               |
| Update     | Immutable fields enforced   |
| **Delete** | **Soft-Delete ONLY**        |
| Restore    | Explicit authority required |

**Hard delete is banned.**

---

## 7. Manifest Registry Tables (✅ Implemented)

### 7.1 `sys_manifests` - Core Manifest Registry

```sql
CREATE TABLE sys_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Layer identification (L1=Domain, L2=Cluster, L3=Cell/Tenant)
  layer TEXT NOT NULL CHECK (layer IN ('L1', 'L2', 'L3')),

  -- Target binding
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('domain', 'cluster', 'tenant')),

  -- Kernel version binding (enforces snapshot compliance)
  kernel_snapshot_id TEXT NOT NULL,

  -- Manifest definition (JSONB)
  definition JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Versioning
  version TEXT NOT NULL DEFAULT '1.0.0' CHECK (version ~ '^\d+\.\d+\.\d+$'),

  -- Activation state
  is_active BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT true,

  -- Soft-delete support (CRUD-S: No hard deletes)
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),

  -- Lineage tracking
  parent_manifest_id UUID REFERENCES sys_manifests(id),
  replaced_by_id UUID REFERENCES sys_manifests(id),

  -- Audit columns
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 7.2 `sys_manifest_allowlist` - Concept Allowlist Cache

```sql
CREATE TABLE sys_manifest_allowlist (
  manifest_id UUID NOT NULL REFERENCES sys_manifests(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL REFERENCES kernel_concept_registry(concept_id),
  can_create BOOLEAN DEFAULT true,
  can_read BOOLEAN DEFAULT true,
  can_update BOOLEAN DEFAULT true,
  can_delete BOOLEAN DEFAULT true,  -- Soft-delete only
  can_restore BOOLEAN DEFAULT false,
  cached_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (manifest_id, concept_id)
);
```

### 7.3 `sys_manifest_policies` - Per-Concept Policy Rules

```sql
CREATE TABLE sys_manifest_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID NOT NULL REFERENCES sys_manifests(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL REFERENCES kernel_concept_registry(concept_id),

  -- CRUD-S RBAC
  crud_create JSONB DEFAULT '[]'::jsonb,
  crud_read JSONB DEFAULT '[]'::jsonb,
  crud_update JSONB DEFAULT '[]'::jsonb,
  crud_delete JSONB DEFAULT '[]'::jsonb,
  crud_restore JSONB DEFAULT '[]'::jsonb,

  -- Integrity constraints
  immutable_fields JSONB DEFAULT '[]'::jsonb,
  required_relations JSONB DEFAULT '[]'::jsonb,

  -- Workflow binding
  workflow_value_set_id TEXT REFERENCES kernel_value_set_registry(value_set_id),
  workflow_initial_state TEXT,
  workflow_transitions JSONB DEFAULT '{}'::jsonb,

  -- Business reference
  business_standard TEXT CHECK (business_standard IN ('IFRS', 'MFRS', 'LOCAL', 'INTERNAL')),
  business_reference TEXT,

  CONSTRAINT uq_manifest_concept_policy UNIQUE (manifest_id, concept_id)
);
```

### 7.4 `sys_manifest_audit` - Immutable Audit Trail

```sql
CREATE TABLE sys_manifest_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID NOT NULL REFERENCES sys_manifests(id),
  action TEXT NOT NULL CHECK (action IN (
    'CREATED', 'ACTIVATED', 'DEACTIVATED', 'UPDATED',
    'SOFT_DELETED', 'RESTORED', 'SUPERSEDED', 'VALIDATED'
  )),
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT DEFAULT 'user',
  authority TEXT NOT NULL,
  authority_manifest_id UUID REFERENCES sys_manifests(id),
  kernel_snapshot_id TEXT NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  request_id UUID,
  ip_address INET,
  user_agent TEXT
);
```

### 7.5 `sys_manifest_violations` - Policy Violation Log

```sql
CREATE TABLE sys_manifest_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID REFERENCES sys_manifests(id),
  concept_id TEXT,
  attempted_operation TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_role TEXT,
  violation_type TEXT NOT NULL CHECK (violation_type IN (
    'UNAUTHORIZED_OPERATION', 'CONCEPT_NOT_IN_ALLOWLIST',
    'IMMUTABLE_FIELD_MODIFIED', 'REQUIRED_RELATION_MISSING',
    'INVALID_WORKFLOW_TRANSITION', 'SNAPSHOT_MISMATCH',
    'HARD_DELETE_ATTEMPTED', 'MANIFEST_BYPASS_ATTEMPTED'
  )),
  violation_details JSONB DEFAULT '{}'::jsonb,
  was_blocked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### 7.6 Helper Functions (✅ Implemented)

| Function                                                    | Purpose                               |
| ----------------------------------------------------------- | ------------------------------------- |
| `get_active_manifest(layer, target_id)`                     | Retrieve active manifest for a target |
| `manifest_allows_concept(manifest_id, concept_id)`          | Check if concept is in allowlist      |
| `manifest_can(manifest_id, concept_id, operation, role_id)` | Check CRUD-S permission               |
| `validate_manifest_snapshot(manifest_id)`                   | Verify kernel snapshot compliance     |
| `log_manifest_audit(...)`                                   | Record audit events                   |
| `log_manifest_violation(...)`                               | Record policy violations              |

### 7.7 Triggers (✅ Implemented)

| Trigger                                | Purpose                         |
| -------------------------------------- | ------------------------------- |
| `trg_sys_manifests_updated_at`         | Auto-update timestamp on change |
| `trg_sys_manifest_policies_updated_at` | Auto-update timestamp on change |
| `trg_sys_manifests_audit`              | Auto-audit all manifest changes |

---

## 8. Manifest Definition (Type-Safe)

```ts
/** Manifest layer hierarchy */
type ManifestLayer = "L1" | "L2" | "L3";
type TargetType = "domain" | "cluster" | "tenant";

interface Manifest {
  /** Manifest identity */
  id: string;
  layer: ManifestLayer;
  target_id: string;
  target_type: TargetType;

  /** Kernel binding (CRITICAL) */
  kernel_snapshot_id: string;
  version: string; // semver

  /** Activation state */
  is_active: boolean;
  is_current: boolean;

  /** Concept allowlist */
  allowlist: ConceptId[];

  /** Per-concept policies */
  policies: {
    [C in ConceptId]?: {
      crud: {
        create: RoleId[];
        read: RoleId[];
        update: RoleId[];
        delete: RoleId[]; // soft-delete only
        restore?: RoleId[];
      };

      integrity: {
        immutable_fields: string[];
        required_relations: ConceptId[];
      };

      workflow: {
        states: ValueSetId;
        initial: ValueId;
        transitions: Record<ValueId, ValueId[]>;
      };

      business_reference?: {
        standard: "IFRS" | "MFRS" | "LOCAL" | "INTERNAL";
        reference: string; // IAS 41, IAS 16, etc.
      };
    };
  };

  /** Soft-delete support */
  deleted_at?: string;
  deleted_by?: string;
}
```

---

## 9. Runtime Enforcement (Next.js + API)

### 9.1 Next.js Middleware

```ts
export async function middleware(req) {
  const ctx = resolveContext(req);
  const manifest = await loadManifest(ctx);

  enforceManifest(manifest, ctx, req);
}
```

### 9.2 API Handler (No Bypass)

```ts
if (!manifest.can(user, "create", CONCEPT.INVOICE)) {
  throw new ForbiddenError();
}
```

**Controllers NEVER check roles directly.**

---

## 10. ACID Enforcement

| Principle   | How Manifest Enforces         |
| ----------- | ----------------------------- |
| Atomicity   | All related concepts required |
| Consistency | Kernel snapshot match         |
| Isolation   | Per-tenant context            |
| Durability  | Audit + soft delete           |

---

## 11. Audit Law (Why Matters)

Every action records:

- Actor
- Concept
- Manifest ID
- Authority
- Snapshot ID

> **We audit “WHY it was allowed”, not just who clicked.**

---

## 12. Definition of Done (Binary)

| Requirement                  | Pass | Notes                                             |
| ---------------------------- | ---- | ------------------------------------------------- |
| No raw role checks in code   | ☐    | Pending: Runtime integration                      |
| No hard deletes              | ✅   | `deleted_at` soft-delete implemented              |
| Kernel snapshot enforced     | ✅   | `validate_manifest_snapshot()` function           |
| Business semantics explicit  | ✅   | `business_standard`, `business_reference` columns |
| Next.js middleware active    | ☐    | Pending: Middleware implementation                |
| API blocked without manifest | ☐    | Pending: API guard implementation                 |
| RLS policies enabled         | ✅   | All 5 tables have RLS                             |
| Audit trail auto-logging     | ✅   | `trg_sys_manifests_audit` trigger                 |
| Violation logging            | ✅   | `sys_manifest_violations` table                   |

---

## 13. Final Law (This is the System)

> **Kernel is never wrong.
> Manifest may be wrong — and is auditable.
> Runtime is guilty until proven compliant.**

This closes the loop.
No leak. No ambiguity. No drift.

---

---

## 14. Implementation Status

### ✅ Completed (2025-12-31 / 2026-01-01)

1. **Database Schema** - All 5 tables created with RLS
2. **Helper Functions** - 6 functions for manifest operations
3. **Triggers** - Auto-audit and timestamp management
4. **Indexes** - Performance optimized queries
5. **Seed Data** - VPM Domain Manifest (L1) created
6. **Zod Schema** - `packages/kernel/src/manifest.ts` with:
   - `ManifestLayerSchema` (L1/L2/L3)
   - `CrudPermissionSchema` (CRUD-S roles)
   - `IntegrityConstraintSchema` (immutable_fields, required_relations)
   - `WorkflowDefinitionSchema` (states, transitions, requires_comment)
   - `BusinessReferenceSchema` (IFRS/MFRS/LOCAL/INTERNAL)
   - `ConceptPolicySchema` (per-concept governance)
   - `ManifestDefinitionSchema` (the JSONB definition)
   - `ManifestSchema` (full DB row)
   - `ManifestCreateInputSchema` (for creation)
   - Helper functions: `validateManifest()`, `isConceptAllowed()`, `canPerformOperation()`, `isValidTransition()`
7. **Manifest Resolver** - `apps/portal/lib/manifest-resolver.ts` with:
   - `ManifestResolver` singleton class with LRU cache
   - L1→L2→L3 hierarchical resolution
   - Allowlist intersection (restrictive merging)
   - Policy deep merging with override semantics
   - `ResolvedManifest` with helper methods: `isAllowed()`, `getPolicy()`, `canPerform()`, `getWorkflow()`, `isValidTransition()`
   - Convenience wrappers: `resolveManifest()`, `isOperationAllowed()`
8. **Manifest Guard** - `apps/portal/lib/manifest-guard.ts` with:
   - `ManifestGuard` class for API-level enforcement
   - Route-to-concept mapping (7 concepts mapped)
   - HTTP method to CRUD-S operation mapping
   - Request context extraction from headers
   - 403 Forbidden response with `MANIFEST_VIOLATION` code
9. **Next.js Middleware** - `apps/portal/middleware.ts` updated:
   - Integrated `manifestGuardMiddleware` for API routes
   - Matcher expanded to include `/api/:path*`
   - Exempt paths: `/api/health`, `/api/status`, `/api/auth`, `/api/aibos-css`

### 🔲 Pending

1. UI "Manifest Inspector" (business-readable) - P2

---

## 15. Seed Data Reference

**VPM Domain Manifest (L1)** - Created on migration:

```json
{
  "layer": "L1",
  "target_id": "VPM",
  "target_type": "domain",
  "allowlist": [
    "CONCEPT_INVOICE",
    "CONCEPT_VENDOR",
    "CONCEPT_PAYMENT",
    "CONCEPT_CASE",
    "CONCEPT_CLAIM"
  ]
}
```
