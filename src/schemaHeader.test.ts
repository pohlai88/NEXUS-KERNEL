/**
 * Kernel Package Tests
 *
 * Tests for the core @nexus/kernel functionality including:
 * - Schema header creation
 * - Canon ID validation
 * - Status set creation
 * - Contract schema creation
 */

import { describe, expect, it } from "vitest";
import type { CanonId } from "../src/canonId";
import {
  createSchemaHeader,
  SchemaHeader,
  SchemaVersion,
} from "../src/schemaHeader";

describe("SchemaVersion", () => {
  it("should accept valid semantic versions", () => {
    expect(SchemaVersion.parse("1.0.0")).toBe("1.0.0");
    expect(SchemaVersion.parse("2.3.4")).toBe("2.3.4");
    expect(SchemaVersion.parse("10.20.30")).toBe("10.20.30");
  });

  it("should reject invalid versions", () => {
    expect(() => SchemaVersion.parse("1.0")).toThrow();
    expect(() => SchemaVersion.parse("v1.0.0")).toThrow();
    expect(() => SchemaVersion.parse("1.0.0-alpha")).toThrow();
    expect(() => SchemaVersion.parse("invalid")).toThrow();
  });
});

describe("createSchemaHeader", () => {
  it("should create a valid schema header", () => {
    const header = createSchemaHeader("NEXUS:INVOICE:1" as CanonId, "1.0.0", {
      created_by: "system",
      reason: "test creation",
    });

    expect(header._schema_id).toBe("NEXUS:INVOICE:1");
    expect(header._schema_version).toBe("1.0.0");
    expect(header._context.created_by).toBe("system");
    expect(header._context.reason).toBe("test creation");
    expect(header.type).toBe("invoice");
  });

  it("should use provided created_at date", () => {
    const customDate = new Date("2024-01-15T10:00:00Z");
    const header = createSchemaHeader("NEXUS:PAYMENT:1" as CanonId, "2.0.0", {
      created_by: "user@example.com",
      created_at: customDate,
    });

    expect(header._context.created_at).toBe("2024-01-15T10:00:00.000Z");
  });

  it("should extract type from schema ID", () => {
    const invoiceHeader = createSchemaHeader(
      "NEXUS:INVOICE:1" as CanonId,
      "1.0.0",
      { created_by: "test" }
    );
    const paymentHeader = createSchemaHeader(
      "NEXUS:PAYMENT:1" as CanonId,
      "1.0.0",
      { created_by: "test" }
    );
    const vendorHeader = createSchemaHeader(
      "NEXUS:VENDOR:1" as CanonId,
      "1.0.0",
      { created_by: "test" }
    );

    expect(invoiceHeader.type).toBe("invoice");
    expect(paymentHeader.type).toBe("payment");
    expect(vendorHeader.type).toBe("vendor");
  });

  it("should handle schema ID without colon separator", () => {
    // This tests the ?? "unknown" fallback when split(":")[1] is undefined
    const header = createSchemaHeader(
      "INVALID_SCHEMA_ID" as CanonId,
      "1.0.0",
      { created_by: "test" }
    );
    expect(header.type).toBe("unknown");
  });

  it("should handle optional context fields", () => {
    const header = createSchemaHeader("NEXUS:GRN:1" as CanonId, "1.0.0", {
      created_by: "system",
      updated_by: "admin",
      updated_at: new Date("2024-01-20T15:00:00Z"),
      source: "api",
    });

    expect(header._context.updated_by).toBe("admin");
    expect(header._context.updated_at).toBe("2024-01-20T15:00:00.000Z");
    expect(header._context.source).toBe("api");
  });
});

describe("SchemaHeader validation", () => {
  it("should validate a complete schema header", () => {
    // Use createSchemaHeader to ensure we get the correct format
    const validHeader = createSchemaHeader("NEXUS:TEST:1" as CanonId, "1.0.0", {
      created_by: "system",
    });

    const result = SchemaHeader.safeParse(validHeader);
    expect(result.success).toBe(true);
  });

  it("should reject invalid schema header", () => {
    const invalidHeader = {
      _schema_id: "invalid-id", // Missing colon format
      _schema_version: "1.0", // Missing patch version
      _context: {},
      type: "test",
    };

    const result = SchemaHeader.safeParse(invalidHeader);
    expect(result.success).toBe(false);
  });
});
