import { describe, it, expect } from "vitest";
import {
  AIBOS_DESIGN_SYSTEM,
  DESIGN_SYSTEM_SSOT,
  DesignSystemConcept,
} from "./design_system";

describe("design_system", () => {
  describe("AIBOS_DESIGN_SYSTEM", () => {
    it("should export a concept definition", () => {
      expect(AIBOS_DESIGN_SYSTEM).toBeDefined();
      expect(AIBOS_DESIGN_SYSTEM.id).toBe("concept_design_system_aibos");
      expect(AIBOS_DESIGN_SYSTEM.name).toBe("AIBOS Design System");
      expect(AIBOS_DESIGN_SYSTEM.description).toContain("Single Source of Truth");
      expect(AIBOS_DESIGN_SYSTEM.version).toBe("1.1.0");
    });

    it("should have correct concept structure", () => {
      expect(AIBOS_DESIGN_SYSTEM).toHaveProperty("id");
      expect(AIBOS_DESIGN_SYSTEM).toHaveProperty("name");
      expect(AIBOS_DESIGN_SYSTEM).toHaveProperty("description");
      expect(AIBOS_DESIGN_SYSTEM).toHaveProperty("version");
    });
  });

  describe("DESIGN_SYSTEM_SSOT", () => {
    it("should be an alias for AIBOS_DESIGN_SYSTEM", () => {
      expect(DESIGN_SYSTEM_SSOT).toBe(AIBOS_DESIGN_SYSTEM);
    });
  });

  describe("DesignSystemConcept", () => {
    it("should be an alias for AIBOS_DESIGN_SYSTEM", () => {
      expect(DesignSystemConcept).toBe(AIBOS_DESIGN_SYSTEM);
    });
  });
});

