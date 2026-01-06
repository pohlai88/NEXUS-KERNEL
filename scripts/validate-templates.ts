#!/usr/bin/env node
/**
 * Template Validation Script
 * Validates all template packs using kernel validation functions
 * Ensures templates are properly structured and reference valid concepts/value sets
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { validateValue } from "../src/kernel.validation.js";
import type { ValueShape } from "../src/kernel.contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
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
}

/**
 * Validation result
 */
interface ValidationResult {
  templateId: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    values: number;
    referencedConcepts: number;
    referencedValueSets: number;
  };
}

/**
 * Load template
 */
function loadTemplate(templatePath: string): TemplatePackShape {
  const content = readFileSync(templatePath, "utf-8");
  return JSON.parse(content) as TemplatePackShape;
}

/**
 * Validate template structure
 */
function validateTemplateStructure(template: TemplatePackShape): string[] {
  const errors: string[] = [];

  // Check required fields
  if (!template.id) errors.push("Missing 'id' field");
  if (!template.name) errors.push("Missing 'name' field");
  if (!template.version) errors.push("Missing 'version' field");
  if (!template.domain) errors.push("Missing 'domain' field");
  if (!template.description) errors.push("Missing 'description' field");
  if (template.priority === undefined) errors.push("Missing 'priority' field");
  if (!template.authoritative_for) errors.push("Missing 'authoritative_for' field");
  if (!Array.isArray(template.values)) errors.push("Missing or invalid 'values' array");

  // Check template-specific fields
  if (!template.referenced_concepts) {
    errors.push("Missing 'referenced_concepts' array (templates should reference concepts)");
  }
  if (!template.referenced_value_sets) {
    errors.push("Missing 'referenced_value_sets' array (templates should reference value sets)");
  }

  // Check that templates don't define concepts/value sets (they should only reference)
  if (template.concepts && template.concepts.length > 0) {
    errors.push("Templates should not define concepts (should only reference them)");
  }
  if (template.value_sets && template.value_sets.length > 0) {
    errors.push("Templates should not define value sets (should only reference them)");
  }

  return errors;
}

/**
 * Validate template values
 */
function validateTemplateValues(template: TemplatePackShape): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Track unique value keys
  const valueKeys = new Set<string>();
  const valueSetCodes = new Set<string>();

  for (let i = 0; i < template.values.length; i++) {
    const value = template.values[i];
    const valueKey = `${value.value_set_code}:${value.code}`;

    // Check for duplicates
    if (valueKeys.has(valueKey)) {
      errors.push(`Duplicate value at index ${i}: ${valueKey}`);
    } else {
      valueKeys.add(valueKey);
    }

    // Track value set codes
    valueSetCodes.add(value.value_set_code);

    // Validate value structure using kernel validation
    try {
      validateValue(value);
    } catch (error: any) {
      errors.push(`Invalid value at index ${i} (${valueKey}): ${error.message}`);
    }

    // Check that value references a value set in referenced_value_sets
    if (template.referenced_value_sets && !template.referenced_value_sets.includes(value.value_set_code)) {
      warnings.push(`Value ${valueKey} references value set '${value.value_set_code}' not in referenced_value_sets`);
    }
  }

  // Check that all referenced value sets have values
  if (template.referenced_value_sets) {
    for (const valueSetCode of template.referenced_value_sets) {
      if (!valueSetCodes.has(valueSetCode)) {
        warnings.push(`Referenced value set '${valueSetCode}' has no values in template`);
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate a single template
 */
function validateTemplate(templatePath: string): ValidationResult {
  const templateId = templatePath.split("/").pop()?.replace("template-", "").replace(".pack.json", "") || "unknown";
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const template = loadTemplate(templatePath);

    // Validate structure
    const structureErrors = validateTemplateStructure(template);
    errors.push(...structureErrors);

    // Validate values
    const { errors: valueErrors, warnings: valueWarnings } = validateTemplateValues(template);
    errors.push(...valueErrors);
    warnings.push(...valueWarnings);

    return {
      templateId,
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        values: template.values.length,
        referencedConcepts: template.referenced_concepts?.length || 0,
        referencedValueSets: template.referenced_value_sets?.length || 0,
      },
    };
  } catch (error: any) {
    return {
      templateId,
      valid: false,
      errors: [`Failed to load template: ${error.message}`],
      warnings: [],
      stats: {
        values: 0,
        referencedConcepts: 0,
        referencedValueSets: 0,
      },
    };
  }
}

/**
 * Main function
 */
function main() {
  console.log("🔍 Template Validation");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (!existsSync(TEMPLATES_DIR)) {
    console.error(`❌ Templates directory not found: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  // Find all template files
  const templateFiles = readdirSync(TEMPLATES_DIR)
    .filter((file) => file.startsWith("template-") && file.endsWith(".pack.json"))
    .map((file) => join(TEMPLATES_DIR, file));

  if (templateFiles.length === 0) {
    console.log("⚠️  No template files found");
    process.exit(0);
  }

  console.log(`Found ${templateFiles.length} template(s) to validate\n`);

  // Validate each template
  const results: ValidationResult[] = [];
  for (const templatePath of templateFiles) {
    const result = validateTemplate(templatePath);
    results.push(result);
  }

  // Print results
  let totalErrors = 0;
  let totalWarnings = 0;
  let validCount = 0;

  for (const result of results) {
    const status = result.valid ? "✅" : "❌";
    console.log(`${status} ${result.templateId}`);
    console.log(`   Values: ${result.stats.values}`);
    console.log(`   Referenced Concepts: ${result.stats.referencedConcepts}`);
    console.log(`   Referenced Value Sets: ${result.stats.referencedValueSets}`);

    if (result.errors.length > 0) {
      console.log(`   Errors (${result.errors.length}):`);
      result.errors.forEach((error) => console.log(`     - ${error}`));
      totalErrors += result.errors.length;
    }

    if (result.warnings.length > 0) {
      console.log(`   Warnings (${result.warnings.length}):`);
      result.warnings.forEach((warning) => console.log(`     - ${warning}`));
      totalWarnings += result.warnings.length;
    }

    if (result.valid) {
      validCount++;
    }

    console.log();
  }

  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Summary: ${validCount}/${results.length} templates valid`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log("\n❌ Validation failed - please fix errors before proceeding");
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log("\n⚠️  Validation passed with warnings");
    process.exit(0);
  } else {
    console.log("\n✅ All templates validated successfully");
    process.exit(0);
  }
}

main();

