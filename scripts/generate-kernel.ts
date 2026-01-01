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
 */
function mergePacks(packs: PackShape[]): {
  concepts: ConceptShape[];
  valueSets: ValueSetShape[];
  values: ValueShape[];
} {
  const concepts = new Map<string, ConceptShape>();
  const valueSets = new Map<string, ValueSetShape>();
  const values = new Map<string, ValueShape>();

  for (const pack of packs) {
    for (const concept of pack.concepts) {
      if (concepts.has(concept.code)) {
        throw new Error(
          `Duplicate concept code ${concept.code} in pack ${pack.id}`
        );
      }
      concepts.set(concept.code, concept);
    }

    for (const valueSet of pack.value_sets) {
      if (valueSets.has(valueSet.code)) {
        throw new Error(
          `Duplicate value set code ${valueSet.code} in pack ${pack.id}`
        );
      }
      valueSets.set(valueSet.code, valueSet);
    }

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
    concepts: Array.from(concepts.values()),
    valueSets: Array.from(valueSets.values()),
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

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateConcepts, generateValues, mergePacks, loadPack };

