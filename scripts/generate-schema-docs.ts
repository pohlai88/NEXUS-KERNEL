// @aibos/kernel - Schema Documentation Generator
// Auto-generates schema reference from Zod schemas

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  ConceptCategorySchema,
  DomainSchema,
  ConceptShapeSchema,
  ValueSetShapeSchema,
  ValueShapeSchema,
  PackShapeSchema,
  KernelRegistryShapeSchema,
} from "../src/kernel.contract.js";
import { z } from "zod";

/**
 * Extract schema information for documentation
 */
function extractSchemaInfo(schema: z.ZodTypeAny, name: string): {
  name: string;
  type: string;
  description: string;
  fields?: Array<{ name: string; type: string; required: boolean; description?: string }>;
  enumValues?: string[];
} {
  const result: any = {
    name,
    type: "",
    description: "",
  };

  // Handle enum schemas
  if (schema instanceof z.ZodEnum || schema instanceof z.ZodNativeEnum) {
    result.type = "enum";
    result.enumValues = schema._def.values || Object.values(schema._def.values);
  }
  // Handle object schemas
  else if (schema instanceof z.ZodObject) {
    result.type = "object";
    result.fields = [];
    const shape = schema._def.shape();
    
    for (const [fieldName, fieldSchema] of Object.entries(shape)) {
      const field = fieldSchema as z.ZodTypeAny;
      const fieldInfo: any = {
        name: fieldName,
        type: getZodTypeName(field),
        required: !(field instanceof z.ZodOptional || field instanceof z.ZodDefault),
        description: extractDescription(field),
      };
      result.fields.push(fieldInfo);
    }
  }
  // Handle other types
  else {
    result.type = getZodTypeName(schema);
  }

  result.description = extractDescription(schema);
  return result;
}

/**
 * Get human-readable type name from Zod schema
 */
function getZodTypeName(schema: z.ZodTypeAny): string {
  if (schema instanceof z.ZodString) return "string";
  if (schema instanceof z.ZodNumber) return "number";
  if (schema instanceof z.ZodBoolean) return "boolean";
  if (schema instanceof z.ZodArray) return `array<${getZodTypeName(schema._def.type)}>`;
  if (schema instanceof z.ZodEnum) return "enum";
  if (schema instanceof z.ZodObject) return "object";
  if (schema instanceof z.ZodOptional) return `${getZodTypeName(schema._def.innerType)}?`;
  if (schema instanceof z.ZodDefault) return `${getZodTypeName(schema._def.innerType)} (default)`;
  if (schema instanceof z.ZodLiteral) return `"${schema._def.value}"`;
  return "unknown";
}

/**
 * Extract description from JSDoc comments
 */
function extractDescription(schema: z.ZodTypeAny): string {
  // Zod doesn't preserve JSDoc, so we'll use a mapping
  const descriptions: Record<string, string> = {
    ConceptCategorySchema: "L0 taxonomy for organizing concepts",
    DomainSchema: "ERP module classification",
    ConceptShapeSchema: "The immutable structure for concepts",
    ValueSetShapeSchema: "The immutable structure for value sets",
    ValueShapeSchema: "The immutable structure for values",
    PackShapeSchema: "The immutable structure for packs",
    KernelRegistryShapeSchema: "The complete kernel registry structure",
  };
  return descriptions[schema.constructor.name] || "";
}

/**
 * Generate markdown documentation
 */
function generateSchemaDocs(): string {
  const schemas = [
    { schema: ConceptCategorySchema, name: "ConceptCategory" },
    { schema: DomainSchema, name: "Domain" },
    { schema: ConceptShapeSchema, name: "ConceptShape" },
    { schema: ValueSetShapeSchema, name: "ValueSetShape" },
    { schema: ValueShapeSchema, name: "ValueShape" },
    { schema: PackShapeSchema, name: "PackShape" },
    { schema: KernelRegistryShapeSchema, name: "KernelRegistryShape" },
  ];

  let markdown = `# Schema Reference

> **Auto-generated** from Zod schemas in \`src/kernel.contract.ts\`  
> **Last Generated:** ${new Date().toISOString()}  
> **Source:** [kernel.contract.ts](../../src/kernel.contract.ts)

This document provides a complete reference for all Zod schemas used in \`@aibos/kernel\`. These schemas define the frozen contract structure.

## Overview

The kernel uses Zod for runtime validation of:
- Concepts (181 total)
- Value Sets (68 total)
- Values (307 total)
- Packs (domain-specific collections)
- Kernel Registry (complete registry structure)

## Schemas

`;

  for (const { schema, name } of schemas) {
    const info = extractSchemaInfo(schema, name);
    
    markdown += `### ${info.name}\n\n`;
    markdown += `**Type:** \`${info.type}\`\n\n`;
    if (info.description) {
      markdown += `${info.description}\n\n`;
    }

    if (info.enumValues) {
      markdown += `**Allowed Values:**\n\n`;
      for (const value of info.enumValues) {
        markdown += `- \`"${value}"\`\n`;
      }
      markdown += `\n`;
    }

    if (info.fields) {
      markdown += `**Fields:**\n\n`;
      markdown += `| Field | Type | Required | Description |\n`;
      markdown += `|-------|------|----------|-------------|\n`;
      
      for (const field of info.fields) {
        const required = field.required ? "✅ Yes" : "❌ No";
        const description = field.description || "-";
        markdown += `| \`${field.name}\` | \`${field.type}\` | ${required} | ${description} |\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  markdown += `## Usage Example

\`\`\`typescript
import { ConceptShapeSchema, ValueSetShapeSchema } from "@aibos/kernel";

// Validate concept shape
const concept = ConceptShapeSchema.parse({
  code: "INVOICE",
  category: "ENTITY",
  domain: "FINANCE",
  description: "Invoice document",
});

// Validate value set shape
const valueSet = ValueSetShapeSchema.parse({
  code: "CURRENCIES",
  domain: "GLOBAL",
  description: "Global currency codes",
  jurisdiction: "GLOBAL",
});
\`\`\`

## Related Documentation

- [Kernel Contract Source](../../src/kernel.contract.ts)
- [Architecture Overview](../architecture/overview.md)
- [Design Principles](../architecture/design-principles.md)
- [API Reference](../api/README.md)

---

**Note:** This file is auto-generated. Do not edit manually.  
To regenerate: \`pnpm docs:schema\`
`;

  return markdown;
}

/**
 * Main execution
 */
function main() {
  try {
    // Create output directory
    const outputDir = join(process.cwd(), "docs", "reference");
    mkdirSync(outputDir, { recursive: true });

    // Generate documentation
    const markdown = generateSchemaDocs();

    // Write to file
    const outputPath = join(outputDir, "schemas.md");
    writeFileSync(outputPath, markdown, "utf-8");

    console.log("✅ Schema documentation generated successfully!");
    console.log(`📄 Output: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error generating schema documentation:", error);
    process.exit(1);
  }
}

main();

