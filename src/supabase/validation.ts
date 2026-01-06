// @aibos/kernel - Supabase Validation Utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utilities for validating Supabase database schemas against kernel snapshot
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readFileSync } from "fs";
import { join } from "path";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";
import { CanonError } from "../errors.js";

/**
 * Kernel snapshot structure from registry.snapshot.json
 */
interface KernelSnapshot {
  kernelVersion: string;
  snapshotId: string;
  generatedAt: string;
  counts: {
    concepts: number;
    valueSets: number;
    values: number;
  };
  concepts: Array<{
    key: string;
    id: string;
    category: string;
  }>;
  valueSets: Array<{
    key: string;
    id: string;
    domain: string;
  }>;
  values: Array<{
    key: string;
    id: string;
    valueSetId: string;
  }>;
}

/**
 * Load kernel snapshot from registry.snapshot.json
 */
function loadKernelSnapshot(): KernelSnapshot {
  try {
    const snapshotPath = join(process.cwd(), "registry.snapshot.json");
    const snapshotContent = readFileSync(snapshotPath, "utf-8");
    return JSON.parse(snapshotContent) as KernelSnapshot;
  } catch (error) {
    throw new CanonError(
      "NOT_FOUND",
      "Failed to load kernel snapshot. Ensure registry.snapshot.json exists."
    );
  }
}

/**
 * Database metadata structure (expected in Supabase)
 */
export interface DatabaseMetadata {
  kernel_version: string;
  snapshot_id: string;
  applied_at: string;
  is_current?: boolean;
}

/**
 * Validation result for database schema
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    kernelVersion: string;
    snapshotId: string;
    dbVersion?: string;
    dbSnapshotId?: string;
  };
}

/**
 * Validate database metadata against kernel snapshot
 * 
 * @param dbMetadata - Database metadata from kernel_metadata table
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * const dbMetadata = await supabase
 *   .from('kernel_metadata')
 *   .select('*')
 *   .eq('is_current', true)
 *   .single();
 * 
 * const result = validateDatabaseMetadata(dbMetadata.data);
 * if (!result.valid) {
 *   console.error('Database drift detected:', result.errors);
 * }
 * ```
 */
export function validateDatabaseMetadata(
  dbMetadata: DatabaseMetadata | null
): ValidationResult {
  const snapshot = loadKernelSnapshot();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if metadata exists
  if (!dbMetadata) {
    errors.push("Database metadata not found. kernel_metadata table may be empty.");
    return {
      valid: false,
      errors,
      warnings,
      metadata: {
        kernelVersion: KERNEL_VERSION,
        snapshotId: SNAPSHOT_ID,
      },
    };
  }

  // Validate kernel version
  if (dbMetadata.kernel_version !== KERNEL_VERSION) {
    errors.push(
      `Kernel version mismatch: database has ${dbMetadata.kernel_version}, kernel expects ${KERNEL_VERSION}`
    );
  }

  // Validate snapshot ID
  if (dbMetadata.snapshot_id !== SNAPSHOT_ID) {
    errors.push(
      `Snapshot ID mismatch: database has ${dbMetadata.snapshot_id}, kernel expects ${SNAPSHOT_ID}`
    );
  }

  // Check if metadata is marked as current
  if (dbMetadata.is_current === false) {
    warnings.push("Database metadata is not marked as current (is_current = false)");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      kernelVersion: KERNEL_VERSION,
      snapshotId: SNAPSHOT_ID,
      dbVersion: dbMetadata.kernel_version,
      dbSnapshotId: dbMetadata.snapshot_id,
    },
  };
}

/**
 * Validate database enum values against kernel value sets
 * 
 * @param dbEnumValues - Array of enum values from database
 * @param valueSetId - Kernel value set ID to validate against
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * const dbCurrencies = await supabase
 *   .from('currency_enum')
 *   .select('value');
 * 
 * const result = validateEnumValues(
 *   dbCurrencies.data.map(r => r.value),
 *   'VALUESET_GLOBAL_CURRENCIES'
 * );
 * ```
 */
export function validateEnumValues(
  dbEnumValues: string[],
  valueSetId: string
): ValidationResult {
  const snapshot = loadKernelSnapshot();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Find value set in snapshot
  const valueSet = snapshot.valueSets.find((vs) => vs.id === valueSetId);
  if (!valueSet) {
    errors.push(`Value set ${valueSetId} not found in kernel snapshot`);
    return {
      valid: false,
      errors,
      warnings,
      metadata: {
        kernelVersion: KERNEL_VERSION,
        snapshotId: SNAPSHOT_ID,
      },
    };
  }

  // Get expected values for this value set
  const expectedValues = snapshot.values
    .filter((v) => v.valueSetId === valueSetId)
    .map((v) => v.id);

  // Check for missing values
  const missingValues = expectedValues.filter((v) => !dbEnumValues.includes(v));
  if (missingValues.length > 0) {
    errors.push(
      `Missing enum values in database: ${missingValues.join(", ")}`
    );
  }

  // Check for extra values (warnings only - database may have additional values)
  const extraValues = dbEnumValues.filter((v) => !expectedValues.includes(v));
  if (extraValues.length > 0) {
    warnings.push(
      `Extra enum values in database (not in kernel): ${extraValues.join(", ")}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      kernelVersion: KERNEL_VERSION,
      snapshotId: SNAPSHOT_ID,
    },
  };
}

/**
 * Validate database concept registry against kernel snapshot
 * 
 * @param dbConcepts - Array of concept IDs from database
 * @returns Validation result
 */
export function validateConceptRegistry(
  dbConcepts: string[]
): ValidationResult {
  const snapshot = loadKernelSnapshot();
  const errors: string[] = [];
  const warnings: string[] = [];

  const expectedConcepts = snapshot.concepts.map((c) => c.id);

  // Check count
  if (dbConcepts.length !== expectedConcepts.length) {
    errors.push(
      `Concept count mismatch: database has ${dbConcepts.length}, kernel expects ${expectedConcepts.length}`
    );
  }

  // Check for missing concepts
  const missingConcepts = expectedConcepts.filter((c) => !dbConcepts.includes(c));
  if (missingConcepts.length > 0) {
    errors.push(`Missing concepts in database: ${missingConcepts.join(", ")}`);
  }

  // Check for extra concepts (warnings only)
  const extraConcepts = dbConcepts.filter((c) => !expectedConcepts.includes(c));
  if (extraConcepts.length > 0) {
    warnings.push(
      `Extra concepts in database (not in kernel): ${extraConcepts.join(", ")}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      kernelVersion: KERNEL_VERSION,
      snapshotId: SNAPSHOT_ID,
    },
  };
}

/**
 * Comprehensive validation of database against kernel snapshot
 * 
 * @param dbState - Complete database state
 * @returns Validation result with all checks
 */
export interface DatabaseState {
  metadata?: DatabaseMetadata | null;
  concepts?: string[];
  valueSets?: string[];
  values?: string[];
  enums?: Record<string, string[]>; // valueSetId -> enum values
}

export function validateDatabaseState(
  dbState: DatabaseState
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate metadata
  if (dbState.metadata !== undefined) {
    const metadataResult = validateDatabaseMetadata(dbState.metadata);
    errors.push(...metadataResult.errors);
    warnings.push(...metadataResult.warnings);
  }

  // Validate concepts
  if (dbState.concepts) {
    const conceptsResult = validateConceptRegistry(dbState.concepts);
    errors.push(...conceptsResult.errors);
    warnings.push(...conceptsResult.warnings);
  }

  // Validate enums
  if (dbState.enums) {
    for (const [valueSetId, enumValues] of Object.entries(dbState.enums)) {
      const enumResult = validateEnumValues(enumValues, valueSetId);
      errors.push(...enumResult.errors);
      warnings.push(...enumResult.warnings);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      kernelVersion: KERNEL_VERSION,
      snapshotId: SNAPSHOT_ID,
      dbVersion: dbState.metadata?.kernel_version,
      dbSnapshotId: dbState.metadata?.snapshot_id,
    },
  };
}

