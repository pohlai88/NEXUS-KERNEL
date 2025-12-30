# L0 Kernel Foundation - Visual Guide

**Date:** 2025-12-30
**Purpose:** Visual companion to Kernel Doctrine Phase 1 implementation
**Audience:** Developers, stakeholders, future team members

---

## The Problem We Solved

### Before L0 Kernel (Traditional Approach)

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION CODE                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Invoices │  │ Payments │  │ Vendors  │  │  Banks   │  │
│  │ Module   │  │  Module  │  │  Module  │  │  Module  │  │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘  │
│        │             │             │             │        │
│        └─────────────┴─────────────┴─────────────┘        │
│                          ↓                                 │
│              Each module defines its own                   │
│              "what is a bank" or "what is valid"          │
│                                                            │
│              ❌ RESULT: Semantic drift & chaos            │
└─────────────────────────────────────────────────────────────┘
```

**Problems:**
- Every module invents its own definitions
- No single source of truth
- Jurisdictional differences cause fragmentation
- Auditors can't trust data consistency
- AI agents can't understand conflicting definitions

---

### After L0 Kernel (Kernel Doctrine Approach)

```
┌─────────────────────────────────────────────────────────────┐
│                    L0 KERNEL (ABSOLUTE AUTHORITY)           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         kernel_concept_registry                      │  │
│  │  "What is a Bank? What is a Currency?"              │  │
│  │                                                       │  │
│  │  ✅ Single definition per concept                   │  │
│  │  ✅ Versioned & immutable audit trail               │  │
│  │  ✅ Jurisdiction-aware                              │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌──────────────────┴──────────────────────────────────┐  │
│  │    kernel_value_set_registry                        │  │
│  │    "Malaysian Banks vs Global Currencies"           │  │
│  │                                                       │  │
│  │  ✅ Local truth is registered, not invented         │  │
│  │  ✅ Sync with official sources (ISO, Bank Negara)  │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌──────────────────┴──────────────────────────────────┐  │
│  │    kernel_value_set_values                          │  │
│  │    "Actual values: Maybank, DBS, etc."             │  │
│  │                                                       │  │
│  │  ✅ Official aliases (SWIFT, ISO codes)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              L1-L3 LAYERS (DERIVED AUTHORITY)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Invoices │  │ Payments │  │ Vendors  │  │  Banks   │  │
│  │ Module   │  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  ✅ All modules query L0 for definitions                 │
│  ✅ No module can invent concepts                        │
│  ✅ Consistent semantics across platform                 │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Single source of truth
- ✅ Prevents semantic drift
- ✅ Supports multi-jurisdiction scenarios
- ✅ AI-safe (concepts are explicit, not probabilistic)
- ✅ Audit-friendly (immutable version history)

---

## L0 Kernel Architecture

### The Three Pillars

```
┌────────────────────────────────────────────────────────────────┐
│                      L0 KERNEL FOUNDATION                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  CONCEPT REGISTRY (What things ARE)                        │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ kernel_concept_registry                             │   │
│     │                                                      │   │
│     │ • concept_id: "CONCEPT_BANK"                        │   │
│     │ • concept_name: "Bank"                              │   │
│     │ • concept_category: "ENTITY"                        │   │
│     │ • concept_description: "Financial institution..."   │   │
│     │ • requires_jurisdiction: true                       │   │
│     │ • version: "1.0.0"                                  │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                                 │
│  2️⃣  JURISDICTIONAL VALUE SETS (Where concepts are valid)      │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ kernel_value_set_registry                           │   │
│     │                                                      │   │
│     │ • value_set_id: "VALUESET_MALAYSIA_BANKS"          │   │
│     │ • concept_id: "CONCEPT_BANK"                        │   │
│     │ • jurisdiction_code: "MY"                           │   │
│     │ • sync_source: "BANK_NEGARA_MALAYSIA"              │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                                 │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ kernel_value_set_values                             │   │
│     │                                                      │   │
│     │ • value_code: "MAYBANK"                             │   │
│     │ • value_label: "Malayan Banking Berhad"            │   │
│     │ • official_aliases: [                               │   │
│     │     {"type": "SWIFT", "code": "MBBEMYKL"},         │   │
│     │     {"type": "BIC", "code": "MAYBANK"}             │   │
│     │   ]                                                 │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                                 │
│  3️⃣  CANONICAL IDENTITY MAPPING (Immutable IDs)                │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ kernel_identity_mapping                             │   │
│     │                                                      │   │
│     │ • canonical_id: UUID (never changes)                │   │
│     │ • external_system: "SAP"                            │   │
│     │ • external_id: "V001"                               │   │
│     │ • external_id_type: "SAP_VENDOR_CODE"              │   │
│     │                                                      │   │
│     │ Maps external IDs → L0 canonical truth              │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: "Add Malaysian Bank"

### Traditional Approach (Without L0)

```
Developer creates "Maybank" directly in application:
  ↓
banks table: INSERT INTO banks (name) VALUES ('Maybank')
  ↓
❌ Problem: No validation, no jurisdiction tracking, no official aliases
❌ Another developer creates "Malayan Banking" (duplicate!)
❌ AI agent sees "Maybank" but doesn't know it's a Malaysian bank
```

### Kernel Doctrine Approach (With L0)

```
1️⃣  Concept already exists in L0:
    kernel_concept_registry: CONCEPT_BANK (created at bootstrap)
  ↓

2️⃣  Value set already exists in L0:
    kernel_value_set_registry: VALUESET_MALAYSIA_BANKS (jurisdiction: MY)
  ↓

3️⃣  Data Steward adds value to existing set:
    kernel_value_set_values:
      value_code: "MAYBANK"
      value_label: "Malayan Banking Berhad"
      official_aliases: [{"type": "SWIFT", "code": "MBBEMYKL"}]
  ↓

✅ Result: Canonical truth established
✅ All modules query L0 for bank list
✅ AI knows "Maybank" = Malaysian bank with SWIFT code MBBEMYKL
✅ No duplicates (unique constraint on value_code)
```

---

## Role-Based Access Control

### Who Can Do What?

```
┌──────────────────────────────────────────────────────────────┐
│                    KERNEL ADMIN                               │
│              (Highest Authority - L0 Governance)              │
├──────────────────────────────────────────────────────────────┤
│ ✅ Create new concepts                                       │
│ ✅ Create new value sets                                     │
│ ✅ Modify concept definitions                                │
│ ✅ Deprecate concepts                                        │
│ ✅ Manage identity mappings                                  │
│ ✅ All operations on all L0 tables                           │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    DATA STEWARD                               │
│              (Operational Governance - L0 Data)               │
├──────────────────────────────────────────────────────────────┤
│ ✅ Add values to existing value sets                         │
│ ✅ Update value metadata (labels, descriptions)              │
│ ✅ Add official aliases to values                            │
│ ❌ Cannot create new concepts or value sets                  │
│ ❌ Cannot modify concept definitions                         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              AUTHENTICATED USER (Read-Only)                   │
│                 (Application Developers)                      │
├──────────────────────────────────────────────────────────────┤
│ ✅ Read all concepts                                         │
│ ✅ Read all value sets                                       │
│ ✅ Read all values                                           │
│ ✅ Query L0 for validation                                   │
│ ❌ Cannot modify anything in L0                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Concept Categories

### The Six Types of L0 Concepts

```
┌────────────────────────────────────────────────────────────┐
│  1️⃣  ENTITY - Business Objects                             │
│     • Bank, Vendor, Customer, Invoice, Payment            │
│     • "Nouns" - things that exist                         │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  2️⃣  ATTRIBUTE - Properties                                │
│     • Status, Color Token, Payment Term                   │
│     • "Adjectives" - descriptions of entities             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  3️⃣  RELATIONSHIP - Connections                            │
│     • Vendor-Company Link, User-Tenant Access             │
│     • "Prepositions" - how entities relate                │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  4️⃣  OPERATION - Actions                                   │
│     • Payment, Invoice, Approval, Onboarding              │
│     • "Verbs" - actions performed on entities             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  5️⃣  CONSTRAINT - Business Rules                           │
│     • Credit Limit, Approval Threshold, SLA               │
│     • "Rules" - what is allowed/required                  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  6️⃣  METADATA - Descriptive Information                    │
│     • Tag, Label, Category, Classification                │
│     • "Context" - additional information                  │
└────────────────────────────────────────────────────────────┘
```

---

## Jurisdictional Example: "Oxford vs Kamus Dewan"

### The Problem

> **Q:** Is "Maybank" a valid bank?
> **Traditional System:** "Depends on who you ask"
> **L0 Kernel:** "Yes, in jurisdiction MY (Malaysia)"

### The Solution

```
┌────────────────────────────────────────────────────────────┐
│          CONCEPT_BANK (Universal Definition)               │
│   "Financial institution providing banking services"       │
└─────────────────┬──────────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
┌────────▼─────┐  ┌───────▼────────┐
│ MALAYSIA (MY)│  │  GLOBAL        │
│              │  │                │
│ • Maybank   │  │ • HSBC         │
│ • CIMB      │  │ • Citibank     │
│ • Public    │  │ • JPMorgan     │
│   Bank      │  │ • BNY Mellon   │
└──────────────┘  └────────────────┘

Both are valid! Both are registered! No conflict!
```

**Key Insight:** Local truth is REAL — but it is REGISTERED, not INVENTED.

---

## Version History & Audit Trail

### Immutable Change Log

```
┌────────────────────────────────────────────────────────────┐
│       kernel_concept_version_history                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Version 1.0.0 (2025-12-30 10:00:00)                       │
│   Change: CREATED                                         │
│   Snapshot: {                                             │
│     "concept_id": "CONCEPT_BANK",                         │
│     "concept_name": "Bank",                               │
│     "concept_category": "ENTITY",                         │
│     ...                                                   │
│   }                                                       │
│                                                            │
│ ─────────────────────────────────────────────────────────  │
│                                                            │
│ Version 1.1.0 (2025-12-31 14:30:00)                       │
│   Change: UPDATED                                         │
│   Breaking: false                                         │
│   Snapshot: {                                             │
│     "concept_description": "Updated description..."       │
│   }                                                       │
│                                                            │
│ ─────────────────────────────────────────────────────────  │
│                                                            │
│ Version 2.0.0 (2026-01-15 09:00:00)                       │
│   Change: UPDATED                                         │
│   Breaking: true ⚠️                                        │
│   Description: "Added new required field"                 │
│                                                            │
└────────────────────────────────────────────────────────────┘

✅ Every change is recorded
✅ Full snapshot at each version
✅ Breaking changes flagged
✅ Insert-only (no deletes, no updates)
```

---

## Integration with Existing Schema

### Current Database Tables ↔ L0 Kernel

```
EXISTING TABLES                    L0 KERNEL CONCEPTS
─────────────────                  ──────────────────

vmp_vendors ──────────────────────> CONCEPT_VENDOR
  - Must reference                  - Defines what a vendor IS
    kernel values                   - Jurisdiction-aware
  - Can't invent                    - Versioned
    vendor types

vmp_companies ─────────────────────> CONCEPT_COMPANY
  - Company types must              - Legal entity definition
    exist in L0                     - Multi-tenant aware

vmp_invoices ──────────────────────> CONCEPT_INVOICE
  - Invoice statuses                - Invoice lifecycle
    from L0 value sets              - Status transitions

vmp_payments ──────────────────────> CONCEPT_PAYMENT
  - Payment methods                 - Payment operations
    validated via L0                - Currency handling

tenants ───────────────────────────> CONCEPT_TENANT
  - Tenant types                    - Multi-tenant model
    defined in L0                   - Isolation rules
```

**Migration Strategy:**
1. ✅ L0 Kernel created (Phase 1 complete)
2. ⏳ Add validation triggers to existing tables (Phase 2)
3. ⏳ Migrate existing enum values to L0 value sets (Phase 2)
4. ⏳ Add foreign keys to L0 tables where applicable (Phase 2)

---

## Developer Workflow

### How to Use L0 Kernel in Your Code

#### ❌ OLD WAY (Pre-Kernel)

```typescript
// BAD: Hardcoded values, no validation
const bankName = 'Maybank';
await db.insert(banks).values({ name: bankName });
```

#### ✅ NEW WAY (With L0 Kernel)

```typescript
// GOOD: Query L0 for valid banks in jurisdiction
const validBanks = await getKernelValues('VALUESET_MALAYSIA_BANKS');

if (!validBanks.some(b => b.value_code === bankCode)) {
  throw new Error(`Invalid bank code: ${bankCode}`);
}

// Proceed with validated data
await db.insert(banks).values({
  bank_code: bankCode,
  canonical_id: validBanks.find(b => b.value_code === bankCode).id
});
```

#### 🎯 BEST WAY (With Helper Functions)

```typescript
// BEST: Use kernel validation helpers
import { validateKernelValue } from '@nexus/kernel';

await validateKernelValue('VALUESET_MALAYSIA_BANKS', bankCode);
// Throws if invalid, continues if valid

// Or get canonical ID directly
const bankCanonicalId = await getKernelCanonicalId(
  'CONCEPT_BANK',
  'MY', // jurisdiction
  bankCode
);
```

---

## Monitoring & Alerting

### L0 Kernel Health Checks

```
┌────────────────────────────────────────────────────────────┐
│              L0 KERNEL HEALTH DASHBOARD                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 📊 Concept Registry                                       │
│   • Total Concepts: 20                                    │
│   • Active: 20                                            │
│   • Deprecated: 0                                         │
│                                                            │
│ 📊 Value Sets                                             │
│   • Total Value Sets: 2                                   │
│   • Global: 2 (Currencies, Countries)                     │
│   • Jurisdictional: 0                                     │
│                                                            │
│ 📊 Values                                                 │
│   • Total Values: 9                                       │
│   • Currencies: 5                                         │
│   • Countries: 4                                          │
│                                                            │
│ 📊 Identity Mappings                                      │
│   • Total Mappings: 0 (to be populated)                   │
│   • Verified: 0                                           │
│   • Pending: 0                                            │
│                                                            │
│ 🔔 Alerts (None)                                          │
│   ✅ No drift detected                                    │
│   ✅ No orphaned values                                   │
│   ✅ All foreign keys valid                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Future Phases

### Phase 2: Guardrail Matrix Enforcement (Next)

- Drift detection system
- JSONB contract validation
- RLS policy verification
- CI/CD integration

### Phase 3: Domain Policy Implementation (L1)

- Finance domain policies
- Supply chain policies
- Permission matrices
- Role-based access (RBAC)

---

## Key Takeaways

### For Developers

1. **Always query L0 first** before creating entities
2. **Never hardcode enum values** - use L0 value sets
3. **Validate via L0** to prevent semantic drift
4. **L0 is read-only for you** - request kernel admin for new concepts

### For Architects

1. **L0 is the absolute authority** - no exceptions
2. **Downstream layers derive, never redefine**
3. **Jurisdictional truth is registered** via value sets
4. **Version history is immutable** - audit-friendly

### For Stakeholders

1. **Single source of truth** eliminates data inconsistency
2. **Multi-jurisdiction support** handles global complexity
3. **Audit-ready** with complete version history
4. **AI-safe** with explicit concept definitions

---

**The Kernel Doctrine is operational. Truth is centralized. Chaos is prevented.**
