// @aibos/kernel - Version Compatibility Matrix
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Semantic versioning compatibility matrix for kernel migrations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { VersionCompatibility } from "./types.js";
import { KERNEL_VERSION } from "../version.js";

/**
 * Version compatibility matrix
 * 
 * Defines compatibility between kernel versions for migration planning.
 * 
 * Rules:
 * - PATCH (1.1.0 -> 1.1.1): Always safe, no migration required
 * - MINOR (1.1.0 -> 1.2.0): Usually safe, migration may be required for new features
 * - MAJOR (1.1.0 -> 2.0.0): Breaking changes, migration required
 */
export const VERSION_COMPATIBILITY_MATRIX: VersionCompatibility[] = [
  // Example: 1.0.0 -> 1.1.0 (minor version, safe)
  {
    from: "1.0.0",
    to: "1.1.0",
    breaking: false,
    safe: true,
    migrationRequired: false,
    deprecations: [],
  },
  // Example: 1.1.0 -> 1.2.0 (minor version, safe with optional migration)
  {
    from: "1.1.0",
    to: "1.2.0",
    breaking: false,
    safe: true,
    migrationRequired: false,
    deprecations: [],
  },
  // Example: 1.0.0 -> 2.0.0 (major version, breaking)
  {
    from: "1.0.0",
    to: "2.0.0",
    breaking: true,
    safe: false,
    migrationRequired: true,
    deprecations: [],
    migrationScript: "migrate-1.0.0-to-2.0.0",
  },
];

/**
 * Parse semantic version
 * 
 * @param version - Semantic version string (e.g., "1.2.3")
 * @returns Parsed version parts
 */
export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${version}. Expected semver (e.g., 1.2.3)`);
  }
  return {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
  };
}

/**
 * Compare two versions
 * 
 * @param v1 - First version
 * @param v2 - Second version
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);
  
  if (parsed1.major !== parsed2.major) {
    return parsed1.major - parsed2.major;
  }
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor - parsed2.minor;
  }
  return parsed1.patch - parsed2.patch;
}

/**
 * Check if version is compatible
 * 
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @returns Compatibility information
 */
export function checkCompatibility(
  fromVersion: string,
  toVersion: string
): VersionCompatibility {
  // Same version - always compatible
  if (fromVersion === toVersion) {
    return {
      from: fromVersion,
      to: toVersion,
      breaking: false,
      safe: true,
      migrationRequired: false,
      deprecations: [],
    };
  }
  
  // Check matrix for exact match
  const exactMatch = VERSION_COMPATIBILITY_MATRIX.find(
    (entry) => entry.from === fromVersion && entry.to === toVersion
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Parse versions
  const from = parseVersion(fromVersion);
  const to = parseVersion(toVersion);
  
  // Determine compatibility based on semver rules
  const isMajor = to.major > from.major;
  const isMinor = to.major === from.major && to.minor > from.minor;
  const isPatch = to.major === from.major && to.minor === from.minor && to.patch > from.patch;
  const isDowngrade = compareVersions(fromVersion, toVersion) > 0;
  
  // Major version change - breaking
  if (isMajor) {
    return {
      from: fromVersion,
      to: toVersion,
      breaking: true,
      safe: false,
      migrationRequired: true,
      deprecations: [],
    };
  }
  
  // Minor version change - usually safe
  if (isMinor) {
    return {
      from: fromVersion,
      to: toVersion,
      breaking: false,
      safe: true,
      migrationRequired: false,
      deprecations: [],
    };
  }
  
  // Patch version change - always safe
  if (isPatch) {
    return {
      from: fromVersion,
      to: toVersion,
      breaking: false,
      safe: true,
      migrationRequired: false,
      deprecations: [],
    };
  }
  
  // Downgrade - not recommended but possible
  if (isDowngrade) {
    return {
      from: fromVersion,
      to: toVersion,
      breaking: true,
      safe: false,
      migrationRequired: true,
      deprecations: [],
    };
  }
  
  // Unknown - assume unsafe
  return {
    from: fromVersion,
    to: toVersion,
    breaking: true,
    safe: false,
    migrationRequired: true,
    deprecations: [],
  };
}

/**
 * Get current kernel version
 * 
 * @returns Current kernel version
 */
export function getCurrentKernelVersion(): string {
  return KERNEL_VERSION;
}

/**
 * Check if migration is needed from current version
 * 
 * @param targetVersion - Target version
 * @returns Whether migration is needed
 */
export function isMigrationNeeded(targetVersion: string): boolean {
  const current = getCurrentKernelVersion();
  const compatibility = checkCompatibility(current, targetVersion);
  return compatibility.migrationRequired;
}

