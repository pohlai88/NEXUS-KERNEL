/**
 * L0 Kernel: Design System Concept Registry
 * 
 * Nexus Design System is registered as the Single Source of Truth (SSOT)
 * for all UI/UX design tokens, components, and utilities.
 * 
 * This is a Kernel-level concept (L0) - immutable, versioned, and canonical.
 * 
 * @see ui/canonical.ts for the constitutional source of all design tokens
 */

import { defineConcept, type ConceptDefinition } from './concept';

/**
 * Nexus Design System Concept
 * 
 * Registered at L0 (Kernel) as the SSOT for all design system concerns.
 * 
 * @property id - Canonical concept ID
 * @property name - Human-readable name
 * @property description - Concept description
 * @property version - Version of the design system (matches constitutional version)
 */
export const NEXUS_DESIGN_SYSTEM: ConceptDefinition = defineConcept({
  id: 'concept_design_system_nexus',
  name: 'Nexus Design System',
  description: 'Single Source of Truth (SSOT) for all UI/UX design tokens. All tokens use nx-* prefix. Source: ui/canonical.ts',
  version: '1.0.0',
});

/**
 * Design System Authority
 * 
 * This concept establishes Nexus Design System as the exclusive authority for:
 * - Design tokens (colors, spacing, typography, shadows, etc.)
 * - Semantic CSS classes (nx-* prefix)
 * - Component patterns and behaviors
 * - Theme configuration
 * - Layout utilities
 * 
 * No other UI/UX frameworks or design systems are permitted.
 * All design decisions must reference this concept.
 * 
 * Constitutional governance:
 * - Source: ui/canonical.ts (pure data)
 * - Generated: ui/input.css (marker-based injection)
 * - Validated: scripts/nx-validate.ts (drift detection)
 * - Checked: scripts/nx-check.ts (compliance scanning)
 */
export const DESIGN_SYSTEM_SSOT = NEXUS_DESIGN_SYSTEM;

/**
 * Export for use in other layers
 */
export { NEXUS_DESIGN_SYSTEM as DesignSystemConcept };

