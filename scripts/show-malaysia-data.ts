#!/usr/bin/env node
/**
 * Show Malaysia Template Data by Category
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const TEMPLATE_PATH = join(ROOT_DIR, "templates", "template-malaysia.pack.json");

interface ValueShape {
  code: string;
  value_set_code: string;
  label: string;
  description?: string;
  metadata?: any;
}

interface TemplateShape {
  id: string;
  name: string;
  template_code?: string;
  values: ValueShape[];
}

function main() {
  const template: TemplateShape = JSON.parse(
    readFileSync(TEMPLATE_PATH, "utf-8")
  );

  // Group values by value set
  const valueSets: Record<string, { count: number; samples: ValueShape[] }> = {};

  template.values.forEach((v) => {
    if (!valueSets[v.value_set_code]) {
      valueSets[v.value_set_code] = { count: 0, samples: [] };
    }
    valueSets[v.value_set_code].count++;
    if (valueSets[v.value_set_code].samples.length < 5) {
      valueSets[v.value_set_code].samples.push(v);
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("MALAYSIA TEMPLATE - DATA BY CATEGORY");
  console.log("=".repeat(80));
  console.log("\nTemplate Information:");
  console.log(`  ID: ${template.id}`);
  console.log(`  Name: ${template.name}`);
  console.log(`  Template Code: ${template.template_code || "N/A"}`);
  console.log(`  Total Values: ${template.values.length.toLocaleString()}`);
  console.log("\n" + "=".repeat(80));
  console.log("ISO STANDARDS DATA");
  console.log("=".repeat(80));

  // ISO Standards
  const isoSets = ["COUNTRIES", "CURRENCIES", "LANGUAGES"];
  isoSets.forEach((vs) => {
    if (valueSets[vs]) {
      const data = valueSets[vs];
      console.log(`\n${vs} (${data.count.toLocaleString()} values)`);
      console.log("-".repeat(80));
      data.samples.forEach((s) => {
        console.log(`  • ${s.code.padEnd(35)} → ${s.label}`);
      });
      if (data.count > 5) {
        console.log(`  ... and ${(data.count - 5).toLocaleString()} more`);
      }
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("CORE ERP DATA");
  console.log("=".repeat(80));

  const coreSets = [
    "PARTY_TYPE",
    "ADDRESS_TYPE",
    "CONTACT_TYPE",
    "TRANSACTION_STATUS",
    "APPROVAL_STATUS",
    "DOCUMENT_STATUS",
    "PRIORITY_LEVEL",
    "PAYMENT_METHOD",
    "SHIPPING_METHOD",
  ];

  coreSets.forEach((vs) => {
    if (valueSets[vs]) {
      const data = valueSets[vs];
      console.log(`\n${vs} (${data.count} values)`);
      console.log("-".repeat(80));
      data.samples.forEach((s) => {
        console.log(`  • ${s.code.padEnd(35)} → ${s.label}`);
      });
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("FINANCE DATA");
  console.log("=".repeat(80));

  const financeSets = ["ACCOUNT_TYPE", "JOURNAL_TYPE", "FISCAL_PERIOD", "ROUNDING_METHOD"];

  financeSets.forEach((vs) => {
    if (valueSets[vs]) {
      const data = valueSets[vs];
      console.log(`\n${vs} (${data.count} values)`);
      console.log("-".repeat(80));
      data.samples.forEach((s) => {
        console.log(`  • ${s.code.padEnd(35)} → ${s.label}`);
      });
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("TAX DATA");
  console.log("=".repeat(80));

  const taxSets = ["TAX_TYPE", "TAX_TREATMENT", "TAX_CODE", "TAX_REPORTING_CATEGORY"];

  taxSets.forEach((vs) => {
    if (valueSets[vs]) {
      const data = valueSets[vs];
      console.log(`\n${vs} (${data.count} values)`);
      console.log("-".repeat(80));
      data.samples.forEach((s) => {
        console.log(`  • ${s.code.padEnd(35)} → ${s.label}`);
      });
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("PAYMENT DATA");
  console.log("=".repeat(80));

  const paymentSets = ["PAYMENT_TERM"];

  paymentSets.forEach((vs) => {
    if (valueSets[vs]) {
      const data = valueSets[vs];
      console.log(`\n${vs} (${data.count} values)`);
      console.log("-".repeat(80));
      data.samples.forEach((s) => {
        console.log(`  • ${s.code.padEnd(35)} → ${s.label}`);
      });
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  console.log("\nTotal Value Sets:", Object.keys(valueSets).length);
  console.log("\nValue Sets by Count:");
  Object.entries(valueSets)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([vs, data]) => {
      console.log(`  ${vs.padEnd(30)} : ${data.count.toString().padStart(4)} values`);
    });
  console.log("\n");
}

main();

