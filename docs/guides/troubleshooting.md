
# Troubleshooting Guide

Common issues and solutions when working with `@aibos/kernel`.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Type Errors](#type-errors)
- [Validation Errors](#validation-errors)
- [Runtime Errors](#runtime-errors)
- [Database Issues](#database-issues)

## Installation Issues

### Package Not Found

**Error:** `Cannot find module '@aibos/kernel'`

**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Or with pnpm
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Version Mismatch

**Error:** Package version doesn't match expected

**Solution:**
```bash
# Check installed version
npm list @aibos/kernel

# Update to latest
npm install @aibos/kernel@latest
```

## Type Errors

### "Cannot find name 'CONCEPT'"

**Error:** TypeScript can't find kernel exports

**Solution:**
```typescript
// Ensure correct import
import { CONCEPT } from "@aibos/kernel";

// Check tsconfig.json includes node_modules
// Check package.json has correct exports
```

### "Property does not exist on type"

**Error:** Concept or value doesn't exist

**Solution:**
```typescript
// Check if concept exists
import { CONCEPT } from "@aibos/kernel";
console.log(CONCEPT.INVOICE); // Should print "CONCEPT_INVOICE"

// Check kernel version
import { KERNEL_VERSION } from "@aibos/kernel";
console.log(KERNEL_VERSION); // Should match package.json
```

### Raw String Warnings

**Error:** Linter warns about raw strings

**Solution:**
```typescript
// ❌ Bad
const type = "CONCEPT_INVOICE";

// ✅ Good
import { CONCEPT } from "@aibos/kernel";
const type = CONCEPT.INVOICE;
```

## Validation Errors

### Kernel Integrity Failure

**Error:** `validateKernelIntegrity()` throws

**Solution:**
```typescript
import { validateKernelIntegrity, KERNEL_VERSION } from "@aibos/kernel";

try {
  validateKernelIntegrity();
} catch (error) {
  console.error("Kernel drift detected:", error);
  console.log("Expected version:", KERNEL_VERSION);
  // Check if kernel files were manually modified
  // Regenerate kernel if needed: pnpm generate
}
```

### Snapshot Mismatch

**Error:** Database snapshot doesn't match kernel

**Solution:**
```typescript
import { SNAPSHOT_ID } from "@aibos/kernel";

const dbSnapshot = await getDbSnapshot();
if (dbSnapshot !== SNAPSHOT_ID) {
  // Update database snapshot
  await updateDbSnapshot(SNAPSHOT_ID);
}
```

## Runtime Errors

### "CONCEPT is not defined"

**Error:** Runtime error accessing CONCEPT

**Solution:**
```typescript
// Ensure proper import
import { CONCEPT } from "@aibos/kernel";

// Check if running in Node.js environment
// Check if package is properly installed
```

### "Cannot read property of undefined"

**Error:** Accessing non-existent concept/value

**Solution:**
```typescript
// Check if concept exists before using
import { CONCEPT } from "@aibos/kernel";

if (CONCEPT.INVOICE) {
  // Safe to use
  const type = CONCEPT.INVOICE;
}
```

## Database Issues

### Drift Detection Failure

**Error:** CI/CD fails on drift detection

**Solution:**
1. Check kernel version in database
2. Compare snapshot IDs
3. Run migration scripts
4. Update kernel_metadata table

### Missing Concepts in Database

**Error:** Database missing concepts from kernel

**Solution:**
```typescript
// Regenerate and seed database
pnpm generate
pnpm seed:kernel

// Or manually update
await seedKernelConcepts();
```

## Common Patterns

### Checking Concept Existence

```typescript
import { CONCEPT } from "@aibos/kernel";

function isValidConcept(concept: string): boolean {
  return Object.values(CONCEPT).includes(concept as any);
}
```

### Getting All Values in Set

```typescript
import { VALUE } from "@aibos/kernel";

const allCurrencies = Object.values(VALUE.CURRENCIES);
console.log(allCurrencies); // ["CURRENCY_MYR", "CURRENCY_USD", ...]
```

### Type-Safe Value Checking

```typescript
import { VALUE } from "@aibos/kernel";

function isValidCurrency(currency: string): boolean {
  return Object.values(VALUE.CURRENCIES).includes(currency as any);
}
```

## Getting Help

If you encounter issues not covered here:

1. Check [CHANGELOG.md](../../CHANGELOG.md) for recent changes
2. Review [Architecture Documentation](../architecture/overview.md)
3. Check [GitHub Issues](https://github.com/pohlai88/NEXUS-KERNEL/issues)
4. Review [Usage Guide](./usage.md) for examples
5. Check [Glossary](./glossary.md) for terminology

## Related Documentation

- **[Getting Started](./getting-started.md)** - Quick start tutorial
- **[Usage Guide](./usage.md)** - Practical examples
- **[Migration Guide](./migration.md)** - Version migration
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Glossary](./glossary.md)** - Ubiquitous Language
- **[Contributing Guidelines](../governance/contributing.md)** - How to contribute

