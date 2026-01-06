#!/usr/bin/env node
/**
 * ISO Population Report Generator
 * Generates a comprehensive report of what ISO data will be cloned/populated into templates
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  getReferenceCode,
  TEMPLATE_REFERENCE_REGISTRY,
} from "./template-reference-registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");
const TEMPLATES_DIR = join(ROOT_DIR, "templates");

/**
 * Load ISO data
 */
function loadISOData() {
  const countries = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-3166-1-countries.json"), "utf-8")
  );
  const currencies = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-4217-currencies.json"), "utf-8")
  );
  const languages = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-639-1-languages.json"), "utf-8")
  );
  return { countries, currencies, languages };
}

/**
 * Check if template exists
 */
function templateExists(templateId: string): boolean {
  const templatePath = join(TEMPLATES_DIR, `template-${templateId}.pack.json`);
  return existsSync(templatePath);
}

/**
 * Generate report
 */
function generateReport() {
  console.log("📊 ISO Data Population Report");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const { countries, currencies, languages } = loadISOData();

  console.log("📥 Source ISO Data:");
  console.log(`   ISO 3166-1 Countries: ${countries.length}`);
  console.log(`   ISO 4217 Currencies: ${currencies.length}`);
  console.log(`   ISO 639-1 Languages: ${languages.length}\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get all ISO-related reference codes
  const isoEntries = Object.values(TEMPLATE_REFERENCE_REGISTRY).filter(
    (entry) => entry.source.startsWith("ISO")
  );

  console.log("🏷️  ISO Reference Codes in Registry:\n");
  
  const byTemplate: Record<string, Array<typeof isoEntries[0]>> = {};
  isoEntries.forEach((entry) => {
    if (!byTemplate[entry.templateId]) {
      byTemplate[entry.templateId] = [];
    }
    byTemplate[entry.templateId].push(entry);
  });

  for (const [templateId, entries] of Object.entries(byTemplate)) {
    const exists = templateExists(templateId);
    const status = exists ? "✅" : "❌";
    console.log(`${status} ${templateId} (${entries[0].jurisdiction})`);
    
    entries.forEach((entry) => {
      console.log(`   ${entry.refCode} - ${entry.source} (${entry.description})`);
    });
    
    if (!exists) {
      console.log(`   ⚠️  Template file not found - create template first`);
    }
    console.log();
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📋 What Will Be Populated:\n");

  // ISO 3166-1 Countries
  console.log("🌍 ISO 3166-1 Countries:");
  const countryTemplates = isoEntries.filter((e) => e.source === "ISO_3166_1");
  countryTemplates.forEach((entry) => {
    const exists = templateExists(entry.templateId);
    const status = exists ? "✅" : "❌";
    console.log(`   ${status} ${entry.refCode} → ${entry.templateId}`);
    console.log(`      Will populate: ${countries.length} countries`);
    console.log(`      Value Set: COUNTRIES`);
    console.log(`      Adapter: ADAPTER_${entry.refCode}`);
    console.log(`      Integrator: INTEGRATOR_${entry.refCode}`);
    if (!exists) {
      console.log(`      ⚠️  Template missing - will skip`);
    }
    console.log();
  });

  // ISO 4217 Currencies
  console.log("💰 ISO 4217 Currencies:");
  const currencyTemplates = isoEntries.filter((e) => e.source === "ISO_4217");
  currencyTemplates.forEach((entry) => {
    const exists = templateExists(entry.templateId);
    const status = exists ? "✅" : "❌";
    console.log(`   ${status} ${entry.refCode} → ${entry.templateId}`);
    console.log(`      Will populate: ${currencies.length} currencies`);
    console.log(`      Value Set: CURRENCIES`);
    console.log(`      Adapter: ADAPTER_${entry.refCode}`);
    console.log(`      Integrator: INTEGRATOR_${entry.refCode}`);
    if (!exists) {
      console.log(`      ⚠️  Template missing - will skip`);
    }
    console.log();
  });

  // ISO 639-1 Languages
  console.log("🗣️  ISO 639-1 Languages:");
  const languageTemplates = isoEntries.filter((e) => e.source === "ISO_639_1");
  languageTemplates.forEach((entry) => {
    const exists = templateExists(entry.templateId);
    const status = exists ? "✅" : "❌";
    console.log(`   ${status} ${entry.refCode} → ${entry.templateId}`);
    console.log(`      Will populate: ${languages.length} languages`);
    console.log(`      Value Set: LANGUAGES`);
    console.log(`      Adapter: ADAPTER_${entry.refCode}`);
    console.log(`      Integrator: INTEGRATOR_${entry.refCode}`);
    if (!exists) {
      console.log(`      ⚠️  Template missing - will skip`);
    }
    console.log();
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📝 Metadata Structure:\n");
  console.log("Each value will include:");
  console.log("  - ref_code: Reference code (e.g., '0009MYISO')");
  console.log("  - template_code: Template code (e.g., 'TEMPLATE_MY')");
  console.log("  - adapter_code: Adapter code (e.g., 'ADAPTER_0009MYISO')");
  console.log("  - integrator_code: Integrator code (e.g., 'INTEGRATOR_0009MYISO')");
  console.log("  - source: Source type (e.g., 'ISO_3166_1')");
  console.log("  - jurisdiction: Jurisdiction code (e.g., 'MY')");
  console.log("  - extracted_at: ISO timestamp");
  console.log("  - Additional source-specific metadata\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Summary
  const totalTemplates = Object.keys(byTemplate).length;
  const existingTemplates = Object.keys(byTemplate).filter((id) =>
    templateExists(id)
  ).length;
  const totalEntries = isoEntries.length;

  console.log("📊 Summary:");
  console.log(`   Total ISO Reference Codes: ${totalEntries}`);
  console.log(`   Templates with ISO codes: ${totalTemplates}`);
  console.log(`   Existing templates: ${existingTemplates}`);
  console.log(`   Missing templates: ${totalTemplates - existingTemplates}`);
  console.log(`   Total countries to populate: ${countries.length} × ${countryTemplates.length} = ${countries.length * countryTemplates.length}`);
  console.log(`   Total currencies to populate: ${currencies.length} × ${currencyTemplates.length} = ${currencies.length * currencyTemplates.length}`);
  console.log(`   Total languages to populate: ${languages.length} × ${languageTemplates.length} = ${languages.length * languageTemplates.length}`);

  console.log("\n✅ Report complete!");
  console.log("\n   To populate ISO data into templates, run:");
  console.log("   pnpm clone-iso [template-id] [iso-type]");
  console.log("\n   Examples:");
  console.log("   pnpm clone-iso malaysia all");
  console.log("   pnpm clone-iso singapore countries");
  console.log("   pnpm clone-iso all currencies");
}

generateReport();

