// @aibos/kernel - Supabase Integration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Supabase integration utilities for kernel validation and sync
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  validateDatabaseMetadata,
  validateEnumValues,
  validateConceptRegistry,
  validateDatabaseState,
  type DatabaseMetadata,
  type ValidationResult,
  type DatabaseState,
} from "./validation.js";

export {
  detectDrift,
  generateDriftReport,
  type DriftResult,
} from "./drift-detection.js";

export {
  generateKernelMetadataMigration,
  generateConceptsMigration,
  generateValueSetsMigration,
  generateValuesMigration,
  generateCompleteMigration,
  type KernelMigration,
} from "./sync.js";

export {
  applyMigrationWithMCP,
  applyAllMigrationsWithMCP,
  validateDatabaseWithMCP,
  detectDriftWithMCP,
  validateKernelWithMCP,
  getKernelMetadataQuery,
  getConceptRegistryQuery,
  getValueSetRegistryQuery,
  getValueSetValuesQuery,
  getKernelTableNames,
  type SupabaseMCPOptions,
  type MCPMigrationResult,
} from "./mcp.js";

// Optimized Supabase MCP Adapter
export {
  SupabaseMCPAdapter,
  createSupabaseMCPAdapter,
  type SupabaseMCPTools,
  type SupabaseMCPAdapterOptions,
  type MigrationResult,
  type FetchedDatabaseState,
} from "./mcp-adapter.js";

// Kernel Metadata Database Integration
export {
  syncKernelToDatabase,
  syncConceptsToDatabase,
  syncValueSetsToDatabase,
  syncValuesToDatabase,
  getKernelMetadataFromDatabase,
  getCurrentKernelVersion,
  type KernelMetadataRow,
  type SyncKernelOptions,
  type SyncKernelResult,
} from "./kernel-metadata.js";

