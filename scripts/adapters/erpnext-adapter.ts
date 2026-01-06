#!/usr/bin/env node
/**
 * ERPNext Adapter
 * Converts ERPNext data patterns to kernel PackShape format
 * Fast cloning approach: adapt existing ERPNext data structures
 */

import type { PackShape, ValueShape, ConceptShape, ValueSetShape } from "../../src/kernel.contract.js";
import {
  createTemplateMetadata,
  SOURCE_TYPES,
} from "../template-metadata-strategy.js";
import {
  getReferenceCode,
} from "../template-reference-registry.js";

/**
 * ERPNext Chart of Accounts structure (simplified)
 */
export interface ERPNextAccount {
  account_name: string;
  account_number?: string;
  account_type: string;
  parent_account?: string;
  is_group: boolean;
  root_type: string;
}

/**
 * ERPNext Tax Code structure
 */
export interface ERPNextTaxCode {
  name: string;
  description?: string;
  rate: number;
  account_head: string;
  type: "Sales" | "Purchase";
}

/**
 * ERPNext Payment Term structure
 */
export interface ERPNextPaymentTerm {
  payment_term_name: string;
  description?: string;
  due_date_based_on: string;
  credit_days: number;
  credit_months?: number;
}

/**
 * Convert ERPNext accounts to kernel values
 */
export function adaptERPNextAccounts(
  accounts: ERPNextAccount[],
  jurisdiction: string,
  templateId?: string
): ValueShape[] {
  // Get reference code from registry
  const refCode = templateId 
    ? getReferenceCode(templateId, SOURCE_TYPES.ERPNext)
    : undefined;

  if (!refCode) {
    throw new Error(
      `Reference code not found for template: ${templateId || 'unknown'}, source: ${SOURCE_TYPES.ERPNext}. ` +
      `Add entry to template-reference-registry.ts`
    );
  }

  return accounts.map((account, index) => ({
    code: account.account_name.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
    value_set_code: "ACCOUNT_TYPE", // Or create CHART_OF_ACCOUNTS valueset
    label: account.account_name,
    description: `${account.account_name} (${jurisdiction})`,
    sort_order: index + 1,
    metadata: createTemplateMetadata(
      refCode,
      SOURCE_TYPES.ERPNext,
      jurisdiction,
      {
        account_number: account.account_number,
        account_type: account.account_type,
        root_type: account.root_type,
        is_group: account.is_group,
      }
    ),
  }));
}

/**
 * Convert ERPNext tax codes to kernel values
 */
export function adaptERPNextTaxCodes(
  taxCodes: ERPNextTaxCode[],
  jurisdiction: string,
  templateId?: string
): ValueShape[] {
  // Get reference code from registry
  const refCode = templateId 
    ? getReferenceCode(templateId, SOURCE_TYPES.ERPNext)
    : undefined;

  if (!refCode) {
    throw new Error(
      `Reference code not found for template: ${templateId || 'unknown'}, source: ${SOURCE_TYPES.ERPNext}. ` +
      `Add entry to template-reference-registry.ts`
    );
  }

  return taxCodes.map((tax, index) => ({
    code: tax.name.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
    value_set_code: "TAX_CODE", // Assuming TAX_CODE valueset exists
    label: tax.name,
    description: `${tax.name} (${tax.rate}%) - ${jurisdiction}`,
    sort_order: index + 1,
    metadata: createTemplateMetadata(
      refCode,
      SOURCE_TYPES.ERPNext,
      jurisdiction,
      {
        rate: tax.rate,
        type: tax.type,
        account_head: tax.account_head,
      }
    ),
  }));
}

/**
 * Convert ERPNext payment terms to kernel values
 */
export function adaptERPNextPaymentTerms(
  paymentTerms: ERPNextPaymentTerm[],
  jurisdiction: string,
  templateId?: string
): ValueShape[] {
  // Get reference code from registry
  const refCode = templateId 
    ? getReferenceCode(templateId, SOURCE_TYPES.ERPNext)
    : undefined;

  if (!refCode) {
    throw new Error(
      `Reference code not found for template: ${templateId || 'unknown'}, source: ${SOURCE_TYPES.ERPNext}. ` +
      `Add entry to template-reference-registry.ts`
    );
  }

  return paymentTerms.map((term, index) => ({
    code: term.payment_term_name.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
    value_set_code: "PAYMENT_TERM", // Assuming PAYMENT_TERM valueset exists
    label: term.payment_term_name,
    description: `${term.payment_term_name} (${term.credit_days} days) - ${jurisdiction}`,
    sort_order: index + 1,
    metadata: createTemplateMetadata(
      refCode,
      SOURCE_TYPES.ERPNext,
      jurisdiction,
      {
        credit_days: term.credit_days,
        credit_months: term.credit_months,
        due_date_based_on: term.due_date_based_on,
      }
    ),
  }));
}

/**
 * Clone ERPNext pattern and adapt to kernel pack
 */
export function cloneERPNextPattern(
  patternName: string,
  jurisdiction: string,
  erpnextData: {
    accounts?: ERPNextAccount[];
    taxCodes?: ERPNextTaxCode[];
    paymentTerms?: ERPNextPaymentTerm[];
  }
): Partial<PackShape> {
  const values: ValueShape[] = [];

  if (erpnextData.accounts) {
    values.push(...adaptERPNextAccounts(erpnextData.accounts, jurisdiction));
  }

  if (erpnextData.taxCodes) {
    values.push(...adaptERPNextTaxCodes(erpnextData.taxCodes, jurisdiction));
  }

  if (erpnextData.paymentTerms) {
    values.push(...adaptERPNextPaymentTerms(erpnextData.paymentTerms, jurisdiction));
  }

  return {
    values,
  };
}

