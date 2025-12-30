# NEXUS Canon: Prevention System

> **"Prevention is better than cure"** - This document explains how NEXUS prevents TypeScript errors from entering the codebase.

## 🛡️ Prevention Layers

### Layer 1: Real-Time (VS Code)

Errors are shown **as you type** via TypeScript language server.

**Features:**

- Red squiggles under type errors
- Quick fixes via `Cmd+.` / `Ctrl+.`
- Auto-import suggestions
- Format on save (Prettier)
- ESLint fix on save

**Required Extensions:**

```
dbaeumer.vscode-eslint
esbenp.prettier-vscode
usernamehw.errorlens (shows errors inline)
```

### Layer 2: Pre-Commit (Husky + lint-staged)

Errors are **blocked from being committed**.

**What happens on `git commit`:**

1. TypeScript checks the entire portal app
2. ESLint checks staged `.ts/.tsx` files
3. Prettier formats staged `.json/.md` files
4. If any check fails → commit is blocked

**Bypass (emergency only):**

```bash
git commit --no-verify -m "emergency fix"
```

### Layer 3: CI/CD (GitHub Actions)

Errors are **blocked from being merged**.

**Pipeline checks:**

- `pnpm typecheck:portal` - TypeScript
- `pnpm lint` - ESLint
- `pnpm build` - Next.js build

## 📋 Configuration Files

| File                            | Purpose                    |
| ------------------------------- | -------------------------- |
| `tsconfig.base.json`            | Strict TypeScript settings |
| `tsconfig.strict.json`          | Ultra-strict for CI        |
| `.husky/pre-commit`             | Git hook script            |
| `package.json` (lint-staged)    | File-specific checks       |
| `.vscode/settings.json`         | Editor settings            |
| `.vscode/extensions.json`       | Recommended extensions     |
| `apps/portal/eslint.config.mjs` | ESLint rules               |

## 🔧 TypeScript Strict Settings

**Always Enabled:**

```json
{
  "strict": true, // Core strict mode
  "noFallthroughCasesInSwitch": true, // Switch safety
  "noImplicitReturns": true, // Return safety
  "forceConsistentCasingInFileNames": true,
  "allowUnreachableCode": false,
  "isolatedModules": true
}
```

**Available for CI (ultra-strict):**

```json
{
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noUncheckedIndexedAccess": true
}
```

## 🚀 Commands

```bash
# Quick type check
pnpm typecheck:portal

# Ultra-strict check
pnpm typecheck:strict

# Full pre-commit check
pnpm precommit

# Lint with auto-fix
pnpm lint --fix
```

## 📐 Best Practices

### 1. Always Use Types

```typescript
// ❌ Bad - implicit any
function process(data) { ... }

// ✅ Good - explicit types
function process(data: Invoice): ProcessResult { ... }
```

### 2. Prefer Zod Schemas

```typescript
// ❌ Bad - runtime type errors possible
const vendor = await getVendor(id);
vendor.name; // Could be undefined!

// ✅ Good - validated at runtime
const vendor = validateVendorPayload(rawData);
vendor.legal_name; // Type-safe!
```

### 3. Handle Null/Undefined

```typescript
// ❌ Bad - assumes value exists
const name = vendor.display_name.toUpperCase();

// ✅ Good - handles missing value
const name = vendor.display_name?.toUpperCase() ?? vendor.legal_name;
```

### 4. Use Type Guards

```typescript
// ❌ Bad - type assertion
const status = data.status as InvoiceStatus;

// ✅ Good - type guard
if (isInvoiceStatus(data.status)) {
  const status: InvoiceStatus = data.status;
}
```

## 🔴 Emergency Bypass

If you absolutely must bypass the checks:

```bash
# Bypass pre-commit hook
git commit --no-verify -m "emergency: [reason]"
```

**Rules for bypass:**

1. Only in genuine emergencies
2. Create follow-up issue to fix
3. Never bypass for "convenience"
4. Must have team approval in production branches

---

_Last updated: 2025-12-31_
