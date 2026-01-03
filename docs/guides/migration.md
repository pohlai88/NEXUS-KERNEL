# Migration Guide

Guidance for migrating between versions of `@aibos/kernel`.

## Version Compatibility

The kernel follows [Semantic Versioning](https://semver.org/):
- **MAJOR** (x.0.0) - Breaking changes
- **MINOR** (x.y.0) - Additive changes (backwards compatible)
- **PATCH** (x.y.z) - Documentation/tooling only

## Migration Checklist

- [ ] Review [CHANGELOG.md](../../CHANGELOG.md) for changes
- [ ] Update package version
- [ ] Run `validateKernelIntegrity()`
- [ ] Update imports if needed
- [ ] Test application thoroughly
- [ ] Update database snapshot if needed

## Major Version Migrations

### v2.0.0 → v3.0.0 (Future)

When migrating to v3.0.0:

1. **Review Breaking Changes**
   - Check CHANGELOG for removed concepts/values
   - Update all references to renamed concepts
   - Update database schema if needed

2. **Update Imports**
   ```typescript
   // Before (v2.0.0)
   import { CONCEPT_V2 } from "@aibos/kernel";
   
   // After (v3.0.0)
   import { CONCEPT } from "@aibos/kernel";
   ```

3. **Validate Integrity**
   ```typescript
   import { validateKernelIntegrity } from "@aibos/kernel";
   validateKernelIntegrity(); // Throws if incompatible
   ```

4. **Update Database**
   - Run migration scripts if provided
   - Update `kernel_metadata` table
   - Verify snapshot ID matches

## Minor Version Migrations

### v1.0.0 → v1.1.0

Minor versions are backwards compatible. Simply update the package:

```bash
npm install @aibos/kernel@latest
```

New concepts/values are additive and won't break existing code.

## Common Migration Scenarios

### Renamed Concept

If a concept is renamed:

```typescript
// Before
import { CONCEPT } from "@aibos/kernel";
const oldConcept = CONCEPT.OLD_NAME;

// After
const newConcept = CONCEPT.NEW_NAME; // Use new name
```

### Removed Value

If a value is removed:

```typescript
// Before
import { VALUE } from "@aibos/kernel";
const oldValue = VALUE.STATUS.OLD_VALUE;

// After
// Find replacement value or handle removal
const newValue = VALUE.STATUS.NEW_VALUE; // Use replacement
```

### New Required Concept

If a new concept becomes required:

```typescript
// Before
const data = {
  type: CONCEPT.INVOICE,
  // ... other fields
};

// After
const data = {
  type: CONCEPT.INVOICE,
  newField: CONCEPT.NEW_CONCEPT, // Add required field
  // ... other fields
};
```

## Database Migration

### Updating Snapshot ID

When kernel version changes, update database:

```sql
-- Update kernel metadata
UPDATE kernel_metadata
SET 
  kernel_version = '1.1.0',
  snapshot_id = 'snapshot:1.1.0:abc123...',
  updated_at = NOW();
```

### Validating Drift

```typescript
import { SNAPSHOT_ID } from "@aibos/kernel";

const dbSnapshot = await getDbSnapshot();
if (dbSnapshot !== SNAPSHOT_ID) {
  throw new Error("Database snapshot mismatch");
}
```

## Troubleshooting Migrations

### Kernel Integrity Errors

If `validateKernelIntegrity()` throws:

1. Check kernel version matches package.json
2. Verify all concepts/values are present
3. Check for manual modifications to kernel files

### Type Errors

If TypeScript errors occur:

1. Clear node_modules and reinstall
2. Restart TypeScript server
3. Check for deprecated imports

### Database Drift

If database snapshot doesn't match:

1. Review migration scripts
2. Update kernel_metadata table
3. Re-run seed scripts if needed

## Related Documentation

- **[CHANGELOG.md](../../CHANGELOG.md)** - Version history
- **[Troubleshooting Guide](./troubleshooting.md)** - Common issues
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Release Process](../governance/release-process.md)** - Release workflow
- **[Getting Started Guide](./getting-started.md)** - Quick start

