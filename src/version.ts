// @aibos/kernel - L0 Version Identity
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SSOT: Version law enforcement constants.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { CONCEPT, CONCEPT_COUNT } from "./concepts";
import { VALUE, VALUESET, VALUESET_COUNT, VALUE_COUNT } from "./values";

/**
 * KERNEL_VERSION - Semantic Version
 *
 * Must match:
 * - package.json version
 * - kernel_metadata.kernel_version in DB
 * - registry.snapshot.json snapshotVersion
 *
 * Semver Policy:
 * - PATCH = doc-only / tooling-only (no registry shape change)
 * - MINOR = new concept/value set/value (backwards compatible additive)
 * - MAJOR = rename/remove/change meaning (breaking change)
 */
export const KERNEL_VERSION = "1.1.0" as const;

/**
 * Compute deterministic snapshot ID from registry contents.
 * This ensures CI can detect any drift between package and DB.
 */
function computeSnapshotId(): string {
  const payload = JSON.stringify({
    version: KERNEL_VERSION,
    concepts: Object.values(CONCEPT).sort(),
    valueSets: Object.values(VALUESET).sort(),
    values: Object.entries(VALUE)
      .map(([setKey, values]) => ({
        set: setKey,
        values: Object.values(values).sort(),
      }))
      .sort((a, b) => a.set.localeCompare(b.set)),
  });

  // Simple hash (for browser/Node compatibility without crypto import)
  // In production, replace with crypto.createHash('sha256') if Node-only
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `snapshot:${KERNEL_VERSION}:${Math.abs(hash).toString(16)}`;
}

/**
 * SNAPSHOT_ID - Content Hash
 *
 * Changes when ANY concept, value set, or value changes.
 * Used for CI validation against kernel_metadata.snapshot_id.
 */
export const SNAPSHOT_ID = computeSnapshotId();

/**
 * Registry metadata for runtime validation
 */
export const KERNEL_REGISTRY_METADATA = {
  version: KERNEL_VERSION,
  snapshotId: SNAPSHOT_ID,
  counts: {
    concepts: CONCEPT_COUNT,
    valueSets: VALUESET_COUNT,
    values: VALUE_COUNT,
  },
  generatedAt: "2026-01-01T00:00:00.000Z",
} as const;

/**
 * Validate that kernel counts match expected values.
 * Throws if drift is detected.
 */
export function validateKernelIntegrity(): void {
  const conceptCount = Object.keys(CONCEPT).length;
  const valueSetCount = Object.keys(VALUESET).length;
  const valueCount = Object.values(VALUE).reduce(
    (sum, set) => sum + Object.keys(set).length,
    0
  );

  if (conceptCount !== CONCEPT_COUNT) {
    throw new Error(
      `Kernel drift: Expected ${CONCEPT_COUNT} concepts, found ${conceptCount}`
    );
  }
  if (valueSetCount !== VALUESET_COUNT) {
    throw new Error(
      `Kernel drift: Expected ${VALUESET_COUNT} value sets, found ${valueSetCount}`
    );
  }
  if (valueCount !== VALUE_COUNT) {
    throw new Error(
      `Kernel drift: Expected ${VALUE_COUNT} values, found ${valueCount}`
    );
  }
}

// Run integrity check at module load
validateKernelIntegrity();
