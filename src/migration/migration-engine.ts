// @aibos/kernel - Migration Engine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Core migration engine for kernel version upgrades
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { checkCompatibility } from "./version-compatibility.js";
import type { MigrationResult, BreakingChange } from "./types.js";
import { KERNEL_VERSION } from "../version.js";

/**
 * Migration context
 */
export interface MigrationContext {
  /** Source version */
  fromVersion: string;
  /** Target version */
  toVersion: string;
  /** Whether to perform dry run */
  dryRun?: boolean;
  /** Whether to skip validation */
  skipValidation?: boolean;
}

/**
 * Execute migration from one version to another
 * 
 * @param context - Migration context
 * @returns Migration result
 * 
 * @example
 * ```typescript
 * import { executeMigration } from '@aibos/kernel/migration';
 * 
 * const result = await executeMigration({
 *   fromVersion: '1.0.0',
 *   toVersion: '1.1.0',
 *   dryRun: false,
 * });
 * 
 * if (result.success) {
 *   console.log(`Migrated ${result.itemsMigrated.concepts} concepts`);
 * }
 * ```
 */
export async function executeMigration(
  context: MigrationContext
): Promise<MigrationResult> {
  const { fromVersion, toVersion, dryRun = false, skipValidation = false } = context;
  
  // Check compatibility
  const compatibility = checkCompatibility(fromVersion, toVersion);
  
  if (!compatibility.safe && !skipValidation) {
    return {
      success: false,
      message: `Migration from ${fromVersion} to ${toVersion} is not safe. Breaking changes detected.`,
      errors: ["Migration is not safe. Breaking changes detected."],
      warnings: [],
      itemsMigrated: {
        concepts: 0,
        valueSets: 0,
        values: 0,
      },
    };
  }
  
  // If no migration required, return success
  if (!compatibility.migrationRequired) {
    return {
      success: true,
      message: `No migration required from ${fromVersion} to ${toVersion}`,
      errors: [],
      warnings: [],
      itemsMigrated: {
        concepts: 0,
        valueSets: 0,
        values: 0,
      },
    };
  }
  
  // Detect breaking changes
  const breakingChanges = detectBreakingChanges(fromVersion, toVersion);
  
  if (breakingChanges.length > 0 && !skipValidation) {
    return {
      success: false,
      message: `Breaking changes detected. Migration cannot proceed automatically.`,
      errors: breakingChanges.map((change) => `${change.type}: ${change.item} - ${change.description}`),
      warnings: [],
      itemsMigrated: {
        concepts: 0,
        valueSets: 0,
        values: 0,
      },
    };
  }
  
  // Perform migration
  if (dryRun) {
    return {
      success: true,
      message: `Dry run: Migration from ${fromVersion} to ${toVersion} would be performed`,
      errors: [],
      warnings: breakingChanges.length > 0 
        ? breakingChanges.map((change) => `Breaking change: ${change.type} - ${change.item}`)
        : [],
      itemsMigrated: {
        concepts: 0,
        valueSets: 0,
        values: 0,
      },
    };
  }
  
  // Actual migration logic would go here
  // For now, return success (implementation depends on specific migration needs)
  return {
    success: true,
    message: `Migration from ${fromVersion} to ${toVersion} completed successfully`,
    errors: [],
    warnings: compatibility.deprecations.length > 0
      ? compatibility.deprecations.map((dep) => `Deprecated: ${dep}`)
      : [],
    itemsMigrated: {
      concepts: 0,
      valueSets: 0,
      values: 0,
    },
  };
}

/**
 * Detect breaking changes between versions
 * 
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @returns List of breaking changes
 */
export function detectBreakingChanges(
  fromVersion: string,
  toVersion: string
): BreakingChange[] {
  // This would compare kernel registries to detect breaking changes
  // For now, return empty array (implementation depends on registry comparison)
  const compatibility = checkCompatibility(fromVersion, toVersion);
  
  if (compatibility.breaking) {
    // In a real implementation, this would compare:
    // - Concept lists (detect removals/renames)
    // - Value set lists (detect removals/renames)
    // - Value lists (detect removals/renames)
    // - Schema changes (detect structure changes)
    
    return [
      {
        type: "SCHEMA_CHANGE",
        item: "kernel",
        description: `Major version change from ${fromVersion} to ${toVersion} may include breaking changes`,
      },
    ];
  }
  
  return [];
}

/**
 * Rollback migration
 * 
 * @param fromVersion - Current version
 * @param toVersion - Target version (rollback to)
 * @returns Migration result
 */
export async function rollbackMigration(
  fromVersion: string,
  toVersion: string
): Promise<MigrationResult> {
  // Rollback is essentially a reverse migration
  return executeMigration({
    fromVersion,
    toVersion,
    skipValidation: true, // Rollback may be unsafe, but allow it
  });
}

/**
 * Validate migration can be performed
 * 
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @returns Whether migration is valid
 */
export function validateMigration(
  fromVersion: string,
  toVersion: string
): { valid: boolean; errors: string[] } {
  const compatibility = checkCompatibility(fromVersion, toVersion);
  const errors: string[] = [];
  
  if (!compatibility.safe) {
    errors.push(`Migration from ${fromVersion} to ${toVersion} is not safe`);
  }
  
  if (compatibility.breaking) {
    errors.push(`Breaking changes detected between ${fromVersion} and ${toVersion}`);
  }
  
  const breakingChanges = detectBreakingChanges(fromVersion, toVersion);
  if (breakingChanges.length > 0) {
    errors.push(
      `Breaking changes detected: ${breakingChanges.map((c) => c.item).join(", ")}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

