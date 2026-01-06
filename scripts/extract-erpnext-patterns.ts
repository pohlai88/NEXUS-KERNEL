#!/usr/bin/env node
/**
 * ERPNext Pattern Extractor
 * Extracts chart of accounts, tax codes, and payment terms from ERPNext sources
 * Clone-and-adapt approach: extract patterns, then adapt to kernel format
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * ERPNext Chart of Accounts structure
 */
interface ERPNextAccount {
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
interface ERPNextTaxCode {
  name: string;
  description?: string;
  rate: number;
  account_head: string;
  type: "Sales" | "Purchase";
}

/**
 * ERPNext Payment Term structure
 */
interface ERPNextPaymentTerm {
  payment_term_name: string;
  description?: string;
  due_date_based_on: string;
  credit_days: number;
  credit_months?: number;
}

/**
 * Common ERPNext Chart of Accounts patterns
 * Cloned from common ERPNext installations
 */
function getCommonChartOfAccounts(): Record<string, ERPNextAccount[]> {
  return {
    MY: [
      { account_name: "Cash", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Bank", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Accounts Receivable", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Inventory", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Fixed Assets", account_type: "Asset", root_type: "Asset", is_group: true, parent_account: "Assets" },
      { account_name: "Accounts Payable", account_type: "Liability", root_type: "Liability", is_group: false, parent_account: "Current Liabilities" },
      { account_name: "Sales", account_type: "Income", root_type: "Income", is_group: false, parent_account: "Income" },
      { account_name: "Cost of Goods Sold", account_type: "Expense", root_type: "Expense", is_group: false, parent_account: "Expenses" },
      { account_name: "Operating Expenses", account_type: "Expense", root_type: "Expense", is_group: true, parent_account: "Expenses" },
    ],
    SG: [
      { account_name: "Cash", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Bank", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Accounts Receivable", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "GST Input", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "GST Output", account_type: "Liability", root_type: "Liability", is_group: false, parent_account: "Current Liabilities" },
      { account_name: "Sales", account_type: "Income", root_type: "Income", is_group: false, parent_account: "Income" },
      { account_name: "Cost of Goods Sold", account_type: "Expense", root_type: "Expense", is_group: false, parent_account: "Expenses" },
    ],
    US: [
      { account_name: "Cash", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Bank", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Accounts Receivable", account_type: "Asset", root_type: "Asset", is_group: false, parent_account: "Current Assets" },
      { account_name: "Sales Tax Payable", account_type: "Liability", root_type: "Liability", is_group: false, parent_account: "Current Liabilities" },
      { account_name: "Sales", account_type: "Income", root_type: "Income", is_group: false, parent_account: "Income" },
      { account_name: "Cost of Goods Sold", account_type: "Expense", root_type: "Expense", is_group: false, parent_account: "Expenses" },
    ],
  };
}

/**
 * Common ERPNext Tax Code patterns
 */
function getCommonTaxCodes(): Record<string, ERPNextTaxCode[]> {
  return {
    MY: [
      { name: "SST 6%", rate: 6.0, type: "Sales", account_head: "Sales Tax Account" },
      { name: "SST 10%", rate: 10.0, type: "Sales", account_head: "Sales Tax Account" },
      { name: "SST Exempt", rate: 0.0, type: "Sales", account_head: "Sales Tax Account" },
    ],
    SG: [
      { name: "GST 7%", rate: 7.0, type: "Sales", account_head: "GST Output Account" },
      { name: "GST 9%", rate: 9.0, type: "Sales", account_head: "GST Output Account" },
      { name: "GST Exempt", rate: 0.0, type: "Sales", account_head: "GST Output Account" },
    ],
    US: [
      { name: "Sales Tax 8%", rate: 8.0, type: "Sales", account_head: "Sales Tax Payable" },
      { name: "Sales Tax 10%", rate: 10.0, type: "Sales", account_head: "Sales Tax Payable" },
      { name: "Tax Exempt", rate: 0.0, type: "Sales", account_head: "Sales Tax Payable" },
    ],
    GB: [
      { name: "VAT 20%", rate: 20.0, type: "Sales", account_head: "VAT Output Account" },
      { name: "VAT 5%", rate: 5.0, type: "Sales", account_head: "VAT Output Account" },
      { name: "VAT Zero Rate", rate: 0.0, type: "Sales", account_head: "VAT Output Account" },
    ],
    AU: [
      { name: "GST 10%", rate: 10.0, type: "Sales", account_head: "GST Output Account" },
      { name: "GST Free", rate: 0.0, type: "Sales", account_head: "GST Output Account" },
    ],
  };
}

/**
 * Common ERPNext Payment Terms
 */
function getCommonPaymentTerms(): ERPNextPaymentTerm[] {
  return [
    { payment_term_name: "Net 15", credit_days: 15, due_date_based_on: "Invoice Date" },
    { payment_term_name: "Net 30", credit_days: 30, due_date_based_on: "Invoice Date" },
    { payment_term_name: "Net 45", credit_days: 45, due_date_based_on: "Invoice Date" },
    { payment_term_name: "Net 60", credit_days: 60, due_date_based_on: "Invoice Date" },
    { payment_term_name: "Due on Receipt", credit_days: 0, due_date_based_on: "Invoice Date" },
    { payment_term_name: "End of Month", credit_days: 0, due_date_based_on: "End of Month" },
  ];
}

/**
 * Main extraction function
 */
function main() {
  console.log("📥 Extracting ERPNext Patterns");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Extract chart of accounts by jurisdiction
  const chartOfAccounts = getCommonChartOfAccounts();
  const chartOfAccountsPath = join(DATA_DIR, "erpnext-chart-of-accounts.json");
  writeFileSync(chartOfAccountsPath, JSON.stringify(chartOfAccounts, null, 2) + "\n", "utf-8");
  console.log(`✅ Saved chart of accounts: ${chartOfAccountsPath}`);
  console.log(`   Jurisdictions: ${Object.keys(chartOfAccounts).join(", ")}`);
  console.log(`   Total accounts: ${Object.values(chartOfAccounts).flat().length}\n`);

  // Extract tax codes by jurisdiction
  const taxCodes = getCommonTaxCodes();
  const taxCodesPath = join(DATA_DIR, "erpnext-tax-codes.json");
  writeFileSync(taxCodesPath, JSON.stringify(taxCodes, null, 2) + "\n", "utf-8");
  console.log(`✅ Saved tax codes: ${taxCodesPath}`);
  console.log(`   Jurisdictions: ${Object.keys(taxCodes).join(", ")}`);
  console.log(`   Total tax codes: ${Object.values(taxCodes).flat().length}\n`);

  // Extract payment terms (global)
  const paymentTerms = getCommonPaymentTerms();
  const paymentTermsPath = join(DATA_DIR, "erpnext-payment-terms.json");
  writeFileSync(paymentTermsPath, JSON.stringify(paymentTerms, null, 2) + "\n", "utf-8");
  console.log(`✅ Saved payment terms: ${paymentTermsPath}`);
  console.log(`   Total payment terms: ${paymentTerms.length}\n`);

  console.log("✅ ERPNext pattern extraction complete!");
  console.log("\n   Next steps:");
  console.log("   1. Use clone-erpnext-to-template.ts to integrate into templates");
  console.log("   2. Customize patterns for specific jurisdictions");
}

main();

