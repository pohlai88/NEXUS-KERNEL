#!/usr/bin/env node
/**
 * Template Reference Code Registry
 * 
 * Central registry of all template reference codes (SQL migration style: NNNNAABBCC)
 * This is the SINGLE SOURCE OF TRUTH for all template/adapter/integrator references.
 * 
 * Format: NNNNAABBCC
 * - NNNN: Sequential number (0001, 0002, 0003...)
 * - AABBCC: Reference code (MYERP, SGISO, USFIN...)
 * 
 * All files, documentation, and metadata MUST reference these codes.
 */

/**
 * Template Reference Code Registry
 * Add new entries here - they will be used across all scripts and documentation
 */
export const TEMPLATE_REFERENCE_REGISTRY: Record<string, {
  refCode: string;
  sequence: number;
  jurisdiction: string;
  source: string;
  description: string;
  templateId: string;
}> = {
  // Malaysia Templates
  "malaysia-erpnext": {
    refCode: "0001MYERP",
    sequence: 1,
    jurisdiction: "MY",
    source: "ERPNext",
    description: "Malaysia ERPNext template",
    templateId: "malaysia",
  },
  
  // Singapore Templates
  "singapore-erpnext": {
    refCode: "0002SGERP",
    sequence: 2,
    jurisdiction: "SG",
    source: "ERPNext",
    description: "Singapore ERPNext template",
    templateId: "singapore",
  },
  
  // United States Templates
  "united-states-erpnext": {
    refCode: "0003USERP",
    sequence: 3,
    jurisdiction: "US",
    source: "ERPNext",
    description: "United States ERPNext template",
    templateId: "united-states",
  },
  
  // United Kingdom Templates
  "united-kingdom-erpnext": {
    refCode: "0004GBERP",
    sequence: 4,
    jurisdiction: "GB",
    source: "ERPNext",
    description: "United Kingdom ERPNext template",
    templateId: "united-kingdom",
  },
  
  // Australia Templates
  "australia-erpnext": {
    refCode: "0005AUERP",
    sequence: 5,
    jurisdiction: "AU",
    source: "ERPNext",
    description: "Australia ERPNext template",
    templateId: "australia",
  },
  
  // Canada Templates
  "canada-erpnext": {
    refCode: "0006CAERP",
    sequence: 6,
    jurisdiction: "CA",
    source: "ERPNext",
    description: "Canada ERPNext template",
    templateId: "canada",
  },
  
  // India Templates
  "india-erpnext": {
    refCode: "0007INERP",
    sequence: 7,
    jurisdiction: "IN",
    source: "ERPNext",
    description: "India ERPNext template",
    templateId: "india",
  },
  
  // Japan Templates
  "japan-erpnext": {
    refCode: "0008JPERP",
    sequence: 8,
    jurisdiction: "JP",
    source: "ERPNext",
    description: "Japan ERPNext template",
    templateId: "japan",
  },
  
  // ISO 3166-1 (Countries) Templates
  "malaysia-iso_3166_1": {
    refCode: "0009MYISO",
    sequence: 9,
    jurisdiction: "MY",
    source: "ISO_3166_1",
    description: "Malaysia ISO 3166-1 countries template",
    templateId: "malaysia",
  },
  
  "singapore-iso_3166_1": {
    refCode: "0010SGISO",
    sequence: 10,
    jurisdiction: "SG",
    source: "ISO_3166_1",
    description: "Singapore ISO 3166-1 countries template",
    templateId: "singapore",
  },
  
  "united-states-iso_3166_1": {
    refCode: "0011USISO",
    sequence: 11,
    jurisdiction: "US",
    source: "ISO_3166_1",
    description: "United States ISO 3166-1 countries template",
    templateId: "united-states",
  },
  
  "united-kingdom-iso_3166_1": {
    refCode: "0012GBISO",
    sequence: 12,
    jurisdiction: "GB",
    source: "ISO_3166_1",
    description: "United Kingdom ISO 3166-1 countries template",
    templateId: "united-kingdom",
  },
  
  "australia-iso_3166_1": {
    refCode: "0013AUISO",
    sequence: 13,
    jurisdiction: "AU",
    source: "ISO_3166_1",
    description: "Australia ISO 3166-1 countries template",
    templateId: "australia",
  },
  
  "canada-iso_3166_1": {
    refCode: "0014CAISO",
    sequence: 14,
    jurisdiction: "CA",
    source: "ISO_3166_1",
    description: "Canada ISO 3166-1 countries template",
    templateId: "canada",
  },
  
  "india-iso_3166_1": {
    refCode: "0015INISO",
    sequence: 15,
    jurisdiction: "IN",
    source: "ISO_3166_1",
    description: "India ISO 3166-1 countries template",
    templateId: "india",
  },
  
  "japan-iso_3166_1": {
    refCode: "0016JPISO",
    sequence: 16,
    jurisdiction: "JP",
    source: "ISO_3166_1",
    description: "Japan ISO 3166-1 countries template",
    templateId: "japan",
  },
  
  // ISO 3166-1 (Countries) - New Focus Countries
  "vietnam-iso_3166_1": {
    refCode: "0021VNISO",
    sequence: 21,
    jurisdiction: "VN",
    source: "ISO_3166_1",
    description: "Vietnam ISO 3166-1 countries template",
    templateId: "vietnam",
  },
  
  "thailand-iso_3166_1": {
    refCode: "0022THISO",
    sequence: 22,
    jurisdiction: "TH",
    source: "ISO_3166_1",
    description: "Thailand ISO 3166-1 countries template",
    templateId: "thailand",
  },
  
  "indonesia-iso_3166_1": {
    refCode: "0023IDISO",
    sequence: 23,
    jurisdiction: "ID",
    source: "ISO_3166_1",
    description: "Indonesia ISO 3166-1 countries template",
    templateId: "indonesia",
  },
  
  "philippines-iso_3166_1": {
    refCode: "0024PHISO",
    sequence: 24,
    jurisdiction: "PH",
    source: "ISO_3166_1",
    description: "Philippines ISO 3166-1 countries template",
    templateId: "philippines",
  },
  
  // ISO 4217 (Currencies) Templates - Focus Countries Only
  "malaysia-iso_4217": {
    refCode: "0017MYCUR",
    sequence: 17,
    jurisdiction: "MY",
    source: "ISO_4217",
    description: "Malaysia ISO 4217 currencies template",
    templateId: "malaysia",
  },
  
  "singapore-iso_4217": {
    refCode: "0018SGCUR",
    sequence: 18,
    jurisdiction: "SG",
    source: "ISO_4217",
    description: "Singapore ISO 4217 currencies template",
    templateId: "singapore",
  },
  
  "vietnam-iso_4217": {
    refCode: "0025VNCUR",
    sequence: 25,
    jurisdiction: "VN",
    source: "ISO_4217",
    description: "Vietnam ISO 4217 currencies template",
    templateId: "vietnam",
  },
  
  "thailand-iso_4217": {
    refCode: "0026THCUR",
    sequence: 26,
    jurisdiction: "TH",
    source: "ISO_4217",
    description: "Thailand ISO 4217 currencies template",
    templateId: "thailand",
  },
  
  "indonesia-iso_4217": {
    refCode: "0027IDCUR",
    sequence: 27,
    jurisdiction: "ID",
    source: "ISO_4217",
    description: "Indonesia ISO 4217 currencies template",
    templateId: "indonesia",
  },
  
  "philippines-iso_4217": {
    refCode: "0028PHCUR",
    sequence: 28,
    jurisdiction: "PH",
    source: "ISO_4217",
    description: "Philippines ISO 4217 currencies template",
    templateId: "philippines",
  },
  
  // ISO 639-1 (Languages) Templates - Focus Countries Only
  "malaysia-iso_639_1": {
    refCode: "0019MYLNG",
    sequence: 19,
    jurisdiction: "MY",
    source: "ISO_639_1",
    description: "Malaysia ISO 639-1 languages template",
    templateId: "malaysia",
  },
  
  "singapore-iso_639_1": {
    refCode: "0020SGLNG",
    sequence: 20,
    jurisdiction: "SG",
    source: "ISO_639_1",
    description: "Singapore ISO 639-1 languages template",
    templateId: "singapore",
  },
  
  "vietnam-iso_639_1": {
    refCode: "0029VNLNG",
    sequence: 29,
    jurisdiction: "VN",
    source: "ISO_639_1",
    description: "Vietnam ISO 639-1 languages template",
    templateId: "vietnam",
  },
  
  "thailand-iso_639_1": {
    refCode: "0030THLNG",
    sequence: 30,
    jurisdiction: "TH",
    source: "ISO_639_1",
    description: "Thailand ISO 639-1 languages template",
    templateId: "thailand",
  },
  
  "indonesia-iso_639_1": {
    refCode: "0031IDLNG",
    sequence: 31,
    jurisdiction: "ID",
    source: "ISO_639_1",
    description: "Indonesia ISO 639-1 languages template",
    templateId: "indonesia",
  },
  
  "philippines-iso_639_1": {
    refCode: "0032PHLNG",
    sequence: 32,
    jurisdiction: "PH",
    source: "ISO_639_1",
    description: "Philippines ISO 639-1 languages template",
    templateId: "philippines",
  },
};

/**
 * Get reference code by template ID and source
 */
export function getReferenceCode(
  templateId: string,
  source: string
): string | undefined {
  const key = `${templateId}-${source.toLowerCase()}`;
  return TEMPLATE_REFERENCE_REGISTRY[key]?.refCode;
}

/**
 * Get all reference codes for a template ID
 */
export function getReferenceCodesForTemplate(templateId: string): string[] {
  return Object.values(TEMPLATE_REFERENCE_REGISTRY)
    .filter((entry) => entry.templateId === templateId)
    .map((entry) => entry.refCode);
}

/**
 * Get reference code entry
 */
export function getReferenceCodeEntry(refCode: string) {
  return Object.values(TEMPLATE_REFERENCE_REGISTRY).find(
    (entry) => entry.refCode === refCode
  );
}

/**
 * Get next sequence number
 */
export function getNextSequence(): number {
  const sequences = Object.values(TEMPLATE_REFERENCE_REGISTRY).map(
    (entry) => entry.sequence
  );
  return Math.max(...sequences, 0) + 1;
}

