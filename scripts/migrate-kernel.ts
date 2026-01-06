#!/usr/bin/env tsx
// @aibos/kernel - Kernel Migration CLI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLI tool for migrating kernel between versions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  checkCompatibility,
  executeMigration,
  validateMigration,
  getCurrentKernelVersion,
} from "../src/migration/index.js";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHelp(): void {
  log("\nKernel Migration CLI", "bright");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
  log("\nUsage: pnpm tsx scripts/migrate-kernel.ts [command] [options]\n", "blue");
  log("Commands:", "bright");
  log("  check <from> <to>     Check compatibility between versions");
  log("  migrate <from> <to>   Migrate kernel from one version to another");
  log("  validate <from> <to>  Validate migration can be performed");
  log("  current                Show current kernel version\n", "blue");
  log("Options:", "bright");
  log("  --dry-run             Perform dry run (no actual changes)");
  log("  --skip-validation     Skip validation checks\n", "blue");
  log("Examples:", "bright");
  log("  # Check compatibility", "blue");
  log("  pnpm tsx scripts/migrate-kernel.ts check 1.0.0 1.1.0\n", "blue");
  log("  # Migrate kernel", "blue");
  log("  pnpm tsx scripts/migrate-kernel.ts migrate 1.0.0 1.1.0\n", "blue");
  log("  # Dry run migration", "blue");
  log("  pnpm tsx scripts/migrate-kernel.ts migrate 1.0.0 1.1.0 --dry-run\n", "blue");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0);
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case "check": {
        if (args.length < 3) {
          log("❌ Error: check command requires <from> and <to> versions", "red");
          printHelp();
          process.exit(1);
        }
        
        const fromVersion = args[1];
        const toVersion = args[2];
        
        log("\n🔍 Checking Compatibility", "cyan");
        log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
        log(`From: ${fromVersion}`, "blue");
        log(`To: ${toVersion}\n`, "blue");
        
        const compatibility = checkCompatibility(fromVersion, toVersion);
        
        log(`Breaking: ${compatibility.breaking ? "Yes" : "No"}`, compatibility.breaking ? "red" : "green");
        log(`Safe: ${compatibility.safe ? "Yes" : "No"}`, compatibility.safe ? "green" : "red");
        log(`Migration Required: ${compatibility.migrationRequired ? "Yes" : "No"}`, compatibility.migrationRequired ? "yellow" : "green");
        
        if (compatibility.deprecations.length > 0) {
          log(`\nDeprecations:`, "yellow");
          compatibility.deprecations.forEach((dep) => log(`  - ${dep}`, "yellow"));
        }
        
        break;
      }
      
      case "migrate": {
        if (args.length < 3) {
          log("❌ Error: migrate command requires <from> and <to> versions", "red");
          printHelp();
          process.exit(1);
        }
        
        const fromVersion = args[1];
        const toVersion = args[2];
        const dryRun = args.includes("--dry-run");
        const skipValidation = args.includes("--skip-validation");
        
        log("\n🔄 Migrating Kernel", "cyan");
        log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
        log(`From: ${fromVersion}`, "blue");
        log(`To: ${toVersion}`, "blue");
        if (dryRun) log(`Mode: Dry Run`, "yellow");
        log("");
        
        const result = await executeMigration({
          fromVersion,
          toVersion,
          dryRun,
          skipValidation,
        });
        
        if (result.success) {
          log("✅ Migration completed successfully", "green");
          log(`\nMessage: ${result.message}`, "blue");
          
          if (result.itemsMigrated.concepts > 0 || result.itemsMigrated.valueSets > 0 || result.itemsMigrated.values > 0) {
            log("\nItems Migrated:", "cyan");
            log(`  Concepts: ${result.itemsMigrated.concepts}`, "blue");
            log(`  Value Sets: ${result.itemsMigrated.valueSets}`, "blue");
            log(`  Values: ${result.itemsMigrated.values}`, "blue");
          }
          
          if (result.warnings.length > 0) {
            log("\n⚠️  Warnings:", "yellow");
            result.warnings.forEach((warning) => log(`  - ${warning}`, "yellow"));
          }
        } else {
          log("❌ Migration failed", "red");
          log(`\nMessage: ${result.message}`, "red");
          
          if (result.errors.length > 0) {
            log("\nErrors:", "red");
            result.errors.forEach((error) => log(`  - ${error}`, "red"));
          }
          
          process.exit(1);
        }
        
        break;
      }
      
      case "validate": {
        if (args.length < 3) {
          log("❌ Error: validate command requires <from> and <to> versions", "red");
          printHelp();
          process.exit(1);
        }
        
        const fromVersion = args[1];
        const toVersion = args[2];
        
        log("\n🔍 Validating Migration", "cyan");
        log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
        log(`From: ${fromVersion}`, "blue");
        log(`To: ${toVersion}\n`, "blue");
        
        const validation = validateMigration(fromVersion, toVersion);
        
        if (validation.valid) {
          log("✅ Migration is valid", "green");
        } else {
          log("❌ Migration is not valid", "red");
          log("\nErrors:", "red");
          validation.errors.forEach((error) => log(`  - ${error}`, "red"));
          process.exit(1);
        }
        
        break;
      }
      
      case "current": {
        const current = getCurrentKernelVersion();
        log(`\nCurrent Kernel Version: ${current}`, "green");
        break;
      }
      
      default:
        log(`❌ Unknown command: ${command}`, "red");
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`, "red");
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.includes("migrate-kernel")) {
  main().catch((error) => {
    log(`\nFatal error: ${error}`, "red");
    process.exit(1);
  });
}

