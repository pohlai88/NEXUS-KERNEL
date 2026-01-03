// @aibos/kernel - Migration System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Complete migration system for kernel versioning
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Version Compatibility
export {
  VERSION_COMPATIBILITY_MATRIX,
  parseVersion,
  compareVersions,
  checkCompatibility,
  getCurrentKernelVersion,
  isMigrationNeeded,
} from "./version-compatibility.js";

// Migration Engine
export {
  executeMigration,
  detectBreakingChanges,
  rollbackMigration,
  validateMigration,
  type MigrationContext,
} from "./migration-engine.js";

// Types
export type {
  VersionCompatibility,
  MigrationResult,
  BreakingChangeType,
  BreakingChange,
  Deprecation,
} from "./types.js";

