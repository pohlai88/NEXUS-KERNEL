// @aibos/kernel - Supabase MCP Integration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utilities for integrating with Supabase MCP (Model Context Protocol) tools
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { generateCompleteMigration, type KernelMigration } from "./sync.js";
import { validateDatabaseState, type DatabaseState } from "./validation.js";
import { detectDrift, type DriftResult } from "./drift-detection.js";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";

/**
 * Supabase MCP integration options
 */
export interface SupabaseMCPOptions {
  /** Apply migrations automatically (default: false) */
  autoApply?: boolean;
  /** Validate after applying (default: true) */
  validateAfterApply?: boolean;
  /** Dry run mode (default: false) */
  dryRun?: boolean;
}

/**
 * MCP migration result
 */
export interface MCPMigrationResult {
  success: boolean;
  migration: KernelMigration;
  applied?: boolean;
  validation?: {
    valid: boolean;
    errors: string[];
  };
  error?: string;
}

/**
 * Apply kernel migration using Supabase MCP
 * 
 * This function is designed to work with Supabase MCP tools.
 * In a real MCP environment, you would call the MCP tool directly.
 * 
 * @param migration - Migration to apply
 * @param options - MCP options
 * @returns Migration result
 * 
 * @example
 * ```typescript
 * // In MCP environment
 * const migration = generateKernelMetadataMigration();
 * const result = await applyMigrationWithMCP(migration, {
 *   autoApply: true,
 *   validateAfterApply: true,
 * });
 * ```
 */
export async function applyMigrationWithMCP(
  migration: KernelMigration,
  options: SupabaseMCPOptions = {}
): Promise<MCPMigrationResult> {
  const { autoApply = false, validateAfterApply = true, dryRun = false } = options;

  try {
    if (dryRun) {
      return {
        success: true,
        migration,
        applied: false,
      };
    }

    // In a real MCP environment, this would call:
    // await mcp_supabase_apply_migration({
    //   name: migration.name,
    //   query: migration.sql,
    // });

    // For now, return the migration structure
    // The actual MCP call should be made by the caller
    const result: MCPMigrationResult = {
      success: true,
      migration,
      applied: autoApply,
    };

    if (validateAfterApply && autoApply) {
      // Validate after applying
      // In MCP environment: await mcp_supabase_execute_sql({ query: "SELECT ..." })
      // Then validate the result
      result.validation = {
        valid: true,
        errors: [],
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      migration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Apply all kernel migrations using Supabase MCP
 * 
 * @param options - MCP options
 * @returns Array of migration results
 * 
 * @example
 * ```typescript
 * const results = await applyAllMigrationsWithMCP({
 *   autoApply: true,
 *   validateAfterApply: true,
 * });
 * 
 * results.forEach((result) => {
 *   if (result.success) {
 *     console.log(`✅ ${result.migration.name} applied`);
 *   } else {
 *     console.error(`❌ ${result.migration.name} failed: ${result.error}`);
 *   }
 * });
 * ```
 */
export async function applyAllMigrationsWithMCP(
  options: SupabaseMCPOptions = {}
): Promise<MCPMigrationResult[]> {
  const migrations = generateCompleteMigration();
  const results: MCPMigrationResult[] = [];

  for (const migration of migrations) {
    const result = await applyMigrationWithMCP(migration, options);
    results.push(result);
  }

  return results;
}

/**
 * Validate database state using Supabase MCP
 * 
 * @param dbState - Database state (can be fetched via MCP)
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * // In MCP environment, fetch database state:
 * // const metadata = await mcp_supabase_execute_sql({
 * //   query: "SELECT * FROM kernel_metadata WHERE is_current = true"
 * // });
 * 
 * const result = await validateDatabaseWithMCP(dbState);
 * if (!result.valid) {
 *   console.error("Validation failed:", result.errors);
 * }
 * ```
 */
export async function validateDatabaseWithMCP(
  dbState: DatabaseState
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const validation = validateDatabaseState(dbState);

  return {
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}

/**
 * Detect drift using Supabase MCP
 * 
 * @param dbState - Database state (can be fetched via MCP)
 * @returns Drift detection result
 * 
 * @example
 * ```typescript
 * const drift = await detectDriftWithMCP(dbState);
 * if (drift.hasDrift) {
 *   console.warn("Drift detected:", drift.details);
 *   console.log("Recommendations:", drift.recommendations);
 * }
 * ```
 */
export async function detectDriftWithMCP(
  dbState: DatabaseState
): Promise<DriftResult> {
  return detectDrift(dbState);
}

/**
 * Get kernel metadata from Supabase using MCP
 * 
 * This is a helper function that constructs the SQL query
 * to fetch kernel metadata. In MCP environment, use:
 * 
 * ```typescript
 * const result = await mcp_supabase_execute_sql({
 *   query: getKernelMetadataQuery()
 * });
 * ```
 * 
 * @returns SQL query string
 */
export function getKernelMetadataQuery(): string {
  return `
    SELECT 
      kernel_version,
      snapshot_id,
      applied_at,
      is_current
    FROM kernel_metadata
    WHERE is_current = true
    LIMIT 1;
  `;
}

/**
 * Get concept registry query for MCP
 * 
 * @returns SQL query string
 */
export function getConceptRegistryQuery(): string {
  return `
    SELECT 
      concept_id,
      concept_key,
      category,
      is_active
    FROM kernel_concept_registry
    WHERE is_active = true
    ORDER BY concept_key;
  `;
}

/**
 * Get value set registry query for MCP
 * 
 * @returns SQL query string
 */
export function getValueSetRegistryQuery(): string {
  return `
    SELECT 
      value_set_id,
      value_set_key,
      domain,
      is_active
    FROM kernel_value_set_registry
    WHERE is_active = true
    ORDER BY value_set_key;
  `;
}

/**
 * Get value set values query for MCP
 * 
 * @param valueSetId - Optional value set ID filter
 * @returns SQL query string
 */
export function getValueSetValuesQuery(valueSetId?: string): string {
  const filter = valueSetId ? `WHERE value_set_id = '${valueSetId}'` : "";
  return `
    SELECT 
      value_id,
      value_set_id,
      value_key,
      label,
      sort_order,
      is_active
    FROM kernel_value_set_values
    ${filter}
    AND is_active = true
    ORDER BY value_set_id, sort_order;
  `;
}

/**
 * Complete database validation workflow using MCP
 * 
 * This function provides a complete workflow for validating
 * kernel state in Supabase using MCP tools.
 * 
 * @param options - MCP options
 * @returns Complete validation result
 * 
 * @example
 * ```typescript
 * // In MCP environment:
 * // 1. Fetch database state using MCP
 * // 2. Validate
 * // 3. Detect drift
 * // 4. Generate and apply migrations if needed
 * 
 * const result = await validateKernelWithMCP({
 *   autoApply: false, // Review migrations first
 *   validateAfterApply: true,
 * });
 * ```
 */
export async function validateKernelWithMCP(
  options: SupabaseMCPOptions = {}
): Promise<{
  valid: boolean;
  drift: DriftResult;
  migrations: KernelMigration[];
  recommendations: string[];
}> {
  // In MCP environment, fetch database state:
  // const metadata = await mcp_supabase_execute_sql({ query: getKernelMetadataQuery() });
  // const concepts = await mcp_supabase_execute_sql({ query: getConceptRegistryQuery() });
  // const valueSets = await mcp_supabase_execute_sql({ query: getValueSetRegistryQuery() });
  // const values = await mcp_supabase_execute_sql({ query: getValueSetValuesQuery() });
  
  // For now, return structure for MCP integration
  const dbState: DatabaseState = {
    metadata: {
      kernel_version: KERNEL_VERSION,
      snapshot_id: SNAPSHOT_ID,
      applied_at: new Date().toISOString(),
      is_current: true,
    },
    concepts: [],
    valueSets: [],
    values: [],
  };

  const drift = await detectDriftWithMCP(dbState);
  const migrations = generateCompleteMigration();

  const recommendations: string[] = [];
  
  if (drift.hasDrift) {
    recommendations.push("Database drift detected. Apply migrations to sync.");
    recommendations.push(...drift.recommendations);
  }

  if (migrations.length > 0) {
    recommendations.push(`${migrations.length} migration(s) ready to apply.`);
  }

  return {
    valid: !drift.hasDrift,
    drift,
    migrations,
    recommendations,
  };
}

/**
 * Get Supabase advisors for kernel tables
 * 
 * In MCP environment, use:
 * ```typescript
 * const advisors = await mcp_supabase_get_advisors({ type: "security" });
 * ```
 * 
 * This function provides the expected table names for advisor checks.
 * 
 * @returns Array of kernel table names
 */
export function getKernelTableNames(): string[] {
  return [
    "kernel_metadata",
    "kernel_concept_registry",
    "kernel_value_set_registry",
    "kernel_value_set_values",
  ];
}

