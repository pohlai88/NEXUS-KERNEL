/**
 * L3 Integration Test: Kernel Snapshot Validation
 *
 * Validates snapshot-based drift detection behavior.
 * Exit codes:
 *   0 = no drift (clean)
 *   1 = drift detected (orphaned tokens)
 *   3 = snapshot file missing (documented contract)
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Kernel Snapshot Validation (L3)", () => {
  const snapshotPath = path.join(
    process.cwd(),
    "docs",
    "kernel",
    "registry.snapshot.json"
  );
  const snapshotBackupPath = path.join(
    process.cwd(),
    "docs",
    "kernel",
    "registry.snapshot.json.backup"
  );
  const portalDriftScript = path.join(
    process.cwd(),
    "apps",
    "portal",
    "scripts",
    "check-l0-drift.ts"
  );

  beforeAll(() => {
    // Backup existing snapshot
    if (fs.existsSync(snapshotPath)) {
      fs.copyFileSync(snapshotPath, snapshotBackupPath);
    }
  });

  afterAll(() => {
    // Restore snapshot
    if (fs.existsSync(snapshotBackupPath)) {
      fs.copyFileSync(snapshotBackupPath, snapshotPath);
      fs.unlinkSync(snapshotBackupPath);
    }
  });

  it("should exit with code 3 when snapshot file is missing", () => {
    // Temporarily remove snapshot
    if (fs.existsSync(snapshotPath)) {
      fs.unlinkSync(snapshotPath);
    }

    try {
      execSync(`node --loader tsx ${portalDriftScript} --snapshot`, {
        stdio: "pipe",
        cwd: path.join(process.cwd(), "apps", "portal"),
      });

      expect.fail("Script should exit with code 3 when snapshot missing");
    } catch (error: any) {
      // Expect exit code 3 (snapshot missing)
      expect(error.status).toBe(3);
    }
  });

  it("should validate snapshot structure when present", () => {
    // Restore snapshot
    if (fs.existsSync(snapshotBackupPath)) {
      fs.copyFileSync(snapshotBackupPath, snapshotPath);
    }

    // Read snapshot
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));

    // Validate structure
    expect(snapshot).toHaveProperty("concepts");
    expect(snapshot).toHaveProperty("valueSets");
    expect(snapshot).toHaveProperty("valuesBySet");
    expect(snapshot).toHaveProperty("snapshotVersion");
    expect(snapshot).toHaveProperty("exportedAt");

    expect(Array.isArray(snapshot.concepts)).toBe(true);
    expect(Array.isArray(snapshot.valueSets)).toBe(true);
    expect(typeof snapshot.valuesBySet).toBe("object");
    expect(snapshot.snapshotVersion).toBe("1.0.0");
  });

  it("should run clean drift check with valid snapshot", () => {
    // Restore snapshot
    if (fs.existsSync(snapshotBackupPath)) {
      fs.copyFileSync(snapshotBackupPath, snapshotPath);
    }

    try {
      const output = execSync(
        `node --loader tsx ${portalDriftScript} --snapshot`,
        {
          stdio: "pipe",
          cwd: path.join(process.cwd(), "apps", "portal"),
        }
      );

      expect(output.toString()).toContain("0 concept");
      expect(output.toString()).toContain("0 valueset");
    } catch (error: any) {
      expect.fail(`Snapshot validation failed: ${error.message}`);
    }
  });
});
