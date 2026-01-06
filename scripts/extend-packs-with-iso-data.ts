#!/usr/bin/env node
/**
 * Extend Packs with ISO Data
 * Extends existing packs with missing ISO 3166-1, ISO 4217, and ISO 639-1 data
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { PackShape, ValueShape } from "../src/kernel.contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");
const PACKS_DIR = join(ROOT_DIR, "packs");

/**
 * Convert country name to UPPER_SNAKE_CASE code
 */
function toCountryCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Convert currency name to UPPER_SNAKE_CASE code
 */
function toCurrencyCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

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
 * Load pack file
 */
function loadPack(filename: string): PackShape {
  const filePath = join(PACKS_DIR, filename);
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as PackShape;
}

/**
 * Save pack file
 */
function savePack(filename: string, pack: PackShape): void {
  const filePath = join(PACKS_DIR, filename);
  writeFileSync(filePath, JSON.stringify(pack, null, 2) + "\n", "utf-8");
  console.log(`✅ Updated ${filename}`);
}

/**
 * Main function
 */
async function main() {
  console.log("📦 Extending Packs with ISO Data");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Load extracted ISO data
  const countriesData = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-3166-1-countries.json"), "utf-8")
  );
  const currenciesData = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-4217-currencies.json"), "utf-8")
  );
  const languagesData = JSON.parse(
    readFileSync(join(DATA_DIR, "iso-639-1-languages.json"), "utf-8")
  );

  // Load existing packs
  const corePack = loadPack("core.pack.json");
  const financePack = loadPack("finance.pack.json");

  // Get existing country codes
  const existingCountryCodes = new Set(
    corePack.values
      .filter((v) => v.value_set_code === "COUNTRIES")
      .map((v) => v.code)
  );

  // Get existing currency codes
  const existingCurrencyCodes = new Set(
    financePack.values
      .filter((v) => v.value_set_code === "CURRENCIES")
      .map((v) => v.code)
  );

  // Find missing countries
  const missingCountries = countriesData
    .filter((country: any) => {
      const code = toCountryCode(country.name);
      return !existingCountryCodes.has(code);
    })
    .slice(0, 12); // Only add 12 to reach 195

  // Find missing currencies - add ALL missing (no limit)
  const missingCurrencies = currenciesData
    .filter((currency: any) => {
      const code = toCurrencyCode(currency.name);
      return !existingCurrencyCodes.has(code);
    });
    // Removed .slice(0, 64) limit - add all missing currencies to reach 170

  console.log(`📊 Found ${missingCountries.length} missing countries`);
  console.log(`📊 Found ${missingCurrencies.length} missing currencies\n`);

  // Add missing countries to core pack
  if (missingCountries.length > 0) {
    const currentMaxSortOrder = Math.max(
      ...corePack.values
        .filter((v) => v.value_set_code === "COUNTRIES")
        .map((v) => v.sort_order || 0),
      0
    );

    missingCountries.forEach((country: any, index: number) => {
      const code = toCountryCode(country.name);
      const value: ValueShape = {
        code,
        value_set_code: "COUNTRIES",
        label: country.name,
        description: `${country.name} (ISO 3166-1: ${country.alpha2})`,
        sort_order: currentMaxSortOrder + index + 1,
        metadata: {
          alpha2: country.alpha2,
          alpha3: country.alpha3,
          numeric: country.numeric,
          region: country.region,
          subregion: country.subregion,
        },
      };
      corePack.values.push(value);
    });

    savePack("core.pack.json", corePack);
    console.log(`   Added ${missingCountries.length} countries to core.pack.json\n`);
  }

  // Add missing currencies to finance pack
  if (missingCurrencies.length > 0) {
    const currentMaxSortOrder = Math.max(
      ...financePack.values
        .filter((v) => v.value_set_code === "CURRENCIES")
        .map((v) => v.sort_order || 0),
      0
    );

    missingCurrencies.forEach((currency: any, index: number) => {
      const code = toCurrencyCode(currency.name);
      const value: ValueShape = {
        code,
        value_set_code: "CURRENCIES",
        label: currency.name,
        description: `${currency.name} (ISO 4217: ${currency.code})`,
        sort_order: currentMaxSortOrder + index + 1,
        metadata: {
          iso_code: currency.code,
          numeric: currency.numeric,
          minor_units: currency.minorUnits,
          symbol: currency.symbol,
        },
      };
      financePack.values.push(value);
    });

    savePack("finance.pack.json", financePack);
    console.log(`   Added ${missingCurrencies.length} currencies to finance.pack.json\n`);
  }

  console.log("✅ Pack extension complete!");
  console.log("\n   Next steps:");
  console.log("   1. Run 'pnpm generate' to regenerate kernel code");
  console.log("   2. Verify the new values are included");
  console.log("   3. Create iso-languages.pack.json for languages");
}

main().catch(console.error);

