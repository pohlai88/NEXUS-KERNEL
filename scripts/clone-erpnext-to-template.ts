#!/usr/bin/env node
/**
 * Clone ERPNext Patterns to Templates
 * Integrates ERPNext chart of accounts, tax codes, and payment terms into templates
 * Uses erpnext-adapter to convert and merge
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ValueShape } from "../src/kernel.contract.js";
import {
  adaptERPNextAccounts,
  adaptERPNextTaxCodes,
  adaptERPNextPaymentTerms,
} from "./adapters/erpnext-adapter.js";
import {
  getTemplateCode,
  TEMPLATE_JURISDICTION_MAP,
} from "./template-metadata-strategy.js";
import {
  getReferenceCode,
  getReferenceCodeEntry,
} from "./template-reference-registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");
const TEMPLATES_DIR = join(ROOT_DIR, "templates");

/**
 * Template Pack Shape
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
  template_code?: string;
  metadata?: {
    jurisdiction?: string;
    source_packs?: string[];
    created_at?: string;
  };
}

/**
 * Load template
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
 * Save template
 */
function saveTemplate(template: TemplatePackShape, templateId: string): void {
  const templatePath = join(TEMPLATES_DIR, `template-${templateId}.pack.json`);
  writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");
}

/**
 * Get jurisdiction code from template
 */
function getJurisdictionCode(templateId: string): string {
  const mapping: Record<string, string> = {
    malaysia: "MY",
    singapore: "SG",
    "united-states": "US",
    "united-kingdom": "GB",
    australia: "AU",
    canada: "CA",
    india: "IN",
    japan: "JP",
  };
  return mapping[templateId] || templateId.toUpperCase().substring(0, 2);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const templateId = args[0] || "all";

  console.log("🔄 Cloning ERPNext Patterns to Templates");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Load ERPNext data
  const chartOfAccounts = JSON.parse(
    readFileSync(join(DATA_DIR, "erpnext-chart-of-accounts.json"), "utf-8")
  );
  const taxCodes = JSON.parse(
    readFileSync(join(DATA_DIR, "erpnext-tax-codes.json"), "utf-8")
  );
  const paymentTerms = JSON.parse(
    readFileSync(join(DATA_DIR, "erpnext-payment-terms.json"), "utf-8")
  );

  // Get templates to process
  const templatesToProcess = templateId === "all"
    ? ["malaysia", "singapore", "united-states", "united-kingdom", "australia", "canada", "india", "japan"]
    : [templateId];

  for (const templateId of templatesToProcess) {
    try {
      const template = loadTemplate(templateId);
      const jurisdiction = getJurisdictionCode(templateId);
      
      // Ensure template has template_code
      if (!template.template_code) {
        template.template_code = getTemplateCode(jurisdiction);
      }
      
      // Ensure template has metadata
      if (!template.metadata) {
        template.metadata = {};
      }
      template.metadata.jurisdiction = jurisdiction;

      // Get reference code from registry
      const refCode = getReferenceCode(templateId, "ERPNext");
      
      console.log(`📦 Processing template: ${templateId} (${jurisdiction})...`);
      console.log(`   Template Code: ${template.template_code}`);
      if (refCode) {
        console.log(`   Reference Code: ${refCode}`);
      } else {
        console.log(`   ⚠️  Reference code not found - add to template-reference-registry.ts`);
      }

      // Add chart of accounts (if available for jurisdiction)
      if (chartOfAccounts[jurisdiction]) {
        const accountValues = adaptERPNextAccounts(chartOfAccounts[jurisdiction], jurisdiction, templateId);
        const existingValueKeys = new Set(
          template.values.map((v) => `${v.value_set_code}:${v.code}`)
        );
        accountValues.forEach((value) => {
          const valueKey = `${value.value_set_code}:${value.code}`;
          if (!existingValueKeys.has(valueKey)) {
            template.values.push(value);
            existingValueKeys.add(valueKey);
          }
        });
        console.log(`   Added ${accountValues.length} chart of accounts`);
      }

      // Add tax codes (if available for jurisdiction)
      if (taxCodes[jurisdiction]) {
        const taxValues = adaptERPNextTaxCodes(taxCodes[jurisdiction], jurisdiction, templateId);
        const existingValueKeys = new Set(
          template.values.map((v) => `${v.value_set_code}:${v.code}`)
        );
        taxValues.forEach((value) => {
          const valueKey = `${value.value_set_code}:${value.code}`;
          if (!existingValueKeys.has(valueKey)) {
            template.values.push(value);
            existingValueKeys.add(valueKey);
          }
        });
        console.log(`   Added ${taxValues.length} tax codes`);
      }

      // Add payment terms (global)
      const paymentTermValues = adaptERPNextPaymentTerms(paymentTerms, jurisdiction, templateId);
      const existingValueKeys = new Set(
        template.values.map((v) => `${v.value_set_code}:${v.code}`)
      );
      paymentTermValues.forEach((value) => {
        const valueKey = `${value.value_set_code}:${value.code}`;
        if (!existingValueKeys.has(valueKey)) {
          template.values.push(value);
          existingValueKeys.add(valueKey);
        }
      });
      console.log(`   Added ${paymentTermValues.length} payment terms`);

      // Update referenced value sets if needed
      const newValueSetCodes = new Set(
        template.values.map((v) => v.value_set_code)
      );
      if (!template.referenced_value_sets) {
        template.referenced_value_sets = [];
      }
      newValueSetCodes.forEach((code) => {
        if (!template.referenced_value_sets!.includes(code)) {
          template.referenced_value_sets!.push(code);
        }
      });

      // Save updated template
      saveTemplate(template, templateId);
      console.log(`✅ Updated template: ${templateId}`);
      console.log(`   Total values: ${template.values.length}\n`);

    } catch (error: any) {
      if (error.message.includes("not found")) {
        console.log(`⚠️  Template ${templateId} not found, skipping...\n`);
      } else {
        console.error(`❌ Error processing ${templateId}:`, error.message);
      }
    }
  }

  console.log("✅ ERPNext pattern integration complete!");
}

main();

