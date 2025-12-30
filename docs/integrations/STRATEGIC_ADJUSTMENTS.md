# Strategic Adjustments - Senior Director Review

**Date:** 2025-01-27  
**Status:** ✅ Approved with Mandatory Adjustments  
**Authority:** Senior Director Strategic Review  
**Compliance:** Execution-focused, zero technical debt

---

## 🚨 Critical Strategic Adjustments

### 1. Schema Alignment (NO Mapping Layer) ✅

**Decision:** Database schema MUST match Kernel exactly. No translation layers.

**Action:**
- ✅ Database migration applied: `name` → `legal_name`
- ✅ Added Kernel-aligned columns: `display_name`, `country_code`, `email`, `official_aliases`
- ✅ Status values support Kernel: `PENDING`, `SUBMITTED`, `APPROVED`, `REJECTED`, `SUSPENDED`

**Rationale:** Mapping layers are technical debt. For a greenfield system, align the database to the Kernel.

---

### 2. Figma Automation (Deferred to Phase 2)

**Decision:** Manual `na-*` class application for Phase 1. Automation tools deferred.

**Action:**
- Phase 1: Manual application of AIBOS classes
- Phase 2: Build automation tools when managing 20+ screens

**Rationale:** Building Figma compiler takes longer than building 5 screens. Ship the portal first.

---

### 3. Realtime Presence (Downgraded to P3)

**Decision:** Keep Realtime Data Sync (P0). Drop Presence tracking (P3).

**Action:**
- ✅ Keep: Realtime data updates (INSERT, UPDATE, DELETE)
- ❌ Drop: "John is viewing this vendor" presence tracking

**Rationale:** Presence consumes WebSocket connections and quotas. Low value for administrative portal.

---

### 4. CSS Hack Accessibility (Replaced with Standard Patterns)

**Decision:** Use Next.js Parallel Routes instead of CSS-only view switching.

**Action:**
- Replace "Radio Button State Machine" with Next.js Parallel Routes
- Use standard React state for view switching
- Maintain accessibility (keyboard navigation, screen readers)

**Rationale:** CSS-only hacks break accessibility. Performance gain negligible vs. accessibility risk.

---

## 🛡️ Revised Architecture

### Database Schema (Kernel-Aligned) ✅

```sql
CREATE TABLE vmp_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  
  -- Kernel Spine (Matches L0 exactly)
  legal_name text NOT NULL,        -- ✅ Migrated from 'name'
  country_code text NOT NULL,
  status text NOT NULL,            -- PENDING, APPROVED, etc. (Kernel values)
  
  -- Kernel Flesh
  display_name text,
  email text,
  phone text,
  official_aliases jsonb DEFAULT '[]',
  
  -- CRUD-S
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz,
  deleted_at timestamptz
);
```

### Tech Stack (Revised)

1. **Next.js 16:** Server Components + Server Actions
2. **Supabase:** Auth + DB + Realtime (Data Sync only)
3. **Styling:** Manual `na-*` classes (No Figma compiler)
4. **State:** URL-driven (Search Params)

### Priority List (Revised)

**P0 (Critical):**
- ✅ Inline Editing
- ✅ Optimistic Updates
- ✅ Realtime Data Sync

**P1 (High):**
- ✅ Parallel Routes (replaces CSS hack)
- ✅ Intercepting Routes (Quick View modals)

**P3 (Low):**
- ⚠️ Realtime Presence (deferred)

---

## ✅ Implementation Directive

**Green Light:** Proceed with Vendor List Page implementation.

**Do NOT:**
- ❌ Build Figma CLI tool
- ❌ Write mapping layer
- ❌ Implement presence tracking

**DO:**
- ✅ Align database schema to Kernel
- ✅ Use Server Components
- ✅ Manual AIBOS class application
- ✅ Standard Next.js patterns

---

**Authority:** Senior Director Strategic Review  
**Enforcement:** All implementations must follow these adjustments.

