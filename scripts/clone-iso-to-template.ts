#!/usr/bin/env node
/**
 * Clone ISO Standards to Templates
 * 
 * Reference Code: INTEGRATOR_{REF_CODE}
 * Examples: INTEGRATOR_0009MYISO, INTEGRATOR_0017MYCUR, INTEGRATOR_0019MYLNG
 * 
 * Integrates ISO 3166-1 (countries), ISO 4217 (currencies), and ISO 639-1 (languages) into templates
 * Uses iso-adapter to convert and merge with reference codes
 * 
 * This integrator:
 * - Loads ISO data from data/ directory
 * - Uses iso-adapter to convert to kernel values
 * - Adds reference codes to all values
 * - Merges into templates with proper metadata
 * - Updates template referenced_value_sets
 * 
 * Reference codes are registered in template-reference-registry.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ValueShape } from "../src/kernel.contract.js";
import {
  adaptISOCountries,
  adaptISOCurrencies,
  adaptISOLanguages,
} from "./adapters/iso-adapter.js";
import {
  getTemplateCode,
  TEMPLATE_JURISDICTION_MAP,
  isFocusCountry,
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
  return TEMPLATE_JURISDICTION_MAP[templateId] || templateId.toUpperCase().substring(0, 2);
}

/**
 * Filter countries by jurisdiction (if needed)
 */
function filterCountriesByJurisdiction(
  countries: any[],
  jurisdiction: string
): any[] {
  // For now, include all countries - can be filtered later if needed
  return countries;
}

/**
 * Filter currencies by jurisdiction (if needed)
 */
function filterCurrenciesByJurisdiction(
  currencies: any[],
  jurisdiction: string
): any[] {
  // For now, include all currencies - can be filtered later if needed
  return currencies;
}

/**
 * Filter languages by jurisdiction (if needed)
 */
function filterLanguagesByJurisdiction(
  languages: any[],
  jurisdiction: string
): any[] {
  // For now, include all languages - can be filtered later if needed
  return languages;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const templateId = args[0] || "all";
  const isoType = args[1] || "all"; // "countries", "currencies", "languages", or "all"

  console.log("🌍 Cloning ISO Standards to Templates");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Load ISO data
  const countriesData = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-3166-1-countries.json"), "utf-8")
  );
  const currenciesData = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-4217-currencies.json"), "utf-8")
  );
  const languagesData = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-639-1-languages.json"), "utf-8")
  );

  // Get templates to process
  // Focus countries: malaysia, singapore, vietnam, thailand, indonesia, philippines (full data)
  // Other countries: united-states, united-kingdom, australia, canada, india, japan (countries only)
  const templatesToProcess = templateId === "all"
    ? ["malaysia", "singapore", "vietnam", "thailand", "indonesia", "philippines", "united-states", "united-kingdom", "australia", "canada", "india", "japan"]
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

      // Get reference codes from registry
      const refCodeISO3166 = getReferenceCode(templateId, "ISO_3166_1");
      const refCodeISO4217 = getReferenceCode(templateId, "ISO_4217");
      const refCodeISO6391 = getReferenceCode(templateId, "ISO_639_1");
      
      console.log(`📦 Processing template: ${templateId} (${jurisdiction})...`);
      console.log(`   Template Code: ${template.template_code}`);
      if (refCodeISO3166) console.log(`   Reference Code (ISO 3166-1): ${refCodeISO3166}`);
      if (refCodeISO4217) console.log(`   Reference Code (ISO 4217): ${refCodeISO4217}`);
      if (refCodeISO6391) console.log(`   Reference Code (ISO 639-1): ${refCodeISO6391}`);

      // Add ISO 3166-1 countries (if requested and reference code exists)
      if ((isoType === "all" || isoType === "countries") && refCodeISO3166) {
        const filteredCountries = filterCountriesByJurisdiction(countriesData, jurisdiction);
        const countryValues = adaptISOCountries(filteredCountries, jurisdiction, templateId);
        const existingValueKeys = new Set(
          template.values.map((v) => `${v.value_set_code}:${v.code}`)
        );
        let addedCount = 0;
        countryValues.forEach((value) => {
          const valueKey = `${value.value_set_code}:${value.code}`;
          if (!existingValueKeys.has(valueKey)) {
            template.values.push(value);
            existingValueKeys.add(valueKey);
            addedCount++;
          }
        });
        console.log(`   Added ${addedCount} countries (ISO 3166-1)`);
      }

      // Add ISO 4217 currencies (only for focus countries, if requested and reference code exists)
      const shouldAddCurrencies = isFocusCountry(templateId) && (isoType === "all" || isoType === "currencies");
      if (shouldAddCurrencies && refCodeISO4217) {
        const filteredCurrencies = filterCurrenciesByJurisdiction(currenciesData, jurisdiction);
        const currencyValues = adaptISOCurrencies(filteredCurrencies, jurisdiction, templateId);
        const existingValueKeys = new Set(
          template.values.map((v) => `${v.value_set_code}:${v.code}`)
        );
        let addedCount = 0;
        currencyValues.forEach((value) => {
          const valueKey = `${value.value_set_code}:${value.code}`;
          if (!existingValueKeys.has(valueKey)) {
            template.values.push(value);
            existingValueKeys.add(valueKey);
            addedCount++;
          }
        });
        console.log(`   Added ${addedCount} currencies (ISO 4217)`);
      } else if (shouldAddCurrencies && !refCodeISO4217) {
        console.log(`   ⚠️  Currencies skipped - reference code not found (focus countries only)`);
      } else if (!isFocusCountry(templateId)) {
        console.log(`   ⚠️  Currencies skipped - not a focus country (countries only)`);
      }

      // Add ISO 639-1 languages (only for focus countries, if requested and reference code exists)
      const shouldAddLanguages = isFocusCountry(templateId) && (isoType === "all" || isoType === "languages");
      if (shouldAddLanguages && refCodeISO6391) {
        const filteredLanguages = filterLanguagesByJurisdiction(languagesData, jurisdiction);
        const languageValues = adaptISOLanguages(filteredLanguages, jurisdiction, templateId);
        const existingValueKeys = new Set(
          template.values.map((v) => `${v.value_set_code}:${v.code}`)
        );
        let addedCount = 0;
        languageValues.forEach((value) => {
          const valueKey = `${value.value_set_code}:${value.code}`;
          if (!existingValueKeys.has(valueKey)) {
            template.values.push(value);
            existingValueKeys.add(valueKey);
            addedCount++;
          }
        });
        console.log(`   Added ${addedCount} languages (ISO 639-1)`);
      } else if (shouldAddLanguages && !refCodeISO6391) {
        console.log(`   ⚠️  Languages skipped - reference code not found (focus countries only)`);
      } else if (!isFocusCountry(templateId)) {
        console.log(`   ⚠️  Languages skipped - not a focus country (countries only)`);
      }

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

  console.log("✅ ISO standards integration complete!");
  console.log("\n   Note: ISO data uses reference codes from template-reference-registry.ts");
  console.log("   All values include proper metadata with ref_code, adapter_code, and integrator_code");
}

main();

