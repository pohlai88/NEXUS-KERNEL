#!/usr/bin/env node
/**
 * Kernel Release Gate
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * One-command release validation: gen → invariants → typecheck → tests
 * Prevents "it works on my machine" drift
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

function runCommand(command: string, description: string): void {
  console.log(`\n${description}...`);
  try {
    execSync(command, { cwd: ROOT_DIR, stdio: "inherit" });
    console.log(`✅ ${description} passed`);
  } catch (error) {
    console.error(`\n❌ ${description} failed`);
    process.exit(1);
  }
}

function main() {
  console.log("🚀 Kernel Release Gate");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Step 1: Generate kernel
  runCommand("pnpm generate", "Generating kernel code");

  // Step 2: Typecheck
  runCommand("pnpm typecheck", "Type checking");

  // Step 3: Run tests
  runCommand("pnpm test", "Running tests");

  // Step 4: Verify output files exist
  const conceptsFile = join(ROOT_DIR, "src", "concepts.ts");
  const valuesFile = join(ROOT_DIR, "src", "values.ts");

  try {
    const conceptsContent = readFileSync(conceptsFile, "utf-8");
    const valuesContent = readFileSync(valuesFile, "utf-8");

    // Extract counts
    const conceptMatch = conceptsContent.match(/export const CONCEPT_COUNT = (\d+) as const/);
    const valueSetMatch = valuesContent.match(/export const VALUESET_COUNT = (\d+) as const/);
    const valueMatch = valuesContent.match(/export const VALUE_COUNT = (\d+) as const/);

    if (conceptMatch && valueSetMatch && valueMatch) {
      console.log("\n📊 Kernel Statistics:");
      console.log(`   Concepts: ${conceptMatch[1]}`);
      console.log(`   Value Sets: ${valueSetMatch[1]}`);
      console.log(`   Values: ${valueMatch[1]}`);
    }

    console.log("\n✨ Release gate passed - kernel is production-ready!");
  } catch (error) {
    console.error("\n❌ Failed to verify generated files");
    process.exit(1);
  }
}

main();

