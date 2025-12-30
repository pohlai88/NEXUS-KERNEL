# Audit Report Corrections - Specific Diffs

**Date:** 2025-12-30  
**Purpose:** Specific code changes and documentation updates based on critique

---

## 1. DRY Violation Fix - Centralized Request Context

### New File: `apps/portal/src/lib/request-context.ts`

```typescript
// ✅ NEW FILE: Centralized request context
import { cookies, headers } from 'next/headers';

export interface RequestContext {
  actor: {
    userId: string;
    tenantId: string | null;
    roles: string[];
  };
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function getRequestContext(): Promise<RequestContext> {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // TODO: Replace with actual auth middleware when implemented
  const userId = cookieStore.get('user_id')?.value || 'system';
  const tenantId = cookieStore.get('tenant_id')?.value || null;
  const roles = cookieStore.get('roles')?.value?.split(',') || [];
  
  return {
    actor: {
      userId,
      tenantId,
      roles,
    },
    requestId: crypto.randomUUID(),
    ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
    userAgent: headersList.get('user-agent'),
  };
}
```

### Update All 57+ Files

**Before (in each file):**
```typescript
// ❌ REMOVE: Duplicate function
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: null,
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}
```

**After (in each file):**
```typescript
// ✅ ADD: Import from centralized location
import { getRequestContext } from '@/src/lib/request-context';
```

---

## 2. Type Safety Enforcement - Update `.cursorrules`

### Add to Section 7 (Production-Grade Requirements)

**Location:** After Section 7.6 (Code Clarity)

**Add:**
```markdown
### 7.7 TypeScript Enforcement (MANDATORY)

**CRITICAL RULE:** All code MUST pass TypeScript strict mode checks. IDE MUST enforce these rules.

**Enforcement Rules:**

1. **No `any` types allowed:**
   - ❌ `const data: any = ...`
   - ✅ `const data: InvoiceData = ...`
   - ✅ `const data: unknown = ...` (with type guards)

2. **No implicit `any`:**
   - ❌ `const items = []` (implicit any[])
   - ✅ `const items: Invoice[] = []`

3. **No `@ts-ignore` or `@ts-expect-error`:**
   - ❌ `// @ts-ignore`
   - ✅ Fix the underlying type issue

4. **All functions must have explicit return types:**
   - ❌ `function getData() { ... }`
   - ✅ `function getData(): Promise<Invoice[]> { ... }`

5. **All interfaces must be exported if used across files:**
   - ❌ `interface InvoiceData { ... }` (missing export)
   - ✅ `export interface InvoiceData { ... }`

6. **Type guards required for `unknown` types:**
   - ❌ `const data: unknown = ...; data.property`
   - ✅ `const data: unknown = ...; if (isInvoice(data)) { data.property }`

**IDE Configuration:**
- TypeScript errors MUST be shown as errors (not warnings)
- IDE MUST block commits with TypeScript errors
- `npm run typecheck` MUST pass before code review

**ESLint Rules (MANDATORY):**
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

**Current Status:**
- ⚠️ 100+ TypeScript errors found in audit
- ⚠️ Many `any` types in codebase
- ⚠️ Missing type definitions
- ⚠️ Implicit `any` arrays

**Action Required:**
1. Fix all TypeScript errors (P0 - Blocking)
2. Add ESLint rules above to `eslint.config.mjs`
3. Configure IDE to treat TypeScript errors as blocking
4. Add pre-commit hook: `npm run typecheck`
```

---

## 3. CSS Loading Fix - Remove Workaround

### Update `apps/portal/app/layout.tsx`

**Before:**
```typescript
import { AIBOSStyles } from "./aibos-styles";
// ... other imports

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AIBOSStyles />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**After:**
```typescript
import 'aibos-design-system/style.css'; // ✅ Direct import (AIBOS 1.1.0 compatible)
// Remove: import { AIBOSStyles } from "./aibos-styles";
// ... other imports

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Remove: <AIBOSStyles /> */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Delete Files

1. **Delete:** `apps/portal/app/aibos-styles.tsx`
2. **Delete:** `apps/portal/app/api/aibos-css/route.ts`

### Update `apps/portal/next.config.ts`

**Before:**
```typescript
async rewrites() {
  return [
    {
      source: '/node_modules/aibos-design-system/:path*',
      destination: '/aibos-design-system.css', // Fallback to public folder
    },
  ];
}
```

**After:**
```typescript
// ✅ REMOVE: Rewrite no longer needed (direct import works)
// async rewrites() {
//   return [];
// }
```

---

## 4. Audit Report Corrections

### Update Section 6 (Design System Integration)

**Before:**
```markdown
3. **CSS Loading** - ✅ AIBOS CSS loaded via API route (workaround for Next.js 16 parser)
```

**After:**
```markdown
3. **CSS Loading** - ⚠️ Using workaround (AIBOS 1.1.0 is compatible with direct import)
   - **Current:** Dynamic loading via API route (workaround)
   - **Recommended:** Direct CSS import: `import 'aibos-design-system/style.css'`
   - **Priority:** P1 (High) - Remove workaround, use direct import
```

### Update Section 13 (Compliance Status)

**Before:**
```markdown
### Kernel Doctrine Compliance: 90% ✅

- ✅ L0-L3 layer architecture
- ✅ Repository pattern
- ✅ Design system integration
- ⚠️ Type safety (errors need fixing)
```

**After:**
```markdown
### Kernel Doctrine Compliance: 27.5% ❌

**Breakdown:**
- ❌ **L0 (Kernel):** 0% - No Concept Registry, Value Sets, or Identity Mapping found
- ⚠️ **L1 (Domain):** 10% - Only claims domain has policy engine (9+ domains missing)
- ❌ **L2 (Cluster):** 0% - No workflow layer, approval chains in wrong layer
- ✅ **L3 (Cell):** 100% - UI and components correctly implemented

**Critical Gaps:**
1. L0 Kernel missing - No Concept Registry implementation
2. L1 Domain incomplete - Only 1/10+ domains have policy engines
3. L2 Cluster missing - No workflow layer
4. Layer violations - Business logic in L3, concepts in L3, policies in repositories

**Priority Actions (P0):**
1. Implement L0 Kernel Registry
2. Create L1 Domain Policy Engines for all domains
3. Create L2 Cluster Workflows
4. Refactor layer violations
```

### Add New Section: DRY Violations

**Add after Section 2 (Code Quality Analysis):**

```markdown
## 2.5 DRY (Don't Repeat Yourself) Violations

### 🔴 CRITICAL: Massive Code Duplication

**Found:** 57+ files with duplicate `getRequestContext()` function

**Impact:**
- ~1,140 lines of duplicate code
- Single point of change requires updating 57+ files
- Blocks authentication middleware integration

**Solution:**
- Centralize in `src/lib/request-context.ts`
- Import from single source in all files
- **Reduction:** 97% code reduction (1,140 lines → 30 lines)

**Priority:** P0 (Critical) - Blocks auth integration

**Files Affected:** 57+ files (see full list in critique document)
```

---

## 5. ESLint Configuration Update

### Update `apps/portal/eslint.config.mjs`

**Before:**
```javascript
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "@nexus/canon": canonPlugin,
    },
    rules: {
      "@nexus/canon/forbid-free-string-status": "error",
      "@nexus/canon/require-schema-header": "warn",
      "@nexus/canon/forbid-bypass-imports": "warn",
    },
  },
  // ...
]);
```

**After:**
```javascript
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "@nexus/canon": canonPlugin,
    },
    rules: {
      "@nexus/canon/forbid-free-string-status": "error",
      "@nexus/canon/require-schema-header": "warn",
      "@nexus/canon/forbid-bypass-imports": "warn",
      // ✅ ADD: TypeScript enforcement rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
  // ...
]);
```

---

## Summary of File Changes

### New Files
1. `apps/portal/src/lib/request-context.ts` - Centralized request context

### Modified Files
1. `.cursorrules` - Add Section 7.7 (TypeScript Enforcement)
2. `apps/portal/app/layout.tsx` - Direct CSS import, remove AIBOSStyles
3. `apps/portal/next.config.ts` - Remove CSS rewrite
4. `apps/portal/eslint.config.mjs` - Add TypeScript enforcement rules
5. `docs/integrations/nextjs/NEXTJS_MCP_AUDIT_REPORT_2025-12-30.md` - Update sections 6, 13, add 2.5

### Deleted Files
1. `apps/portal/app/aibos-styles.tsx` - No longer needed
2. `apps/portal/app/api/aibos-css/route.ts` - No longer needed

### Files to Update (57+ files)
- All files with `getRequestContext()` function
- Replace with import: `import { getRequestContext } from '@/src/lib/request-context';`

---

**Diff Generated:** 2025-12-30  
**Status:** Ready for Implementation  
**Priority:** P0 (Critical corrections)

