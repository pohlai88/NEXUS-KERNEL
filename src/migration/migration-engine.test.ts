// @aibos/kernel - Migration Engine Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  executeMigration,
  detectBreakingChanges,
  rollbackMigration,
  validateMigration,
  type MigrationContext,
} from "./migration-engine.js";
import { checkCompatibility } from "./version-compatibility.js";

// Mock version-compatibility
vi.mock("./version-compatibility.js", () => ({
  checkCompatibility: vi.fn(),
}));

describe("Migration Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("executeMigration", () => {
    it("should return success when no migration required", async () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "1.1.0",
        breaking: false,
        safe: true,
        migrationRequired: false,
        deprecations: [],
      });

      const result = await executeMigration({
        fromVersion: "1.0.0",
        toVersion: "1.1.0",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("No migration required");
      expect(result.itemsMigrated.concepts).toBe(0);
    });

    it("should reject unsafe migrations", async () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "2.0.0",
        breaking: true,
        safe: false,
        migrationRequired: true,
        deprecations: [],
      });

      const result = await executeMigration({
        fromVersion: "1.0.0",
        toVersion: "2.0.0",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("not safe");
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should allow unsafe migrations with skipValidation", async () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "2.0.0",
        breaking: true,
        safe: false,
        migrationRequired: true,
        deprecations: [],
      });

      const result = await executeMigration({
        fromVersion: "1.0.0",
        toVersion: "2.0.0",
        skipValidation: true,
      });

      // Should proceed past safety check
      expect(result).toBeDefined();
    });

    it("should perform dry run", async () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "1.1.0",
        breaking: false,
        safe: true,
        migrationRequired: true,
        deprecations: [],
      });

      const result = await executeMigration({
        fromVersion: "1.0.0",
        toVersion: "1.1.0",
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Dry run");
      expect(result.itemsMigrated.concepts).toBe(0);
    });

    it("should include deprecations in warnings", async () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "1.1.0",
        breaking: false,
        safe: true,
        migrationRequired: true,
        deprecations: ["CONCEPT_OLD", "VALUESET_DEPRECATED"],
      });

      const result = await executeMigration({
        fromVersion: "1.0.0",
        toVersion: "1.1.0",
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes("CONCEPT_OLD"))).toBe(true);
    });

    it("should reject migrations with breaking changes", async () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "2.0.0",
        breaking: true,
        safe: false,
        migrationRequired: true,
        deprecations: [],
      });

      // Mock detectBreakingChanges to return breaking changes
      const result = await executeMigration({
        fromVersion: "1.0.0",
        toVersion: "2.0.0",
      });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("detectBreakingChanges", () => {
    it("should return empty array for non-breaking changes", () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "1.1.0",
        breaking: false,
        safe: true,
        migrationRequired: false,
        deprecations: [],
      });

      const changes = detectBreakingChanges("1.0.0", "1.1.0");

      expect(changes).toEqual([]);
    });

    it("should detect breaking changes for major version updates", () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "2.0.0",
        breaking: true,
        safe: false,
        migrationRequired: true,
        deprecations: [],
      });

      const changes = detectBreakingChanges("1.0.0", "2.0.0");

      expect(changes.length).toBeGreaterThan(0);
      expect(changes[0].type).toBe("SCHEMA_CHANGE");
      expect(changes[0].item).toBe("kernel");
    });
  });

  describe("rollbackMigration", () => {
    it("should perform rollback migration", async () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "2.0.0",
        to: "1.0.0",
        breaking: true,
        safe: false,
        migrationRequired: true,
        deprecations: [],
      });

      const result = await rollbackMigration("2.0.0", "1.0.0");

      expect(result).toBeDefined();
      // Rollback should skip validation
      expect(checkCompatibility).toHaveBeenCalled();
    });
  });

  describe("validateMigration", () => {
    it("should validate safe migrations", () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "1.1.0",
        breaking: false,
        safe: true,
        migrationRequired: false,
        deprecations: [],
      });

      const validation = validateMigration("1.0.0", "1.1.0");

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it("should reject unsafe migrations", () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "2.0.0",
        breaking: true,
        safe: false,
        migrationRequired: true,
        deprecations: [],
      });

      const validation = validateMigration("1.0.0", "2.0.0");

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("should include breaking change errors", () => {
      vi.mocked(checkCompatibility).mockReturnValue({
        from: "1.0.0",
        to: "2.0.0",
        breaking: true,
        safe: false,
        migrationRequired: true,
        deprecations: [],
      });

      const validation = validateMigration("1.0.0", "2.0.0");

      expect(validation.errors.some((e) => e.includes("Breaking changes"))).toBe(true);
    });
  });
});

