# Concept Coverage Map: Portal Features → L0 Kernel

**Purpose:** Verify that every Portal feature/route has required L0 concepts defined. Exposes gaps *before* P1 development.

**Last Updated:** Dec 31, 2025  
**Status:** P0 Baseline Complete ✅ | P1 Gaps Identified 🚧

---

## Executive Summary

| Category | Features Covered | L0 Concepts Required | Status |
|----------|:---------------:|:------------------:|:------:|
| **Core Portal** | 4/4 | 4/4 | ✅ |
| **Vendor Management** | 3/3 | 5/5 | ✅ |
| **Financial** | 4/4 | 5/5 | ✅ |
| **Claims** | 0/1 | 0/3 | ❌ P1 |
| **Cases** | 0/2 | 0/3 | ❌ P1 |
| **Approvals** | 1/3 | 1/4 | ⚠️ P1 |
| **Admin/System** | 3/3 | 3/3 | ✅ |
| **TOTAL** | 15/20 | 18/23 | ⚠️ |

---

## Detailed Coverage by Feature Area

### 1. CORE PORTAL (✅ Complete)

#### 1.1 Dashboard / Omni Dashboard
- **Routes:** `/` (portal home), `/omni-dashboard`, `/vendor-omni-dashboard`
- **Key Functions:**
  - Display tenant overview
  - Show vendor summary
  - Navigation hub
- **Required L0 Concepts:**
  - `TENANT` ✅ (L0 seeded)
  - `VENDOR` ✅ (L0 seeded)
  - `COMPANY` ✅ (L0 seeded)
  - `USER_TENANT_ACCESS` ✅ (relationship, L0 seeded)
- **Value Sets Used:** None
- **Status:** ✅ **COMPLETE** - All concepts present
- **Evidence:**
  ```sql
  -- kernel_concept_registry (L0)
  SELECT code FROM kernel_concept_registry 
  WHERE code IN ('TENANT', 'VENDOR', 'COMPANY', 'USER_TENANT_ACCESS');
  -- Result: 4 rows found ✅
  ```
- **Notes:** Portal can render dashboard without P1 additions; relationship model is L0 seeded

---

#### 1.2 Vendor Profile / Onboarding
- **Routes:** `/vendor`, `/vendor/[id]`, `/onboarding`
- **Key Functions:**
  - Display vendor profile
  - Manage vendor status
  - Onboarding workflow
- **Required L0 Concepts:**
  - `VENDOR` ✅ (L0 seeded)
  - `VENDOR_COMPANY_LINK` ✅ (L0 seeded)
  - `STATUS` ✅ (attribute, L0 seeded)
- **Value Sets Used:**
  - `STATUS` values (for vendor state)
- **Status:** ✅ **COMPLETE**
- **Evidence:** Vendor onboarding flow uses `VENDOR`, `COMPANY`, and `STATUS` (active/inactive/suspended) from L0
- **Notes:** Payment terms (P1) not yet in L0; will be needed for full onboarding flow

---

#### 1.3 Profile / User Management
- **Routes:** `/profile`, `/admin`
- **Key Functions:**
  - User settings
  - Role/permission management
  - Admin controls
- **Required L0 Concepts:**
  - `USER_TENANT_ACCESS` ✅ (L0 seeded)
  - `APPROVAL_LEVEL` ✅ (L0 seeded)
  - `TENANT` ✅ (L0 seeded)
- **Value Sets Used:** `APPROVAL_LEVEL` (if used for user tiers)
- **Status:** ✅ **COMPLETE**
- **Notes:** User management can proceed with existing L0; role mapping to APPROVAL_LEVEL is declarative

---

### 2. VENDOR MANAGEMENT (✅ Complete)

#### 2.1 Vendors List / Directory
- **Routes:** `/vendors`, `/vendors/[id]`
- **Key Functions:**
  - Browse vendors
  - Filter by company
  - View vendor details
- **Required L0 Concepts:**
  - `VENDOR` ✅ (L0 seeded)
  - `COMPANY` ✅ (L0 seeded)
  - `VENDOR_COMPANY_LINK` ✅ (L0 seeded)
  - `COUNTRY` ✅ (L0 seeded)
  - `CURRENCY` ✅ (L0 seeded)
- **Value Sets Used:**
  - `VALUESET_GLOBAL_COUNTRIES` ✅ (MY, SG, US, GB seeded)
  - `VALUESET_GLOBAL_CURRENCIES` ✅ (USD, EUR, MYR, SGD, GBP seeded)
- **Status:** ✅ **COMPLETE**
- **Evidence:** All 5 concepts + 2 value sets verified in L0
- **Notes:** Multi-jurisdiction vendor management already supported; currency conversion rules (P1) TBD

---

#### 2.2 Vendor Groups / Federation
- **Routes:** `/vendor-groups` (planned), `/group-analytics`
- **Key Functions:**
  - Manage vendor groups
  - Group-level approvals
  - Consolidated reporting
- **Required L0 Concepts:**
  - `GROUP_MEMBERSHIP` ✅ (L0 seeded)
  - `VENDOR` ✅ (L0 seeded)
  - `APPROVAL_LEVEL` ✅ (L0 seeded)
- **Value Sets Used:** None (APPROVAL_LEVEL managed as attribute)
- **Status:** ✅ **COMPLETE**
- **Notes:** Group federation architecture documented; GROUP_MEMBERSHIP enables hierarchical approvals

---

### 3. FINANCIAL OPERATIONS (✅ Complete)

#### 3.1 Payments / Payment Runs
- **Routes:** `/payment-run`, `/payment-run/[id]`
- **Key Functions:**
  - Batch payment execution
  - Payment status tracking
  - Settlement workflow
- **Required L0 Concepts:**
  - `PAYMENT` ✅ (L0 seeded - OPERATION)
  - `INVOICE` ✅ (L0 seeded - OPERATION)
  - `VENDOR` ✅ (L0 seeded)
  - `CURRENCY` ✅ (L0 seeded)
  - `BANK` ✅ (L0 seeded)
- **Value Sets Used:**
  - `VALUESET_GLOBAL_CURRENCIES` ✅
- **Status:** ✅ **COMPLETE**
- **Evidence:** Payment operations and supporting entities all in L0
- **Notes:** Payment status values (pending, approved, failed, settled) will be defined in P1 via `CONCEPT_PAYMENT_STATUS`

---

#### 3.2 Invoices / Statements
- **Routes:** `/invoices`, `/invoices/[id]`
- **Key Functions:**
  - Invoice management
  - Statement reconciliation
  - AP matching
- **Required L0 Concepts:**
  - `INVOICE` ✅ (L0 seeded)
  - `PAYMENT` ✅ (L0 seeded)
  - `VENDOR` ✅ (L0 seeded)
  - `CURRENCY` ✅ (L0 seeded)
- **Value Sets Used:**
  - `VALUESET_GLOBAL_CURRENCIES` ✅
- **Status:** ✅ **COMPLETE**
- **Evidence:** Invoice core operations + payment relationships in L0
- **Notes:** Statement matching (P1) requires `CONCEPT_STATEMENT` and `CONCEPT_RECONCILIATION`

---

#### 3.3 Quotations / Pricing
- **Routes:** `/quotations` (planned)
- **Key Functions:**
  - Quote management
  - Price negotiation
  - Pricing rules
- **Required L0 Concepts:**
  - `VENDOR` ✅ (L0 seeded)
  - `CURRENCY` ✅ (L0 seeded)
  - (Custom pricing concepts pending P1)
- **Value Sets Used:**
  - `VALUESET_GLOBAL_CURRENCIES` ✅
- **Status:** ⚠️ **PARTIAL** - Core entities ready, pricing concepts needed for P1
- **Notes:** Quote workflow can read VENDOR/CURRENCY; specialized concepts (QUOTE, PRICING_RULE) → P1

---

#### 3.4 Matching / AP Reconciliation
- **Routes:** `/matching`
- **Key Functions:**
  - 3-way matching (PO/Invoice/Receipt)
  - Variance detection
  - Exception handling
- **Required L0 Concepts:**
  - `INVOICE` ✅ (L0 seeded)
  - `PAYMENT` ✅ (L0 seeded)
  - `VENDOR` ✅ (L0 seeded)
  - (Matching-specific concepts → P1: `CONCEPT_MATCHING`, `CONCEPT_VARIANCE`)
- **Value Sets Used:** None (core P0)
- **Status:** ⚠️ **PARTIAL** - Infrastructure ready; specialized concepts → P1
- **Notes:** Basic matching UI can reference INVOICE/PAYMENT; three-way rule engine awaits P1

---

### 4. CLAIMS MANAGEMENT (❌ Missing - P1)

#### 4.1 Claims List / Dashboard
- **Routes:** `/claims` (planned), `/claims/[id]` (planned)
- **Key Functions:**
  - Create claims
  - Track claim status
  - View claim history
- **Required L0 Concepts:**
  - ❌ `CONCEPT_CLAIM` (NOT IN L0 - **P1 CANDIDATE**)
  - ❌ `CONCEPT_CLAIM_CATEGORY` (NOT IN L0 - **P1 CANDIDATE**)
  - ❌ `CONCEPT_CLAIM_STATUS` (NOT IN L0 - **P1 CANDIDATE**)
  - ✅ `VENDOR` (L0 seeded)
  - ✅ `COMPANY` (L0 seeded)
- **Value Sets Needed:**
  - `VALUESET_CLAIM_CATEGORIES` (shortage, quality, damaged, other)
  - `VALUESET_CLAIM_STATUS` (draft, submitted, reviewing, approved, rejected, closed)
- **Status:** ❌ **BLOCKED** - 3 core concepts missing
- **Gap Analysis:**
  - Claims feature cannot be built without L0 concepts
  - Recommendation: **Migrate to P1 concept creation (Jan 8-15)**
  - Implementation: Single migration `20260108_add_claims_concepts.sql`
- **Estimated P1 Effort:** 2 hours (1 migration + 2 policy engines)

---

### 5. CASES / ESCALATIONS (❌ Missing - P1)

#### 5.1 Cases List / Case Management
- **Routes:** `/cases` (planned), `/cases/[id]` (planned), `/escalations` (planned)
- **Key Functions:**
  - Create cases from claims/exceptions
  - Track case progress
  - Escalation management
- **Required L0 Concepts:**
  - ❌ `CONCEPT_CASE` (NOT IN L0 - **P1 CANDIDATE**)
  - ❌ `CONCEPT_CASE_TYPE` (NOT IN L0 - **P1 CANDIDATE**)
  - ❌ `CONCEPT_ESCALATION` (NOT IN L0 - **P1 CANDIDATE**)
  - ✅ `APPROVAL_LEVEL` (L0 seeded - for escalation tiers)
  - ✅ `USER_TENANT_ACCESS` (L0 seeded - for case assignment)
- **Value Sets Needed:**
  - `VALUESET_CASE_TYPES` (dispute, discrepancy, quality, compliance)
  - `VALUESET_CASE_STATUS` (open, under-review, awaiting-response, resolved, closed)
  - `VALUESET_ESCALATION_REASON` (not-resolved, timed-out, complexity-exceeded)
- **Status:** ❌ **BLOCKED** - 3 core concepts missing
- **Gap Analysis:**
  - Cases/escalations are "meta-workflow" concepts
  - Same as Claims: cannot proceed without L0 definitions
  - Recommendation: **Combine with Claims in P1 creation**
  - Implementation: Same migration or separate `20260108_add_cases_concepts.sql`
- **Estimated P1 Effort:** 2 hours (1 migration + 2 policy engines)

---

#### 5.2 Exceptions / Break Glass
- **Routes:** `/exceptions` (planned), `/system-control` (planned)
- **Key Functions:**
  - Automatic exception detection
  - Manual exception override
  - Audit trail
- **Required L0 Concepts:**
  - (Exception concepts are system-level; may reuse APPROVAL_LEVEL)
  - ✅ `APPROVAL_LEVEL` (L0 seeded)
  - ✅ `USER_TENANT_ACCESS` (L0 seeded)
- **Value Sets Needed:**
  - `VALUESET_EXCEPTION_TYPE` (rule-violation, threshold-exceeded, missing-data)
  - `VALUESET_EXCEPTION_PRIORITY` (low, medium, high, critical)
- **Status:** ⚠️ **PARTIAL** - Infrastructure ready; can use break-glass with existing L0
- **Notes:** Exception workflow uses "silent is a bug" pattern; existing audit trail in L0 sufficient for P0

---

### 6. APPROVALS & WORKFLOWS (⚠️ Partial - P1 Expansion)

#### 6.1 Approval Workflows
- **Routes:** `/admin/approvals` (planned), approval routing (system-level)
- **Key Functions:**
  - Approval rules definition
  - Multi-level approval chains
  - Delegation & substitution
- **Required L0 Concepts:**
  - ✅ `APPROVAL_LEVEL` (L0 seeded)
  - ❌ `CONCEPT_APPROVAL_CHAIN` (NOT IN L0 - **P1 CANDIDATE**)
  - ❌ `CONCEPT_DELEGATION` (NOT IN L0 - **P1 CANDIDATE**)
  - ✅ `USER_TENANT_ACCESS` (L0 seeded)
  - ✅ `GROUP_MEMBERSHIP` (L0 seeded - for group approvals)
- **Value Sets Needed:**
  - `VALUESET_APPROVAL_ACTION` (approve, reject, request-changes, escalate)
- **Status:** ⚠️ **PARTIAL** - Basic approvals (APPROVAL_LEVEL) exist; chains/delegation → P1
- **Gap Analysis:**
  - Basic approval thresholds work with existing APPROVAL_LEVEL
  - Multi-level chains require CONCEPT_APPROVAL_CHAIN (P1)
  - Delegation/substitution requires CONCEPT_DELEGATION (P1)
- **Estimated P1 Effort:** 3 hours (1 migration + 2 policy engines)

---

#### 6.2 Ratings & Evaluations
- **Routes:** `/ratings`, `/evaluations`
- **Key Functions:**
  - Vendor performance ratings
  - KPI tracking
  - Evaluation workflows
- **Required L0 Concepts:**
  - (Rating concepts to be defined in P1)
  - ✅ `VENDOR` (L0 seeded)
  - ✅ `APPROVAL_LEVEL` (L0 seeded - for rating significance)
- **Value Sets Needed:**
  - `VALUESET_RATING_SCORE` (1-5, A-F, or custom)
  - `VALUESET_KPI_CATEGORY` (delivery, quality, compliance, cost)
- **Status:** ⚠️ **PARTIAL** - Can read vendor data; rating framework → P1
- **Notes:** Evaluations are decision-intensive; P1 concepts should separate input, calculation, outcome

---

### 7. ADMIN / SYSTEM CONTROL (✅ Complete)

#### 7.1 System Control / Feature Toggles
- **Routes:** `/system-control`, `/admin`
- **Key Functions:**
  - Feature flags
  - Configuration management
  - Audit logging
- **Required L0 Concepts:**
  - ✅ `TENANT` (L0 seeded)
  - ✅ `COMPANY` (L0 seeded)
  - ✅ `APPROVAL_LEVEL` (L0 seeded - for admin access)
- **Value Sets Used:** None
- **Status:** ✅ **COMPLETE**
- **Notes:** System control UI can reference L0 directly; all governance machinery in place

---

#### 7.2 Internal Marketplace
- **Routes:** `/internal-marketplace` (planned)
- **Key Functions:**
  - Service discovery
  - Tool marketplace
  - Integration management
- **Required L0 Concepts:**
  - (Marketplace-specific concepts TBD)
  - ✅ `VENDOR` (L0 seeded - for marketplace participants)
- **Value Sets Used:** None (P0)
- **Status:** ⚠️ **PARTIAL** - Can reference VENDOR; service concepts → P2

---

#### 7.3 Staleness / Data Quality
- **Routes:** `/staleness`
- **Key Functions:**
  - Monitor data currency
  - Alert on stale records
  - Auto-refresh triggers
- **Required L0 Concepts:**
  - ✅ `VENDOR` (L0 seeded)
  - ✅ `TENANT` (L0 seeded)
  - (Staleness rules are system-level; can use existing L0)
- **Value Sets Needed:** None (P0)
- **Status:** ✅ **COMPLETE**
- **Notes:** Staleness detection uses audit trail from kernel_concept_version_history

---

### 8. OFFBOARDING (✅ Supported)

#### 8.1 Vendor Offboarding
- **Routes:** `/offboarding`, `/offboarding/[id]`
- **Key Functions:**
  - Vendor deactivation
  - Data archival
  - Final settlement
- **Required L0 Concepts:**
  - ✅ `VENDOR` (L0 seeded)
  - ✅ `COMPANY` (L0 seeded)
  - ✅ `STATUS` (L0 seeded)
  - ✅ `PAYMENT` (L0 seeded - for final settlement)
  - ✅ `CURRENCY` (L0 seeded)
- **Value Sets Used:** `STATUS` values (inactive, archived)
- **Status:** ✅ **COMPLETE**
- **Notes:** Offboarding workflow can proceed; archival rules (P1) may refine retention policy

---

## Summary: Concept Gaps by Priority

### ✅ P0 (Seeded - Ready Now)

| Concept | Type | Used By | Status |
|---------|------|---------|--------|
| BANK | ENTITY | Payment flows | ✅ Live |
| CURRENCY | ENTITY | Invoices, payments, vendor profiles | ✅ Live |
| VENDOR | ENTITY | All vendor features | ✅ Live |
| TENANT | ENTITY | Multi-tenant access | ✅ Live |
| COMPANY | ENTITY | Vendor companies | ✅ Live |
| COUNTRY | ENTITY | Vendor location | ✅ Live |
| STATUS | ATTRIBUTE | Vendor, invoice, payment status | ✅ Live |
| COLOR_TOKEN | ATTRIBUTE | UI design system | ✅ Live |
| PAYMENT_TERM | ATTRIBUTE | Payment flexibility | ✅ Live |
| APPROVAL_LEVEL | ATTRIBUTE | Access control, approvals | ✅ Live |
| VENDOR_COMPANY_LINK | RELATIONSHIP | Vendor federation | ✅ Live |
| USER_TENANT_ACCESS | RELATIONSHIP | User access control | ✅ Live |
| GROUP_MEMBERSHIP | RELATIONSHIP | Vendor groups, group approvals | ✅ Live |
| PAYMENT | OPERATION | Payment runs, settlement | ✅ Live |
| INVOICE | OPERATION | Invoice management, matching | ✅ Live |
| APPROVAL | OPERATION | System-level approvals | ✅ Live |
| ONBOARDING | OPERATION | Vendor onboarding | ✅ Live |

**Value Sets:**
- `VALUESET_GLOBAL_CURRENCIES` (USD, EUR, MYR, SGD, GBP) ✅
- `VALUESET_GLOBAL_COUNTRIES` (MY, SG, US, GB) ✅

---

### ⏳ P1 Candidates (Needed for Full Feature Set)

| Concept | Type | Feature | Priority | Reason |
|---------|------|---------|----------|--------|
| **CONCEPT_CLAIM** | ENTITY | Claims | CRITICAL | Feature blocked; no claim definition |
| **CONCEPT_CLAIM_CATEGORY** | ATTRIBUTE | Claims | CRITICAL | Claim types (shortage, quality, damage) |
| **CONCEPT_CLAIM_STATUS** | ATTRIBUTE | Claims | CRITICAL | Claim workflow (draft→submitted→resolved) |
| **CONCEPT_CASE** | ENTITY | Cases | CRITICAL | Feature blocked; no case definition |
| **CONCEPT_CASE_TYPE** | ATTRIBUTE | Cases | CRITICAL | Case types (dispute, quality, compliance) |
| **CONCEPT_ESCALATION** | RELATIONSHIP | Cases | CRITICAL | Escalation hierarchy + tiers |
| **CONCEPT_APPROVAL_CHAIN** | ENTITY | Approvals | HIGH | Multi-level approval rules |
| **CONCEPT_DELEGATION** | RELATIONSHIP | Approvals | HIGH | Approval substitution |
| **CONCEPT_STATEMENT** | ENTITY | AP Reconciliation | HIGH | Bank statement matching |
| **CONCEPT_RECONCILIATION** | OPERATION | AP Reconciliation | HIGH | 3-way matching logic |
| **CONCEPT_MATCHING** | OPERATION | AP Matching | MEDIUM | Variance detection |
| **CONCEPT_VARIANCE** | ATTRIBUTE | AP Matching | MEDIUM | Variance types (quantity, amount) |

**P1 Total: 12 new concepts** (recommended for Jan 8-15 sprint)

---

### 📅 P2 Candidates (Advanced Features)

| Concept | Type | Feature | Target |
|---------|------|---------|--------|
| CONCEPT_WORKFLOW_STATE | ENTITY | Workflow engine | P2 (Jan 22-29) |
| CONCEPT_TASK | ENTITY | Task management | P2 (Jan 22-29) |
| CONCEPT_APPROVAL_RULE | ENTITY | Dynamic approvals | P2 (Jan 22-29) |
| CONCEPT_KPI_CATEGORY | ATTRIBUTE | Evaluations | P2 (Jan 22-29) |
| CONCEPT_RATING_SCORE | ATTRIBUTE | Ratings | P2 (Jan 22-29) |
| CONCEPT_EXCEPTION_TYPE | ATTRIBUTE | Exception handling | P2 (Jan 22-29) |
| CONCEPT_SERVICE | ENTITY | Marketplace | P3+ (Future) |

**P2 Total: 7 new concepts**

---

## Implementation Roadmap

### P0 (✅ Complete - Dec 31, 2025)
- ✅ 17 concepts seeded in `kernel_concept_registry`
- ✅ 2 value sets seeded in `kernel_value_set_registry`
- ✅ Portal core features operational
- ✅ RLS + audit trail enforced

### P1 (⏳ In Progress - Jan 8-15, 2026)
- [ ] Create migration: `20260108_add_claims_and_cases_concepts.sql`
  - Add 6 concepts: CLAIM, CLAIM_CATEGORY, CLAIM_STATUS, CASE, CASE_TYPE, ESCALATION
  - Seeded value sets for each
- [ ] Create migration: `20260108_add_approval_chain_concepts.sql`
  - Add 2 concepts: APPROVAL_CHAIN, DELEGATION
  - Value sets for approval actions
- [ ] Create migration: `20260108_add_ap_reconciliation_concepts.sql`
  - Add 4 concepts: STATEMENT, RECONCILIATION, MATCHING, VARIANCE
  - Value sets for reconciliation status
- [ ] Implement 4 L1 domain policy engines (Claims, Cases, Approvals, AP)
- [ ] Run `check:l0-drift` to verify no orphaned references
- [ ] Target: **18/30 concepts by Jan 15**

### P2 (🔮 Planned - Jan 22-29, 2026)
- [ ] Create migration: `20260122_add_workflow_concepts.sql`
  - Add 5 concepts: WORKFLOW_STATE, TASK, APPROVAL_RULE, KPI_CATEGORY, RATING_SCORE
- [ ] Implement workflow execution engine + task management
- [ ] Implement evaluations/ratings framework
- [ ] Target: **23/30 concepts by Jan 29**

---

## Governance Rules (Operating Discipline)

### Rule 1: Every Feature = L0 Concept
- ❌ **Never** hardcode concept names in app code
- ✅ **Always** query `kernel_concept_registry` at runtime
- ✅ **Always** add concept to L0 *before* implementing feature

### Rule 2: Concept Addition = Migration
- Every concept addition → separate `sql` migration (one concept family per migration)
- Each migration includes:
  - Concept definitions
  - Value set definitions (if needed)
  - Reason for addition (comment)
  - Back-compat alias (if renaming existing)

### Rule 3: L1 Policies Must Query L0
- Domain policies fetch L0 concepts at runtime
- No caching of concept definitions
- Enables safe concept addition without code redeploy

### Rule 4: CI Must Detect Drift
- `check:l0-drift` fails the build if:
  - App code references missing L0 concept
  - L0 concept is deleted without alias
  - Value set changed outside governance rules
  - RLS policies violated

### Rule 5: Never Delete L0 Concepts
- Mark as deprecated + create alias
- Maintain version history
- Enable safe deprecation cycle

---

## Verification Checklist

Use this checklist to verify P0 coverage before deploying new features:

- [ ] All route files (`page.tsx`) have mapped L0 concepts
- [ ] All Server Actions reference L0 concepts via policy engines
- [ ] All API endpoints validate against `kernel_concept_registry`
- [ ] All Admin features reference L0 (no hardcoded config)
- [ ] All error pages use L0 for fallback content
- [ ] `check:l0-drift` passes (zero drift detected)
- [ ] Every concept has audit trail enabled
- [ ] RLS policies cover all sensitive operations
- [ ] Value sets match domain requirements (no orphaned values)

---

## Related Documents

- **L0_KERNEL_ROBUSTNESS_ANALYSIS.md** - Detailed robustness assessment + 5-dimensional evaluation
- **L0_CONCEPTS_VISUAL_MAP.md** - ASCII diagrams, timeline, gap analysis matrix
- **NEXUS_CANON_V5_KERNEL_DOCTRINE.md** - Core axioms and architecture
- **check-l0-drift.sh** (to be created) - CI validation script

---

## Questions & Clarifications

**Q: Can I proceed with feature X if its L0 concept is missing?**  
A: No. Add the concept first (via migration), then implement the feature. This enforces discipline.

**Q: Should all value sets be in L0?**  
A: Only *jurisdictional* or *business-critical* value sets. Local enums (UI strings) live in code.

**Q: What if my feature needs a concept not listed here?**  
A: Document it in this map, add a migration, then implement. Update this file each P1/P2 cycle.

**Q: How do I validate my app against L0?**  
A: Run `pnpm check:l0-drift` (coming in next commit). It checks all concept references.

---

**Status:** This map is a **living document**. Update it at the start of each phase (P1, P2, etc.) as new concepts are added.
