/**
 * L3 Integration Test: Kernel Drift Detection
 *
 * Validates that drift detection scripts correctly identify orphaned tokens.
 * Exit codes:
 *   0 = no drift (clean)
 *   1 = drift detected (orphaned tokens found)
 */

/* eslint-disable @nexus/canon/no-kernel-string-literals -- Test fixtures require raw identifiers */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { afterAll, describe, expect, it } from "vitest";

describe("Kernel Drift Detection (L3)", () => {
  const testFilePath = path.join(process.cwd(), "__test-drift-file.ts");
  const rootDriftScript = path.join(
    process.cwd(),
    "scripts",
    "audit-kernel-drift.ts"
  );

  afterAll(() => {
    // Cleanup test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it("should detect orphaned CONCEPT_ token and exit with code 1", () => {
    // Create test file with fake token
    fs.writeFileSync(
      testFilePath,
      `
      // Test file with orphaned token
      const fakeToken = "CONCEPT_FAKE_XYZ_NOT_IN_REGISTRY";
    `
    );

    try {
      // Run root drift detection script
      execSync(`node --loader tsx ${rootDriftScript}`, {
        stdio: "pipe",
        cwd: process.cwd(),
      });

      // If we get here, drift was NOT detected (test should fail)
      expect.fail(
        "Drift script should have detected CONCEPT_FAKE_XYZ_NOT_IN_REGISTRY"
      );
    } catch (error: any) {
      // Expect exit code 1 (drift detected)
      expect(error.status).toBe(1);
      expect(error.stdout?.toString()).toContain(
        "CONCEPT_FAKE_XYZ_NOT_IN_REGISTRY"
      );
    }
  });

  it("should detect orphaned VALUESET_ token and exit with code 1", () => {
    // Create test file with fake valueset
    fs.writeFileSync(
      testFilePath,
      `
      // Test file with orphaned valueset
      const fakeValueSet = "VALUESET_GLOBAL_FAKE_XYZ";
    `
    );

    try {
      execSync(`node --loader tsx ${rootDriftScript}`, {
        stdio: "pipe",
        cwd: process.cwd(),
      });

      expect.fail("Drift script should have detected VALUESET_GLOBAL_FAKE_XYZ");
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stdout?.toString()).toContain("VALUESET_GLOBAL_FAKE_XYZ");
    }
  });

  it("should exit with code 0 when no drift (clean state)", () => {
    // Remove test file to ensure clean state
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    try {
      const output = execSync(`node --loader tsx ${rootDriftScript}`, {
        stdio: "pipe",
        cwd: process.cwd(),
      });

      expect(output.toString()).toContain("0 orphan");
    } catch (error: any) {
      // Should not throw in clean state
      expect.fail(`Drift script failed in clean state: ${error.message}`);
    }
  });
});
