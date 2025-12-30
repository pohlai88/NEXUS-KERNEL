import { z } from "zod";
import { CanonId } from "./canonId";

export type ConceptId = CanonId;

export type JurisdictionCode = string; // ISO country code or "GLOBAL"

export interface ConceptDefinition {
  id: ConceptId;
  name: string;
  description?: string;
  version: string;
}

export interface JurisdictionalValueSet {
  conceptId: ConceptId;
  jurisdiction: JurisdictionCode;
  values: readonly string[];
  metadata?: Record<string, unknown>;
}

const conceptRegistry = new Map<ConceptId, ConceptDefinition>();
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
export function getConcept(conceptId: ConceptId): ConceptDefinition | undefined {
  return conceptRegistry.get(conceptId);
}

/**
 * Get a value set for a concept and jurisdiction.
 */
export function getValueSet(
  conceptId: ConceptId,
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
export function listValueSets(conceptId: ConceptId): JurisdictionalValueSet[] {
  return Array.from(valueSetRegistry.values()).filter((vs) => vs.conceptId === conceptId);
}

