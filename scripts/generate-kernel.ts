#!/usr/bin/env node
/**
 * Kernel Code Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates TypeScript code from structured data (CSV/JSON)
 * Source of truth = data tables, not hand-written code
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  type ConceptShape,
  type ValueSetShape,
  type ValueShape,
  type PackShape,
  NamingLaws,
  ExportPattern,
} from "../src/kernel.contract.js";
import {
  validateConcept,
  validateValueSet,
  validateValue,
  validatePack,
} from "../src/kernel.validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");
const PACKS_DIR = join(ROOT_DIR, "packs");
const OUTPUT_DIR = join(ROOT_DIR, "src");

/**
 * Generate prefix from value set code
 * ACCOUNT_TYPE -> ACC
 * DOCUMENT_STATUS -> DOC
 * Uses metadata.prefix if available, otherwise derives from code
 */
function derivePrefix(valueSet: ValueSetShape): string {
  // Use metadata prefix if provided (Option B - more readable)
  if (valueSet.metadata?.prefix) {
    return valueSet.metadata.prefix;
  }

  // Fallback to derivation (Option A - automatic)
  const parts = valueSet.code.split("_");
  if (parts.length === 1) {
    return valueSet.code.substring(0, 3).toUpperCase();
  }
  // Take first letter of each part, max 4 chars
  const prefix = parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .substring(0, 4);
  return prefix;
}

/**
 * Generate concepts.ts from data
 */
function generateConcepts(concepts: ConceptShape[]): string {
  const categories = new Map<string, ConceptShape[]>();

  for (const concept of concepts) {
    if (!categories.has(concept.category)) {
      categories.set(concept.category, []);
    }
    categories.get(concept.category)!.push(concept);
  }

  let output = `// @aibos/kernel - L0 Concept Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ AUTO-GENERATED: Do not edit manually. Edit data sources instead.
// Generated: ${new Date().toISOString()}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Concept Categories
 * L0 taxonomy for organizing concepts.
 */
export type ConceptCategory =
${Array.from(categories.keys())
      .map((cat) => `  | "${cat}"`)
      .join("\n")};

/**
 * CONCEPT - The Business Ontology
 *
 * ${concepts.length} canonical concepts organized by category.
 * These define WHAT EXISTS in AI-BOS.
 *
 * @example
 * \`\`\`typescript
 * import { CONCEPT } from "@aibos/kernel";
 *
 * const type = CONCEPT.INVOICE; // ✅ Type-safe: "CONCEPT_INVOICE"
 * const type = "CONCEPT_INVOICE"; // ❌ Forbidden: Raw string
 * \`\`\`
 */
export const CONCEPT = {
`;

  // Group by category
  for (const [category, categoryConcepts] of categories.entries()) {
    output += `  // ─────────────────────────────────────────────────────────────────────────
  // ${category} (${categoryConcepts.length}) - ${getCategoryDescription(category)}
  // ─────────────────────────────────────────────────────────────────────────
`;
    for (const concept of categoryConcepts.sort((a, b) => a.code.localeCompare(b.code))) {
      const comment = concept.description
        ? `  /** ${concept.description} */`
        : "";
      output += `${comment}
  ${concept.code}: "${ExportPattern.concept(concept.code)}",
`;
    }
    output += "\n";
  }

  output += `} as const;

/**
 * ConceptId - Union type of all valid concept identifiers
 */
export type ConceptId = (typeof CONCEPT)[keyof typeof CONCEPT];

/**
 * CONCEPT_CATEGORY - Mapping of concepts to their categories
 */
export const CONCEPT_CATEGORY: Record<ConceptId, ConceptCategory> = {
`;

  for (const concept of concepts.sort((a, b) => a.code.localeCompare(b.code))) {
    output += `  [CONCEPT.${concept.code}]: "${concept.category}",
`;
  }

  output += `} as const;

/**
 * Concept count for validation
 */
export const CONCEPT_COUNT = ${concepts.length} as const;
`;

  return output;
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    ENTITY: "Core business objects",
    ATTRIBUTE: "Properties of entities",
    OPERATION: "Business actions",
    RELATIONSHIP: "Connections between entities",
  };
  return descriptions[category] || category;
}

/**
 * Generate values.ts from data
 */
function generateValues(
  valueSets: ValueSetShape[],
  values: ValueShape[]
): string {
  // Group values by value set
  const valuesBySet = new Map<string, ValueShape[]>();
  for (const value of values) {
    if (!valuesBySet.has(value.value_set_code)) {
      valuesBySet.set(value.value_set_code, []);
    }
    valuesBySet.get(value.value_set_code)!.push(value);
  }

  let output = `// @aibos/kernel - L0 Value Set Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ AUTO-GENERATED: Do not edit manually. Edit data sources instead.
// Generated: ${new Date().toISOString()}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * VALUESET - The Value Set Registry
 *
 * ${valueSets.length} canonical value sets.
 * These define ALLOWED VALUES for concepts.
 *
 * @example
 * \`\`\`typescript
 * import { VALUESET, VALUE } from "@aibos/kernel";
 *
 * const setId = VALUESET.ACCOUNT_TYPE; // ✅ Type-safe
 * const value = VALUE.ACCOUNT_TYPE.ASSET; // ✅ Type-safe
 * \`\`\`
 */
export const VALUESET = {
`;

  for (const valueSet of valueSets.sort((a, b) => a.code.localeCompare(b.code))) {
    output += `  ${valueSet.code}: "${ExportPattern.valueSet(valueSet.code, valueSet.jurisdiction)}",
`;
  }

  output += `} as const;

/**
 * ValueSetId - Union type of all valid value set identifiers
 */
export type ValueSetId = (typeof VALUESET)[keyof typeof VALUESET];

/**
 * VALUE - The Value Registry
 *
 * ${values.length} canonical values organized by value set.
 * Nested structure: VALUE.<ValueSet>.<Value>
 *
 * @example
 * \`\`\`typescript
 * import { VALUE } from "@aibos/kernel";
 *
 * const status = VALUE.APPROVAL_ACTION.APPROVED; // "APP_APPROVED"
 * const country = VALUE.COUNTRIES.MALAYSIA; // "COUNTRY_MY"
 * \`\`\`
 */
export const VALUE = {
`;

  for (const valueSet of valueSets.sort((a, b) => a.code.localeCompare(b.code))) {
    const setValues = valuesBySet.get(valueSet.code) || [];
    if (setValues.length === 0) continue;

    const prefix = derivePrefix(valueSet);
    output += `  // ─────────────────────────────────────────────────────────────────────────
  // ${valueSet.code} (${setValues.length} values)
  // ─────────────────────────────────────────────────────────────────────────
  ${valueSet.code}: {
`;

    for (const value of setValues.sort((a, b) => {
      if (a.sort_order !== undefined && b.sort_order !== undefined) {
        return a.sort_order - b.sort_order;
      }
      return a.code.localeCompare(b.code);
    })) {
      output += `    ${value.code}: "${ExportPattern.value(valueSet.code, value.code, prefix)}",
`;
    }

    output += `  },

`;
  }

  output += `} as const;

/**
 * Counts for validation
 */
export const VALUESET_COUNT = ${valueSets.length} as const;
export const VALUE_COUNT = ${values.length} as const;
`;

  return output;
}

/**
 * Load pack from JSON file
 */
function loadPack(packPath: string): PackShape {
  const content = readFileSync(packPath, "utf-8");
  const pack = JSON.parse(content);
  validatePack(pack);
  return pack as PackShape;
}

/**
 * Merge multiple packs into single registry
 * Enforces Invariant E: Cross-pack duplicates must be allowed by policy
 */
function mergePacks(packs: PackShape[]): {
  concepts: ConceptShape[];
  valueSets: ValueSetShape[];
  values: ValueShape[];
} {
  const concepts = new Map<string, { concept: ConceptShape; packId: string; priority: number; authoritative: boolean }>();
  const valueSets = new Map<string, { valueSet: ValueSetShape; packId: string; priority: number; authoritative: boolean }>();
  const values = new Map<string, ValueShape>();

  // Sort packs by priority (higher first) to ensure authoritative packs process first
  const sortedPacks = [...packs].sort((a, b) => (b.priority ?? 10) - (a.priority ?? 10));

  for (const pack of sortedPacks) {
    const packPriority = pack.priority ?? 10;
    const authoritativeConcepts = new Set(pack.authoritative_for?.concepts ?? []);
    const authoritativeValueSets = new Set(pack.authoritative_for?.value_sets ?? []);

    // Merge concepts with Invariant E enforcement
    for (const concept of pack.concepts) {
      const existing = concepts.get(concept.code);
      if (existing) {
        // Invariant E: Check if overwrite is allowed
        const isAuthoritative = authoritativeConcepts.has(concept.code);
        const existingIsAuthoritative = existing.authoritative;
        const canOverwrite =
          (packPriority > existing.priority && isAuthoritative) ||
          (packPriority === existing.priority && isAuthoritative && !existingIsAuthoritative);

        if (!canOverwrite) {
          throw new Error(
            `Invariant E violation: Duplicate concept code ${concept.code} in pack ${pack.id}. ` +
              `Existing: pack ${existing.packId} (priority ${existing.priority}, authoritative: ${existingIsAuthoritative}). ` +
              `New: pack ${pack.id} (priority ${packPriority}, authoritative: ${isAuthoritative}). ` +
              `Overwrite only allowed if new pack has higher priority AND lists code in authoritative_for.`
          );
        }
      }
      concepts.set(concept.code, {
        concept,
        packId: pack.id,
        priority: packPriority,
        authoritative: authoritativeConcepts.has(concept.code),
      });
    }

    // Merge value sets with Invariant E enforcement
    for (const valueSet of pack.value_sets) {
      const existing = valueSets.get(valueSet.code);
      if (existing) {
        // Invariant E: Check if overwrite is allowed
        const isAuthoritative = authoritativeValueSets.has(valueSet.code);
        const existingIsAuthoritative = existing.authoritative;
        const canOverwrite =
          (packPriority > existing.priority && isAuthoritative) ||
          (packPriority === existing.priority && isAuthoritative && !existingIsAuthoritative);

        if (!canOverwrite) {
          throw new Error(
            `Invariant E violation: Duplicate value set code ${valueSet.code} in pack ${pack.id}. ` +
              `Existing: pack ${existing.packId} (priority ${existing.priority}, authoritative: ${existingIsAuthoritative}). ` +
              `New: pack ${pack.id} (priority ${packPriority}, authoritative: ${isAuthoritative}). ` +
              `Overwrite only allowed if new pack has higher priority AND lists code in authoritative_for.`
          );
        }
      }
      valueSets.set(valueSet.code, {
        valueSet,
        packId: pack.id,
        priority: packPriority,
        authoritative: authoritativeValueSets.has(valueSet.code),
      });
    }

    // Merge values (no cross-pack duplicates allowed - values are always unique per value set)
    for (const value of pack.values) {
      const key = `${value.value_set_code}:${value.code}`;
      if (values.has(key)) {
        throw new Error(
          `Duplicate value code ${value.code} in value set ${value.value_set_code} in pack ${pack.id}`
        );
      }
      values.set(key, value);
    }
  }

  return {
    concepts: Array.from(concepts.values()).map((entry) => entry.concept),
    valueSets: Array.from(valueSets.values()).map((entry) => entry.valueSet),
    values: Array.from(values.values()),
  };
}

/**
 * Main generation function
 */
function main() {
  console.log("🚀 Kernel Code Generator");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Load packs
  if (!existsSync(PACKS_DIR)) {
    console.log(`⚠️  Packs directory not found: ${PACKS_DIR}`);
    console.log("   Creating empty packs directory...");
    mkdirSync(PACKS_DIR, { recursive: true });
    console.log("   ✅ Created. Add pack JSON files to generate code.\n");
    return;
  }

  let packFiles: string[];
  try {
    packFiles = readdirSync(PACKS_DIR)
      .filter((f) => f.endsWith(".pack.json"));
  } catch (error) {
    console.error(`❌ Error reading packs directory: ${error}`);
    process.exit(1);
  }

  if (packFiles.length === 0) {
    console.log(`⚠️  No pack files found in ${PACKS_DIR}`);
    console.log("   Create pack JSON files to generate code.\n");
    return;
  }

  console.log(`📦 Loading ${packFiles.length} pack(s)...`);
  const packs: PackShape[] = [];
  for (const packFile of packFiles) {
    const packPath = join(PACKS_DIR, packFile);
    try {
      const pack = loadPack(packPath);
      packs.push(pack);
      console.log(`   ✅ ${pack.id} v${pack.version} (${pack.concepts.length} concepts, ${pack.value_sets.length} value sets, ${pack.values.length} values)`);
    } catch (error) {
      console.error(`   ❌ Failed to load ${packFile}:`, error);
      process.exit(1);
    }
  }

  // Merge packs
  console.log("\n🔄 Merging packs...");
  const { concepts, valueSets, values } = mergePacks(packs);
  console.log(`   ✅ Merged: ${concepts.length} concepts, ${valueSets.length} value sets, ${values.length} values`);

  // Validate invariants before generation
  console.log("\n🔍 Validating invariants...");
  validateGeneratorInvariants(concepts, valueSets, values);
  console.log("   ✅ All invariants passed");

  // Generate code
  console.log("\n📝 Generating TypeScript code...");
  const conceptsCode = generateConcepts(concepts);
  const valuesCode = generateValues(valueSets, values);

  // Write files
  writeFileSync(join(OUTPUT_DIR, "concepts.ts"), conceptsCode);
  writeFileSync(join(OUTPUT_DIR, "values.ts"), valuesCode);

  console.log("   ✅ Generated concepts.ts");
  console.log("   ✅ Generated values.ts");

  console.log("\n✨ Generation complete!");
}

/**
 * Validate generator invariants (prevents pack rot)
 */
function validateGeneratorInvariants(
  concepts: ConceptShape[],
  valueSets: ValueSetShape[],
  values: ValueShape[]
): void {
  // Group values by value set
  const valuesBySet = new Map<string, ValueShape[]>();
  for (const value of values) {
    if (!valuesBySet.has(value.value_set_code)) {
      valuesBySet.set(value.value_set_code, []);
    }
    valuesBySet.get(value.value_set_code)!.push(value);
  }

  // Invariant A: sort_order is continuous per value_set (1..n)
  for (const [setCode, setValues] of valuesBySet.entries()) {
    const valuesWithOrder = setValues.filter((v) => v.sort_order !== undefined);
    if (valuesWithOrder.length === 0) continue; // Optional sort_order

    const sortOrders = valuesWithOrder
      .map((v) => v.sort_order!)
      .sort((a, b) => a - b);

    // Check continuity: should be 1, 2, 3, ..., n
    for (let i = 0; i < sortOrders.length; i++) {
      if (sortOrders[i] !== i + 1) {
        throw new Error(
          `Invariant A violation: sort_order must be continuous (1..n) in value set ${setCode}. ` +
          `Expected ${i + 1}, found ${sortOrders[i]}. All orders: [${sortOrders.join(", ")}]`
        );
      }
    }
  }

  // Invariant B: every value_set has ≥2 values (prevents dead enums)
  for (const valueSet of valueSets) {
    const setValues = valuesBySet.get(valueSet.code) || [];
    if (setValues.length < 2) {
      throw new Error(
        `Invariant B violation: value set must have at least 2 values. ` +
        `${valueSet.code} has ${setValues.length} value(s)`
      );
    }
  }

  // Invariant C: collision-free export IDs across namespaces
  // CONCEPT.{code} vs VALUESET.{code} must never collide in generated exports
  const conceptCodes = new Set(concepts.map((c) => c.code));
  const valueSetCodes = new Set(valueSets.map((vs) => vs.code));

  // Check for collisions (same code in both namespaces)
  for (const code of conceptCodes) {
    if (valueSetCodes.has(code)) {
      // This is allowed (different namespaces), but we verify exports don't collide
      // CONCEPT.ACCOUNT_TYPE vs VALUESET.ACCOUNT_TYPE are different exports
      // This is fine - they're in different objects
    }
  }

  // Verify generated export names don't collide
  const conceptExportNames = new Set(
    concepts.map((c) => `CONCEPT.${c.code}`)
  );
  const valueSetExportNames = new Set(
    valueSets.map((vs) => `VALUESET.${vs.code}`)
  );

  for (const exportName of conceptExportNames) {
    if (valueSetExportNames.has(exportName)) {
      throw new Error(
        `Invariant C violation: export name collision detected: ${exportName}. ` +
        `Concept and value set cannot share the same export name.`
      );
    }
  }

  // Invariant D: Line concept required for order/invoice/entry entities
  validateLineConcepts(concepts);

  // Invariant F: Naming semantics validation
  validateNamingSemantics(concepts, valueSets, values);
}

/**
 * Invariant D: If a pack contains an "Order/Invoice/Entry" entity,
 * enforce it also has a corresponding "*_LINE" concept.
 */
function validateLineConcepts(concepts: ConceptShape[]): void {
  const conceptCodes = new Set(concepts.map((c) => c.code));

  // Patterns that require line concepts
  const lineRequiredPatterns = [
    /^.*_ORDER$/,
    /^.*_INVOICE$/,
    /^.*_ENTRY$/,
    /^.*_QUOTATION$/,
    /^.*_RECEIPT$/,
    /^.*_DELIVERY_NOTE$/,
    /^.*_GOODS_RECEIPT$/,
  ];

  for (const concept of concepts) {
    // Check if this concept matches a pattern that requires a line concept
    for (const pattern of lineRequiredPatterns) {
      if (pattern.test(concept.code)) {
        const lineConceptCode = `${concept.code}_LINE`;
        if (!conceptCodes.has(lineConceptCode)) {
          throw new Error(
            `Invariant D violation: Entity ${concept.code} requires corresponding line concept ${lineConceptCode}. ` +
            `ERP spine consistency requires line concepts for order/invoice/entry entities.`
          );
        }
      }
    }
  }
}

/**
 * Invariant F: Naming semantics validation
 * - *_STATUS value sets must have ≥3 values and include terminal states
 * - *_LINE concepts must have matching parent concept
 * - metadata.prefix must be 3 letters, uppercase, unique globally
 */
function validateNamingSemantics(
  concepts: ConceptShape[],
  valueSets: ValueSetShape[],
  values: ValueShape[]
): void {
  const conceptCodes = new Set(concepts.map((c) => c.code));
  const valueSetCodes = new Set(valueSets.map((vs) => vs.code));
  const valuesBySet = new Map<string, ValueShape[]>();
  const prefixes = new Map<string, string>(); // prefix -> valueSet code

  // Group values by value set
  for (const value of values) {
    if (!valuesBySet.has(value.value_set_code)) {
      valuesBySet.set(value.value_set_code, []);
    }
    valuesBySet.get(value.value_set_code)!.push(value);
  }

  // Check *_STATUS value sets
  for (const valueSet of valueSets) {
    if (valueSet.code.endsWith("_STATUS")) {
      const setValues = valuesBySet.get(valueSet.code) || [];
      if (setValues.length < 3) {
        throw new Error(
          `Invariant F violation: *_STATUS value set ${valueSet.code} must have at least 3 values, found ${setValues.length}`
        );
      }

      // Check for terminal states
      const terminalStates = ["CANCELLED", "CLOSED", "COMPLETED", "RETIRED", "VOIDED", "EXPIRED"];
      const hasTerminalState = setValues.some((v) =>
        terminalStates.includes(v.code)
      );
      if (!hasTerminalState) {
        throw new Error(
          `Invariant F violation: *_STATUS value set ${valueSet.code} must include at least one terminal state ` +
          `(CANCELLED|CLOSED|COMPLETED|RETIRED|VOIDED|EXPIRED)`
        );
      }
    }
  }

  // Check *_LINE concepts have matching parent
  for (const concept of concepts) {
    if (concept.code.endsWith("_LINE")) {
      const parentCode = concept.code.replace(/_LINE$/, "");
      if (!conceptCodes.has(parentCode)) {
        throw new Error(
          `Invariant F violation: *_LINE concept ${concept.code} must have matching parent concept ${parentCode}`
        );
      }
    }
  }

  // Check prefix uniqueness and format
  for (const valueSet of valueSets) {
    const prefix = valueSet.metadata?.prefix;
    if (prefix) {
      // Format check: 3 letters, uppercase
      if (!/^[A-Z]{3}$/.test(prefix)) {
        throw new Error(
          `Invariant F violation: metadata.prefix must be exactly 3 uppercase letters, found "${prefix}" in ${valueSet.code}`
        );
      }

      // Uniqueness check
      if (prefixes.has(prefix)) {
        throw new Error(
          `Invariant F violation: prefix "${prefix}" is used by both ${prefixes.get(prefix)} and ${valueSet.code}. Prefixes must be globally unique.`
        );
      }
      prefixes.set(prefix, valueSet.code);
    }
  }
}

// Run if executed directly
main();

export { generateConcepts, generateValues, mergePacks, loadPack };

