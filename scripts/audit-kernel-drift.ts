#!/usr/bin/env node
/**
 * Kernel Doctrine: CI Drift Detection
 *
 * Scans codebase for CONCEPT_* and VALUESET_* tokens and validates they exist
 * in the registry snapshot. Prevents code drift during feature development.
 *
 * Usage:
 *   pnpm audit:no-drift
 *
 * Exit Codes:
 *   0 = No drift detected
 *   1 = Drift detected (token not in snapshot)
 *   2 = Snapshot not found (run 'pnpm kernel:export-snapshot' first)
 */

import fs from "fs";
import { glob } from "glob";
import path from "path";

interface RegistrySnapshot {
  concepts: string[];
  valueSets: string[];
  valuesBySet: Record<string, string[]>;
  exportedAt: string;
  snapshotVersion: string;
}

const CONCEPT_PATTERN = /\bCONCEPT_[A-Z0-9_]+\b/g;
const VALUESET_PATTERN = /\bVALUESET_[A-Z0-9_]+\b/g;
const SNAPSHOT_PATH = path.join(
  process.cwd(),
  "docs",
  "kernel",
  "registry.snapshot.json"
);

const EXCLUDE_DIRS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "coverage",
];

// Files that should be excluded from drift detection
// (contain variable names or documentation examples, not actual concept references)
const EXCLUDE_FILES = [
  "**/audit-kernel-drift.ts", // This script defines CONCEPT_PATTERN variable
  "**/check-l0-drift.ts", // Portal drift script defines patterns too
  "**/*.test.ts", // Test files may have example tokens
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "docs/**", // Documentation examples
];

/**
 * Load registry snapshot from disk
 */
function loadSnapshot(): RegistrySnapshot {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.error(`❌ Registry snapshot not found at ${SNAPSHOT_PATH}`);
    console.error(`   Run 'pnpm kernel:export-snapshot' to generate it.`);
    process.exit(2);
  }

  const content = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
  return JSON.parse(content);
}

/**
 * Scan codebase for token patterns
 */
function scanCodebase(): {
  conceptTokens: Set<string>;
  valuesetTokens: Set<string>;
} {
  const conceptTokens = new Set<string>();
  const valuesetTokens = new Set<string>();

  const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
    cwd: process.cwd(),
    ignore: [...EXCLUDE_DIRS.map((dir) => `**/${dir}/**`), ...EXCLUDE_FILES],
  });

  files.forEach((file) => {
    const fullPath = path.join(process.cwd(), file);
    try {
      const content = fs.readFileSync(fullPath, "utf-8");

      let match;
      // Extract CONCEPT_* tokens
      while ((match = CONCEPT_PATTERN.exec(content)) !== null) {
        conceptTokens.add(match[0]);
      }

      // Extract VALUESET_* tokens
      while ((match = VALUESET_PATTERN.exec(content)) !== null) {
        valuesetTokens.add(match[0]);
      }
    } catch {
      // Skip unreadable files
    }
  });

  return { conceptTokens, valuesetTokens };
}

/**
 * Check for drift: verify all tokens exist in snapshot
 */
function checkDrift(
  snapshot: RegistrySnapshot,
  tokens: {
    conceptTokens: Set<string>;
    valuesetTokens: Set<string>;
  }
): boolean {
  let hasDrift = false;

  // Check concepts
  tokens.conceptTokens.forEach((token) => {
    if (!snapshot.concepts.includes(token)) {
      console.error(`❌ Concept not in registry: ${token}`);
      hasDrift = true;
    }
  });

  // Check value sets
  tokens.valuesetTokens.forEach((token) => {
    if (!snapshot.valueSets.includes(token)) {
      console.error(`❌ Value set not in registry: ${token}`);
      hasDrift = true;
    }
  });

  return hasDrift;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log("🔍 Scanning codebase for Kernel tokens...");

  const snapshot = loadSnapshot();
  console.log(`✅ Loaded registry snapshot (exported: ${snapshot.exportedAt})`);
  console.log(
    `   Concepts: ${snapshot.concepts.length}, Value Sets: ${snapshot.valueSets.length}`
  );

  const tokens = scanCodebase();
  console.log(
    `   Found in code: ${tokens.conceptTokens.size} concepts, ${tokens.valuesetTokens.size} value sets`
  );

  const hasDrift = checkDrift(snapshot, tokens);

  if (!hasDrift) {
    console.log("✅ No drift detected. Build proceeding.");
    process.exit(0);
  } else {
    console.error("\n❌ Kernel drift detected. Update registry or fix code.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
});
