#!/usr/bin/env node
/**
 * ISO Adapter
 * 
 * Reference Code: ADAPTER_{REF_CODE}
 * Examples: ADAPTER_0009MYISO, ADAPTER_0017MYCUR, ADAPTER_0019MYLNG
 * 
 * Converts ISO standards data (3166-1, 4217, 639-1) to kernel PackShape format
 * Uses reference codes from registry for proper metadata management
 * 
 * All values created by this adapter include:
 * - ref_code: Reference code from template-reference-registry.ts
 * - adapter_code: ADAPTER_{ref_code}
 * - integrator_code: INTEGRATOR_{ref_code}
 * - template_code: TEMPLATE_{jurisdiction}
 * - source: ISO_3166_1 | ISO_4217 | ISO_639_1
 * - jurisdiction: ISO 3166-1 alpha-2 code
 * - extracted_at: ISO timestamp
 */

import type { ValueShape } from "../../src/kernel.contract.js";
import {
  createTemplateMetadata,
  SOURCE_TYPES,
} from "../template-metadata-strategy.js";
import {
  getReferenceCode,
} from "../template-reference-registry.js";

/**
 * ISO 3166-1 Country structure
 */
export interface ISOCountry {
  alpha2: string;
  alpha3: string;
  name: string;
  numeric: string;
  region?: string;
  subregion?: string;
}

/**
 * ISO 4217 Currency structure
 */
export interface ISOCurrency {
  code: string;
  name: string;
  numeric: string;
  minorUnits: number;
  symbol?: string;
}

/**
 * ISO 639-1 Language structure
 */
export interface ISOLanguage {
  code: string;
  name: string;
  nativeName?: string;
}

/**
 * Convert ISO countries to kernel values
 */
export function adaptISOCountries(
  countries: ISOCountry[],
  jurisdiction: string,
  templateId?: string
): ValueShape[] {
  // Get reference code from registry
  const refCode = templateId 
    ? getReferenceCode(templateId, SOURCE_TYPES.ISO_3166_1)
    : undefined;

  if (!refCode) {
    throw new Error(
      `Reference code not found for template: ${templateId || 'unknown'}, source: ${SOURCE_TYPES.ISO_3166_1}. ` +
      `Add entry to template-reference-registry.ts`
    );
  }

  return countries.map((country, index) => ({
    code: `COUNTRY_${country.alpha2}`,
    value_set_code: "COUNTRIES",
    label: country.name,
    description: `${country.name} (${country.alpha2}/${country.alpha3})`,
    sort_order: index + 1,
    metadata: createTemplateMetadata(
      refCode,
      SOURCE_TYPES.ISO_3166_1,
      jurisdiction,
      {
        alpha2: country.alpha2,
        alpha3: country.alpha3,
        numeric: country.numeric,
        region: country.region,
        subregion: country.subregion,
      }
    ),
  }));
}

/**
 * Convert ISO currencies to kernel values
 */
export function adaptISOCurrencies(
  currencies: ISOCurrency[],
  jurisdiction: string,
  templateId?: string
): ValueShape[] {
  // Get reference code from registry
  const refCode = templateId 
    ? getReferenceCode(templateId, SOURCE_TYPES.ISO_4217)
    : undefined;

  if (!refCode) {
    throw new Error(
      `Reference code not found for template: ${templateId || 'unknown'}, source: ${SOURCE_TYPES.ISO_4217}. ` +
      `Add entry to template-reference-registry.ts`
    );
  }

  return currencies.map((currency, index) => ({
    code: `CUR_${currency.code}`,
    value_set_code: "CURRENCIES",
    label: currency.name,
    description: `${currency.name} (${currency.code})`,
    sort_order: index + 1,
    metadata: createTemplateMetadata(
      refCode,
      SOURCE_TYPES.ISO_4217,
      jurisdiction,
      {
        iso_code: currency.code,
        numeric: currency.numeric,
        minor_units: currency.minorUnits,
        symbol: currency.symbol,
      }
    ),
  }));
}

/**
 * Convert ISO languages to kernel values
 */
export function adaptISOLanguages(
  languages: ISOLanguage[],
  jurisdiction: string,
  templateId?: string
): ValueShape[] {
  // Get reference code from registry
  const refCode = templateId 
    ? getReferenceCode(templateId, SOURCE_TYPES.ISO_639_1)
    : undefined;

  if (!refCode) {
    throw new Error(
      `Reference code not found for template: ${templateId || 'unknown'}, source: ${SOURCE_TYPES.ISO_639_1}. ` +
      `Add entry to template-reference-registry.ts`
    );
  }

  return languages.map((language, index) => ({
    code: `LANG_${language.code.toUpperCase()}`,
    value_set_code: "LANGUAGES",
    label: language.name,
    description: language.nativeName 
      ? `${language.name} (${language.nativeName})`
      : language.name,
    sort_order: index + 1,
    metadata: createTemplateMetadata(
      refCode,
      SOURCE_TYPES.ISO_639_1,
      jurisdiction,
      {
        iso_code: language.code,
        native_name: language.nativeName,
      }
    ),
  }));
}

/**
 * Clone ISO pattern and adapt to kernel values
 */
export function cloneISOPattern(
  jurisdiction: string,
  templateId: string,
  isoData: {
    countries?: ISOCountry[];
    currencies?: ISOCurrency[];
    languages?: ISOLanguage[];
  }
): ValueShape[] {
  const values: ValueShape[] = [];

  if (isoData.countries) {
    values.push(...adaptISOCountries(isoData.countries, jurisdiction, templateId));
  }

  if (isoData.currencies) {
    values.push(...adaptISOCurrencies(isoData.currencies, jurisdiction, templateId));
  }

  if (isoData.languages) {
    values.push(...adaptISOLanguages(isoData.languages, jurisdiction, templateId));
  }

  return values;
}

