// @aibos/kernel - Supabase MCP Adapter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Optimized adapter for Supabase MCP (Model Context Protocol) tools
// Provides type-safe, Supabase-specific integration with kernel utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { generateCompleteMigration, type KernelMigration } from "./sync.js";
import { validateDatabaseState, type DatabaseState, type DatabaseMetadata } from "./validation.js";
import { detectDrift, type DriftResult } from "./drift-detection.js";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";

/**
 * Supabase MCP tool interface
 * This interface matches the actual Supabase MCP tool signatures
 */
export interface SupabaseMCPTools {
  /** Execute SQL query */
  execute_sql?: (query: string) => Promise<unknown>;
  /** Apply migration */
  apply_migration?: (name: string, query: string) => Promise<unknown>;
  /** Get advisors (security/performance) */
  get_advisors?: (type: "security" | "performance") => Promise<unknown>;
  /** List tables */
  list_tables?: (schemas?: string[]) => Promise<unknown>;
  /** List migrations */
  list_migrations?: () => Promise<unknown>;
}

/**
 * Supabase MCP adapter options
 */
export interface SupabaseMCPAdapterOptions {
  /** MCP tools instance (injected from MCP environment) */
  mcpTools?: SupabaseMCPTools;
  /** Auto-apply migrations (default: false) */
  autoApply?: boolean;
  /** Validate after operations (default: true) */
  validateAfterApply?: boolean;
  /** Dry run mode (default: false) */
  dryRun?: boolean;
  /** Schema name (default: "public") */
  schema?: string;
}

/**
 * Migration application result
 */
export interface MigrationResult {
  success: boolean;
  migration: KernelMigration;
  applied: boolean;
  error?: string;
  validation?: {
    valid: boolean;
    errors: string[];
  };
}

/**
 * Database state fetched from Supabase
 */
export interface FetchedDatabaseState {
  metadata: DatabaseMetadata | null;
  concepts: Array<{
    concept_id: string;
    concept_key: string;
    category: string;
    is_active: boolean;
  }>;
  valueSets: Array<{
    value_set_id: string;
    value_set_key: string;
    domain: string;
    is_active: boolean;
  }>;
  values: Array<{
    value_id: string;
    value_set_id: string;
    value_key: string;
    label: string;
    sort_order: number;
    is_active: boolean;
  }>;
}

/**
 * Supabase MCP Adapter
 * 
 * Provides optimized, Supabase-specific integration with kernel utilities.
 * Designed to work seamlessly with Supabase MCP tools.
 * 
 * @example
 * ```typescript
 * // In MCP environment
 * const adapter = new SupabaseMCPAdapter({
 *   mcpTools: {
 *     execute_sql: mcp_supabase_execute_sql,
 *     apply_migration: mcp_supabase_apply_migration,
 *     get_advisors: mcp_supabase_get_advisors,
 *   },
 *   autoApply: false,
 * });
 * 
 * // Fetch and validate database state
 * const state = await adapter.fetchDatabaseState();
 * const validation = await adapter.validateState(state);
 * 
 * // Apply migrations if needed
 * if (!validation.valid) {
 *   const results = await adapter.applyAllMigrations();
 * }
 * ```
 */
export class SupabaseMCPAdapter {
  private mcpTools?: SupabaseMCPTools;
  private options: Required<Omit<SupabaseMCPAdapterOptions, "mcpTools">> & {
    mcpTools?: SupabaseMCPTools;
  };

  constructor(options: SupabaseMCPAdapterOptions = {}) {
    this.mcpTools = options.mcpTools;
    this.options = {
      autoApply: options.autoApply ?? false,
      validateAfterApply: options.validateAfterApply ?? true,
      dryRun: options.dryRun ?? false,
      schema: options.schema ?? "public",
      mcpTools: options.mcpTools,
    };
  }

  /**
   * Set MCP tools (useful for dependency injection)
   */
  setMCPTools(tools: SupabaseMCPTools): void {
    this.mcpTools = tools;
    this.options.mcpTools = tools;
  }

  /**
   * Fetch kernel metadata from Supabase
   */
  async fetchMetadata(): Promise<DatabaseMetadata | null> {
    if (!this.mcpTools?.execute_sql) {
      throw new Error("MCP tools not available. Set mcpTools in constructor or via setMCPTools()");
    }

    const query = `
      SELECT 
        kernel_version,
        snapshot_id,
        applied_at,
        is_current
      FROM ${this.options.schema}.kernel_metadata
      WHERE is_current = true
      LIMIT 1;
    `;

    try {
      const result = await this.mcpTools.execute_sql(query);
      // Transform MCP result to DatabaseMetadata
      // MCP returns data in format: { data: [...], error: null }
      const data = this.extractData(result);
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as DatabaseMetadata;
      }
      return null;
    } catch (error) {
      // Table might not exist yet
      return null;
    }
  }

  /**
   * Fetch concept registry from Supabase
   */
  async fetchConcepts(): Promise<FetchedDatabaseState["concepts"]> {
    if (!this.mcpTools?.execute_sql) {
      throw new Error("MCP tools not available");
    }

    const query = `
      SELECT 
        concept_id,
        concept_key,
        category,
        is_active
      FROM ${this.options.schema}.kernel_concept_registry
      WHERE is_active = true
      ORDER BY concept_key;
    `;

    const result = await this.mcpTools.execute_sql(query);
    return this.extractData(result) as FetchedDatabaseState["concepts"];
  }

  /**
   * Fetch value set registry from Supabase
   */
  async fetchValueSets(): Promise<FetchedDatabaseState["valueSets"]> {
    if (!this.mcpTools?.execute_sql) {
      throw new Error("MCP tools not available");
    }

    const query = `
      SELECT 
        value_set_id,
        value_set_key,
        domain,
        is_active
      FROM ${this.options.schema}.kernel_value_set_registry
      WHERE is_active = true
      ORDER BY value_set_key;
    `;

    const result = await this.mcpTools.execute_sql(query);
    return this.extractData(result) as FetchedDatabaseState["valueSets"];
  }

  /**
   * Fetch value set values from Supabase
   */
  async fetchValues(valueSetId?: string): Promise<FetchedDatabaseState["values"]> {
    if (!this.mcpTools?.execute_sql) {
      throw new Error("MCP tools not available");
    }

    const filter = valueSetId ? `WHERE value_set_id = '${valueSetId}'` : "";
    const query = `
      SELECT 
        value_id,
        value_set_id,
        value_key,
        label,
        sort_order,
        is_active
      FROM ${this.options.schema}.kernel_value_set_values
      ${filter}
      AND is_active = true
      ORDER BY value_set_id, sort_order;
    `;

    const result = await this.mcpTools.execute_sql(query);
    return this.extractData(result) as FetchedDatabaseState["values"];
  }

  /**
   * Fetch complete database state from Supabase
   */
  async fetchDatabaseState(): Promise<FetchedDatabaseState> {
    const [metadata, concepts, valueSets, values] = await Promise.all([
      this.fetchMetadata(),
      this.fetchConcepts(),
      this.fetchValueSets(),
      this.fetchValues(),
    ]);

    return {
      metadata,
      concepts,
      valueSets,
      values,
    };
  }

  /**
   * Transform fetched state to DatabaseState format for validation
   */
  transformToDatabaseState(fetched: FetchedDatabaseState): DatabaseState {
    return {
      metadata: fetched.metadata || {
        kernel_version: "",
        snapshot_id: "",
        applied_at: new Date().toISOString(),
        is_current: false,
      },
      concepts: fetched.concepts.map((c) => c.concept_id),
      valueSets: fetched.valueSets.map((vs) => vs.value_set_id),
      values: fetched.values.map((v) => v.value_id),
    };
  }

  /**
   * Validate database state against kernel snapshot
   */
  async validateState(fetchedState?: FetchedDatabaseState): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    drift?: DriftResult;
  }> {
    const state = fetchedState || (await this.fetchDatabaseState());
    const dbState = this.transformToDatabaseState(state);
    const validation = validateDatabaseState(dbState);
    const drift = detectDrift(dbState);

    return {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      drift,
    };
  }

  /**
   * Apply a single migration using Supabase MCP
   */
  async applyMigration(migration: KernelMigration): Promise<MigrationResult> {
    if (this.options.dryRun) {
      return {
        success: true,
        migration,
        applied: false,
      };
    }

    if (!this.mcpTools?.apply_migration) {
      throw new Error("MCP apply_migration tool not available");
    }

    try {
      if (this.options.autoApply) {
        await this.mcpTools.apply_migration(migration.name, migration.sql);
      }

      const result: MigrationResult = {
        success: true,
        migration,
        applied: this.options.autoApply,
      };

      if (this.options.validateAfterApply && this.options.autoApply) {
        // Re-fetch and validate after applying
        const validation = await this.validateState();
        result.validation = {
          valid: validation.valid,
          errors: validation.errors,
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        migration,
        applied: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Apply all kernel migrations
   */
  async applyAllMigrations(): Promise<MigrationResult[]> {
    const migrations = generateCompleteMigration();
    const results: MigrationResult[] = [];

    for (const migration of migrations) {
      const result = await this.applyMigration(migration);
      results.push(result);
    }

    return results;
  }

  /**
   * Get Supabase advisors for kernel tables
   */
  async getAdvisors(type: "security" | "performance" = "security"): Promise<unknown> {
    if (!this.mcpTools?.get_advisors) {
      throw new Error("MCP get_advisors tool not available");
    }

    return this.mcpTools.get_advisors(type);
  }

  /**
   * Check if kernel tables exist
   */
  async checkTablesExist(): Promise<{
    exists: boolean;
    missing: string[];
  }> {
    if (!this.mcpTools?.list_tables) {
      throw new Error("MCP list_tables tool not available");
    }

    const expectedTables = [
      "kernel_metadata",
      "kernel_concept_registry",
      "kernel_value_set_registry",
      "kernel_value_set_values",
    ];

    const result = await this.mcpTools.list_tables([this.options.schema]);
    const tables = this.extractData(result) as Array<{ name: string }>;
    const tableNames = tables.map((t) => t.name);

    const missing = expectedTables.filter(
      (expected) => !tableNames.includes(expected)
    );

    return {
      exists: missing.length === 0,
      missing,
    };
  }

  /**
   * Complete kernel sync workflow
   * 
   * 1. Fetch current database state
   * 2. Validate against kernel snapshot
   * 3. Detect drift
   * 4. Generate migrations if needed
   * 5. Apply migrations (if autoApply enabled)
   * 6. Validate after applying
   */
  async syncKernel(): Promise<{
    valid: boolean;
    drift: DriftResult;
    migrations: KernelMigration[];
    results: MigrationResult[];
    recommendations: string[];
  }> {
    // 1. Fetch state
    const fetchedState = await this.fetchDatabaseState();

    // 2. Validate
    const validation = await this.validateState(fetchedState);

    // 3. Generate migrations
    const migrations = generateCompleteMigration();

    // 4. Apply if needed
    let results: MigrationResult[] = [];
    if (this.options.autoApply && migrations.length > 0) {
      results = await this.applyAllMigrations();
    }

    // 5. Generate recommendations
    const recommendations: string[] = [];
    if (validation.drift?.hasDrift) {
      recommendations.push("Database drift detected. Apply migrations to sync.");
      recommendations.push(...(validation.drift.recommendations || []));
    }
    if (migrations.length > 0 && !this.options.autoApply) {
      recommendations.push(`${migrations.length} migration(s) ready to apply.`);
    }
    if (results.some((r) => !r.success)) {
      recommendations.push("Some migrations failed. Review errors and retry.");
    }

    return {
      valid: validation.valid,
      drift: validation.drift || {
        hasDrift: false,
        driftType: "none",
        details: {},
        recommendations: [],
      },
      migrations,
      results,
      recommendations,
    };
  }

  /**
   * Extract data from MCP result
   * Handles different MCP result formats
   */
  private extractData(result: unknown): unknown {
    // MCP tools may return data in different formats
    // Handle common patterns
    if (result && typeof result === "object") {
      if ("data" in result) {
        return (result as { data: unknown }).data;
      }
      if ("rows" in result) {
        return (result as { rows: unknown }).rows;
      }
      if (Array.isArray(result)) {
        return result;
      }
    }
    return result;
  }
}

/**
 * Create a Supabase MCP adapter instance
 * 
 * Convenience function for creating an adapter with MCP tools
 * 
 * @example
 * ```typescript
 * const adapter = createSupabaseMCPAdapter({
 *   mcpTools: {
 *     execute_sql: mcp_supabase_execute_sql,
 *     apply_migration: mcp_supabase_apply_migration,
 *   },
 * });
 * ```
 */
export function createSupabaseMCPAdapter(
  options: SupabaseMCPAdapterOptions
): SupabaseMCPAdapter {
  return new SupabaseMCPAdapter(options);
}

