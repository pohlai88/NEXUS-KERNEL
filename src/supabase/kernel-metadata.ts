// @aibos/kernel - Kernel Metadata Database Integration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TypeScript integration for kernel_metadata table operations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ConceptShape, ValueSetShape, ValueShape } from "../kernel.contract.js";
import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";
import type { SupabaseClient } from "../kernel.validation.cache.supabase.js";

/**
 * Kernel metadata row structure
 */
export interface KernelMetadataRow {
  id: string;
  kernel_version: string;
  snapshot_id: string;
  entity_type: "concept" | "valueset" | "value";
  entity_id: string;
  entity_data: ConceptShape | ValueSetShape | ValueShape;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Sync options for kernel metadata
 */
export interface SyncKernelOptions {
  /** Mark previous versions as not current (default: true) */
  markPreviousAsNotCurrent?: boolean;
  /** Batch size for inserts (default: 100) */
  batchSize?: number;
}

/**
 * Sync result
 */
export interface SyncKernelResult {
  /** Number of concepts synced */
  conceptsSynced: number;
  /** Number of value sets synced */
  valueSetsSynced: number;
  /** Number of values synced */
  valuesSynced: number;
  /** Total entities synced */
  totalSynced: number;
  /** Errors encountered during sync */
  errors: string[];
}

/**
 * Sync kernel concepts to database
 * 
 * @param supabase - Supabase client
 * @param concepts - Array of concept shapes to sync
 * @param options - Sync options
 * @returns Number of concepts synced
 */
export async function syncConceptsToDatabase(
  supabase: SupabaseClient,
  concepts: ConceptShape[],
  options: SyncKernelOptions = {}
): Promise<number> {
  const { markPreviousAsNotCurrent = true, batchSize = 100 } = options;
  
  // Mark previous versions as not current if requested
  if (markPreviousAsNotCurrent) {
    const updateResult = await supabase
      .from("kernel_metadata")
      .update({ is_current: false })
      .eq("entity_type", "concept")
      .neq("snapshot_id", SNAPSHOT_ID);
    
    if (updateResult.error) {
      console.warn(`Failed to mark previous concepts as not current: ${String(updateResult.error)}`);
    }
  }
  
  // Sync concepts in batches
  let synced = 0;
  for (let i = 0; i < concepts.length; i += batchSize) {
    const batch = concepts.slice(i, i + batchSize);
    const rows = batch.map((concept) => ({
      kernel_version: KERNEL_VERSION,
      snapshot_id: SNAPSHOT_ID,
      entity_type: "concept" as const,
      entity_id: concept.code,
      entity_data: concept,
      is_current: true,
    }));
    
    const result = await supabase
      .from("kernel_metadata")
      .upsert(rows, {
        onConflict: "kernel_version,snapshot_id,entity_type,entity_id",
      })
      .select();
    
    if (result.error) {
      throw new Error(`Failed to sync concepts batch: ${String(result.error)}`);
    }
    
    synced += batch.length;
  }
  
  return synced;
}

/**
 * Sync kernel value sets to database
 * 
 * @param supabase - Supabase client
 * @param valueSets - Array of value set shapes to sync
 * @param options - Sync options
 * @returns Number of value sets synced
 */
export async function syncValueSetsToDatabase(
  supabase: SupabaseClient,
  valueSets: ValueSetShape[],
  options: SyncKernelOptions = {}
): Promise<number> {
  const { markPreviousAsNotCurrent = true, batchSize = 100 } = options;
  
  // Mark previous versions as not current if requested
  if (markPreviousAsNotCurrent) {
    const updateResult = await supabase
      .from("kernel_metadata")
      .update({ is_current: false })
      .eq("entity_type", "valueset")
      .neq("snapshot_id", SNAPSHOT_ID);
    
    if (updateResult.error) {
      console.warn(`Failed to mark previous value sets as not current: ${String(updateResult.error)}`);
    }
  }
  
  // Sync value sets in batches
  let synced = 0;
  for (let i = 0; i < valueSets.length; i += batchSize) {
    const batch = valueSets.slice(i, i + batchSize);
    const rows = batch.map((valueSet) => ({
      kernel_version: KERNEL_VERSION,
      snapshot_id: SNAPSHOT_ID,
      entity_type: "valueset" as const,
      entity_id: valueSet.code,
      entity_data: valueSet,
      is_current: true,
    }));
    
    const result = await supabase
      .from("kernel_metadata")
      .upsert(rows, {
        onConflict: "kernel_version,snapshot_id,entity_type,entity_id",
      })
      .select();
    
    if (result.error) {
      throw new Error(`Failed to sync value sets batch: ${String(result.error)}`);
    }
    
    synced += batch.length;
  }
  
  return synced;
}

/**
 * Sync kernel values to database
 * 
 * @param supabase - Supabase client
 * @param values - Array of value shapes to sync
 * @param options - Sync options
 * @returns Number of values synced
 */
export async function syncValuesToDatabase(
  supabase: SupabaseClient,
  values: ValueShape[],
  options: SyncKernelOptions = {}
): Promise<number> {
  const { markPreviousAsNotCurrent = true, batchSize = 100 } = options;
  
  // Mark previous versions as not current if requested
  if (markPreviousAsNotCurrent) {
    const updateResult = await supabase
      .from("kernel_metadata")
      .update({ is_current: false })
      .eq("entity_type", "value")
      .neq("snapshot_id", SNAPSHOT_ID);
    
    if (updateResult.error) {
      console.warn(`Failed to mark previous values as not current: ${String(updateResult.error)}`);
    }
  }
  
  // Sync values in batches
  let synced = 0;
  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    const rows = batch.map((value) => ({
      kernel_version: KERNEL_VERSION,
      snapshot_id: SNAPSHOT_ID,
      entity_type: "value" as const,
      entity_id: value.code,
      entity_data: value,
      is_current: true,
    }));
    
    const result = await supabase
      .from("kernel_metadata")
      .upsert(rows, {
        onConflict: "kernel_version,snapshot_id,entity_type,entity_id",
      })
      .select();
    
    if (result.error) {
      throw new Error(`Failed to sync values batch: ${String(result.error)}`);
    }
    
    synced += batch.length;
  }
  
  return synced;
}

/**
 * Sync entire kernel to database
 * 
 * This function syncs all concepts, value sets, and values to the kernel_metadata table.
 * 
 * @param supabase - Supabase client
 * @param kernelRegistry - Complete kernel registry data
 * @param options - Sync options
 * @returns Sync result with counts and errors
 * 
 * @example
 * ```typescript
 * import { syncKernelToDatabase } from '@aibos/kernel/supabase';
 * import { createClient } from '@supabase/supabase-js';
 * 
 * const supabase = createClient(url, key);
 * const result = await syncKernelToDatabase(supabase, kernelRegistry);
 * console.log(`Synced ${result.totalSynced} entities`);
 * ```
 */
export async function syncKernelToDatabase(
  supabase: SupabaseClient,
  kernelRegistry: {
    concepts: ConceptShape[];
    value_sets: ValueSetShape[];
    values: ValueShape[];
  },
  options: SyncKernelOptions = {}
): Promise<SyncKernelResult> {
  const errors: string[] = [];
  let conceptsSynced = 0;
  let valueSetsSynced = 0;
  let valuesSynced = 0;
  
  try {
    conceptsSynced = await syncConceptsToDatabase(
      supabase,
      kernelRegistry.concepts,
      options
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Concepts sync failed: ${message}`);
  }
  
  try {
    valueSetsSynced = await syncValueSetsToDatabase(
      supabase,
      kernelRegistry.value_sets,
      options
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Value sets sync failed: ${message}`);
  }
  
  try {
    valuesSynced = await syncValuesToDatabase(
      supabase,
      kernelRegistry.values,
      options
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Values sync failed: ${message}`);
  }
  
  return {
    conceptsSynced,
    valueSetsSynced,
    valuesSynced,
    totalSynced: conceptsSynced + valueSetsSynced + valuesSynced,
    errors,
  };
}

/**
 * Get kernel metadata from database
 * 
 * @param supabase - Supabase client
 * @param entityType - Type of entity to fetch (optional)
 * @param isCurrent - Only fetch current versions (default: true)
 * @returns Array of kernel metadata rows
 */
export async function getKernelMetadataFromDatabase(
  supabase: SupabaseClient,
  entityType?: "concept" | "valueset" | "value",
  isCurrent: boolean = true
): Promise<KernelMetadataRow[]> {
  let query = supabase
    .from("kernel_metadata")
    .select("*");
  
  if (entityType) {
    query = query.eq("entity_type", entityType);
  }
  
  if (isCurrent) {
    query = query.eq("is_current", true);
  }
  
  const result = await query;
  
  if (result.error) {
    throw new Error(`Failed to fetch kernel metadata: ${result.error}`);
  }
  
  return (result.data || []) as KernelMetadataRow[];
}

/**
 * Get current kernel version from database
 * 
 * @param supabase - Supabase client
 * @returns Current kernel version and snapshot ID, or null if not found
 */
export async function getCurrentKernelVersion(
  supabase: SupabaseClient
): Promise<{ kernel_version: string; snapshot_id: string } | null> {
  const result = await supabase
    .from("kernel_metadata")
    .select("kernel_version, snapshot_id")
    .eq("is_current", true)
    .limit(1)
    .maybeSingle();
  
  if (result.error || !result.data) {
    return null;
  }
  
  const data = result.data as { kernel_version: string; snapshot_id: string };
  return {
    kernel_version: data.kernel_version,
    snapshot_id: data.snapshot_id,
  };
}

