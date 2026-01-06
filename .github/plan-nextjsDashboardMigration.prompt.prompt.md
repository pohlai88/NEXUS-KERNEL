# FINAL REFINED PLAN: Next.js Dashboard Migration (Single Dashboard)

**TL;DR:** Migrate existing dashboard to Next.js App Router (don't build a separate one). Next.js 16 already includes Turbopack (no Turborepo needed). Add features like pagination incrementally as needed.

---

## Key Changes Based on Feedback

✅ **Removed Turborepo** - Next.js 16 uses Turbopack for dev (`next dev --turbo`)
✅ **Single Dashboard Strategy** - Migrate existing dashboard, don't build separate one
✅ **Incremental Enhancement** - Add pagination/features as needed, not upfront

---

## Critical Fixes Applied

### Fix 1: Vercel Read-Only Filesystem
- ✅ Snapshots generated via GitHub Actions cron only
- ✅ Dashboard reads pre-committed snapshots from Git
- ✅ No `fs.writeFile()` at runtime
- ✅ Optional: "Request Snapshot" button triggers GitHub Dispatch Event

### Fix 2: Tailwind Workspace Scanning
```typescript
// ui/dashboard/tailwind.config.ts
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../components/src/**/*.{ts,tsx}" // Scan workspace package
  ]
}
```

### Fix 3: Polling vs Caching
```typescript
// ui/dashboard/src/app/api/poll/route.ts
export const dynamic = 'force-dynamic'; // Bypass Next.js cache
export const revalidate = 0; // No ISR here
```

### Fix 4: Best-Effort Adapter Pipeline
```typescript
// scripts/populate-all-modules.ts
const results = await Promise.allSettled([
  runERPNextAdapter(),  // Critical P0
  runISOAdapter(),      // Best effort
  runUNECEAdapter()     // Best effort
]);
// Fail only if P0 adapters fail
```

---

## MVP Scope vs Phase 2+

### MVP (Milestones A-B, Week 1-2)
- ✅ Next.js dashboard with Server Components
- ✅ Analytics engine (coverage, risk scoring, value tracking)
- ✅ Module pages + overview
- ✅ ETag-based polling
- ✅ Basic drift detection
- ✅ Minimal UI (shadcn in dashboard, not extracted)

### Phase 2+ (After MVP proven)
- 🔮 Extract `@aibos/ui` library
- 🔮 Data adapter pipeline (ERPNext, ISO, UNECE)
- 🔮 Full test pyramid
- 🔮 Storybook
- 🔮 Advanced features (exports, webhooks, Supabase)

---

## Milestone A: Migrate Dashboard to Next.js (2-3 days)

### Step A1: Initialize Next.js App in Existing Structure
Convert current dashboard to Next.js without creating new separate app:
- Create `ui/dashboard/` using `npx create-next-app@latest ui/dashboard --typescript --tailwind --app --src-dir`
- Configure root `package.json`: `"workspaces": ["ui/dashboard"]`
- Link kernel: `pnpm add @aibos/kernel@workspace:*` in dashboard
- Update scripts in root `package.json`: `"dashboard": "cd ui/dashboard && pnpm dev --turbo"` (replace old `dashboard:v2`)
- **Migration plan:** Port `scripts/serve-dashboard-v2.ts` analytics to Next.js App Router pages
- **Deprecate:** `scripts/serve-dashboard.ts` and `scripts/serve-dashboard-v2.ts` move to `scripts/legacy/`

### Step A2: Initialize shadcn/ui
Set up component library in dashboard:
- Run `npx shadcn@latest init` in `ui/dashboard/`
- Configure `ui/dashboard/tailwind.config.ts`: Extend existing `ui/style.css` tokens (Quantum Indigo, P1-P10 design system)
- Add minimal components for MVP: `npx shadcn@latest add button card table badge alert`
- Components stay in `ui/dashboard/src/components/ui/` (extract to `@aibos/ui` in Phase 2)

### Step A3: Port Existing Dashboard to RSC Pages
Migrate current v2.0 dashboard features to Next.js pages:

**`ui/dashboard/src/app/page.tsx`** - Main overview (migrate from v2.0):
- Port "System Verdict" card
- Port "Silent Killers" sidebar
- Port "Risk Matrix" (top 5 canons)
- Port "Stats" panel
- Uses `getCachedConcepts()`, `getCachedValueSets()`, `getCachedValues()` from `@aibos/kernel/nextjs`
- Simple ISR: `export const revalidate = 60`

**`ui/dashboard/src/app/modules/[module]/page.tsx`** - Module detail pages:
- Dynamic routes for Finance, Inventory, Sales, etc.
- Use `generateStaticParams()` to pre-render all module pages
- Show module-specific coverage, blocking gaps, required values
- **Add pagination when needed** - not upfront

**`ui/dashboard/src/app/coverage/page.tsx`** - Full coverage heatmap (migrate from v1.0):
- Port v1.0's detailed coverage grid showing all 13 canons
- **Add pagination later** if needed for many canons

### Step A4: Port Analytics Engine
Migrate analytics from `scripts/serve-dashboard-v2.ts`:

**`ui/dashboard/src/lib/analytics/coverage.ts`**:
- Port `computeAnalytics()` function
- Calculate coverage per canon, blocking gaps, missing value sets
- Add value-level tracking (not just value sets)

**`ui/dashboard/src/lib/analytics/risk-scoring.ts`**:
- Port risk scoring plugin
- Formula: `(Missing/Required)×40 + (Tier1?30:15) + (SilentKiller?30:0)`

**`ui/dashboard/src/lib/analytics/types.ts`**:
- TypeScript interfaces for analytics data

### Step A5: Build UI Layout
Create layout matching existing v2.0 design:

**`ui/dashboard/src/app/layout.tsx`**:
- Root layout with Tailwind
- Dark mode provider (next-themes)
- Navigation matching current dashboard
- 3-column grid layout (left sidebar, main content, right sidebar)

**`ui/dashboard/src/components/`**:
- Port existing v2.0 components as Server Components
- `coverage-card.tsx`, `verdict-badge.tsx`, `risk-matrix.tsx`, `silent-killers.tsx`

### Step A6: Single Analytics API Route
One endpoint for all analytics:

**`ui/dashboard/src/app/api/analytics/route.ts`**:
- GET endpoint returning full analytics (coverage + risk + stats)
- Simple caching: `export const revalidate = 60`
- Return JSON with ETag header based on kernel version

**Milestone A Deliverable:** Existing v2.0 dashboard features now running in Next.js at http://localhost:3000, old Node.js dashboards deprecated.

---

## Milestone B: Add Polling + Drift (2-3 days)

### Step B1: Add ETag-Optimized Polling

**`ui/dashboard/src/app/api/poll/route.ts`**:
- Lightweight endpoint: `export const dynamic = 'force-dynamic'`, `export const revalidate = 0`
- Return minimal JSON: `{ version, snapshot, hasChanges }`
- Support `If-None-Match` header, return 304 if unchanged

**`ui/dashboard/src/lib/polling/use-analytics-poller.ts`**:
- Custom hook with intervals: 10s dev, 30s prod, 60s idle tab
- ETag support with `If-None-Match`

**`ui/dashboard/src/components/client/real-time-poller.tsx`**:
- First `"use client"` component
- Show toast on updates

### Step B2: Simple Drift Page

**`ui/dashboard/src/app/drift/page.tsx`**:
- Compare current counts vs baseline
- Simple diff: concept count, value set count, value count
- Show "changed packs" by file modification times

### Step B3: Basic Trends (If Snapshots Exist)

**`ui/dashboard/src/app/trends/page.tsx`**:
- Load snapshots from `snapshots/` if directory exists
- Simple line chart showing growth
- Graceful fallback if no snapshots

**`ui/dashboard/src/lib/snapshots/loader.ts`**:
- Load snapshot JSONs using `fs.readdir()`

### Step B4: Add Editable Sections

**`ui/dashboard/src/components/client/editable-section.tsx`**:
- Markdown editor with localStorage persistence
- Auto-save with 500ms debounce

**`ui/dashboard/src/components/client/action-items.tsx`**:
- Todo list (add drag-drop later if needed, not upfront)

**Milestone B Deliverable:** Dashboard with real-time polling, drift detection, basic trends, editable notes. Single production dashboard replacing all legacy dashboards.

---

## Milestone C: Extract Library + Adapters (1 week)

### Step C1: Extract `@aibos/ui` Library
After UI stabilizes:
- Create `ui/components/` workspace
- Move components from `ui/dashboard/src/components/ui/`
- Configure `ui/components/tsup.config.ts`
- Update Tailwind config to scan `../components/src/**/*.{ts,tsx}`

### Step C2: Build Data Adapter System

**`scripts/adapters/base-adapter.ts`**: Abstract base
**`scripts/adapters/erpnext-adapter.ts`**: ERPNext data
**`scripts/adapters/iso-standards-adapter.ts`**: ISO standards
**`scripts/adapters/unece-adapter.ts`**: UOM codes
**`scripts/adapters/iana-adapter.ts`**: Timezones

All output to `data/external/`

### Step C3: Best-Effort Pipeline

**`scripts/populate-all-modules.ts`**:
- Run adapters with `Promise.allSettled()`
- Fail only if P0 (ERPNext) fails

**`scripts/validate-populated-data.ts`**: Validation
**`scripts/merge-to-templates.ts`**: Merge to templates

### Step C4: GitHub Actions Snapshots

**`scripts/snapshot-kernel.ts`**:
- Generate small snapshots (counts + metadata)
- Save to `snapshots/`

**`.github/workflows/snapshot.yml`**:
- Daily cron at 00:00 UTC
- Commit to dedicated branch `snapshots-data`

### Step C5: Deploy to Vercel

**`ui/dashboard/vercel.json`**: Edge Functions, caching
**`ui/dashboard/next.config.ts`**: Optimizations
**`.github/workflows/deploy-dashboard.yml`**: Auto-deploy

### Step C6: MVP Testing

**Unit Tests**: Analytics functions (80%+ coverage)
**1 E2E Test**: Overview page loads and displays data

**Milestone C Deliverable:** Production dashboard deployed, UI library extracted, data adapters working, automated snapshots.

---

## Phase 2+: Advanced Features (Add When Needed)

**Add incrementally based on real needs:**
- Pagination (when canon list grows)
- Drag-drop (when prioritization is needed)
- Storybook (when component library is shared widely)
- Full test pyramid (when stability is critical)
- Advanced analytics (when basic analytics are insufficient)
- Export features (when stakeholders request)
- Supabase WebSocket (when polling is too slow)

---

## Updated Cleanup Strategy

**After Milestone A:**
- Move `scripts/serve-dashboard.ts` → `scripts/legacy/serve-dashboard-v1.ts`
- Move `scripts/serve-dashboard-v2.ts` → `scripts/legacy/serve-dashboard-v2.ts`
- Update root `package.json`: `"dashboard": "cd ui/dashboard && pnpm dev --turbo"` (single command)
- Update `DASHBOARD-V2-GUIDE.md`: Migration guide to Next.js dashboard, deprecation notice

---

## Key Changes Summary

✅ **No Turborepo** - Next.js 16 includes Turbopack for dev
✅ **Single Dashboard** - Migrate existing v2.0 to Next.js, don't build separate
✅ **Incremental Features** - Add pagination/drag-drop/etc. when actually needed
✅ **Simplified Workflow** - One dashboard to maintain, not 4

---

## Decision Rule: "Does it change what users see this week?"

**If a feature doesn't directly improve the dashboard UI or analytics this week, it's Phase 2.**

This prevents infrastructure theater and keeps focus on shipping value.

---

## Execution Timeline

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| Week 1 | A + B | Working dashboard with polling, drift, basic trends |
| Week 2 | C | Extracted UI library, data adapters, deployed to Vercel |
| Week 3+ | Phase 2 | Storybook, full tests, advanced features |

---

## Data Source Strategy

**Primary:** ERPNext (proven ERP, comprehensive values)
**Standards:** ISO (countries, currencies, languages), UNECE (UOM codes), IANA (timezones)
**Manual:** Custom business rules, Malaysia-specific tax codes

**Component Library:** shadcn/ui (Radix) → `@aibos/ui` shared package, HTML adapter for static exports

**Rendering:** React Server Components (default) for low-latency HTML, selective client components with `"use client"`

**Real-time:** Polling (30s prod, 10s dev, 60s idle) with ETag optimization, WebSocket upgrade path via Supabase (feature flag)

**State:** localStorage + React Server Actions

**Historical:** Git commits with daily cron job

**Testing:** Unit (Vitest 80%+), 1 E2E (Playwright), expand in Phase 2

**Deployment:** Vercel (primary) with Railway fallback

**Bundle Budget:** <500KB total enforced via CI
