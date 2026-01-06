// @aibos/kernel - Supabase Drift Detection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Detect schema drift between kernel snapshot and Supabase database
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { KERNEL_VERSION, SNAPSHOT_ID } from "../version.js";
import { validateDatabaseState, type DatabaseState } from "./validation.js";

/**
 * Drift detection result
 */
export interface DriftResult {
  hasDrift: boolean;
  driftType: "version" | "snapshot" | "schema" | "none";
  details: {
    versionMismatch?: boolean;
    snapshotMismatch?: boolean;
    missingConcepts?: string[];
    missingValueSets?: string[];
    missingValues?: string[];
    extraConcepts?: string[];
    extraValueSets?: string[];
    extraValues?: string[];
  };
  recommendations: string[];
}

/**
 * Detect drift between kernel snapshot and database
 * 
 * @param dbState - Current database state
 * @returns Drift detection result
 * 
 * @example
 * ```typescript
 * const dbState = await getDatabaseState(supabase);
 * const drift = detectDrift(dbState);
 * 
 * if (drift.hasDrift) {
 *   console.error('Drift detected:', drift);
 *   // Generate migration or alert
 * }
 * ```
 */
export function detectDrift(dbState: DatabaseState): DriftResult {
  const validation = validateDatabaseState(dbState);
  const details: DriftResult["details"] = {};
  const recommendations: string[] = [];
  let driftType: DriftResult["driftType"] = "none";

  // Check version mismatch
  if (dbState.metadata?.kernel_version !== KERNEL_VERSION) {
    details.versionMismatch = true;
    driftType = "version";
    recommendations.push(
      `Update database kernel_version from ${dbState.metadata?.kernel_version} to ${KERNEL_VERSION}`
    );
  }

  // Check snapshot mismatch
  if (dbState.metadata?.snapshot_id !== SNAPSHOT_ID) {
    details.snapshotMismatch = true;
    if (driftType === "none") driftType = "snapshot";
    recommendations.push(
      `Update database snapshot_id from ${dbState.metadata?.snapshot_id} to ${SNAPSHOT_ID}`
    );
  }

  // Check schema drift
  if (validation.errors.length > 0) {
    driftType = "schema";
    
    // Extract missing items from errors
    validation.errors.forEach((error) => {
      if (error.includes("Missing concepts")) {
        const matches = error.match(/Missing concepts in database: (.+)/);
        if (matches) {
          details.missingConcepts = matches[1].split(", ");
        }
      }
      if (error.includes("Missing enum values")) {
        const matches = error.match(/Missing enum values in database: (.+)/);
        if (matches) {
          details.missingValues = matches[1].split(", ");
        }
      }
    });

    recommendations.push("Run migration to sync database schema with kernel");
  }

  // Extract extra items from warnings
  validation.warnings.forEach((warning) => {
    if (warning.includes("Extra concepts")) {
      const matches = warning.match(/Extra concepts in database \(not in kernel\): (.+)/);
      if (matches) {
        details.extraConcepts = matches[1].split(", ");
        recommendations.push(
          "Review extra concepts in database - they may need to be removed or migrated"
        );
      }
    }
  });

  return {
    hasDrift: driftType !== "none",
    driftType,
    details,
    recommendations,
  };
}

/**
 * Generate drift report for CI/CD
 * 
 * @param dbState - Current database state
 * @returns Formatted drift report
 */
export function generateDriftReport(dbState: DatabaseState): string {
  const drift = detectDrift(dbState);
  const validation = validateDatabaseState(dbState);

  let report = "# Kernel Drift Detection Report\n\n";
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `**Kernel Version:** ${KERNEL_VERSION}\n`;
  report += `**Kernel Snapshot:** ${SNAPSHOT_ID}\n`;
  report += `**Database Version:** ${dbState.metadata?.kernel_version || "unknown"}\n`;
  report += `**Database Snapshot:** ${dbState.metadata?.snapshot_id || "unknown"}\n\n`;

  report += `## Status: ${drift.hasDrift ? "❌ DRIFT DETECTED" : "✅ NO DRIFT"}\n\n`;

  if (drift.hasDrift) {
    report += `**Drift Type:** ${drift.driftType}\n\n`;
    report += "## Details\n\n";

    if (drift.details.versionMismatch) {
      report += "- ❌ Kernel version mismatch\n";
    }
    if (drift.details.snapshotMismatch) {
      report += "- ❌ Snapshot ID mismatch\n";
    }
    if (drift.details.missingConcepts?.length) {
      report += `- ❌ Missing concepts: ${drift.details.missingConcepts.join(", ")}\n`;
    }
    if (drift.details.missingValues?.length) {
      report += `- ❌ Missing values: ${drift.details.missingValues.join(", ")}\n`;
    }
    if (drift.details.extraConcepts?.length) {
      report += `- ⚠️ Extra concepts: ${drift.details.extraConcepts.join(", ")}\n`;
    }

    report += "\n## Recommendations\n\n";
    drift.recommendations.forEach((rec) => {
      report += `- ${rec}\n`;
    });
  } else {
    report += "✅ Database is in sync with kernel snapshot.\n";
  }

  if (validation.warnings.length > 0) {
    report += "\n## Warnings\n\n";
    validation.warnings.forEach((warning) => {
      report += `- ⚠️ ${warning}\n`;
    });
  }

  return report;
}

