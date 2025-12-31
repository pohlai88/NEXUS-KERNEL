#!/usr/bin/env node

/**
 * generate-kernel-registry-snapshot.ts
 *
 * Purpose:
 *   Export L0 Kernel registry to a JSON snapshot file for CI drift detection.
 *   This enables deterministic, fast drift checking without DB access.
 *
 * Usage:
 *   pnpm kernel:registry:snapshot
 *
 * Output:
 *   ../../docs/kernel/registry.snapshot.json
 *
 * CI Integration:
 *   Run this before `pnpm audit:l0-drift` in CI pipeline.
 *   Example:
 *     pnpm kernel:registry:snapshot
 *     pnpm audit:l0-drift  (uses snapshot, no DB access)
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

interface RegistrySnapshot {
  concepts: string[];
  valueSets: string[];
  valuesBySet: Record<string, string[]>;
  exportedAt: string;
  snapshotVersion: string;
}

async function main() {
  try {
    console.log("📦 Generating L0 Kernel registry snapshot...");

    // Load Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active concepts
    console.log("📡 Fetching concepts...");
    const { data: concepts, error: conceptsError } = await supabase
      .from("kernel_concept_registry")
      .select("concept_id")
      .eq("is_active", true);

    if (conceptsError) throw conceptsError;

    // Fetch all active value sets
    console.log("📡 Fetching value sets...");
    const { data: valueSets, error: valueSetsError } = await supabase
      .from("kernel_value_set_registry")
      .select("value_set_id")
      .eq("is_active", true);

    if (valueSetsError) throw valueSetsError;

    // Fetch all active values grouped by set
    console.log("📡 Fetching value codes...");
    const { data: values, error: valuesError } = await supabase
      .from("kernel_value_set_values")
      .select("value_set_id, value_code")
      .eq("is_active", true);

    if (valuesError) throw valuesError;

    // Build values-by-set map
    const valuesBySet: Record<string, string[]> = {};
    values?.forEach((v) => {
      if (!valuesBySet[v.value_set_id]) {
        valuesBySet[v.value_set_id] = [];
      }
      valuesBySet[v.value_set_id].push(v.value_code);
    });

    // Build snapshot
    const snapshot: RegistrySnapshot = {
      concepts: (concepts ?? []).map((c) => c.concept_id).sort(),
      valueSets: (valueSets ?? []).map((vs) => vs.value_set_id).sort(),
      valuesBySet,
      exportedAt: new Date().toISOString(),
      snapshotVersion: "1.0.0",
    };

    // Ensure output directory exists (relative to Portal, up to root, then to docs/kernel)
    const outputDir = path.join(__dirname, "..", "..", "..", "docs", "kernel");
    await fs.mkdir(outputDir, { recursive: true });

    // Write snapshot
    const outputPath = path.join(outputDir, "registry.snapshot.json");
    await fs.writeFile(outputPath, JSON.stringify(snapshot, null, 2));

    console.log(`✅ Snapshot exported to ${outputPath}`);
    console.log(`   Concepts: ${snapshot.concepts.length}`);
    console.log(`   Value Sets: ${snapshot.valueSets.length}`);
    console.log(`   Total Values: ${Object.values(valuesBySet).flat().length}`);
    console.log(`   Generated: ${snapshot.exportedAt}`);

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Export failed:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(2);
  }
}

main();
