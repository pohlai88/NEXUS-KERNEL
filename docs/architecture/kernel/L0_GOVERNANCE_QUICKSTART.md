# L0 Governance Framework: Quick Start (Dec 31, 2025)

**TL;DR:** Your L0 Kernel is now self-expanding with drift detection. Follow these 3 steps to add P1 concepts without breaking anything.

---

## 📋 What Was Added Today

| Artifact                          | Purpose                                                                                 | Location                                         |
| --------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **CONCEPT_COVERAGE_MAP.md**       | Feature audit: shows which Portal features need which L0 concepts (P0 ✅, P1 ❌, P2 🔮) | `docs/development/CONCEPT_COVERAGE_MAP.md`       |
| **check-l0-drift.ts**             | CI script: detects if Portal code references missing L0 concepts                        | `apps/portal/scripts/check-l0-drift.ts`          |
| **L0_SELF_EXPANDING_STRATEGY.md** | Implementation playbook: how to add P1/P2 concepts safely                               | `docs/development/L0_SELF_EXPANDING_STRATEGY.md` |
| **Turbo task**                    | Run drift check in CI: `pnpm turbo check:l0-drift`                                      | `turbo.json`                                     |
| **Package.json script**           | Portal alias: `pnpm check:l0-drift`                                                     | `apps/portal/package.json`                       |

---

## 🚀 Three-Step P1 Workflow

### Step 1: Add Concept via Migration (5 min)

```bash
# Create file: apps/portal/supabase/migrations/20260108_add_claims_concepts.sql
# Paste this:

INSERT INTO kernel_concept_registry
  (code, name, description, concept_type, version, created_at, created_by, is_extensible)
VALUES
  ('CONCEPT_CLAIM', 'Claim', 'A vendor claim for shortage/quality/damage', 'ENTITY', '1.0.0', now(), 'system', true),
  ('CONCEPT_CLAIM_CATEGORY', 'Claim Category', 'Category of claim', 'ATTRIBUTE', '1.0.0', now(), 'system', true),
  ('CONCEPT_CLAIM_STATUS', 'Claim Status', 'Status of claim (draft→submitted→approved→closed)', 'ATTRIBUTE', '1.0.0', now(), 'system', true);

# Deploy
supabase db push
```

### Step 2: Verify No Drift (2 min)

```bash
cd apps/portal
pnpm check:l0-drift

# Output should be: ✅ Clean - No drift detected
```

### Step 3: Implement Feature (1-2 hours)

```typescript
// app/claims/page.tsx
import { claimsPolicy } from "@nexus/kernel/policies";

export default async function ClaimsPage() {
  // Policy automatically validates concepts exist in L0
  const claims = await claimsPolicy.getClaims();
  return <ClaimsList claims={claims} />;
}
```

**Then run drift check again:**

```bash
pnpm check:l0-drift  # Still ✅ Clean
```

---

## 📊 Current Status

### P0 (✅ Complete - 17 Concepts)

```
ENTITIES:      BANK, CURRENCY, VENDOR, TENANT, COMPANY, COUNTRY
ATTRIBUTES:    STATUS, COLOR_TOKEN, PAYMENT_TERM, APPROVAL_LEVEL
RELATIONSHIPS: VENDOR_COMPANY_LINK, USER_TENANT_ACCESS, GROUP_MEMBERSHIP
OPERATIONS:    PAYMENT, INVOICE, APPROVAL, ONBOARDING
VALUE_SETS:    CURRENCIES (5 values), COUNTRIES (4 values)
```

### P1 Gap (❌ Needed for Full Features)

```
CLAIMS:         CONCEPT_CLAIM, CONCEPT_CLAIM_CATEGORY, CONCEPT_CLAIM_STATUS
CASES:          CONCEPT_CASE, CONCEPT_CASE_TYPE, CONCEPT_ESCALATION
APPROVALS:      CONCEPT_APPROVAL_CHAIN, CONCEPT_DELEGATION
RECONCILIATION: CONCEPT_STATEMENT, CONCEPT_RECONCILIATION, CONCEPT_MATCHING, CONCEPT_VARIANCE
TOTAL:          12 new concepts (1 migration, ~2 hours to add all)
```

---

## 🎯 Governance Rules (Non-Negotiable)

1. **Concept First:** Every concept addition = migration before code
2. **CI Enforced:** `pnpm check:l0-drift` fails the build if concept is missing
3. **No Caching:** Concepts fetched at runtime, never baked into code
4. **RLS Protected:** Only kernel-admin role can modify L0
5. **Versioned:** Every change tracked in `kernel_concept_version_history`

---

## 🔍 How to Use check:l0-drift

```bash
# Basic: Check for drift
pnpm check:l0-drift

# JSON output (for CI)
pnpm check:l0-drift --json

# Strict mode (fail on warnings too)
pnpm check:l0-drift --strict

# Via Turbo
pnpm turbo check:l0-drift
```

**What it does:**

1. Queries L0 Kernel for valid concepts
2. Scans Portal code for concept references
3. Cross-checks: _Does every reference exist in L0?_
4. Reports gaps + recommends P1/P2 migrations

---

## 📖 Documentation Map

**Start here:**

- ✅ This file (quick reference)

**For feature planning:**

- 📋 `CONCEPT_COVERAGE_MAP.md` (which features need which concepts)

**For implementation:**

- 🛠️ `L0_SELF_EXPANDING_STRATEGY.md` (step-by-step workflow)

**For governance:**

- 🔒 `L0_KERNEL_ROBUSTNESS_ANALYSIS.md` (why this works)
- 📊 `L0_CONCEPTS_VISUAL_MAP.md` (visual reference)

---

## 💡 Examples

### Adding Claims Concepts

```sql
-- 20260108_add_claims_concepts.sql
INSERT INTO kernel_concept_registry VALUES
  ('CONCEPT_CLAIM', 'Claim', '...', 'ENTITY', ...),
  ('CONCEPT_CLAIM_CATEGORY', 'Claim Category', '...', 'ATTRIBUTE', ...),
  ('CONCEPT_CLAIM_STATUS', 'Claim Status', '...', 'ATTRIBUTE', ...);
```

### Using in App

```typescript
// lib/policies/claims-policy.ts
export const claimsPolicy = {
  requiredConcepts: ["CONCEPT_CLAIM", "CLAIM_CATEGORY", "CLAIM_STATUS"],
  validate: async (claim) => {
    // Query L0, verify concepts exist
    const { data } = await supabase
      .from("kernel_concept_registry")
      .select("code")
      .in("code", ["CONCEPT_CLAIM", "CLAIM_CATEGORY", "CLAIM_STATUS"]);

    return data?.length === 3;
  },
};
```

### Checking for Drift

```bash
$ pnpm check:l0-drift --json
{
  "timestamp": "2026-01-08T10:30:00Z",
  "summaryOK": true,
  "errorCount": 0,
  "referencedConcepts": ["CONCEPT_CLAIM", "CONCEPT_CLAIM_CATEGORY", "CONCEPT_CLAIM_STATUS"],
  "missingConcepts": [],
  "recommendations": ["✅ All concept references are valid. No drift detected."]
}
```

---

## ❓ FAQ

**Q: Can I add a concept and use it in the same commit?**
A: Yes. Migration first (in same commit), then code. CI will pass.

**Q: What if I misspell a concept name?**
A: `pnpm check:l0-drift` will fail and show you exactly which files need fixing.

**Q: Can I delete a concept?**
A: No. Mark as deprecated + create alias. Keeps audit trail intact.

**Q: Does this slow down development?**
A: No. Adding a concept takes ~5 minutes (one SQL insert). The CI validation prevents bugs, saving hours of debugging.

---

## 🔗 Next Steps

### This Week (Dec 31 - Jan 7)

- [ ] Share these docs with team
- [ ] Review CONCEPT_COVERAGE_MAP.md P1 recommendations
- [ ] Decide which P1 concepts to add (Claims? Cases? Approvals?)

### Next Week (Jan 8-15) - P1 Sprint

- [ ] Create migration: `20260108_add_claims_and_cases_concepts.sql`
- [ ] Deploy migration: `supabase db push`
- [ ] Verify drift check: `pnpm check:l0-drift` ✅
- [ ] Implement Claims feature (2-3 days)
- [ ] Implement Cases feature (2-3 days)
- [ ] Merge → Production (all 12 P1 concepts + features live)

### Later (Jan 22+ ) - P2 Sprint

- [ ] Add workflow concepts (WORKFLOW_STATE, TASK, etc.)
- [ ] Implement approval chain engine
- [ ] Implement ratings/evaluations framework

---

## 🎯 Success Criteria

✅ **P0 (Done):**

- 17 concepts in L0 ✅
- All Portal features use L0 concepts ✅
- RLS + versioning enforced ✅
- Robustness documented ✅

✅ **P1 (Ready to Execute):**

- [ ] 12 new concepts added via migration
- [ ] Claims feature shipped (using CONCEPT_CLAIM, etc.)
- [ ] Cases feature shipped (using CONCEPT_CASE, etc.)
- [ ] `pnpm check:l0-drift` still passes ✅
- [ ] Zero breaking changes ✅

✅ **P2 (Planned):**

- [ ] Workflow concepts added
- [ ] Approval chain system built
- [ ] Ratings/evaluations framework live
- [ ] 29+ concepts in L0 ✅

---

## 🚨 Cautions

⚠️ **Supabase Connectivity:** `check:l0-drift` requires live connection to L0. If Supabase is down, CI fails (intentionally).

⚠️ **Lazy Migration:** If you add code before the migration, drift check will fail. Solution: Always migrate first.

⚠️ **Naming Collisions:** Establish naming convention (e.g., `CONCEPT_` prefix). Two concepts with same code = disaster.

---

**Status:** 🟢 Ready for P1 Execution

**Questions?** Refer to `L0_SELF_EXPANDING_STRATEGY.md` for detailed implementation guide.

🚀
