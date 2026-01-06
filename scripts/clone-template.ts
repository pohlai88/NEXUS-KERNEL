#!/usr/bin/env node
/**
 * Template Clone Utility
 * Clones and adapts existing packs/templates for ERP deployment
 * Fast approach: clone existing data, then adapt/transform
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import type { PackShape, ValueShape, ConceptShape } from "../src/kernel.contract.js";
import {
  getTemplateCode,
  getAdapterCode,
  getIntegratorCode,
  createTemplateMetadata,
  TEMPLATE_JURISDICTION_MAP,
  SOURCE_TYPES,
} from "./template-metadata-strategy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const PACKS_DIR = join(ROOT_DIR, "packs");
const TEMPLATES_DIR = join(ROOT_DIR, "templates");

// Ensure templates directory exists
if (!existsSync(TEMPLATES_DIR)) {
  mkdirSync(TEMPLATES_DIR, { recursive: true });
}

/**
 * Template Pack Shape - Extension of PackShape for deployment templates
 * Templates are NOT kernel packs - they're deployment-time data
 */
interface TemplatePackShape extends Omit<PackShape, "concepts" | "value_sets"> {
  // Templates reference existing concepts/value sets, don't define them
  referenced_concepts?: string[]; // Concept codes this template uses
  referenced_value_sets?: string[]; // Value set codes this template uses
  // Templates only add VALUES
  values: ValueShape[];
  // Template metadata for traceability
  template_code?: string; // TEMPLATE_{JURISDICTION}
  metadata?: {
    jurisdiction?: string;
    source_packs?: string[];
    created_at?: string;
  };
}

/**
 * Clone a pack file
 */
function clonePack(sourcePackId: string, targetPackId: string, adapters?: {
  transformId?: (id: string) => string;
  transformName?: (name: string) => string;
  transformDescription?: (desc: string) => string;
  filterValues?: (value: ValueShape) => boolean;
  transformValue?: (value: ValueShape) => ValueShape;
}): PackShape {
  const sourcePath = join(PACKS_DIR, `${sourcePackId}.pack.json`);
  
  if (!existsSync(sourcePath)) {
    throw new Error(`Source pack not found: ${sourcePackId}.pack.json`);
  }

  const sourcePack: PackShape = JSON.parse(readFileSync(sourcePath, "utf-8"));

  // Clone the pack structure
  const clonedPack: PackShape = {
    ...sourcePack,
    id: adapters?.transformId ? adapters.transformId(sourcePack.id) : targetPackId,
    name: adapters?.transformName ? adapters.transformName(sourcePack.name) : sourcePack.name,
    description: adapters?.transformDescription 
      ? adapters.transformDescription(sourcePack.description) 
      : sourcePack.description,
    version: "1.0.0", // Reset version for new template
    priority: sourcePack.priority || 10,
    concepts: [...sourcePack.concepts],
    value_sets: [...sourcePack.value_sets],
    values: sourcePack.values
      .filter((v) => adapters?.filterValues ? adapters.filterValues(v) : true)
      .map((v) => adapters?.transformValue ? adapters.transformValue(v) : v),
  };

  return clonedPack;
}

/**
 * Clone multiple packs and merge into a template
 * Templates are deployment data, NOT kernel packs
 */
function cloneTemplatePack(
  templateId: string,
  sourcePackIds: string[],
  jurisdiction: string,
  adapters?: {
    transformValue?: (value: ValueShape, packId: string) => ValueShape;
  }
): TemplatePackShape {
  // Get jurisdiction code (e.g., "MY" from "Malaysia" or template ID)
  const jurisdictionCode = TEMPLATE_JURISDICTION_MAP[templateId] || 
    jurisdiction.substring(0, 2).toUpperCase();
  const templateCode = getTemplateCode(jurisdictionCode);

  const mergedTemplate: TemplatePackShape = {
    id: templateId,
    name: `${jurisdiction} ERP Template`,
    version: "1.0.0",
    domain: "CORE",
    description: `Pre-built ERP template for ${jurisdiction} - clone and adapt for instant deployment`,
    priority: 50,
    authoritative_for: {
      concepts: [],
      value_sets: [],
    },
    referenced_concepts: [],
    referenced_value_sets: [],
    values: [],
    template_code: templateCode,
    metadata: {
      jurisdiction: jurisdictionCode,
      source_packs: sourcePackIds,
      created_at: new Date().toISOString(),
    },
  };

  // Clone and merge packs - templates ONLY add VALUES
  // Templates reference concepts/value sets from source packs (for documentation)
  const referencedConceptCodes = new Set<string>();
  const referencedValueSetCodes = new Set<string>();
  
  for (const sourcePackId of sourcePackIds) {
    const sourcePack = clonePack(sourcePackId, `${templateId}-${sourcePackId}`);
    
    // Track referenced concepts (for documentation only)
    sourcePack.concepts.forEach((concept) => {
      if (!referencedConceptCodes.has(concept.code)) {
        mergedTemplate.referenced_concepts!.push(concept.code);
        referencedConceptCodes.add(concept.code);
      }
    });

    // Track referenced value sets (for documentation only)
    sourcePack.value_sets.forEach((valueSet) => {
      if (!referencedValueSetCodes.has(valueSet.code)) {
        mergedTemplate.referenced_value_sets!.push(valueSet.code);
        referencedValueSetCodes.add(valueSet.code);
      }
    });

    // Merge values (transform if adapter provided)
    // Templates add jurisdiction-specific VALUES to existing value sets
    const existingValueKeys = new Set(
      mergedTemplate.values.map((v) => `${v.value_set_code}:${v.code}`)
    );
    sourcePack.values.forEach((value) => {
      const valueKey = `${value.value_set_code}:${value.code}`;
      if (!existingValueKeys.has(valueKey)) {
        const transformed = adapters?.transformValue 
          ? adapters.transformValue(value, sourcePackId)
          : value;
        mergedTemplate.values.push(transformed);
        existingValueKeys.add(valueKey);
      }
    });
  }

  return mergedTemplate;
}

/**
 * Adapter: Filter values by jurisdiction (country code)
 */
function createJurisdictionFilter(countryCode: string) {
  return (value: ValueShape): boolean => {
    // Filter logic: keep values relevant to jurisdiction
    // For now, keep all values - can be customized per template
    return true;
  };
}

/**
 * Adapter: Transform value for jurisdiction with proper metadata
 */
function createJurisdictionTransformer(jurisdiction: string, countryCode: string, templateCode: string) {
  return (value: ValueShape, packId: string): ValueShape => {
    // Add jurisdiction metadata with template code
    if (!value.metadata) {
      value.metadata = {};
    }
    value.metadata.jurisdiction = countryCode;
    value.metadata.template_code = templateCode;
    value.metadata.source_pack = packId;
    return value;
  };
}

/**
 * Clone from ERPNext patterns (if we have reference data)
 */
function cloneFromERPNextPattern(patternName: string, targetPackId: string): PackShape | null {
  // This would clone from ERPNext reference data if available
  // For now, return null - can be extended with ERPNext data sources
  console.log(`⚠️  ERPNext pattern cloning not yet implemented: ${patternName}`);
  return null;
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "clone") {
    const sourcePackId = args[1];
    const targetPackId = args[2];

    if (!sourcePackId || !targetPackId) {
      console.error("Usage: pnpm clone-template clone <source-pack-id> <target-pack-id>");
      process.exit(1);
    }

    console.log(`📋 Cloning ${sourcePackId} → ${targetPackId}...`);
    const cloned = clonePack(sourcePackId, targetPackId);
    
    const targetPath = join(PACKS_DIR, `${targetPackId}.pack.json`);
    writeFileSync(targetPath, JSON.stringify(cloned, null, 2) + "\n", "utf-8");
    console.log(`✅ Cloned to ${targetPath}`);

  } else if (command === "template") {
    const templateId = args[1];
    const jurisdiction = args[2];
    const countryCode = args[3] || jurisdiction.substring(0, 2).toUpperCase();
    const sourcePacks = args.slice(4) || ["core", "finance", "tax"];

    if (!templateId || !jurisdiction) {
      console.error("Usage: pnpm clone-template template <template-id> <jurisdiction> [country-code] [source-packs...]");
      console.error("Example: pnpm clone-template template malaysia Malaysia MY core finance tax");
      process.exit(1);
    }

    console.log(`🏗️  Creating template: ${templateId} for ${jurisdiction}...`);
    console.log(`   Source packs: ${sourcePacks.join(", ")}\n`);

    // Get jurisdiction code and template code
    const jurisdictionCode = TEMPLATE_JURISDICTION_MAP[templateId] || countryCode;
    const templateCode = getTemplateCode(jurisdictionCode);

    const template = cloneTemplatePack(
      templateId,
      sourcePacks,
      jurisdiction,
      {
        transformValue: createJurisdictionTransformer(jurisdiction, jurisdictionCode, templateCode),
      }
    );

    const templatePath = join(TEMPLATES_DIR, `template-${templateId}.pack.json`);
    writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");
    
    console.log(`✅ Created template: ${templatePath}`);
    console.log(`   Template Code: ${template.template_code}`);
    console.log(`   Referenced Concepts: ${template.referenced_concepts?.length || 0}`);
    console.log(`   Referenced Value Sets: ${template.referenced_value_sets?.length || 0}`);
    console.log(`   Values: ${template.values.length}`);
    console.log(`\n   Note: Templates are deployment data, not kernel packs.`);
    console.log(`   Use adapters to convert templates to kernel packs at deployment time.\n`);

  } else if (command === "from-erpnext") {
    const patternName = args[1];
    const targetPackId = args[2];

    if (!patternName || !targetPackId) {
      console.error("Usage: pnpm clone-template from-erpnext <pattern-name> <target-pack-id>");
      process.exit(1);
    }

    const cloned = cloneFromERPNextPattern(patternName, targetPackId);
    if (cloned) {
      const targetPath = join(PACKS_DIR, `${targetPackId}.pack.json`);
      writeFileSync(targetPath, JSON.stringify(cloned, null, 2) + "\n", "utf-8");
      console.log(`✅ Cloned from ERPNext pattern: ${targetPath}`);
    }

  } else if (command === "deploy") {
    const templateId = args[1];
    const targetPackId = args[2];

    if (!templateId || !targetPackId) {
      console.error("Usage: pnpm clone-template deploy <template-id> <target-pack-id>");
      console.error("Example: pnpm clone-template deploy malaysia my-company-malaysia");
      process.exit(1);
    }

    // Import and use deployment adapter
    const { deployTemplateToPacks } = await import("./adapters/deploy-adapter.js");
    deployTemplateToPacks(templateId, targetPackId);

  } else {
    console.log("📦 Template Clone Utility");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("Commands:");
    console.log("  clone <source> <target>     - Clone a pack");
    console.log("  template <id> <jurisdiction> [country-code] [sources...] - Create template from multiple packs");
    console.log("  deploy <template-id> <target-pack-id> - Deploy template to kernel pack");
    console.log("  from-erpnext <pattern> <target> - Clone from ERPNext pattern (future)");
    console.log("\nExamples:");
    console.log("  pnpm clone-template clone core core-backup");
    console.log("  pnpm clone-template template malaysia Malaysia MY core finance tax");
    console.log("  pnpm clone-template deploy malaysia my-company-malaysia");
  }
}

main();

