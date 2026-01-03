// @aibos/kernel - Version Compatibility Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect } from "vitest";
import {
  parseVersion,
  compareVersions,
  checkCompatibility,
  getCurrentKernelVersion,
  isMigrationNeeded,
} from "./version-compatibility.js";

describe("Version Compatibility", () => {
  describe("parseVersion", () => {
    it("should parse valid semantic version", () => {
      const parsed = parseVersion("1.2.3");
      expect(parsed.major).toBe(1);
      expect(parsed.minor).toBe(2);
      expect(parsed.patch).toBe(3);
    });

    it("should throw on invalid version format", () => {
      expect(() => parseVersion("invalid")).toThrow();
      expect(() => parseVersion("1.2")).toThrow();
      expect(() => parseVersion("1.2.3.4")).toThrow();
    });
  });

  describe("compareVersions", () => {
    it("should compare versions correctly", () => {
      expect(compareVersions("1.0.0", "1.0.1")).toBeLessThan(0);
      expect(compareVersions("1.0.1", "1.0.0")).toBeGreaterThan(0);
      expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
      expect(compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
    });
  });

  describe("checkCompatibility", () => {
    it("should return compatible for same version", () => {
      const result = checkCompatibility("1.0.0", "1.0.0");
      expect(result.safe).toBe(true);
      expect(result.breaking).toBe(false);
      expect(result.migrationRequired).toBe(false);
    });

    it("should return safe for patch version change", () => {
      const result = checkCompatibility("1.0.0", "1.0.1");
      expect(result.safe).toBe(true);
      expect(result.breaking).toBe(false);
    });

    it("should return safe for minor version change", () => {
      const result = checkCompatibility("1.0.0", "1.1.0");
      expect(result.safe).toBe(true);
      expect(result.breaking).toBe(false);
    });

    it("should return breaking for major version change", () => {
      const result = checkCompatibility("1.0.0", "2.0.0");
      expect(result.breaking).toBe(true);
      expect(result.migrationRequired).toBe(true);
    });
  });

  describe("getCurrentKernelVersion", () => {
    it("should return current kernel version", () => {
      const version = getCurrentKernelVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe("string");
      expect(version.match(/^\d+\.\d+\.\d+$/)).toBeTruthy();
    });
  });

  describe("isMigrationNeeded", () => {
    it("should return false for same version", () => {
      const current = getCurrentKernelVersion();
      expect(isMigrationNeeded(current)).toBe(false);
    });
  });
});

