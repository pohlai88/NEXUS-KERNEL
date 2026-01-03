/**
 * Test Helpers
 * Common utilities for kernel tests
 */

import { CONCEPT, type ConceptCategory } from "../../concepts";
import { VALUESET, VALUE } from "../../values";

/**
 * Get all concept IDs
 */
export function getAllConceptIds(): string[] {
  return Object.values(CONCEPT);
}

/**
 * Get all value set IDs
 */
export function getAllValueSetIds(): string[] {
  return Object.values(VALUESET);
}

/**
 * Get all value IDs for a value set
 */
export function getValueIdsForValueSet(valueSetId: string): string[] {
  const valueSetKey = Object.keys(VALUESET).find(
    (key) => VALUESET[key as keyof typeof VALUESET] === valueSetId
  );
  if (!valueSetKey) return [];
  
  const valueSet = VALUE[valueSetKey as keyof typeof VALUE];
  if (!valueSet || typeof valueSet !== "object") return [];
  
  return Object.values(valueSet as Record<string, string>);
}

/**
 * Check if a string matches the concept ID format
 */
export function isValidConceptId(id: string): boolean {
  return /^CONCEPT_[A-Z][A-Z0-9_]{1,30}$/.test(id);
}

/**
 * Check if a string matches the value set ID format
 */
export function isValidValueSetId(id: string): boolean {
  return /^VALUESET_(GLOBAL|JURISDICTIONAL)_[A-Z][A-Z0-9_]{1,30}$/.test(id);
}

/**
 * Check if a string matches the value ID format
 */
export function isValidValueId(id: string): boolean {
  return /^[A-Z]{2,10}_[A-Z][A-Z0-9_]{1,30}$/.test(id);
}

/**
 * Get concept category for a concept
 */
export function getConceptCategory(conceptId: string): ConceptCategory | null {
  // This would need to check the actual concept registry
  // For now, return null as placeholder
  return null;
}

/**
 * Assert that a value exists in a value set
 */
export function assertValueInValueSet(
  valueId: string,
  valueSetId: string
): void {
  const valueIds = getValueIdsForValueSet(valueSetId);
  if (!valueIds.includes(valueId)) {
    throw new Error(
      `Value ${valueId} not found in value set ${valueSetId}`
    );
  }
}

