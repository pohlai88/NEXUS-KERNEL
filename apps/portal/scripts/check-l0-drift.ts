#!/usr/bin/env node

/**
 * check-l0-drift.ts
 *
 * Purpose:
 *   Validate that Portal app logic doesn't reference L0 concepts that don't exist in the kernel registry.
 *   Detect "drift" = inconsistency between what the app expects and what L0 defines.
 *
 * Strategy:
 *   1. Parse Portal code for concept references (patterns like CONCEPT_*, concept("*"), concept_code: "*")
 *   2. Query Supabase kernel_concept_registry to get list of valid concepts
 *   3. Cross-check: every referenced concept must exist in L0
 *   4. Report gaps + recommend P1/P2 additions
 *
 * Usage:
 *   pnpm check:l0-drift
 *   pnpm check:l0-drift --json (machine-readable output)
 *   pnpm check:l0-drift --strict (fail on warnings too, not just errors)
 *
 * Exit Codes:
 *   0 = No drift detected ✅
 *   1 = Drift detected (missing concepts) ❌
 *   2 = Configuration error (can't connect to Supabase, etc.)
 *
 * Governance:
 *   This check enforces the "Contract First" discipline:
 *   - Every concept reference in app code must exist in L0
 *   - Enables safe P1/P2 expansion without breaking existing features
 *   - Part of CI/CD pipeline (non-negotiable)
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORTAL_ROOT = process.cwd();

// Known false positives to ignore (patterns that look like concepts but aren't)
const FALSE_POSITIVES = [
  "CONCEPT_DRAFT", // React state naming
  "CONCEPT_NODE", // React tree naming
];

// ============================================================================
// TYPES
// ============================================================================

interface DriftReport {
  timestamp: string;
  summaryOK: boolean;
  errorCount: number;
  warningCount: number;
  referencedConcepts: string[];
  missingConcepts: string[];
  orphanedValueSets: string[];
  recommendations: string[];
  details: {
    concept: string;
    files: string[];
  }[];
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const strict = args.includes("--strict");

  try {
    console.log("🔍 L0 Drift Detection: Starting...");

    // Step 1: Load environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Step 2: Fetch L0 Kernel concepts from Supabase
    console.log("📡 Fetching L0 Kernel concepts...");
    const { data: conceptRegistry, error: conceptError } = await supabase
      .from("kernel_concept_registry")
      .select("concept_id, concept_category");

    if (conceptError)
      throw new Error(`Failed to fetch concepts: ${conceptError.message}`);

    const validConcepts = new Set(
      (conceptRegistry || []).map((c) => c.concept_id)
    );
    console.log(
      `✅ Loaded ${validConcepts.size} valid concepts from L0 Kernel`
    );

    // Step 3: Fetch L0 value sets
    console.log("📡 Fetching L0 value sets...");
    const { data: valueSetRegistry, error: valueSetError } = await supabase
      .from("kernel_value_set_registry")
      .select("value_set_id");

    if (valueSetError)
      throw new Error(`Failed to fetch value sets: ${valueSetError.message}`);

    const validValueSets = new Set(
      (valueSetRegistry || []).map((v) => v.value_set_id)
    );
    console.log(
      `✅ Loaded ${validValueSets.size} valid value sets from L0 Kernel`
    );

    // Step 4: Scan Portal code for concept references
    console.log("🔎 Scanning Portal code for concept references...");
    const referencedConcepts = await scanPortalCode(PORTAL_ROOT);
    console.log(
      `📝 Found ${referencedConcepts.size} unique concept references in app code`
    );

    // Step 5: Cross-check: are all referenced concepts valid?
    const missingConcepts: string[] = [];
    const detailsByMissing: Record<string, string[]> = {};

    for (const concept of referencedConcepts.keys()) {
      if (!validConcepts.has(concept) && !FALSE_POSITIVES.includes(concept)) {
        missingConcepts.push(concept);
        detailsByMissing[concept] = referencedConcepts.get(concept) || [];
      }
    }

    // Step 6: Build report
    const report: DriftReport = {
      timestamp: new Date().toISOString(),
      summaryOK: missingConcepts.length === 0,
      errorCount: missingConcepts.length,
      warningCount: 0,
      referencedConcepts: Array.from(referencedConcepts.keys()).sort(),
      missingConcepts: missingConcepts.sort(),
      orphanedValueSets: [],
      recommendations: buildRecommendations(missingConcepts),
      details: Object.entries(detailsByMissing).map(([concept, files]) => ({
        concept,
        files,
      })),
    };

    // Step 7: Output report
    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }

    // Step 8: Exit with appropriate code
    if (missingConcepts.length > 0) {
      process.exit(1); // Drift detected
    } else {
      process.exit(0); // Clean
    }
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(2); // Configuration error
  }
}

// ============================================================================
// HELPER FUNCTIONS
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

        // Skip node_modules, .next, dist, etc.
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
    } catch (error) {
      // Skip unreadable directories
    }
  }

  await walk(dir);
  return files;
}

/**
 * Scan Portal code for concept references
 */
async function scanPortalCode(rootDir: string): Promise<Map<string, string[]>> {
  const referencedConcepts = new Map<string, string[]>();

  // Regex patterns to detect concept references in code
  const CONCEPT_PATTERNS = [
    // Explicit CONCEPT_* constants
    /CONCEPT_([A-Z_]+)/g,
    // String literals: concept("CONCEPT_NAME"), concept_code: "CONCEPT_NAME"
    /concept[("_](?:code["\s:]*)?["']([A-Z_]+)["']/gi,
    // Registry queries: concept_code = "CONCEPT_NAME"
    /concept_code\s*=\s*["']([A-Z_]+)["']/gi,
  ];

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

        for (const regex of CONCEPT_PATTERNS) {
          let match;
          // Reset regex state for global patterns
          regex.lastIndex = 0;

          while ((match = regex.exec(content)) !== null) {
            const concept = match[1].toUpperCase();

            if (!referencedConcepts.has(concept)) {
              referencedConcepts.set(concept, []);
            }

            const files = referencedConcepts.get(concept) || [];
            if (!files.includes(file)) {
              files.push(file);
              referencedConcepts.set(concept, files);
            }
          }
        }
      } catch (error) {
        // Skip unreadable files
      }
    }
  }

  return referencedConcepts;
}

/**
 * Build recommendations based on missing concepts
 */
function buildRecommendations(missingConcepts: string[]): string[] {
  const recommendations: string[] = [];

  if (missingConcepts.length === 0) {
    recommendations.push(
      "✅ All concept references are valid. No drift detected."
    );
    return recommendations;
  }

  recommendations.push(
    `❌ Drift detected: ${missingConcepts.length} missing concept(s) referenced in app code.`
  );

  // Categorize by likely phase
  const claimsRelated = missingConcepts.filter((c) => c.includes("CLAIM"));
  const casesRelated = missingConcepts.filter((c) => c.includes("CASE"));
  const approvalRelated = missingConcepts.filter((c) => c.includes("APPROVAL"));
  const reconciliationRelated = missingConcepts.filter(
    (c) =>
      c.includes("STATEMENT") ||
      c.includes("RECONCIL") ||
      c.includes("MATCHING")
  );

  if (claimsRelated.length > 0) {
    recommendations.push(
      `📋 P1 Candidate: ${claimsRelated.join(
        ", "
      )} - Create migration 20260108_add_claims_concepts.sql`
    );
  }

  if (casesRelated.length > 0) {
    recommendations.push(
      `📋 P1 Candidate: ${casesRelated.join(
        ", "
      )} - Create migration 20260108_add_cases_concepts.sql`
    );
  }

  if (approvalRelated.length > 0) {
    recommendations.push(
      `📋 P1 Candidate: ${approvalRelated.join(
        ", "
      )} - Create migration 20260108_add_approval_concepts.sql`
    );
  }

  if (reconciliationRelated.length > 0) {
    recommendations.push(
      `📋 P1 Candidate: ${reconciliationRelated.join(
        ", "
      )} - Create migration 20260108_add_reconciliation_concepts.sql`
    );
  }

  recommendations.push(
    "📖 See docs/development/CONCEPT_COVERAGE_MAP.md for full P1/P2 roadmap."
  );

  return recommendations;
}

/**
 * Print human-readable report to console
 */
function printReport(report: DriftReport): void {
  console.log("\n" + "=".repeat(80));
  console.log("📊 L0 DRIFT REPORT");
  console.log("=".repeat(80));

  console.log(`\n⏰ Timestamp: ${report.timestamp}`);
  console.log(`📊 Referenced Concepts: ${report.referencedConcepts.length}`);
  console.log(`❌ Missing Concepts: ${report.missingConcepts.length}`);

  if (report.summaryOK) {
    console.log("\n✅ STATUS: CLEAN - No drift detected\n");
  } else {
    console.log("\n❌ STATUS: DRIFT DETECTED - Action required\n");

    console.log("Missing Concepts (not in L0 Kernel):");
    for (const detail of report.details) {
      console.log(`\n  ❌ ${detail.concept}`);
      for (const file of detail.files) {
        // Make path relative for readability
        const relativePath = file
          .replace(PORTAL_ROOT, "")
          .replace(/^[/\\]/, "");
        console.log(`     📄 ${relativePath}`);
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
