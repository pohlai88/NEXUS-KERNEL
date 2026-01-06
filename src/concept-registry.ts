// @aibos/kernel - In-Memory Concept Registry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PURPOSE: This is an in-memory helper registry used for validation, testing,
// and build-time snapshotting. The database (kernel_concept_registry) remains
// the runtime state. The Kernel constants (concepts.ts) remain the L0 truth.
//
// This file is NOT an alternative source of truth. It provides:
// - Local validation without DB access
// - Unit test support (no network dependency)
// - Build-time snapshot generation (registry.snapshot.json)
// - Fallback behavior for read-only/offline modes
//
// Law: This registry must never compete with DB for runtime state.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { CanonId } from "./canonId";

// Note: ConceptId is now exported from ./concepts.ts as a typed union
// This file uses CanonId for backwards compatibility with runtime helpers
type RuntimeConceptId = CanonId;

export type JurisdictionCode = string; // ISO country code or "GLOBAL"

export interface ConceptDefinition {
  id: RuntimeConceptId;
  name: string;
  description?: string;
  version: string;
}

export interface JurisdictionalValueSet {
  conceptId: RuntimeConceptId;
  jurisdiction: JurisdictionCode;
  values: readonly string[];
  metadata?: Record<string, unknown>;
}

const conceptRegistry = new Map<RuntimeConceptId, ConceptDefinition>();
const valueSetRegistry = new Map<string, JurisdictionalValueSet>();

/**
 * Define a concept in the Kernel Registry.
 * Concepts are stable, rare-change, code-versioned definitions of what a thing IS.
 */
export function defineConcept(def: ConceptDefinition): ConceptDefinition {
  if (conceptRegistry.has(def.id)) {
    throw new Error(`Concept ${def.id} already registered`);
  }
  conceptRegistry.set(def.id, def);
  return def;
}

/**
 * Register a jurisdictional value set for a concept.
 * Value sets define WHERE a concept is valid (e.g., Malaysia Banks, Global Currencies).
 */
export function registerValueSet(valueSet: JurisdictionalValueSet): void {
  const key = `${valueSet.conceptId}:${valueSet.jurisdiction}`;
  if (valueSetRegistry.has(key)) {
    throw new Error(`Value set ${key} already registered`);
  }
  valueSetRegistry.set(key, valueSet);
}

/**
 * Get a concept definition by ID.
 */
export function getConcept(
  conceptId: RuntimeConceptId
): ConceptDefinition | undefined {
  return conceptRegistry.get(conceptId);
}

/**
 * Get a value set for a concept and jurisdiction.
 */
export function getValueSet(
  conceptId: RuntimeConceptId,
  jurisdiction: JurisdictionCode
): JurisdictionalValueSet | undefined {
  const key = `${conceptId}:${jurisdiction}`;
  return valueSetRegistry.get(key);
}

/**
 * List all registered concepts.
 */
export function listConcepts(): ConceptDefinition[] {
  return Array.from(conceptRegistry.values());
}

/**
 * List all value sets for a concept.
 */
export function listValueSets(
  conceptId: RuntimeConceptId
): JurisdictionalValueSet[] {
  return Array.from(valueSetRegistry.values()).filter(
    (vs) => vs.conceptId === conceptId
  );
}
