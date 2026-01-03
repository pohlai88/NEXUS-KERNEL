# Code Standards

Coding conventions and standards for `@aibos/kernel`.

## TypeScript Configuration

### Strict Mode

**Required:** All TypeScript strict flags enabled.

*See Config:* [`tsconfig.base.json`](../../tsconfig.base.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Type Safety Rules

- **No `any` types** - Use proper types or `unknown`
- **No raw strings** - Always use kernel exports
- **Explicit types** - Prefer explicit over inferred where clarity matters
- **Type guards** - Use type guards for runtime validation

## Naming Conventions

### Concepts

```typescript
// ✅ Good
CONCEPT.INVOICE
CONCEPT.VENDOR
CONCEPT.ACCOUNT

// ❌ Bad
CONCEPT.invoice
CONCEPT.vendor
"CONCEPT_INVOICE" // Raw string
```

### Value Sets

```typescript
// ✅ Good
VALUESET.CURRENCIES
VALUESET.ACCOUNT_TYPE

// ❌ Bad
VALUESET.currencies
"VALUESET_GLOBAL_CURRENCIES" // Raw string
```

### Values

```typescript
// ✅ Good
VALUE.CURRENCIES.MYR
VALUE.ACCOUNT_TYPE.ASSET

// ❌ Bad
VALUE.currencies.myr
"CURRENCY_MYR" // Raw string
```

### Functions

```typescript
// ✅ Good - camelCase
function validateKernelIntegrity() {}
function generateCanonId() {}

// ❌ Bad
function ValidateKernelIntegrity() {}
function validate_kernel_integrity() {}
```

### Types and Interfaces

```typescript
// ✅ Good - PascalCase
type ConceptCategory = "ENTITY" | "ATTRIBUTE";
interface ConceptShape {
  code: string;
}

// ❌ Bad
type conceptCategory = "ENTITY" | "ATTRIBUTE";
interface concept_shape {
  code: string;
}
```

## File Organization

### File Naming

- **kebab-case** for file names: `kernel.contract.ts`
- **Descriptive names**: `concept-registry.ts` not `concepts.ts`
- **One main export per file** when possible

### File Structure

```
src/
├── concepts.ts          # Concept definitions
├── values.ts            # Value definitions
├── kernel.contract.ts   # Frozen contract
├── kernel.validation.ts # Validation functions
└── [module].ts          # Module code
```

## Code Style

### Imports

```typescript
// ✅ Good - Grouped and sorted
import { z } from "zod";

import { CONCEPT } from "./concepts";
import { VALUE } from "./values";

// ❌ Bad - Unsorted
import { VALUE } from "./values";
import { CONCEPT } from "./concepts";
import { z } from "zod";
```

### Exports

```typescript
// ✅ Good - Named exports
export const CONCEPT = { ... };
export type ConceptId = string;

// ❌ Bad - Default exports (avoid for constants)
export default CONCEPT;
```

### Comments

```typescript
// ✅ Good - JSDoc for public APIs
/**
 * Validates kernel integrity.
 * Throws if counts don't match expected.
 */
export function validateKernelIntegrity(): void {
  // Implementation
}

// ✅ Good - Inline comments for complex logic
// Compute deterministic hash from registry contents
const hash = computeHash(registry);

// ❌ Bad - Obvious comments
// Set the value
const value = 10;
```

## Validation Patterns

### Schema Validation

```typescript
// ✅ Good - Use Zod schemas
import { z } from "zod";
import { ConceptShapeSchema } from "./kernel.contract";

const concept = ConceptShapeSchema.parse(data);

// ❌ Bad - Manual validation
if (!data.code || !data.category) {
  throw new Error("Invalid");
}
```

### Type Guards

```typescript
// ✅ Good - Type guards
function isConcept(value: string): value is ConceptId {
  return Object.values(CONCEPT).includes(value as ConceptId);
}

// ❌ Bad - Type assertions
const concept = value as ConceptId;
```

## Testing Standards

### Test Structure

```typescript
// ✅ Good - Descriptive test names
describe("validateKernelIntegrity", () => {
  it("should pass when counts match", () => {
    // Test
  });

  it("should throw when concept count mismatches", () => {
    // Test
  });
});
```

### Test Coverage

- **Minimum 80% coverage**
- **Test all public APIs**
- **Test error cases**
- **Test edge cases**

## Linting and Formatting

### ESLint Configuration

*See Config:* `.eslintrc.js` (if exists)

Rules enforced:
- TypeScript strict rules
- No `any` types
- No unused variables
- Consistent import order

### Prettier Configuration

*See Config:* `.prettierrc` (if exists)

Formatting enforced:
- 2-space indentation
- Semicolons
- Single quotes (or double, consistent)
- Trailing commas

## Code Generation

### Generated Files

- **Never edit manually** - Files marked with `AUTO-GENERATED`
- **Edit source data** - Modify pack JSON files
- **Regenerate** - Run `pnpm generate`
- **Commit both** - Source and generated files

### Generator Scripts

```typescript
// ✅ Good - Deterministic generation
function generateConcepts(packs: Pack[]): string {
  // Deterministic output
  return packs.map(pack => generatePackCode(pack)).join("\n");
}
```

## Related Documentation

- **[Contributing Guidelines](./contributing.md)** - Contribution process
- **[TypeScript Configuration](../../tsconfig.base.json)** - TSConfig file
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Design Principles](../architecture/design-principles.md)** - Core principles
- **[Getting Started Guide](../guides/getting-started.md)** - Quick start

