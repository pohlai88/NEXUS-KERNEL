// @aibos/kernel - Supabase Sync Utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utilities for syncing kernel metadata to Supabase database
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readFileSync } from "fs";
import { join } from "path";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";

/**
 * Kernel snapshot structure
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
 * Load kernel snapshot
 */
function loadKernelSnapshot(): KernelSnapshot {
  const snapshotPath = join(process.cwd(), "registry.snapshot.json");
  const snapshotContent = readFileSync(snapshotPath, "utf-8");
  return JSON.parse(snapshotContent) as KernelSnapshot;
}

/**
 * SQL migration for kernel metadata table
 */
export interface KernelMigration {
  name: string;
  sql: string;
  description: string;
}

/**
 * Generate SQL migration to sync kernel metadata
 * 
 * @returns SQL migration for Supabase
 * 
 * @example
 * ```typescript
 * const migration = generateKernelMetadataMigration();
 * // Use with Supabase MCP: mcp_supabase_apply_migration
 * ```
 */
export function generateKernelMetadataMigration(): KernelMigration {
  const snapshot = loadKernelSnapshot();

  const sql = `
-- Kernel Metadata Migration
-- Generated: ${new Date().toISOString()}
-- Kernel Version: ${KERNEL_VERSION}
-- Snapshot ID: ${SNAPSHOT_ID}

-- Ensure kernel_metadata table exists
CREATE TABLE IF NOT EXISTS kernel_metadata (
  id SERIAL PRIMARY KEY,
  kernel_version TEXT NOT NULL,
  snapshot_id TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_current BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(kernel_version, snapshot_id)
);

-- Create unique constraint on is_current (only one current row)
CREATE UNIQUE INDEX IF NOT EXISTS kernel_metadata_is_current_unique 
ON kernel_metadata (is_current) 
WHERE is_current = true;

-- Insert or update kernel metadata
INSERT INTO kernel_metadata (kernel_version, snapshot_id, applied_at, is_current)
VALUES ('${KERNEL_VERSION}', '${SNAPSHOT_ID}', NOW(), true)
ON CONFLICT (kernel_version, snapshot_id) 
DO UPDATE SET
  applied_at = NOW(),
  is_current = true;

-- Mark other rows as not current
UPDATE kernel_metadata
SET is_current = false
WHERE kernel_version != '${KERNEL_VERSION}' 
  OR snapshot_id != '${SNAPSHOT_ID}';
`;

  return {
    name: `kernel_metadata_${KERNEL_VERSION.replace(/\./g, "_")}`,
    sql: sql.trim(),
    description: `Sync kernel metadata for version ${KERNEL_VERSION} (snapshot: ${SNAPSHOT_ID})`,
  };
}

/**
 * Generate SQL migration for concepts table
 */
export function generateConceptsMigration(): KernelMigration {
  const snapshot = loadKernelSnapshot();

  const conceptsValues = snapshot.concepts
    .map(
      (c) =>
        `('${c.id}', '${c.key}', '${c.category}', NOW(), true)`
    )
    .join(",\n    ");

  const sql = `
-- Kernel Concepts Migration
-- Generated: ${new Date().toISOString()}
-- Concepts Count: ${snapshot.concepts.length}

-- Ensure kernel_concept_registry table exists
CREATE TABLE IF NOT EXISTS kernel_concept_registry (
  id SERIAL PRIMARY KEY,
  concept_id TEXT NOT NULL UNIQUE,
  concept_key TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Insert or update concepts
INSERT INTO kernel_concept_registry (concept_id, concept_key, category, created_at, is_active)
VALUES
    ${conceptsValues}
ON CONFLICT (concept_id) 
DO UPDATE SET
  concept_key = EXCLUDED.concept_key,
  category = EXCLUDED.category,
  is_active = true;

-- Deactivate concepts not in snapshot
UPDATE kernel_concept_registry
SET is_active = false
WHERE concept_id NOT IN (${snapshot.concepts.map((c) => `'${c.id}'`).join(", ")});
`;

  return {
    name: `kernel_concepts_${KERNEL_VERSION.replace(/\./g, "_")}`,
    sql: sql.trim(),
    description: `Sync ${snapshot.concepts.length} concepts to database`,
  };
}

/**
 * Generate SQL migration for value sets
 */
export function generateValueSetsMigration(): KernelMigration {
  const snapshot = loadKernelSnapshot();

  const valueSetsValues = snapshot.valueSets
    .map(
      (vs) =>
        `('${vs.id}', '${vs.key}', '${vs.domain}', NOW(), true)`
    )
    .join(",\n    ");

  const sql = `
-- Kernel Value Sets Migration
-- Generated: ${new Date().toISOString()}
-- Value Sets Count: ${snapshot.valueSets.length}

-- Ensure kernel_value_set_registry table exists
CREATE TABLE IF NOT EXISTS kernel_value_set_registry (
  id SERIAL PRIMARY KEY,
  value_set_id TEXT NOT NULL UNIQUE,
  value_set_key TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Insert or update value sets
INSERT INTO kernel_value_set_registry (value_set_id, value_set_key, domain, created_at, is_active)
VALUES
    ${valueSetsValues}
ON CONFLICT (value_set_id) 
DO UPDATE SET
  value_set_key = EXCLUDED.value_set_key,
  domain = EXCLUDED.domain,
  is_active = true;

-- Deactivate value sets not in snapshot
UPDATE kernel_value_set_registry
SET is_active = false
WHERE value_set_id NOT IN (${snapshot.valueSets.map((vs) => `'${vs.id}'`).join(", ")});
`;

  return {
    name: `kernel_value_sets_${KERNEL_VERSION.replace(/\./g, "_")}`,
    sql: sql.trim(),
    description: `Sync ${snapshot.valueSets.length} value sets to database`,
  };
}

/**
 * Generate SQL migration for values
 */
export function generateValuesMigration(): KernelMigration {
  const snapshot = loadKernelSnapshot();

  const valuesData = snapshot.values
    .map(
      (v) =>
        `('${v.id}', '${v.key}', '${v.valueSetId}', NOW(), true)`
    )
    .join(",\n    ");

  const sql = `
-- Kernel Values Migration
-- Generated: ${new Date().toISOString()}
-- Values Count: ${snapshot.values.length}

-- Ensure kernel_value_set_values table exists
CREATE TABLE IF NOT EXISTS kernel_value_set_values (
  id SERIAL PRIMARY KEY,
  value_id TEXT NOT NULL UNIQUE,
  value_key TEXT NOT NULL,
  value_set_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (value_set_id) REFERENCES kernel_value_set_registry(value_set_id)
);

-- Insert or update values
INSERT INTO kernel_value_set_values (value_id, value_key, value_set_id, created_at, is_active)
VALUES
    ${valuesData}
ON CONFLICT (value_id) 
DO UPDATE SET
  value_key = EXCLUDED.value_key,
  value_set_id = EXCLUDED.value_set_id,
  is_active = true;

-- Deactivate values not in snapshot
UPDATE kernel_value_set_values
SET is_active = false
WHERE value_id NOT IN (${snapshot.values.map((v) => `'${v.id}'`).join(", ")});
`;

  return {
    name: `kernel_values_${KERNEL_VERSION.replace(/\./g, "_")}`,
    sql: sql.trim(),
    description: `Sync ${snapshot.values.length} values to database`,
  };
}

/**
 * Generate complete migration set for kernel sync
 */
export function generateCompleteMigration(): KernelMigration[] {
  return [
    generateKernelMetadataMigration(),
    generateConceptsMigration(),
    generateValueSetsMigration(),
    generateValuesMigration(),
  ];
}

