# L0 Kernel: Self-Expanding Implementation Strategy

**Version:** 1.0
**Date:** Dec 31, 2025
**Status:** Ready for P1 Execution (Jan 8-15)

---

## Overview

Your L0 Kernel (17 concepts) is locked and governance-enforced. This document outlines the exact workflow to **add P1/P2 concepts without introducing drift or breaking existing features**.

The strategy has 5 pillars:

1. **CONCEPT_COVERAGE_MAP.md** - Feature audit showing gaps
2. **check:l0-drift** - CI validation that detects orphaned concept references
3. **assertConceptExists()** - App-layer validation (prevents silent failures)
4. **Migration-first discipline** - Every concept addition = new SQL migration
5. **No caching policy** - L0 concepts fetched at runtime, never baked into code

---

## Artifacts Created Today

### 1. **CONCEPT_COVERAGE_MAP.md**

**What it is:** Complete audit of Portal features → L0 concepts mapping.

**Key findings:**

- ✅ **P0 Complete:** 15/15 core features covered by 17 L0 concepts
- ⏳ **P1 Gaps:** Claims (3 concepts missing), Cases (3 missing), AP Reconciliation (3 missing), Approvals (2 missing) = **12 new concepts**
- 📅 **P2 Roadmap:** 7 additional concepts for workflow engine + ratings
- **Total L0 expansion:** 17 → 29 → 36+ concepts (phased)

**How to use:**

- Before implementing a feature, check this map
- If concept is marked ❌, it must be added first (via migration)
- Update this map at the start of P1, P2, etc.
- Reference it in sprint planning

**Location:** `docs/development/CONCEPT_COVERAGE_MAP.md`

---

### 2. **check-l0-drift.ts**

**What it is:** CI/validation script that scans Portal code for concept references and cross-checks against L0 Kernel.

**How it works:**

1. Fetches valid concepts from `kernel_concept_registry` (Supabase)
2. Scans all `app/**/*.tsx`, `components/**/*.ts`, `lib/**/*.ts` for patterns:
   - `CONCEPT_NAME` constants
   - `concept("CONCEPT_NAME")` function calls
   - `concept_code: "CONCEPT_NAME"` object references
3. Cross-checks: _Is this concept defined in L0?_
4. Reports gaps + recommendations

**Run it:**

```bash
cd apps/portal
pnpm check:l0-drift

# Machine-readable JSON output
pnpm check:l0-drift --json

# Fail on warnings too (not just errors)
pnpm check:l0-drift --strict
```

**Exit codes:**

- `0` = Clean (no drift)
- `1` = Drift detected (missing concepts)
- `2` = Configuration error (Supabase not reachable)

**In CI/CD:**

```bash
pnpm check:l0-drift --json > reports/l0-drift-$(date +%Y%m%d).json
# Parse JSON to alert on drift
```

**Location:** `apps/portal/scripts/check-l0-drift.ts`

---

### 3. **Turbo Task Integration**

Added to `turbo.json`:

```json
"check:l0-drift": {
  "dependsOn": ["^build"],
  "cache": false,
  "env": ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
}
```

**Run via Turbo:**

```bash
pnpm turbo check:l0-drift
```

---

## Operating Workflow: Adding a P1 Concept

### Phase 1: Plan

1. Check **CONCEPT_COVERAGE_MAP.md** for which concepts are missing
2. Identify which feature(s) require the concept
3. Write spec (1-2 sentences): _"This concept represents [domain entity/attribute/relationship/operation] used by [feature]"_

### Phase 2: Create Migration

1. Create SQL file: `apps/portal/supabase/migrations/20260108_add_claims_concepts.sql`

   ```sql
   -- Add Claims Concepts (P1)
   -- Reason: Enables CONCEPT_CLAIM, CLAIM_CATEGORY, CLAIM_STATUS for Claims feature

   INSERT INTO kernel_concept_registry (code, name, description, concept_type, version, created_at, created_by, is_extensible)
   VALUES
     ('CONCEPT_CLAIM', 'Claim', 'A vendor claim for shortage/quality/damage', 'ENTITY', '1.0.0', now(), 'system', true),
     ('CONCEPT_CLAIM_CATEGORY', 'Claim Category', 'Category of claim (shortage, quality, damaged)', 'ATTRIBUTE', '1.0.0', now(), 'system', true),
     ('CONCEPT_CLAIM_STATUS', 'Claim Status', 'Status of claim (draft, submitted, reviewing, approved, rejected, closed)', 'ATTRIBUTE', '1.0.0', now(), 'system', true);

   INSERT INTO kernel_value_set_registry (code, name, description, is_restricted)
   VALUES
     ('VALUESET_CLAIM_CATEGORIES', 'Claim Categories', 'Valid claim types', false),
     ('VALUESET_CLAIM_STATUS', 'Claim Status Values', 'Valid claim states', false);

   INSERT INTO kernel_value_set_values (value_set_code, code, label, sort_order)
   VALUES
     ('VALUESET_CLAIM_CATEGORIES', 'SHORTAGE', 'Shortage', 1),
     ('VALUESET_CLAIM_CATEGORIES', 'QUALITY', 'Quality Issue', 2),
     ('VALUESET_CLAIM_CATEGORIES', 'DAMAGED', 'Damaged', 3),
     ('VALUESET_CLAIM_STATUS', 'DRAFT', 'Draft', 1),
     ('VALUESET_CLAIM_STATUS', 'SUBMITTED', 'Submitted', 2),
     ('VALUESET_CLAIM_STATUS', 'APPROVED', 'Approved', 5),
     ('VALUESET_CLAIM_STATUS', 'REJECTED', 'Rejected', 4),
     ('VALUESET_CLAIM_STATUS', 'CLOSED', 'Closed', 6);
   ```

2. Review the migration:

   - Concepts use semantic versioning (1.0.0 for new)
   - Values are ordered logically (workflow progression)
   - Description explains the concept
   - `is_extensible` = true allows P2/P3 to add subtypes

3. Deploy:
   ```bash
   cd apps/portal
   supabase db push
   ```

### Phase 3: Verify

1. Check `kernel_concept_registry` has new concepts:

   ```sql
   SELECT code FROM kernel_concept_registry WHERE code LIKE 'CONCEPT_CLAIM%';
   ```

2. Run drift check:
   ```bash
   pnpm check:l0-drift
   ```
   Should return: ✅ Clean

### Phase 4: Implement Feature

1. Create L1 domain policy engine (e.g., `lib/policies/claims-policy.ts`)

   ```typescript
   import { createClaimsPolicy } from "@nexus/kernel";

   export const claimsPolicy = createClaimsPolicy({
     requiredConcepts: ["CONCEPT_CLAIM", "CLAIM_CATEGORY", "CLAIM_STATUS"],
     validateAgainstL0: true, // Always check L0 at runtime
   });
   ```

2. Use in app:

   ```typescript
   // app/claims/[id]/actions.ts
   export async function createClaim(data: ClaimPayload) {
     // Policy validation automatically queries L0
     const isValid = await claimsPolicy.validate(data);
     if (!isValid) throw new Error("Concept mismatch");

     // Create claim...
   }
   ```

3. Run drift check again:
   ```bash
   pnpm check:l0-drift
   ```
   Should still return: ✅ Clean

### Phase 5: Test

1. Unit tests verify concept references:

   ```typescript
   it("should validate CONCEPT_CLAIM exists in L0", async () => {
     const concepts = await supabase
       .from("kernel_concept_registry")
       .select("code")
       .eq("code", "CONCEPT_CLAIM");
     expect(concepts.data).toHaveLength(1);
   });
   ```

2. Run drift check in CI:
   ```bash
   pnpm turbo check:l0-drift
   ```

### Phase 6: Merge

Pull request must:

- ✅ Have new migration (`20260108_add_claims_concepts.sql`)
- ✅ Have updated code referencing concepts
- ✅ Pass `pnpm check:l0-drift`
- ✅ Update CONCEPT_COVERAGE_MAP.md (mark concept as ✅ instead of ❌)
- ✅ Have test confirming concept exists

---

## The 3 Pillars of Governance

### Pillar 1: Data Layer (Enforced by RLS + Schema)

- ✅ **What it does:** PostgreSQL enforces concept existence via foreign keys
- ✅ **Why it matters:** No orphaned concept references in database
- ✅ **Rules:**
  - `kernel_concept_registry.code` is PRIMARY KEY (cannot duplicate)
  - `kernel_concept_version_history.concept_code` has FK → `registry.code`
  - `kernel_value_set_values.value_set_code` has FK → `registry.code`
  - All writes protected by RLS (kernel-admin role only)

### Pillar 2: App Layer (Enforced by assertConceptExists())

- **What it does:** Portal code validates concept existence _before_ using it
- **Why it matters:** Prevents silent failures (e.g., typo in concept name → causes bugs)
- **Implementation:**

  ```typescript
  // Shared guard in lib/kernel/validation.ts
  export async function assertConceptExists(
    conceptCode: string
  ): Promise<void> {
    const { data, error } = await supabase
      .from("kernel_concept_registry")
      .select("code")
      .eq("code", conceptCode);

    if (error || !data?.length) {
      throw new Error(`Concept not found in L0: ${conceptCode}`);
    }
  }

  // Usage in Server Actions
  export async function createClaim(claimData) {
    await assertConceptExists("CONCEPT_CLAIM");
    // Safe to proceed
  }
  ```

### Pillar 3: CI Layer (Enforced by check:l0-drift)

- **What it does:** Detects code that references missing concepts _before_ merge
- **Why it matters:** Prevents shipping broken code
- **Rules:**
  - Every concept reference must exist in L0 at build time
  - If concept is referenced but missing → build fails
  - Report shows exactly which files reference missing concepts

---

## Example: Adding Claims (P1)

**Timeline:** ~2-3 hours (1 person)

### Step 1: Create Migration (15 min)

File: `apps/portal/supabase/migrations/20260108_add_claims_concepts.sql`

```sql
-- Concepts for Claims feature (P1)
INSERT INTO kernel_concept_registry (...) VALUES
  ('CONCEPT_CLAIM', 'Claim', '...', 'ENTITY', ...),
  ('CONCEPT_CLAIM_CATEGORY', 'Claim Category', '...', 'ATTRIBUTE', ...),
  ('CONCEPT_CLAIM_STATUS', 'Claim Status', '...', 'ATTRIBUTE', ...);
```

### Step 2: Deploy (5 min)

```bash
cd apps/portal
supabase db push
pnpm check:l0-drift  # Should pass ✅
```

### Step 3: Create Policy Engine (30 min)

File: `packages/kernel/src/policies/claims-policy.ts`

```typescript
export const claimsPolicy = {
  requiredConcepts: ["CONCEPT_CLAIM", "CLAIM_CATEGORY", "CLAIM_STATUS"],
  validate: async (claim) => {
    // Query L0, check all concepts exist, return true/false
  },
};
```

### Step 4: Implement UI (60 min)

Files: `app/claims/page.tsx`, `app/claims/[id]/page.tsx`, `components/claims/*`

```typescript
"use server";
import { claimsPolicy } from "@nexus/kernel";

export async function createClaim(data) {
  await claimsPolicy.validate(data);
  // Create claim in DB
}
```

### Step 5: Test (30 min)

```typescript
describe("Claims", () => {
  it("should fetch CONCEPT_CLAIM from L0", async () => {
    const { data } = await supabase
      .from("kernel_concept_registry")
      .select("*")
      .eq("code", "CONCEPT_CLAIM");
    expect(data).toHaveLength(1);
  });
});
```

### Step 6: Verify (5 min)

```bash
pnpm check:l0-drift      # ✅
pnpm turbo test          # ✅
git push origin claims   # PR → merge
```

---

## When Concepts Conflict: Renaming & Aliases

**Scenario:** You created `CONCEPT_CLAIM` in P1, but later realize it should be `CONCEPT_VENDOR_CLAIM` to distinguish from `CONCEPT_BUYER_CLAIM`.

**Solution (No Breaking Change):**

```sql
-- Migration: 20260215_rename_claim_concept.sql
-- Reason: Disambiguate vendor claims from buyer claims (P2 preparation)

-- Step 1: Create new concept
INSERT INTO kernel_concept_registry (code, name, ..., predecessor_code)
VALUES ('CONCEPT_VENDOR_CLAIM', 'Vendor Claim', ..., 'CONCEPT_CLAIM');

-- Step 2: Create alias for back-compat
INSERT INTO kernel_concept_alias (from_code, to_code, reason, deprecated_at)
VALUES ('CONCEPT_CLAIM', 'CONCEPT_VENDOR_CLAIM', 'Renamed for clarity', now());

-- Step 3: Migrate existing records
UPDATE kernel_value_set_values
SET concept_code = 'CONCEPT_VENDOR_CLAIM'
WHERE concept_code = 'CONCEPT_CLAIM'
  AND NOT EXISTS (SELECT 1 FROM kernel_concept_alias WHERE from_code = 'CONCEPT_CLAIM');
```

**App-layer handles alias:**

```typescript
export async function resolveConceptCode(code: string): Promise<string> {
  // If aliased, return target concept
  const { data } = await supabase
    .from("kernel_concept_alias")
    .select("to_code")
    .eq("from_code", code);

  return data?.[0]?.to_code || code;
}
```

**No code changes needed.** Old references still work via alias.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: L0 Drift Check
on: [pull_request]
jobs:
  drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm turbo check:l0-drift -- --json > /tmp/drift.json
      - name: Report
        run: |
          if grep -q '"summaryOK": false' /tmp/drift.json; then
            echo "::error::L0 Drift detected. See CONCEPT_COVERAGE_MAP.md for P1 roadmap."
            cat /tmp/drift.json
            exit 1
          fi
```

### Pre-commit Hook

```bash
#!/usr/bin/env bash
# .husky/pre-commit

pnpm check:l0-drift
if [ $? -ne 0 ]; then
  echo "❌ L0 drift detected. Commit aborted."
  exit 1
fi
```

---

## FAQ

**Q: Can I add a concept and use it in the same PR?**
A: Yes. PR order: migration → code → test. All three in same commit is fine. CI will pass if migration is applied first.

**Q: What if I reference a concept that doesn't exist yet?**
A: `pnpm check:l0-drift` will fail and tell you which files. Fix it by adding the migration first.

**Q: Can I delete a concept?**
A: Never delete. Mark as deprecated + create alias. This preserves audit trail.

**Q: How do I handle concept versioning (e.g., CONCEPT_PAYMENT v1 → v2)?**
A: Use `kernel_concept_version_history`. Create new row on each change, link via `concept_code + version`. Old versions stay in registry for audit.

**Q: Is it safe to add concepts without code changes?**
A: Yes. It's encouraged. Add all P1 concepts in one migration, implement features over next 2 weeks. Drift check will be clean because no code references them yet.

**Q: What if Supabase is down when `check:l0-drift` runs?**
A: Script returns exit code `2` (configuration error). CI should fail. This is intentional — L0 state is critical.

---

## Next Steps

### Immediate (Today - Dec 31)

- ✅ **CONCEPT_COVERAGE_MAP.md** created
- ✅ **check-l0-drift.ts** created
- ✅ Turbo task added
- [ ] Review both documents with team
- [ ] Commit: "Governance: Add L0 drift detection + concept coverage audit"

### P1 Planning (Jan 2-7)

- [ ] Decide which concepts to add in P1 (recommend: Claims + Cases + AP Reconciliation = 12 concepts)
- [ ] Write migration: `20260108_add_claims_and_cases_concepts.sql`
- [ ] Assign features to engineers:
  - Engineer A: Claims feature (2-3 days)
  - Engineer B: Cases/escalations (2-3 days)
  - Engineer C: AP reconciliation (2-3 days)

### P1 Execution (Jan 8-15)

- [ ] Deploy P1 concepts via migration (Day 1)
- [ ] Verify `pnpm check:l0-drift` passes (Day 1)
- [ ] Implement features (Days 2-4)
- [ ] Test + merge (Days 5)
- [ ] Result: 29/30 concepts live, P1 features shipped

### P2 Planning (Jan 16-21)

- [ ] Update CONCEPT_COVERAGE_MAP.md based on P1 feedback
- [ ] Plan P2 concepts (workflow, ratings, etc.)

---

## Key Files

| File                                                | Purpose                          | Maintainer       |
| --------------------------------------------------- | -------------------------------- | ---------------- |
| `docs/development/CONCEPT_COVERAGE_MAP.md`          | Feature audit + P1/P2/P3 roadmap | Product/Eng Lead |
| `apps/portal/scripts/check-l0-drift.ts`             | CI validation script             | Eng Lead         |
| `apps/portal/supabase/migrations/20260108_*.sql`    | P1 concept additions             | Data Engineer    |
| `docs/development/L0_KERNEL_ROBUSTNESS_ANALYSIS.md` | Robustness justification         | Eng Lead         |
| `docs/development/L0_CONCEPTS_VISUAL_MAP.md`        | Quick-reference diagrams         | Product          |

---

## Confidence & Cautions

**Confidence:** 95/100

**Why this works:**

1. ✅ L0 is immutable (RLS enforced)
2. ✅ Concepts are versioned (audit trail)
3. ✅ Drift detection is automated (CI)
4. ✅ App-layer validates at runtime (no silent failures)
5. ✅ Aliases enable safe refactoring (no breaking changes)

**Cautions:**

1. ⚠️ **Supabase connectivity:** Drift check requires live connection to L0 database. If Supabase is down, CI will fail (by design).
2. ⚠️ **Lazy migration:** If you add code referencing a concept _before_ the migration is applied, drift check will fail. Solution: Always migrate first.
3. ⚠️ **Concept naming:** Establish naming convention (e.g., `CONCEPT_*` for entities, adjectives for attributes). Naming collisions will cause confusion.
4. ⚠️ **Value set governance:** Restricted value sets (`is_restricted = true`) cannot be modified by code. Only kernel-admin can change. Plan accordingly.

---

## Summary

You now have a **no-drift, self-expanding L0 Kernel**:

1. **Lock mechanism:** CI fails if code references missing concepts
2. **Expansion roadmap:** CONCEPT_COVERAGE_MAP shows P1/P2/P3 timeline
3. **Safe evolution:** Migrations + aliases + versioning prevent breaking changes
4. **Team discipline:** Simple rule: "Concept first, code second"

**Next commit:** Merge CONCEPT_COVERAGE_MAP.md + check-l0-drift.ts → enables clean P1 expansion starting Jan 8.

🚀
