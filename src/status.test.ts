import { describe, it, expect } from "vitest";
import { createStatusSet, type StatusSet } from "./status";

describe("status", () => {
  describe("createStatusSet", () => {
    it("should create a status set with valid values", () => {
      const statusSet = createStatusSet(["DRAFT", "PUBLISHED", "ARCHIVED"] as const);

      expect(statusSet).toBeDefined();
      expect(statusSet.values).toEqual(["DRAFT", "PUBLISHED", "ARCHIVED"]);
      expect(statusSet.schema).toBeDefined();
    });

    it("should parse valid values", () => {
      const statusSet = createStatusSet(["ACTIVE", "INACTIVE"] as const);

      expect(statusSet.parse("ACTIVE")).toBe("ACTIVE");
      expect(statusSet.parse("INACTIVE")).toBe("INACTIVE");
    });

    it("should reject invalid values", () => {
      const statusSet = createStatusSet(["ACTIVE", "INACTIVE"] as const);

      expect(() => statusSet.parse("INVALID")).toThrow();
    });

    it("should use safeParse for validation", () => {
      const statusSet = createStatusSet(["OPEN", "CLOSED"] as const);

      const validResult = statusSet.safeParse("OPEN");
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data).toBe("OPEN");
      }

      const invalidResult = statusSet.safeParse("INVALID");
      expect(invalidResult.success).toBe(false);
    });

    it("should check if value is in set", () => {
      const statusSet = createStatusSet(["PENDING", "APPROVED", "REJECTED"] as const);

      expect(statusSet.is("PENDING")).toBe(true);
      expect(statusSet.is("APPROVED")).toBe(true);
      expect(statusSet.is("REJECTED")).toBe(true);
      expect(statusSet.is("INVALID")).toBe(false);
    });

    it("should throw error for empty values array", () => {
      expect(() => createStatusSet([] as unknown as readonly string[])).toThrow(
        "Status set must have at least one value"
      );
    });

    it("should work with single value", () => {
      const statusSet = createStatusSet(["SINGLE"] as const);

      expect(statusSet.parse("SINGLE")).toBe("SINGLE");
      expect(() => statusSet.parse("OTHER")).toThrow();
      expect(statusSet.is("SINGLE")).toBe(true);
      expect(statusSet.is("OTHER")).toBe(false);
    });

    it("should preserve readonly array type", () => {
      const values = ["A", "B", "C"] as const;
      const statusSet = createStatusSet(values);

      expect(statusSet.values).toBe(values);
    });
  });

  describe("StatusSet type", () => {
    it("should have correct type structure", () => {
      const statusSet: StatusSet<readonly ["A", "B"]> = createStatusSet(["A", "B"] as const);

      expect(statusSet.schema).toBeDefined();
      expect(statusSet.values).toBeDefined();
      expect(statusSet.parse).toBeDefined();
      expect(statusSet.safeParse).toBeDefined();
      expect(statusSet.is).toBeDefined();
    });
  });
});

