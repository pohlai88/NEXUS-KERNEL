import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateOrThrow, createContractSchema } from "./zod";
import { CanonError } from "./errors";

describe("zod", () => {
  describe("validateOrThrow", () => {
    it("should return valid data when schema passes", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const input = { name: "John", age: 30 };
      const result = validateOrThrow(schema, input);

      expect(result).toEqual(input);
    });

    it("should throw CanonError when validation fails", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const input = { name: "John", age: "invalid" };

      expect(() => validateOrThrow(schema, input)).toThrow(CanonError);
      try {
        validateOrThrow(schema, input);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.code).toBe("VALIDATION_FAILED");
        }
      }
    });

    it("should include error details in thrown error", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const input = { email: "not-an-email" };

      try {
        validateOrThrow(schema, input);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CanonError);
        if (error instanceof CanonError) {
          expect(error.code).toBe("VALIDATION_FAILED");
          expect(error.message).toContain("Schema validation failed");
          expect(error.details).toBeDefined();
          if (error.details && typeof error.details === "object") {
            expect(error.details).toHaveProperty("errors");
          }
        }
      }
    });

    it("should work with nested schemas", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          profile: z.object({
            age: z.number(),
          }),
        }),
      });

      const input = {
        user: {
          name: "John",
          profile: {
            age: 30,
          },
        },
      };

      const result = validateOrThrow(schema, input);
      expect(result).toEqual(input);
    });

    it("should work with array schemas", () => {
      const schema = z.array(z.string());

      const input = ["a", "b", "c"];
      const result = validateOrThrow(schema, input);

      expect(result).toEqual(input);
    });
  });

  describe("createContractSchema", () => {
    it("should create a contract schema with header fields", () => {
      const schema = createContractSchema(
        "TEST_SCHEMA",
        "1.0.0",
        {
          name: z.string(),
          value: z.number(),
        }
      );

      const validInput = {
        _schema_id: "TEST_SCHEMA",
        _schema_version: "1.0.0",
        _context: {
          created_by: "user1",
          created_at: "2024-01-01T00:00:00Z",
        },
        type: "test",
        name: "Test",
        value: 42,
      };

      const result = schema.parse(validInput);
      expect(result._schema_id).toBe("TEST_SCHEMA");
      expect(result._schema_version).toBe("1.0.0");
      expect(result.name).toBe("Test");
      expect(result.value).toBe(42);
    });

    it("should include optional context fields", () => {
      const schema = createContractSchema("TEST_SCHEMA", "1.0.0", {});

      const input = {
        _schema_id: "TEST_SCHEMA",
        _schema_version: "1.0.0",
        _context: {
          created_by: "user1",
          created_at: "2024-01-01T00:00:00Z",
          updated_by: "user2",
          updated_at: "2024-01-02T00:00:00Z",
          reason: "Update",
          source: "API",
        },
        type: "test",
      };

      const result = schema.parse(input);
      expect(result._context.updated_by).toBe("user2");
      expect(result._context.updated_at).toBe("2024-01-02T00:00:00Z");
      expect(result._context.reason).toBe("Update");
      expect(result._context.source).toBe("API");
    });

    it("should validate required header fields", () => {
      const schema = createContractSchema("TEST_SCHEMA", "1.0.0", {});

      const invalidInput = {
        _schema_id: "TEST_SCHEMA",
        // Missing _schema_version
        _context: {
          created_by: "user1",
          created_at: "2024-01-01T00:00:00Z",
        },
        type: "test",
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it("should validate context fields", () => {
      const schema = createContractSchema("TEST_SCHEMA", "1.0.0", {});

      const invalidInput = {
        _schema_id: "TEST_SCHEMA",
        _schema_version: "1.0.0",
        _context: {
          // Missing required fields
        },
        type: "test",
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it("should validate custom fields", () => {
      const schema = createContractSchema(
        "TEST_SCHEMA",
        "1.0.0",
        {
          count: z.number().min(0),
        }
      );

      const invalidInput = {
        _schema_id: "TEST_SCHEMA",
        _schema_version: "1.0.0",
        _context: {
          created_by: "user1",
          created_at: "2024-01-01T00:00:00Z",
        },
        type: "test",
        count: -1, // Invalid: negative number
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it("should work with complex nested fields", () => {
      const schema = createContractSchema(
        "TEST_SCHEMA",
        "1.0.0",
        {
          metadata: z.object({
            tags: z.array(z.string()),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
          }),
        }
      );

      const validInput = {
        _schema_id: "TEST_SCHEMA",
        _schema_version: "1.0.0",
        _context: {
          created_by: "user1",
          created_at: "2024-01-01T00:00:00Z",
        },
        type: "test",
        metadata: {
          tags: ["tag1", "tag2"],
          priority: "HIGH" as const,
        },
      };

      const result = schema.parse(validInput);
      expect(result.metadata.tags).toEqual(["tag1", "tag2"]);
      expect(result.metadata.priority).toBe("HIGH");
    });
  });
});

