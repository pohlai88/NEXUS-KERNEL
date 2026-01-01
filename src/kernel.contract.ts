// @aibos/kernel - FROZEN CONTRACT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ IMMUTABLE: This contract defines the kernel structure.
// Changes here = breaking changes. Freeze before generation.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";

/**
 * Concept Category - L0 taxonomy
 * FROZEN: Do not modify without major version bump
 */
export const ConceptCategorySchema = z.enum([
  "ENTITY",
  "ATTRIBUTE",
  "OPERATION",
  "RELATIONSHIP",
]);
export type ConceptCategory = z.infer<typeof ConceptCategorySchema>;

/**
 * Domain - ERP module classification
 * FROZEN: Do not modify without major version bump
 */
export const DomainSchema = z.enum([
  "FINANCE",
  "INVENTORY",
  "SALES",
  "PURCHASE",
  "MANUFACTURING",
  "HR",
  "PROJECT",
  "ASSET",
  "TAX",
  "SYSTEM",
  "GLOBAL",
]);
export type Domain = z.infer<typeof DomainSchema>;

/**
 * Concept Shape - The immutable structure
 * FROZEN: This is the contract. Never change without v3.0.0
 */
export const ConceptShapeSchema = z.object({
  /** Unique concept code (e.g., "ACCOUNT") */
  code: z.string().regex(/^[A-Z][A-Z0-9_]*$/, "Must be UPPERCASE_SNAKE_CASE"),
  /** Concept category */
  category: ConceptCategorySchema,
  /** Domain classification */
  domain: DomainSchema,
  /** Human-readable description */
  description: z.string().min(1).max(256),
  /** Optional tags for grouping/search */
  tags: z.array(z.string()).optional().default([]),
  /** Optional semantic root reference */
  semantic_root: z.string().optional(),
});
export type ConceptShape = z.infer<typeof ConceptShapeSchema>;

/**
 * Value Set Shape - The immutable structure
 * FROZEN: This is the contract. Never change without v3.0.0
 */
export const ValueSetShapeSchema = z.object({
  /** Unique value set code (e.g., "ACCOUNT_TYPE") */
  code: z.string().regex(/^[A-Z][A-Z0-9_]*$/, "Must be UPPERCASE_SNAKE_CASE"),
  /** Domain classification */
  domain: DomainSchema,
  /** Human-readable description */
  description: z.string().min(1).max(256),
  /** Jurisdiction scope */
  jurisdiction: z.enum(["GLOBAL", "REGIONAL", "LOCAL"]).default("GLOBAL"),
  /** Optional tags */
  tags: z.array(z.string()).optional().default([]),
  /** Optional metadata (prefix override, etc.) */
  metadata: z
    .object({
      prefix: z.string().regex(/^[A-Z]{2,4}$/, "Prefix must be 2-4 uppercase letters").optional(),
    })
    .optional(),
});
export type ValueSetShape = z.infer<typeof ValueSetShapeSchema>;

/**
 * Value Shape - The immutable structure
 * FROZEN: This is the contract. Never change without v3.0.0
 */
export const ValueShapeSchema = z.object({
  /** Unique value code (e.g., "ASSET") */
  code: z.string().regex(/^[A-Z][A-Z0-9_]*$/, "Must be UPPERCASE_SNAKE_CASE"),
  /** Parent value set code */
  value_set_code: z.string().regex(/^[A-Z][A-Z0-9_]*$/, "Must reference valid value set"),
  /** Human-readable label */
  label: z.string().min(1).max(128),
  /** Optional description */
  description: z.string().max(512).optional(),
  /** Optional sort order */
  sort_order: z.number().int().optional(),
  /** Optional metadata (ISO codes, etc.) */
  metadata: z.record(z.unknown()).optional(),
});
export type ValueShape = z.infer<typeof ValueShapeSchema>;

/**
 * Pack Shape - ERP domain pack structure
 * FROZEN: This is the contract. Never change without v3.0.0
 */
export const PackShapeSchema = z.object({
  /** Pack identifier */
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, "Must be lowercase-kebab-case"),
  /** Pack name */
  name: z.string().min(1),
  /** Pack version (semver) */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Must be semver"),
  /** Domain classification */
  domain: DomainSchema,
  /** Pack description */
  description: z.string().min(1),
  /** Concepts in this pack */
  concepts: z.array(ConceptShapeSchema),
  /** Value sets in this pack */
  value_sets: z.array(ValueSetShapeSchema),
  /** Values in this pack */
  values: z.array(ValueShapeSchema),
});
export type PackShape = z.infer<typeof PackShapeSchema>;

/**
 * Kernel Registry Shape - Complete kernel structure
 * FROZEN: This is the contract. Never change without v3.0.0
 */
export const KernelRegistryShapeSchema = z.object({
  /** Kernel version */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Must be semver"),
  /** All concepts */
  concepts: z.array(ConceptShapeSchema),
  /** All value sets */
  value_sets: z.array(ValueSetShapeSchema),
  /** All values */
  values: z.array(ValueShapeSchema),
  /** Validation rules */
  validation: z.object({
    /** All concept codes must be unique */
    unique_concept_codes: z.boolean().default(true),
    /** All value set codes must be unique */
    unique_value_set_codes: z.boolean().default(true),
    /** All value codes must be unique within value set */
    unique_value_codes_per_set: z.boolean().default(true),
    /** All values must reference valid value set */
    valid_value_set_references: z.boolean().default(true),
  }),
});
export type KernelRegistryShape = z.infer<typeof KernelRegistryShapeSchema>;

/**
 * Naming Laws - Immutable rules
 * FROZEN: These rules are absolute. Never change.
 */
export const NamingLaws = {
  /** Concept ID format: CONCEPT_{CODE} */
  conceptId: (code: string): string => `CONCEPT_${code}`,
  
  /** Value Set ID format: VALUESET_{JURISDICTION}_{CODE} */
  valueSetId: (code: string, jurisdiction: "GLOBAL" | "REGIONAL" | "LOCAL" = "GLOBAL"): string => {
    const prefix = jurisdiction === "GLOBAL" ? "GLOBAL" : jurisdiction;
    return `VALUESET_${prefix}_${code}`;
  },
  
  /** Value ID format: {PREFIX}_{CODE} */
  valueId: (code: string, prefix: string): string => {
    // Prefix is derived from value set (e.g., ACCOUNT_TYPE -> ACC)
    return `${prefix}_${code}`;
  },
  
  /** Validate concept code */
  isValidConceptCode: (code: string): boolean => {
    return /^[A-Z][A-Z0-9_]*$/.test(code);
  },
  
  /** Validate value set code */
  isValidValueSetCode: (code: string): boolean => {
    return /^[A-Z][A-Z0-9_]*$/.test(code);
  },
  
  /** Validate value code */
  isValidValueCode: (code: string): boolean => {
    return /^[A-Z][A-Z0-9_]*$/.test(code);
  },
} as const;

/**
 * Export pattern - How constants are exported
 * FROZEN: This pattern is immutable
 */
export const ExportPattern = {
  /** Concept export: CONCEPT.{CODE} = "CONCEPT_{CODE}" */
  concept: (code: string): string => NamingLaws.conceptId(code),
  
  /** Value set export: VALUESET.{CODE} = "VALUESET_GLOBAL_{CODE}" */
  valueSet: (code: string, jurisdiction: "GLOBAL" | "REGIONAL" | "LOCAL" = "GLOBAL"): string => {
    return NamingLaws.valueSetId(code, jurisdiction);
  },
  
  /** Value export: VALUE.{VALUE_SET_CODE}.{VALUE_CODE} = "{PREFIX}_{CODE}" */
  value: (valueSetCode: string, valueCode: string, prefix: string): string => {
    return NamingLaws.valueId(valueCode, prefix);
  },
} as const;

