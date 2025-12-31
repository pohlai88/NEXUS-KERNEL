#!/usr/bin/env node
// @aibos/kernel - Snapshot Generator
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Generates registry.snapshot.json for CI validation
// Run: pnpm tsx scripts/generate-kernel-snapshot.mjs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Import directly from source (tsx handles TypeScript)
import {
  CONCEPT,
  CONCEPT_CATEGORY,
  CONCEPT_COUNT,
  KERNEL_VERSION,
  VALUE,
  VALUESET,
  VALUESET_COUNT,
  VALUE_COUNT,
} from "../packages/kernel/src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Build snapshot payload (deterministic - sorted keys)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Concepts: sorted by concept_id
const concepts = Object.entries(CONCEPT)
  .map(([key, id]) => ({
    key,
    id,
    category: CONCEPT_CATEGORY[id],
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

// Value Sets: sorted by value_set_id
const valueSets = Object.entries(VALUESET)
  .map(([key, id]) => ({
    key,
    id,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

// Values: sorted by value_set_id, then value_id
const values = [];
for (const [setKey, setValues] of Object.entries(VALUE)) {
  const valueSetId = VALUESET[setKey];
  for (const [valueKey, valueId] of Object.entries(setValues)) {
    values.push({
      valueSetKey: setKey,
      valueSetId,
      key: valueKey,
      id: valueId,
    });
  }
}
values.sort((a, b) => {
  const setCompare = a.valueSetId.localeCompare(b.valueSetId);
  if (setCompare !== 0) return setCompare;
  return a.id.localeCompare(b.id);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Compute deterministic snapshot ID (from content only, not timestamp)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const contentPayload = JSON.stringify({
  version: KERNEL_VERSION,
  concepts: concepts.map((c) => c.id),
  valueSets: valueSets.map((v) => v.id),
  values: values.map((v) => v.id),
});

// Simple hash (browser/Node compatible)
let hash = 0;
for (let i = 0; i < contentPayload.length; i++) {
  const char = contentPayload.charCodeAt(i);
  hash = (hash << 5) - hash + char;
  hash = hash & hash;
}
const snapshotId = `snapshot:${KERNEL_VERSION}:${Math.abs(hash).toString(16)}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Build final snapshot
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const snapshot = {
  kernelVersion: KERNEL_VERSION,
  snapshotId,
  generatedAt: new Date().toISOString(),
  counts: {
    concepts: CONCEPT_COUNT,
    valueSets: VALUESET_COUNT,
    values: VALUE_COUNT,
  },
  concepts,
  valueSets,
  values,
};

// Validate counts match actual
if (concepts.length !== CONCEPT_COUNT) {
  console.error(
    `❌ Concept count mismatch: expected ${CONCEPT_COUNT}, got ${concepts.length}`
  );
  process.exit(1);
}
if (valueSets.length !== VALUESET_COUNT) {
  console.error(
    `❌ ValueSet count mismatch: expected ${VALUESET_COUNT}, got ${valueSets.length}`
  );
  process.exit(1);
}
if (values.length !== VALUE_COUNT) {
  console.error(
    `❌ Value count mismatch: expected ${VALUE_COUNT}, got ${values.length}`
  );
  process.exit(1);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Write snapshot
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const outputPath = join(__dirname, "../packages/kernel/registry.snapshot.json");
writeFileSync(outputPath, JSON.stringify(snapshot, null, 2) + "\n");

console.log(`✅ Generated registry.snapshot.json`);
console.log(`   Version:    ${KERNEL_VERSION}`);
console.log(`   Snapshot:   ${snapshotId}`);
console.log(`   Concepts:   ${concepts.length}`);
console.log(`   ValueSets:  ${valueSets.length}`);
console.log(`   Values:     ${values.length}`);
console.log(`   Path:       ${outputPath}`);
