#!/usr/bin/env node
/**
 * Kernel Registry Snapshot Export
 *
 * Exports L0 Kernel registry (concepts, value sets, values) to a JSON snapshot.
 * Used by CI drift detection to validate code without DB access.
 *
 * Usage:
 *   pnpm kernel:export-snapshot
 *
 * Output:
 *   docs/kernel/registry.snapshot.json
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

interface RegistrySnapshot {
  concepts: string[];
  valueSets: string[];
  valuesBySet: Record<string, string[]>;
  exportedAt: string;
  snapshotVersion: string;
}

async function exportSnapshot(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("📦 Exporting Kernel registry snapshot...");

  // Fetch all active concepts
  const { data: concepts, error: conceptsError } = await supabase
    .from("kernel_concept_registry")
    .select("concept_id")
    .eq("is_active", true);

  if (conceptsError) throw conceptsError;

  // Fetch all active value sets
  const { data: valueSets, error: valueSetsError } = await supabase
    .from("kernel_value_set_registry")
    .select("value_set_id")
    .eq("is_active", true);

  if (valueSetsError) throw valueSetsError;

  // Fetch all active values grouped by set
  const { data: values, error: valuesError } = await supabase
    .from("kernel_value_set_values")
    .select("value_set_id, value_code")
    .eq("is_active", true);

  if (valuesError) throw valuesError;

  // Build snapshot
  const valuesBySet: Record<string, string[]> = {};
  values?.forEach((v) => {
    if (!valuesBySet[v.value_set_id]) {
      valuesBySet[v.value_set_id] = [];
    }
    valuesBySet[v.value_set_id].push(v.value_code);
  });

  const snapshot: RegistrySnapshot = {
    concepts: (concepts ?? []).map((c) => c.concept_id).sort(),
    valueSets: (valueSets ?? []).map((vs) => vs.value_set_id).sort(),
    valuesBySet,
    exportedAt: new Date().toISOString(),
    snapshotVersion: "1.0.0",
  };

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), "docs", "kernel");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write snapshot
  const outputPath = path.join(outputDir, "registry.snapshot.json");
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

  console.log(`✅ Snapshot exported to ${outputPath}`);
  console.log(`   Concepts: ${snapshot.concepts.length}`);
  console.log(`   Value Sets: ${snapshot.valueSets.length}`);
  console.log(`   Total Values: ${Object.values(valuesBySet).flat().length}`);
}

exportSnapshot().catch((err) => {
  console.error("❌ Export failed:", err);
  process.exit(1);
});
