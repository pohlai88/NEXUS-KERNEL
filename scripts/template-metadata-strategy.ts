#!/usr/bin/env node
/**
 * Template Metadata Strategy
 * 
 * SQL Migration-Style Reference Code Convention:
 * Format: NNNNAABBCC
 * - NNNN: Sequential number (0001, 0002, 0003...)
 * - AABBCC: Reference code (MYERP, SGISO, USFIN...)
 * 
 * This reference code is the SINGLE SOURCE OF TRUTH used in:
 * - Template files
 * - Adapter files
 * - Integrator files
 * - Documentation
 * - All metadata
 * 
 * Example: 0001MYERP
 * - 0001: Sequence number
 * - MY: Malaysia (jurisdiction)
 * - ERP: ERPNext (source)
 * 
 * All related files and metadata reference this code.
 */

/**
 * Source code abbreviations (for reference code generation)
 */
const SOURCE_ABBREVIATIONS: Record<string, string> = {
  ISO_3166_1: "ISO",
  ISO_4217: "ISO",
  ISO_639_1: "ISO",
  ERPNext: "ERP",
  Finance: "FIN",
  Tax: "TAX",
};

/**
 * Generate reference code (SQL migration style: NNNNAABBCC)
 * Format: {sequence}{jurisdiction}{source}
 * Example: 0001MYERP (Malaysia ERPNext), 0002SGISO (Singapore ISO)
 */
export function generateReferenceCode(
  sequence: number,
  jurisdiction: string,
  source: string
): string {
  const seq = String(sequence).padStart(4, "0");
  const jur = jurisdiction.toUpperCase().substring(0, 2);
  const src = SOURCE_ABBREVIATIONS[source] || source.toUpperCase().substring(0, 3);
  return `${seq}${jur}${src}`;
}

/**
 * Parse reference code to extract components
 */
export function parseReferenceCode(refCode: string): {
  sequence: number;
  jurisdiction: string;
  source: string;
} {
  const match = refCode.match(/^(\d{4})([A-Z]{2})([A-Z]{3})$/);
  if (!match) {
    throw new Error(`Invalid reference code format: ${refCode}. Expected: NNNNAABBCC`);
  }
  return {
    sequence: parseInt(match[1], 10),
    jurisdiction: match[2],
    source: match[3],
  };
}

/**
 * Get template code from reference code (backward compatibility)
 */
export function getTemplateCode(jurisdiction: string): string {
  return `TEMPLATE_${jurisdiction.toUpperCase()}`;
}

/**
 * Get adapter code from reference code
 */
export function getAdapterCode(refCode: string): string {
  return `ADAPTER_${refCode}`;
}

/**
 * Get integrator code from reference code
 */
export function getIntegratorCode(refCode: string): string {
  return `INTEGRATOR_${refCode}`;
}

/**
 * Create standard metadata for template values
 * Uses reference code as single source of truth
 */
export function createTemplateMetadata(
  refCode: string,
  source: string,
  jurisdiction: string,
  additionalMetadata?: Record<string, any>
): Record<string, any> {
  const templateCode = getTemplateCode(jurisdiction);
  const adapterCode = getAdapterCode(refCode);
  const integratorCode = getIntegratorCode(refCode);

  return {
    ref_code: refCode, // PRIMARY: SQL migration-style reference code
    template_code: templateCode,
    adapter_code: adapterCode,
    integrator_code: integratorCode,
    source,
    jurisdiction: jurisdiction.toUpperCase(),
    extracted_at: new Date().toISOString(),
    ...additionalMetadata,
  };
}

/**
 * Template ID to jurisdiction code mapping
 */
export const TEMPLATE_JURISDICTION_MAP: Record<string, string> = {
  malaysia: "MY",
  singapore: "SG",
  vietnam: "VN",
  thailand: "TH",
  indonesia: "ID",
  philippines: "PH",
  "united-states": "US",
  "united-kingdom": "GB",
  australia: "AU",
  canada: "CA",
  india: "IN",
  japan: "JP",
};

/**
 * Focus countries for Phase 1 - get full data (countries + currencies + languages)
 */
export const FOCUS_COUNTRIES = [
  "malaysia",
  "singapore",
  "vietnam",
  "thailand",
  "indonesia",
  "philippines",
] as const;

/**
 * Check if a template is a focus country (gets full ISO data)
 */
export function isFocusCountry(templateId: string): boolean {
  return FOCUS_COUNTRIES.includes(templateId as any);
}

/**
 * Source type constants
 */
export const SOURCE_TYPES = {
  ISO_3166_1: "ISO_3166_1", // Countries
  ISO_4217: "ISO_4217", // Currencies
  ISO_639_1: "ISO_639_1", // Languages
  ERPNext: "ERPNext",
} as const;

export type SourceType = typeof SOURCE_TYPES[keyof typeof SOURCE_TYPES];

