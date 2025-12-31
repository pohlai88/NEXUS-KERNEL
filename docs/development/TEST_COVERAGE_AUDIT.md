# Test Coverage Audit

**Date**: 2025-06-30
**Status**: Initial Setup Complete
**Framework**: Vitest 4.0.16 with React Testing Library

---

## Overview

This document tracks the test coverage status across the AIBOS Nexus Kernel codebase.

## Test Infrastructure

### Setup Complete ✅

| Component             | Status        | Notes                         |
| --------------------- | ------------- | ----------------------------- |
| Vitest                | ✅ Installed  | v4.0.16 with coverage-v8      |
| React Testing Library | ✅ Installed  | v16.3.1                       |
| Jest DOM Matchers     | ✅ Installed  | v6.9.1                        |
| Coverage Reporter     | ✅ Configured | v8 provider with HTML/LCOV    |
| Setup File            | ✅ Created    | `vitest.setup.ts` with mocks  |
| Config File           | ✅ Created    | `vitest.config.ts` with paths |

### Available Commands

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Interactive UI
pnpm test:ui
```

---

## Coverage Targets

### Phase 1 (Current): Foundation

| Metric     | Target | Current |
| ---------- | ------ | ------- |
| Statements | 20%    | TBD     |
| Branches   | 20%    | TBD     |
| Functions  | 20%    | TBD     |
| Lines      | 20%    | TBD     |

### Phase 2: Core Business Logic

| Metric     | Target | Timeline |
| ---------- | ------ | -------- |
| Statements | 40%    | Q3 2025  |
| Branches   | 35%    | Q3 2025  |
| Functions  | 40%    | Q3 2025  |
| Lines      | 40%    | Q3 2025  |

### Phase 3: Comprehensive

| Metric     | Target | Timeline |
| ---------- | ------ | -------- |
| Statements | 70%    | Q4 2025  |
| Branches   | 60%    | Q4 2025  |
| Functions  | 70%    | Q4 2025  |
| Lines      | 70%    | Q4 2025  |

---

## Coverage by Package

### @nexus/kernel

Priority: **P0 - Critical**

| Module              | Tests     | Coverage | Priority |
| ------------------- | --------- | -------- | -------- |
| `schemaHeader.ts`   | ✅ 1 file | TBD      | P0       |
| `canonId.ts`        | ❌ None   | 0%       | P0       |
| `statusSet.ts`      | ❌ None   | 0%       | P0       |
| `contractSchema.ts` | ❌ None   | 0%       | P0       |
| `validation.ts`     | ❌ None   | 0%       | P1       |

### @nexus/cruds

Priority: **P1 - High**

| Module             | Tests   | Coverage | Priority |
| ------------------ | ------- | -------- | -------- |
| Repository classes | ❌ None | 0%       | P1       |
| CRUD operations    | ❌ None | 0%       | P1       |
| Query builders     | ❌ None | 0%       | P2       |

### @nexus/ui-actions

Priority: **P2 - Medium**

| Module            | Tests   | Coverage | Priority |
| ----------------- | ------- | -------- | -------- |
| `runAction.ts`    | ❌ None | 0%       | P1       |
| Permission checks | ❌ None | 0%       | P1       |
| Action handlers   | ❌ None | 0%       | P2       |

### apps/portal

Priority: **P1 - High**

| Area           | Tests   | Coverage | Priority |
| -------------- | ------- | -------- | -------- |
| Server Actions | ❌ None | 0%       | P0       |
| Repositories   | ❌ None | 0%       | P1       |
| API Routes     | ❌ None | 0%       | P1       |
| Components     | ❌ None | 0%       | P2       |
| Utils/Lib      | ❌ None | 0%       | P2       |

---

## Test Categories

### Unit Tests (Priority: P0)

- Pure function testing
- Schema validation
- Data transformation
- Business logic

### Integration Tests (Priority: P1)

- Repository operations
- Server action flows
- API route handlers

### Component Tests (Priority: P2)

- UI component rendering
- User interaction flows
- Form validation

### E2E Tests (Priority: P3)

- Critical user journeys
- Authentication flows
- Data submission workflows

---

## Recommended Test Files to Create

### Immediate (P0)

1. `packages/kernel/src/canonId.test.ts`

   - Canon ID format validation
   - Parse/create functions

2. `packages/kernel/src/statusSet.test.ts`

   - Status set creation
   - Status validation
   - State transitions

3. `apps/portal/src/repositories/__tests__/invoice-repository.test.ts`
   - CRUD operations
   - Business rules

### Short-term (P1)

4. `apps/portal/app/api/__tests__/web-vitals.test.ts`

   - Metric processing
   - Buffer management

5. `apps/portal/app/system-control/kernel-steward/__tests__/actions.test.ts`
   - Server action validation
   - Error handling

### Medium-term (P2)

6. `apps/portal/components/__tests__/WebVitals.test.tsx`
   - Component mounting
   - Metric callbacks

---

## Mocking Strategy

### Database (Supabase)

```typescript
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}));
```

### Next.js Router

Already configured in `vitest.setup.ts`

### Server Actions

```typescript
vi.mock("./actions", async () => {
  const actual = await vi.importActual("./actions");
  return {
    ...actual,
    updateTenantConfig: vi.fn().mockResolvedValue({ success: true }),
  };
});
```

---

## Running Tests

### All Tests

```bash
cd apps/portal
pnpm test
```

### Specific File

```bash
pnpm test src/repositories/invoice-repository.test.ts
```

### Coverage Report

```bash
pnpm test:coverage
# Opens HTML report at ./coverage/index.html
```

---

## CI/CD Integration

### GitHub Actions (Recommended)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v4
        with:
          file: ./apps/portal/coverage/lcov.info
```

---

## Changelog

### 2025-06-30

- ✅ Initial Vitest setup
- ✅ Test infrastructure configured
- ✅ Coverage targets defined
- ✅ First test file created: `schemaHeader.test.ts`
- ✅ Test commands added to package.json
