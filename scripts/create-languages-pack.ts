#!/usr/bin/env node
/**
 * Create ISO Languages Pack
 * Creates packs/iso-languages.pack.json with LANGUAGE concept and LANGUAGES valueset
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { PackShape, ValueShape, ConceptShape, ValueSetShape } from "../src/kernel.contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");
const PACKS_DIR = join(ROOT_DIR, "packs");

/**
 * Convert language name to UPPER_SNAKE_CASE code
 */
function toLanguageCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Main function
 */
async function main() {
  console.log("🌐 Creating ISO Languages Pack");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Load extracted languages data
  const languagesData = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-639-1-languages.json"), "utf-8")
  );

  // Create LANGUAGE concept
  const languageConcept: ConceptShape = {
    code: "LANGUAGE",
    category: "ENTITY",
    domain: "CORE",
    description: "Language per ISO 639-1",
    tags: ["core", "language", "iso6391"],
  };

  // Create LANGUAGES value set
  const languagesValueSet: ValueSetShape = {
    code: "LANGUAGES",
    domain: "CORE",
    description: "ISO 639-1 language codes",
    jurisdiction: "GLOBAL",
    tags: ["core", "language", "iso6391"],
    metadata: {
      prefix: "LNG",
    },
  };

  // Create language values
  const languageValues: ValueShape[] = languagesData.map((lang: any, index: number) => {
    const code = toLanguageCode(lang.name);
    return {
      code,
      value_set_code: "LANGUAGES",
      label: lang.name,
      description: `${lang.name} (ISO 639-1: ${lang.code})`,
      sort_order: index + 1,
      metadata: {
        iso_code: lang.code,
        native_name: lang.nativeName,
      },
    };
  });

  // Create the pack
  const languagesPack: PackShape = {
    id: "iso-languages",
    name: "ISO 639-1 Languages",
    version: "1.0.0",
    domain: "CORE",
    description: "ISO 639-1 language codes and metadata - complete language support for internationalization",
    priority: 50,
    authoritative_for: {
      concepts: ["LANGUAGE"],
      value_sets: ["LANGUAGES"],
    },
    concepts: [languageConcept],
    value_sets: [languagesValueSet],
    values: languageValues,
  };

  // Save the pack
  const packPath = join(PACKS_DIR, "iso-languages.pack.json");
  writeFileSync(packPath, JSON.stringify(languagesPack, null, 2) + "\n", "utf-8");

  console.log(`✅ Created iso-languages.pack.json`);
  console.log(`   Concept: LANGUAGE`);
  console.log(`   Value Set: LANGUAGES`);
  console.log(`   Values: ${languageValues.length} languages\n`);

  console.log("✅ Languages pack creation complete!");
  console.log("\n   Next steps:");
  console.log("   1. Run 'pnpm generate' to regenerate kernel code");
  console.log("   2. Verify the new LANGUAGE concept and LANGUAGES valueset are included");
}

main().catch(console.error);

