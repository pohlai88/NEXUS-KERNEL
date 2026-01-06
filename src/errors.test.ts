import { describe, it, expect } from "vitest";
import { CanonError, type CanonErrorCode } from "./errors";

describe("errors", () => {
  describe("CanonError", () => {
    it("should create error with code and message", () => {
      const error = new CanonError("VALIDATION_FAILED", "Test error");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CanonError);
      expect(error.code).toBe("VALIDATION_FAILED");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("CanonError");
    });

    it("should include optional details", () => {
      const details = { field: "email", reason: "invalid format" };
      const error = new CanonError("VALIDATION_FAILED", "Test error", details);
      expect(error.details).toEqual(details);
    });

    it("should work without details", () => {
      const error = new CanonError("INTERNAL", "Something went wrong");
      expect(error.details).toBeUndefined();
    });

    it("should support all error codes", () => {
      const codes: CanonErrorCode[] = [
        "CANON_VIOLATION",
        "CONTRACT_MISMATCH",
        "POLICY_DENIED",
        "UNAUTHENTICATED",
        "UNAUTHORIZED",
        "NOT_FOUND",
        "CONFLICT",
        "VALIDATION_FAILED",
        "INTERNAL",
      ];

      codes.forEach((code) => {
        const error = new CanonError(code, `Error: ${code}`);
        expect(error.code).toBe(code);
      });
    });

    it("should convert to JSON", () => {
      const details = { field: "email" };
      const error = new CanonError("VALIDATION_FAILED", "Test error", details);
      const json = error.toJSON();

      expect(json).toEqual({
        code: "VALIDATION_FAILED",
        message: "Test error",
        details: details,
      });
    });

    it("should convert to JSON without details", () => {
      const error = new CanonError("INTERNAL", "Something went wrong");
      const json = error.toJSON();

      expect(json).toEqual({
        code: "INTERNAL",
        message: "Something went wrong",
        details: undefined,
      });
    });
  });
});

