# L0 Kernel Foundation Deployment Guide

**Status:** Ready to Deploy
**Migration File:** [`apps/portal/supabase/migrations/20251230_l0_kernel_foundation.sql`](../../apps/portal/supabase/migrations/20251230_l0_kernel_foundation.sql)
**Date:** 2025-12-30
**Priority:** P0 (Foundation for all future work)

---

## 🚀 Quick Start: Deploy via Supabase Dashboard

### Step 1: Access SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Execute Migration
1. Open the migration file: `apps/portal/supabase/migrations/20251230_l0_kernel_foundation.sql`
2. Copy **all content** (600+ lines)
3. Paste into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Deployment
Run this verification query:
```sql
-- Check all 5 L0 tables exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'kernel_%'
ORDER BY table_name;

-- Expected output:
-- kernel_concept_registry (14 columns)
-- kernel_concept_version_history (11 columns)
-- kernel_identity_mapping (13 columns)
-- kernel_value_set_registry (15 columns)
-- kernel_value_set_values (14 columns)
```

### Step 4: Verify Seed Data
```sql
-- Check 20 concepts seeded
SELECT concept_category, COUNT(*) as count
FROM kernel_concept_registry
GROUP BY concept_category
ORDER BY concept_category;

-- Expected output:
-- ATTRIBUTE: 4 concepts
-- ENTITY: 6 concepts
-- OPERATION: 4 concepts
-- RELATIONSHIP: 3 concepts

-- Check currencies seeded
SELECT value_code, value_label
FROM kernel_value_set_values
WHERE value_set_id = 'VALUESET_GLOBAL_CURRENCIES'
ORDER BY sort_order;

-- Expected output:
-- USD | US Dollar
-- EUR | Euro
-- MYR | Malaysian Ringgit
-- SGD | Singapore Dollar
-- GBP | British Pound

-- Check countries seeded
SELECT value_code, value_label
FROM kernel_value_set_values
WHERE value_set_id = 'VALUESET_GLOBAL_COUNTRIES'
ORDER BY sort_order;

-- Expected output:
-- MY | Malaysia
-- SG | Singapore
-- US | United States
-- GB | United Kingdom
```

---

## 🔐 Post-Deployment: Grant Kernel Admin Role

After deployment, grant yourself (and other admins) the `kernel_admin` role:

```sql
-- Replace 'your-email@example.com' with actual admin email
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"kernel_admin"'::jsonb
)
WHERE email = 'your-email@example.com';

-- Verify role assignment
SELECT
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'kernel_admin';
```

---

## ✅ Security Verification: Test RLS Policies

### Test 1: Regular Users Can Read
```sql
-- Switch to a regular user session (not kernel_admin)
-- This should work (return all concepts)
SELECT concept_id, concept_name FROM kernel_concept_registry;
```

### Test 2: Regular Users Cannot Write
```sql
-- This should FAIL with RLS policy violation
INSERT INTO kernel_concept_registry (concept_id, concept_name, concept_category, concept_description)
VALUES ('CONCEPT_TEST', 'Test', 'ENTITY', 'Test concept');
-- Expected: ERROR - new row violates row-level security policy
```

### Test 3: Kernel Admins Can Write
```sql
-- As a kernel_admin user, this should succeed
INSERT INTO kernel_concept_registry (concept_id, concept_name, concept_category, concept_description)
VALUES ('CONCEPT_TEST', 'Test', 'ENTITY', 'Test concept');

-- Clean up test data
DELETE FROM kernel_concept_registry WHERE concept_id = 'CONCEPT_TEST';
```

---

## 🔧 Alternative: Install Supabase CLI

### Windows (via npm)
```powershell
npm install -g supabase
```

### Windows (via Scoop)
```powershell
# Install Scoop first (if not installed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Once CLI is installed:
```powershell
# Navigate to portal directory
cd C:\AI-BOS\AIBOS-NEXUS-KERNEL\apps\portal

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

---

## 📊 Database Statistics After Deployment

**Before L0 Kernel:**
- Tables: ~50 tables
- Total indexes: ~100 indexes
- RLS policies: ~50 policies

**After L0 Kernel:**
- Tables: ~55 tables (+5 L0 Kernel tables)
- Total indexes: ~117 indexes (+17 kernel indexes)
- RLS policies: ~60 policies (+10 kernel policies)

**L0 Foundation Metrics:**
- Concepts: 20 foundational concepts
- Value Sets: 2 (Currencies, Countries)
- Values: 9 (5 currencies, 4 countries)
- Indexes: 17 (optimized for read-heavy workloads)
- RLS Policies: 10 (read-all, write-admin)
- Constraints: 28 (data integrity enforcement)

---

## 🎯 What This Migration Enables

### 1. Concept Registry (ABSOLUTE AUTHORITY)
- All business concepts must be registered in L0
- No downstream layer can create concepts not registered here
- "If it's not in L0, it doesn't exist" axiom enforced

### 2. Jurisdictional Value Sets
- Currencies: ISO 4217 compliance
- Countries: ISO 3166-1 compliance
- Extensible for banks, payment methods, statuses, etc.

### 3. Canonical Identity Mapping
- Maps external system IDs to immutable L0 IDs
- Supports SWIFT codes, tax IDs, regulatory codes
- Enables "No Evidence, No Coin" enforcement

### 4. Immutable Audit Trail
- All L0 changes tracked in version history
- Breaking changes flagged
- Full snapshots preserved

### 5. RLS Security Model
- `kernel_admin`: Full L0 governance authority
- `data_steward`: Can manage value set data
- Regular users: Read-only access

---

## ⚠️ Important Notes

### Migration Safety
- ✅ **Idempotent:** Safe to run multiple times (uses `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
- ✅ **No Data Loss:** Only creates new tables, doesn't modify existing data
- ✅ **Backward Compatible:** Doesn't break existing functionality

### Dependencies
- ✅ **auth.users table:** Must exist (standard Supabase auth)
- ✅ **gen_random_uuid():** Built-in PostgreSQL function
- ✅ **JSONB support:** Built-in PostgreSQL data type

### Performance
- ✅ **Optimized Indexes:** 17 indexes for fast lookups
- ✅ **GIN Index:** For JSONB alias searching
- ✅ **Partial Indexes:** For active records only

---

## 🚦 Next Steps After Deployment

### Phase 2: Guardrail Matrix Enforcement
1. **Drift Detection System**
   - CI/CD integration to detect unauthorized concepts
   - Automated alerts for L0 violations

2. **JSONB Contract Validation**
   - Write-time enforcement of JSONB contracts
   - Reject data that doesn't match registered schemas

3. **Application Integration**
   - Repository layer (TypeScript)
   - Admin UI for L0 management
   - API endpoints for concept lookup

### Immediate Actions
1. ✅ Deploy migration (this guide)
2. ✅ Grant kernel_admin role to authorized users
3. ✅ Test RLS policies
4. ✅ Add Malaysian banks to CONCEPT_BANK value set
5. ✅ Add payment methods to CONCEPT_PAYMENT_METHOD value set

---

## 📞 Troubleshooting

### Issue: "relation 'auth.users' does not exist"
**Solution:** You're not using Supabase Auth. Either:
1. Enable Supabase Auth in your project
2. Modify migration to use your custom users table

### Issue: RLS policies not working
**Solution:**
1. Verify `kernel_admin` role is set in `auth.users.raw_user_meta_data->>'role'`
2. Check you're authenticated when testing
3. Verify RLS is enabled on tables

### Issue: Migration fails midway
**Solution:**
1. The migration is idempotent - safe to re-run
2. Check which table failed and investigate constraint violations
3. Review PostgreSQL error message for specific issue

---

## 📚 Related Documentation

- [NEXUS_CANON_V5_KERNEL_DOCTRINE.md](../../NEXUS_CANON_V5_KERNEL_DOCTRINE.md) - Full Kernel Doctrine
- [KERNEL_DOCTRINE_PHASE_1_COMPLETE.md](KERNEL_DOCTRINE_PHASE_1_COMPLETE.md) - Technical implementation details
- [L0_KERNEL_VISUAL_GUIDE.md](L0_KERNEL_VISUAL_GUIDE.md) - Visual diagrams and examples
- [KERNEL_PHASE_1_SUMMARY.md](KERNEL_PHASE_1_SUMMARY.md) - Executive summary

---

**Status:** Ready to Deploy ✅
**Author:** AIBOS Nexus Kernel Team
**Date:** 2025-12-30
