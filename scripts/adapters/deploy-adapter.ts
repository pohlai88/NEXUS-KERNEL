#!/usr/bin/env node
/**
 * Deployment Adapter
 * Converts template packs to kernel packs at deployment time
 * Fast approach: clone template, adapt, deploy
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { PackShape, ValueShape } from "../../src/kernel.contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "../..");
const TEMPLATES_DIR = join(ROOT_DIR, "templates");
const PACKS_DIR = join(ROOT_DIR, "packs");

/**
 * Template Pack Shape - Deployment template format
 */
interface TemplatePackShape {
  id: string;
  name: string;
  version: string;
  domain: string;
  description: string;
  priority: number;
  authoritative_for: {
    concepts: string[];
    value_sets: string[];
  };
  referenced_concepts?: string[];
  referenced_value_sets?: string[];
  values: ValueShape[];
}

/**
 * Load template pack
 */
function loadTemplate(templateId: string): TemplatePackShape {
  const templatePath = join(TEMPLATES_DIR, `template-${templateId}.pack.json`);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateId}`);
  }
  const content = readFileSync(templatePath, "utf-8");
  return JSON.parse(content) as TemplatePackShape;
}

/**
 * Load source packs to get concepts and value sets
 */
function loadSourcePacks(valueSetCodes: string[]): {
  concepts: any[];
  valueSets: any[];
} {
  // Load all packs to find concepts and value sets
  const allPacks: PackShape[] = [];
  const packFiles = ["core", "finance", "tax", "sales", "purchase", "hr", "inventory"];
  
  for (const packFile of packFiles) {
    const packPath = join(PACKS_DIR, `${packFile}.pack.json`);
    if (existsSync(packPath)) {
      const content = readFileSync(packPath, "utf-8");
      allPacks.push(JSON.parse(content) as PackShape);
    }
  }

  // Extract concepts and value sets referenced by template
  const concepts = new Map();
  const valueSets = new Map();

  for (const pack of allPacks) {
    pack.concepts.forEach((c) => {
      if (!concepts.has(c.code)) {
        concepts.set(c.code, c);
      }
    });
    pack.value_sets.forEach((vs) => {
      if (valueSetCodes.includes(vs.code) && !valueSets.has(vs.code)) {
        valueSets.set(vs.code, vs);
      }
    });
  }

  return {
    concepts: Array.from(concepts.values()),
    valueSets: Array.from(valueSets.values()),
  };
}

/**
 * Convert template to kernel pack for deployment
 */
export function deployTemplate(
  templateId: string,
  targetPackId: string,
  customizations?: {
    transformValue?: (value: ValueShape) => ValueShape;
    filterValues?: (value: ValueShape) => boolean;
  }
): PackShape {
  const template = loadTemplate(templateId);
  const valueSetCodes = template.referenced_value_sets || [];
  const { concepts, valueSets } = loadSourcePacks(valueSetCodes);

  // Create deployment pack from template
  const deploymentPack: PackShape = {
    id: targetPackId,
    name: template.name,
    version: "1.0.0",
    domain: template.domain,
    description: template.description,
    priority: template.priority,
    authoritative_for: template.authoritative_for,
    concepts: concepts.filter((c) => 
      template.referenced_concepts?.includes(c.code)
    ),
    value_sets: valueSets,
    values: template.values
      .filter((v) => customizations?.filterValues ? customizations.filterValues(v) : true)
      .map((v) => customizations?.transformValue ? customizations.transformValue(v) : v),
  };

  return deploymentPack;
}

/**
 * Deploy template to packs directory
 */
export function deployTemplateToPacks(
  templateId: string,
  targetPackId: string,
  customizations?: {
    transformValue?: (value: ValueShape) => ValueShape;
    filterValues?: (value: ValueShape) => boolean;
  }
): void {
  const pack = deployTemplate(templateId, targetPackId, customizations);
  const packPath = join(PACKS_DIR, `${targetPackId}.pack.json`);
  writeFileSync(packPath, JSON.stringify(pack, null, 2) + "\n", "utf-8");
  console.log(`✅ Deployed template ${templateId} → ${targetPackId}.pack.json`);
  console.log(`   Concepts: ${pack.concepts.length}`);
  console.log(`   Value Sets: ${pack.value_sets.length}`);
  console.log(`   Values: ${pack.values.length}`);
}

