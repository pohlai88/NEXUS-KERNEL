# @aibos/kernel

> **The Business Constitution (L0 SSOT)**

[![npm version](https://img.shields.io/npm/v/@aibos/kernel.svg)](https://www.npmjs.com/package/@aibos/kernel)
[![CI](https://github.com/pohlai88/NEXUS-KERNEL/workflows/CI/badge.svg)](https://github.com/pohlai88/NEXUS-KERNEL/actions/workflows/ci.yml)
[![Security Scan](https://github.com/pohlai88/NEXUS-KERNEL/workflows/Security%20Scan/badge.svg)](https://github.com/pohlai88/NEXUS-KERNEL/actions/workflows/security.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-96.81%25-brightgreen)](https://github.com/pohlai88/NEXUS-KERNEL)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Next.js Optimized ✅

This package is **fully optimized for Next.js** applications:
- ✅ Tree-shaking support
- ✅ Server Components compatible
- ✅ Subpath exports for granular imports
- ✅ Lazy loading for large value sets
- ✅ Optimized bundle size
- ✅ Dual format builds (ESM + CJS)
- ✅ Dual type definitions (.d.ts + .d.cts)
- ✅ Versioned exports (/v1)
- ✅ Next.js middleware integration
- ✅ Next.js route handlers
- ✅ Next.js cache strategy with `unstable_cache`

**Features:**
- Dual format builds (ESM + CJS) for maximum compatibility
- Tree-shaking optimized with `sideEffects: false`
- Server Components compatible (zero client-side JavaScript)
- Subpath exports for granular imports
- Lazy loading support for large value sets
- Next.js integration utilities (`@aibos/kernel/nextjs`)

---

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

## Next.js Integration

The `@aibos/kernel/nextjs` export provides optimized utilities for Next.js App Router. Choose the pattern that fits your use case:

### 🎯 **Pattern 1: Server Components (Recommended)**

**Best for:** Server-side rendering, type-safe data access, optimal performance

```typescript
// app/concepts/page.tsx
import { getCachedConcepts, getCachedValueSets, getCachedValues } from '@aibos/kernel/nextjs';

export default async function ConceptsPage() {
  // Automatically cached with Next.js unstable_cache
  const concepts = await getCachedConcepts();
  const valueSets = await getCachedValueSets();
  const values = await getCachedValues();
  
  return (
    <div>
      <h1>Kernel Concepts</h1>
      <ul>
        {Object.entries(concepts).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Benefits:**
- ✅ Automatic caching (1 hour default, configurable)
- ✅ Zero client-side JavaScript
- ✅ Type-safe imports
- ✅ Best performance (no API calls)

### 🔌 **Pattern 2: Route Handlers (API Endpoints)**

**Best for:** Client-side fetching, external API access, mobile apps

```typescript
// app/api/kernel/concepts/route.ts
import { handleGetConcepts } from '@aibos/kernel/nextjs';

export const GET = handleGetConcepts;
```

```typescript
// app/api/kernel/valuesets/route.ts
import { handleGetValueSets } from '@aibos/kernel/nextjs';

export const GET = handleGetValueSets;
```

```typescript
// app/api/kernel/values/route.ts
import { handleGetValues } from '@aibos/kernel/nextjs';

export const GET = handleGetValues;
```

```typescript
// app/api/kernel/version/route.ts
import { handleGetVersion } from '@aibos/kernel/nextjs';

export const GET = handleGetVersion;
```

```typescript
// app/api/kernel/validate/route.ts
import { handleValidateKernel } from '@aibos/kernel/nextjs';

export const POST = handleValidateKernel;
```

**Client-side usage:**
```typescript
// app/components/ConceptList.tsx (Client Component)
'use client';

import { useEffect, useState } from 'react';

export function ConceptList() {
  const [concepts, setConcepts] = useState(null);
  
  useEffect(() => {
    fetch('/api/kernel/concepts')
      .then(res => res.json())
      .then(data => setConcepts(data.data));
  }, []);
  
  return <div>{/* Render concepts */}</div>;
}
```

### 🛡️ **Pattern 3: Middleware (Optional)**

**Best for:** Background validation, monitoring, non-blocking checks

```typescript
// middleware.ts (root of your Next.js app)
import { withKernelValidation } from '@aibos/kernel/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Your existing middleware logic (auth, redirects, etc.)
  return NextResponse.next();
}

// Wrap with kernel validation (runs on every request, non-blocking)
export default withKernelValidation(middleware);

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Alternative: Standalone validation**
```typescript
// middleware.ts
import { kernelValidationMiddleware } from '@aibos/kernel/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Run kernel validation first (non-blocking)
  await kernelValidationMiddleware(request);
  
  // Your other middleware logic
  return NextResponse.next();
}
```

### 🚀 **Pattern 4: Custom Cache Strategy**

**Best for:** Fine-grained cache control, custom revalidation

```typescript
// app/concepts/page.tsx
import { createKernelCache } from '@aibos/kernel/nextjs';

// Create custom cached function
const getCustomConcepts = createKernelCache(
  'custom-concepts',
  async () => {
    // Your custom logic
    const concepts = await fetchConceptsFromDatabase();
    return concepts;
  },
  {
    revalidate: 1800, // 30 minutes
    tags: ['concepts', 'custom'],
  }
);

export default async function ConceptsPage() {
  const concepts = await getCustomConcepts();
  return <div>{/* Render */}</div>;
}
```

**Cache revalidation:**
```typescript
// app/api/kernel/sync/route.ts
import { revalidateKernelCache, revalidateKernelTag } from '@aibos/kernel/nextjs';

export async function POST() {
  // Sync kernel to database
  await syncKernelToDatabase();
  
  // Revalidate all kernel caches
  await revalidateKernelCache();
  
  // Or revalidate specific tag
  await revalidateKernelTag('concepts');
  
  return Response.json({ success: true });
}
```

### 📊 **Performance Comparison**

| Pattern | Use Case | Performance | Type Safety | Caching |
|---------|----------|-------------|-------------|---------|
| **Server Components** | SSR, Pages | ⭐⭐⭐⭐⭐ | ✅ Full | ✅ Automatic |
| **Route Handlers** | API, Client-side | ⭐⭐⭐ | ✅ Full | ⚠️ Manual |
| **Middleware** | Validation | ⭐⭐⭐⭐ | ✅ Full | ✅ In-memory |
| **Custom Cache** | Advanced | ⭐⭐⭐⭐⭐ | ✅ Full | ✅ Configurable |

### 🎓 **Best Practices**

1. **Prefer Server Components** - Use `getCachedConcepts()` in Server Components for best performance
2. **Use Route Handlers sparingly** - Only when you need API endpoints (client-side, external access)
3. **Middleware is optional** - Use only if you need request-time validation/monitoring
4. **Cache invalidation** - Call `revalidateKernelCache()` after kernel updates
5. **Type safety** - Always use kernel exports, never raw strings

### 🔄 **Complete Example: Full Stack Integration**

```typescript
// 1. Server Component (app/invoices/page.tsx)
import { getCachedConcepts, getCachedValueSets } from '@aibos/kernel/nextjs';
import { InvoiceList } from './InvoiceList';

export default async function InvoicesPage() {
  const concepts = await getCachedConcepts();
  const valueSets = await getCachedValueSets();
  
  return (
    <div>
      <h1>Invoices</h1>
      <InvoiceList concepts={concepts} valueSets={valueSets} />
    </div>
  );
}

// 2. Client Component (app/invoices/InvoiceList.tsx)
'use client';

import { CONCEPT, VALUE } from '@aibos/kernel';

export function InvoiceList({ concepts, valueSets }) {
  // Use type-safe kernel constants
  const invoiceType = CONCEPT.INVOICE;
  const status = VALUE.INVOICE_STATUS.DRAFT;
  
  return <div>{/* Render invoices */}</div>;
}

// 3. API Route (app/api/invoices/route.ts)
import { handleGetConcepts } from '@aibos/kernel/nextjs';
import { CONCEPT } from '@aibos/kernel';

export async function GET() {
  // Validate using kernel constants
  const invoiceConcept = CONCEPT.INVOICE;
  
  // Fetch invoices from database
  const invoices = await db.invoices.findMany({
    where: { type: invoiceConcept },
  });
  
  return Response.json({ invoices });
}

// 4. Middleware (middleware.ts)
import { withKernelValidation } from '@aibos/kernel/nextjs';

export default withKernelValidation((req) => {
  // Kernel validated automatically
  return NextResponse.next();
});
```

## Version Migration

Migrate between kernel versions using the migration system:

### Migration CLI

```bash
# Check compatibility between versions
pnpm tsx scripts/migrate-kernel.ts check 1.0.0 1.1.0

# Perform migration
pnpm tsx scripts/migrate-kernel.ts migrate 1.0.0 1.1.0

# Dry run (preview changes without applying)
pnpm tsx scripts/migrate-kernel.ts migrate 1.0.0 1.1.0 --dry-run
```

### Programmatic Migration

```typescript
import { executeMigration, validateMigration, rollbackMigration } from '@aibos/kernel/migration';

// Validate migration before executing
const validation = validateMigration('1.0.0', '1.1.0');
if (!validation.valid) {
  console.error('Migration not safe:', validation.errors);
  process.exit(1);
}

// Execute migration
const result = await executeMigration({
  fromVersion: '1.0.0',
  toVersion: '1.1.0',
  dryRun: false,
});

if (result.success) {
  console.log(`Migrated ${result.itemsMigrated.concepts} concepts`);
  console.log(`Warnings: ${result.warnings.join(', ')}`);
} else {
  console.error('Migration failed:', result.errors);
}

// Rollback if needed
const rollbackResult = await rollbackMigration('1.1.0', '1.0.0');
```

### Migration Types

| Version Change | Breaking | Safe | Migration Required |
|----------------|----------|------|-------------------|
| **PATCH** (1.1.0 → 1.1.1) | ❌ No | ✅ Yes | ❌ No |
| **MINOR** (1.1.0 → 1.2.0) | ❌ No | ✅ Yes | ⚠️ Optional |
| **MAJOR** (1.0.0 → 2.0.0) | ✅ Yes | ❌ No | ✅ Yes |

### Migration Checklist

1. ✅ **Check compatibility** - Verify migration is safe
2. ✅ **Review deprecations** - Check for deprecated concepts/values
3. ✅ **Dry run** - Preview changes without applying
4. ✅ **Backup** - Backup database before migration
5. ✅ **Execute** - Run migration in staging first
6. ✅ **Validate** - Verify kernel integrity after migration
7. ✅ **Update code** - Update any deprecated references
8. ✅ **Test** - Run full test suite
9. ✅ **Deploy** - Deploy to production

### Handling Breaking Changes

When migrating across major versions:

```typescript
import { detectBreakingChanges } from '@aibos/kernel/migration';

const breakingChanges = detectBreakingChanges('1.0.0', '2.0.0');

breakingChanges.forEach(change => {
  console.warn(`${change.type}: ${change.item}`);
  console.warn(`Description: ${change.description}`);
  if (change.migrationGuidance) {
    console.warn(`Guidance: ${change.migrationGuidance}`);
  }
});
```

### Supabase Database Migration

If using Supabase, sync kernel metadata after migration:

```typescript
import { syncKernelToDatabase } from '@aibos/kernel/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const result = await syncKernelToDatabase(supabase, kernelRegistry);

console.log(`Synced ${result.totalSynced} entities`);
if (result.errors.length > 0) {
  console.error('Errors:', result.errors);
}
```

## Repository Update

Update the entire repository with a single command:

```bash
pnpm update
# or
pnpm update:repo
```

This script will:
- ✅ Update all dependencies
- ✅ Clean build artifacts
- ✅ Regenerate kernel data
- ✅ Build the project
- ✅ Run all tests
- ✅ Generate coverage reports
- ✅ Validate kernel integrity
- ✅ Analyze bundle size

## Documentation

Comprehensive documentation is available:

- **[README.md](./README.md)** - This file - Complete integration guide with Next.js, Supabase, and migration examples
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and all changes
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project

**Core Documentation:**
- **[PRD: NPM Package](./docs/PRD-KERNEL_NPM.md)** - Original product requirements
- **[PRD: ERP Production Ready](./docs/PRD-KERNEL_ERP_PRODUCTION_READY.md)** - Production requirements
- **[Kernel Doctrine](./docs/NEXUS_CANON_V5_KERNEL_DOCTRINE.md)** - Core architectural principles

## Project Structure

```
NEXUS-KERNEL/
├── src/                    # Source code (71 files)
│   ├── nextjs/            # Next.js integration (9 files)
│   ├── migration/         # Version migration system (5 files)
│   ├── supabase/          # Supabase integration (8 files)
│   ├── monitoring/         # Performance & error tracking (2 files)
│   └── [core modules]     # Core kernel (44 files)
├── supabase/              # Database & Edge Functions
│   ├── migrations/        # 3 database migrations
│   └── functions/         # 2 Edge Functions
├── packs/                 # Kernel pack definitions (15 files)
├── scripts/               # Build & utility scripts (14 files)
├── docs/                  # Core documentation (3 PRDs + Doctrine)
└── dist/                  # Build output (dual ESM/CJS)
```

**Statistics:**
- **Source Files:** 41 TypeScript files
- **Test Files:** 30 test files (73% test ratio)
- **Migrations:** 3 SQL migrations
- **Edge Functions:** 2 functions
- **Package Exports:** 10 subpath exports

## License

MIT
