// @aibos/kernel - Migration Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Type definitions for kernel versioning and migration system
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Version compatibility information
 */
export interface VersionCompatibility {
  /** Source version */
  from: string;
  /** Target version */
  to: string;
  /** Whether this is a breaking change */
  breaking: boolean;
  /** Whether migration is safe to perform */
  safe: boolean;
  /** Whether migration is required */
  migrationRequired: boolean;
  /** List of deprecated items */
  deprecations: string[];
  /** Migration script name (if required) */
  migrationScript?: string;
  /** Rollback script name (if available) */
  rollbackScript?: string;
}

/**
 * Migration result
 */
export interface MigrationResult {
  /** Whether migration succeeded */
  success: boolean;
  /** Migration message */
  message: string;
  /** Errors encountered (if any) */
  errors: string[];
  /** Warnings encountered (if any) */
  warnings: string[];
  /** Items migrated */
  itemsMigrated: {
    concepts: number;
    valueSets: number;
    values: number;
  };
}

/**
 * Breaking change type
 */
export type BreakingChangeType =
  | "CONCEPT_REMOVED"
  | "CONCEPT_RENAMED"
  | "VALUESET_REMOVED"
  | "VALUESET_RENAMED"
  | "VALUE_REMOVED"
  | "VALUE_RENAMED"
  | "SCHEMA_CHANGE";

/**
 * Breaking change information
 */
export interface BreakingChange {
  /** Type of breaking change */
  type: BreakingChangeType;
  /** Item affected */
  item: string;
  /** Description of the change */
  description: string;
  /** Migration guidance */
  migrationGuidance?: string;
}

/**
 * Deprecation information
 */
export interface Deprecation {
  /** Deprecated item code */
  code: string;
  /** Type of item (concept, valueset, value) */
  type: "concept" | "valueset" | "value";
  /** Deprecation message */
  message: string;
  /** Replacement item (if available) */
  replacement?: string;
  /** Version when deprecated */
  deprecatedIn: string;
  /** Version when will be removed */
  removedIn?: string;
}

