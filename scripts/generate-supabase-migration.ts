#!/usr/bin/env tsx
/**
 * Supabase Migration Generator
 * 
 * Generates Supabase migrations from kernel snapshot.
 * Creates SQL migration files for syncing kernel metadata to Supabase database.
 * 
 * Usage: pnpm tsx scripts/generate-supabase-migration.ts [options]
 * 
 * Options:
 *   --type <type>     Migration type: metadata, concepts, valuesets, values, complete (default: complete)
 *   --output <path>   Output file path (default: migrations/kernel-<timestamp>.sql)
 *   --dry-run         Print migration without writing file
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import {
  generateKernelMetadataMigration,
  generateConceptsMigration,
  generateValueSetsMigration,
  generateValuesMigration,
  generateCompleteMigration,
  type KernelMigration,
} from "../src/supabase/sync.js";

type MigrationType = "metadata" | "concepts" | "valuesets" | "values" | "complete";

interface Options {
  type: MigrationType;
  output?: string;
  dryRun: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    type: "complete",
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--type":
        const type = args[++i];
        if (["metadata", "concepts", "valuesets", "values", "complete"].includes(type)) {
          options.type = type as MigrationType;
        } else {
          console.error(`❌ Invalid migration type: ${type}`);
          console.error("Valid types: metadata, concepts, valuesets, values, complete");
          process.exit(1);
        }
        break;
      case "--output":
        options.output = args[++i];
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`❌ Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Supabase Migration Generator

Usage: pnpm tsx scripts/generate-supabase-migration.ts [options]

Options:
  --type <type>     Migration type (default: complete)
                    Types: metadata, concepts, valuesets, values, complete
  --output <path>   Output file path
                    Default: migrations/kernel-<timestamp>.sql
  --dry-run         Print migration without writing file
  --help, -h        Show this help message

Examples:
  # Generate complete migration
  pnpm tsx scripts/generate-supabase-migration.ts

  # Generate only concepts migration
  pnpm tsx scripts/generate-supabase-migration.ts --type concepts

  # Generate with custom output path
  pnpm tsx scripts/generate-supabase-migration.ts --output supabase/migrations/kernel.sql

  # Dry run (print without writing)
  pnpm tsx scripts/generate-supabase-migration.ts --dry-run
`);
}

function generateMigration(type: MigrationType): KernelMigration {
  switch (type) {
    case "metadata":
      return generateKernelMetadataMigration();
    case "concepts":
      return generateConceptsMigration();
    case "valuesets":
      return generateValueSetsMigration();
    case "values":
      return generateValuesMigration();
    case "complete":
      return generateCompleteMigration();
    default:
      throw new Error(`Unknown migration type: ${type}`);
  }
}

function getDefaultOutputPath(type: MigrationType): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const filename = `kernel-${type}-${timestamp}.sql`;
  return join(process.cwd(), "migrations", filename);
}

function main(): void {
  try {
    const options = parseArgs();
    const migration = generateMigration(options.type);

    console.log("📦 Generating Supabase Migration");
    console.log(`   Type: ${options.type}`);
    console.log(`   Name: ${migration.name}`);
    console.log(`   Description: ${migration.description}`);
    console.log(`   SQL Size: ${migration.sql.length} bytes\n`);

    if (options.dryRun) {
      console.log("=".repeat(70));
      console.log("MIGRATION SQL (DRY RUN):");
      console.log("=".repeat(70));
      console.log(migration.sql);
      console.log("=".repeat(70));
      console.log("\n✅ Dry run complete. Use without --dry-run to write file.");
      return;
    }

    const outputPath = options.output || getDefaultOutputPath(options.type);
    const outputDir = dirname(outputPath);

    // Create output directory if it doesn't exist
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }

    // Write migration file
    writeFileSync(outputPath, migration.sql, "utf-8");

    console.log(`✅ Migration generated successfully!`);
    console.log(`   Output: ${outputPath}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Review the migration file`);
    console.log(`   2. Apply using Supabase MCP: mcp_supabase_apply_migration`);
    console.log(`   3. Or apply manually in Supabase dashboard`);
  } catch (error) {
    console.error("❌ Error generating migration:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.includes("generate-supabase-migration")) {
  main();
}

export { generateMigration, type Options };

