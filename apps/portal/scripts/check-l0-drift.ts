#!/usr/bin/env node

/* eslint-disable @nexus/canon/no-kernel-string-literals -- Drift scanner dynamically constructs identifiers */

/**
 * check-l0-drift.ts
 *
 * Purpose:
 *   Validate that Portal app logic doesn't reference L0 concepts/value sets that don't exist in kernel registry.
 *   Detect "drift" = inconsistency between what app expects and what L0 defines.
 *
 * Strategy:
 *   1. Parse Portal code for CONCEPT_* and VALUESET_* references
 *   2. Load registry from Supabase (--live) or snapshot (--snapshot <path>)
 *   3. Cross-check: every reference must exist in L0
 *   4. Apply allowlist (drift.ignore.json) for intentional exclusions
 *   5. Report gaps + recommend P1/P2 additions
 *
 * Usage:
 *   pnpm audit:l0-drift:live                    (query live Supabase)
 *   pnpm audit:l0-drift                         (use snapshot - CI mode)
 *   pnpm audit:l0-drift --json                  (machine-readable output)
 *   pnpm audit:l0-drift --strict                (fail on warnings too)
 *
 * Exit Codes:
 *   0 = No drift detected ✅
 *   1 = Drift detected (missing concepts/value sets) ❌
 *   2 = Configuration error (can't connect to Supabase, bad args) ⚠️
 *   3 = Snapshot missing/outdated (when using --snapshot mode) ⚠️
 *
 * Governance:
 *   This check enforces the "Contract First" discipline:
 *   - Every CONCEPT_ / VALUESET_ reference must exist in L0
 *   - Intentional allowlist prevents ad-hoc bypasses
 *   - Enables safe P1/P2 expansion without breaking features
 *   - Non-negotiable in CI/CD pipeline
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

// ============================================================================
// TYPES
// ============================================================================

interface RegistrySnapshot {
  concepts: string[];
  valueSets: string[];
  valuesBySet?: Record<string, string[]>;
  exportedAt: string;
  snapshotVersion: string;
}

interface AllowList {
  concepts: string[];
  valueSets: string[];
}

interface DriftReport {
  timestamp: string;
  source: "live" | "snapshot";
  summaryOK: boolean;
  errorCount: number;
  warningCount: number;
  referencedConcepts: string[];
  referencedValueSets: string[];
  missingConcepts: string[];
  missingValueSets: string[];
  allowedExceptions: string[];
  recommendations: string[];
  details: {
    type: "concept" | "valueset";
    id: string;
    files: string[];
  }[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORTAL_ROOT = process.cwd();
const ALLOWLIST_PATH = path.join(PORTAL_ROOT, "scripts", "drift.ignore.json");

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const strict = args.includes("--strict");

  // Determine mode: --live queries Supabase, --snapshot uses file (default to snapshot for CI)
  const liveMode = args.includes("--live");
  let snapshotPath = args[args.indexOf("--snapshot") + 1];
  if (!liveMode && !snapshotPath) {
    // CI default: look for snapshot relative to root
    snapshotPath = path.join(
      PORTAL_ROOT,
      "..",
      "..",
      "docs",
      "kernel",
      "registry.snapshot.json"
    );
  }

  try {
    console.log(
      `🔍 L0 Drift Detection: Starting... (mode: ${
        liveMode ? "live" : "snapshot"
      })`
    );

    // Step 1: Load allowlist
    const allowlist = await loadAllowlist();
    console.log(
      `📋 Loaded allowlist: ${allowlist.concepts.length} concepts, ${allowlist.valueSets.length} value sets ignored`
    );

    // Step 2: Load registry (either live or snapshot)
    let validConcepts: Set<string>;
    let validValueSets: Set<string>;
    let source: "live" | "snapshot";

    if (liveMode) {
      console.log("📡 Mode: LIVE - Querying Supabase...");
      const { concepts, valueSets } = await loadRegistryLive();
      validConcepts = concepts;
      validValueSets = valueSets;
      source = "live";
    } else {
      console.log(`📄 Mode: SNAPSHOT - Loading from ${snapshotPath}`);
      const { concepts, valueSets } = await loadRegistrySnapshot(snapshotPath);
      validConcepts = concepts;
      validValueSets = valueSets;
      source = "snapshot";
    }

    console.log(
      `✅ Loaded ${validConcepts.size} concepts, ${validValueSets.size} value sets`
    );

    // Step 3: Scan Portal code for references
    console.log(
      "🔎 Scanning Portal code for CONCEPT_* and VALUESET_* references..."
    );
    const { concepts: referencedConcepts, valueSets: referencedValueSets } =
      await scanPortalCode(PORTAL_ROOT);
    console.log(
      `📝 Found ${referencedConcepts.size} concept refs, ${referencedValueSets.size} value set refs`
    );

    // Step 4: Cross-check against allowlist
    const missingConcepts: string[] = [];
    const missingValueSets: string[] = [];
    const detailsByMissing: Record<string, string[]> = {};

    // Check concepts
    for (const concept of referencedConcepts.keys()) {
      if (
        !validConcepts.has(concept) &&
        !allowlist.concepts.includes(concept)
      ) {
        missingConcepts.push(concept);
        detailsByMissing[concept] = referencedConcepts.get(concept) || [];
      }
    }

    // Check value sets
    for (const valueset of referencedValueSets.keys()) {
      if (
        !validValueSets.has(valueset) &&
        !allowlist.valueSets.includes(valueset)
      ) {
        missingValueSets.push(valueset);
        detailsByMissing[valueset] = referencedValueSets.get(valueset) || [];
      }
    }

    // Step 5: Build report
    const report: DriftReport = {
      timestamp: new Date().toISOString(),
      source,
      summaryOK: missingConcepts.length === 0 && missingValueSets.length === 0,
      errorCount: missingConcepts.length + missingValueSets.length,
      warningCount: 0,
      referencedConcepts: Array.from(referencedConcepts.keys()).sort(),
      referencedValueSets: Array.from(referencedValueSets.keys()).sort(),
      missingConcepts: missingConcepts.sort(),
      missingValueSets: missingValueSets.sort(),
      allowedExceptions: [...allowlist.concepts, ...allowlist.valueSets].sort(),
      recommendations: buildRecommendations(missingConcepts, missingValueSets),
      details: Object.entries(detailsByMissing).map(([id, files]) => {
        const type = id.startsWith("VALUESET_") ? "valueset" : "concept";
        return { type, id, files };
      }),
    };

    // Step 6: Output report
    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }

    // Step 7: Exit with appropriate code
    if (!report.summaryOK) {
      process.exit(1); // Drift detected
    } else {
      process.exit(0); // Clean
    }
  } catch (error) {
    if (error instanceof SnapshotMissingError) {
      console.error(
        "⚠️  Snapshot missing/outdated:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(3); // Snapshot error (distinct from config error)
    } else {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(2); // Configuration error
    }
  }
}

// ============================================================================
// ERROR TYPES
// ============================================================================

class SnapshotMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SnapshotMissingError";
  }
}

// ============================================================================
// REGISTRY LOADING
// ============================================================================

/**
 * Load registry from live Supabase
 */
async function loadRegistryLive(): Promise<{
  concepts: Set<string>;
  valueSets: Set<string>;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch concepts
  const { data: conceptRegistry, error: conceptError } = await supabase
    .from("kernel_concept_registry")
    .select("concept_id")
    .eq("is_active", true);

  if (conceptError)
    throw new Error(`Failed to fetch concepts: ${conceptError.message}`);

  // Fetch value sets
  const { data: valueSetRegistry, error: valueSetError } = await supabase
    .from("kernel_value_set_registry")
    .select("value_set_id")
    .eq("is_active", true);

  if (valueSetError)
    throw new Error(`Failed to fetch value sets: ${valueSetError.message}`);

  const concepts = new Set((conceptRegistry || []).map((c) => c.concept_id));
  const valueSets = new Set(
    (valueSetRegistry || []).map((v) => v.value_set_id)
  );

  return { concepts, valueSets };
}

/**
 * Load registry from snapshot JSON
 */
async function loadRegistrySnapshot(snapshotPath: string): Promise<{
  concepts: Set<string>;
  valueSets: Set<string>;
}> {
  try {
    const content = await fs.readFile(snapshotPath, "utf-8");
    const snapshot: RegistrySnapshot = JSON.parse(content);

    const concepts = new Set(snapshot.concepts);
    const valueSets = new Set(snapshot.valueSets);

    return { concepts, valueSets };
  } catch (error) {
    throw new SnapshotMissingError(
      `Cannot load snapshot at ${snapshotPath}. Run 'pnpm kernel:registry:snapshot' to generate it.`
    );
  }
}

/**
 * Load allowlist from drift.ignore.json
 */
async function loadAllowlist(): Promise<AllowList> {
  try {
    const content = await fs.readFile(ALLOWLIST_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    // No allowlist = no exceptions
    return { concepts: [], valueSets: [] };
  }
}

// ============================================================================
// CODE SCANNING
// ============================================================================

/**
 * Recursively scan directory for TypeScript/TSX files
 */
async function scanDirectory(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentPath: string) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (
          entry.name.startsWith(".") ||
          ["node_modules", ".next", "dist", ".turbo"].includes(entry.name)
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }

  await walk(dir);
  return files;
}

/**
 * Scan Portal code for CONCEPT_* and VALUESET_* references
 */
async function scanPortalCode(rootDir: string): Promise<{
  concepts: Map<string, string[]>;
  valueSets: Map<string, string[]>;
}> {
  const concepts = new Map<string, string[]>();
  const valueSets = new Map<string, string[]>();

  const patterns = {
    concepts: [
      /CONCEPT_([A-Z0-9_]+)/g,
      /concept[("_](?:code["\s:]*)?["']([A-Z_][A-Z0-9_]*)["']/gi,
      /concept_code\s*=\s*["']([A-Z_][A-Z0-9_]*)["']/gi,
    ],
    valueSets: [
      /VALUESET_([A-Z0-9_]+)/g,
      /value_set[("_](?:id["\s:]*)?["']([A-Z_][A-Z0-9_]*)["']/gi,
      /value_set_id\s*=\s*["']([A-Z_][A-Z0-9_]*)["']/gi,
    ],
  };

  const dirsToScan = [
    path.join(rootDir, "app"),
    path.join(rootDir, "components"),
    path.join(rootDir, "lib"),
  ];

  for (const dir of dirsToScan) {
    const files = await scanDirectory(dir);

    for (const file of files) {
      try {
        const content = await fs.readFile(file, "utf-8");

        // Scan for concepts
        for (const regex of patterns.concepts) {
          let match;
          regex.lastIndex = 0;

          while ((match = regex.exec(content)) !== null) {
            const concept = `CONCEPT_${match[1].toUpperCase()}`;

            if (!concepts.has(concept)) {
              concepts.set(concept, []);
            }

            const fileList = concepts.get(concept) || [];
            if (!fileList.includes(file)) {
              fileList.push(file);
              concepts.set(concept, fileList);
            }
          }
        }

        // Scan for value sets
        for (const regex of patterns.valueSets) {
          let match;
          regex.lastIndex = 0;

          while ((match = regex.exec(content)) !== null) {
            const valueset = `VALUESET_${match[1].toUpperCase()}`;

            if (!valueSets.has(valueset)) {
              valueSets.set(valueset, []);
            }

            const fileList = valueSets.get(valueset) || [];
            if (!fileList.includes(file)) {
              fileList.push(file);
              valueSets.set(valueset, fileList);
            }
          }
        }
      } catch {
        // Skip unreadable files
      }
    }
  }

  return { concepts, valueSets };
}

// ============================================================================
// REPORTING
// ============================================================================

/**
 * Build recommendations based on missing items
 */
function buildRecommendations(
  missingConcepts: string[],
  missingValueSets: string[]
): string[] {
  const recommendations: string[] = [];

  if (missingConcepts.length === 0 && missingValueSets.length === 0) {
    recommendations.push("✅ All references are valid. No drift detected.");
    return recommendations;
  }

  if (missingConcepts.length > 0) {
    recommendations.push(
      `❌ Drift detected: ${missingConcepts.length} missing concept(s).`
    );
  }

  if (missingValueSets.length > 0) {
    recommendations.push(
      `❌ Drift detected: ${missingValueSets.length} missing value set(s).`
    );
  }

  // Categorize for phase planning
  const allMissing = [...missingConcepts, ...missingValueSets];
  const claimsRelated = allMissing.filter((c) => c.includes("CLAIM"));
  const casesRelated = allMissing.filter((c) => c.includes("CASE"));
  const approvalRelated = allMissing.filter((c) => c.includes("APPROVAL"));
  const reconciliationRelated = allMissing.filter(
    (c) =>
      c.includes("STATEMENT") ||
      c.includes("RECONCIL") ||
      c.includes("MATCHING")
  );

  if (claimsRelated.length > 0) {
    recommendations.push(
      `📋 P1 Candidate: ${claimsRelated.join(", ")} - Add via migration`
    );
  }

  if (casesRelated.length > 0) {
    recommendations.push(
      `📋 P1 Candidate: ${casesRelated.join(", ")} - Add via migration`
    );
  }

  if (approvalRelated.length > 0) {
    recommendations.push(
      `📋 P1 Candidate: ${approvalRelated.join(", ")} - Add via migration`
    );
  }

  if (reconciliationRelated.length > 0) {
    recommendations.push(
      `📋 P1 Candidate: ${reconciliationRelated.join(", ")} - Add via migration`
    );
  }

  recommendations.push(
    "📖 See KERNEL_PHASE_1_SUMMARY.md for governance + roadmap."
  );
  recommendations.push(
    "💡 To intentionally allow a token, add it to scripts/drift.ignore.json (with review)."
  );

  return recommendations;
}

/**
 * Print human-readable report to console
 */
function printReport(report: DriftReport): void {
  console.log("\n" + "=".repeat(80));
  console.log("📊 L0 DRIFT REPORT");
  console.log(
    `Source: ${report.source.toUpperCase()} | Time: ${report.timestamp}`
  );
  console.log("=".repeat(80));

  console.log(`\n📊 Counts:`);
  console.log(`   Referenced Concepts:  ${report.referencedConcepts.length}`);
  console.log(`   Referenced Value Sets: ${report.referencedValueSets.length}`);
  console.log(`   Allowed Exceptions:    ${report.allowedExceptions.length}`);
  console.log(`\n❌ Missing:`);
  console.log(`   Concepts:    ${report.missingConcepts.length}`);
  console.log(`   Value Sets:  ${report.missingValueSets.length}`);

  if (report.summaryOK) {
    console.log("\n✅ STATUS: CLEAN - No drift detected\n");
  } else {
    console.log("\n❌ STATUS: DRIFT DETECTED - Action required\n");

    if (report.details.length > 0) {
      console.log("Missing References (not in L0 Kernel):");
      for (const detail of report.details) {
        const icon = detail.type === "concept" ? "🔹" : "📦";
        console.log(`\n  ${icon} ${detail.type.toUpperCase()}: ${detail.id}`);
        for (const file of detail.files) {
          const relativePath = file
            .replace(PORTAL_ROOT, "")
            .replace(/^[/\\]/, "");
          console.log(`     📄 ${relativePath}`);
        }
      }
    }
  }

  console.log("\n📋 Recommendations:");
  for (const rec of report.recommendations) {
    console.log(`  ${rec}`);
  }

  console.log("\n" + "=".repeat(80));
}

// ============================================================================
// ENTRY POINT
// ============================================================================

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(2);
});
