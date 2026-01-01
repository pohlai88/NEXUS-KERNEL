/**
 * L0 Kernel: Design System Concept Registry
 *
 * AIBOS Design System is registered as the Single Source of Truth (SSOT)
 * for all UI/UX design tokens, components, and utilities.
 *
 * This is a Kernel-level concept (L0) - immutable, versioned, and canonical.
 */

import { defineConcept, type ConceptDefinition } from "./concept-registry";

/**
 * AIBOS Design System Concept
 *
 * Registered at L0 (Kernel) as the SSOT for all design system concerns.
 *
 * @property id - Canonical concept ID
 * @property name - Human-readable name
 * @property description - Concept description
 * @property version - Version of the design system (matches package version)
 */
export const AIBOS_DESIGN_SYSTEM: ConceptDefinition = defineConcept({
  id: "concept_design_system_aibos",
  name: "AIBOS Design System",
  description:
    "Single Source of Truth (SSOT) for all UI/UX design tokens, semantic classes, components, and utilities. All styling, theming, and design decisions must derive from this system.",
  version: "1.1.0",
});

/**
 * Design System Authority
 *
 * This concept establishes AIBOS Design System as the exclusive authority for:
 * - Design tokens (colors, spacing, typography, shadows, etc.)
 * - Semantic CSS classes (.na-*)
 * - Component patterns and behaviors
 * - Theme configuration
 * - Layout utilities
 *
 * No other UI/UX frameworks or design systems are permitted.
 * All design decisions must reference this concept.
 */
export const DESIGN_SYSTEM_SSOT = AIBOS_DESIGN_SYSTEM;

/**
 * Export for use in other layers
 */
export { AIBOS_DESIGN_SYSTEM as DesignSystemConcept };
