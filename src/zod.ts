import { z } from "zod";
import { CanonError } from "./errors";
import { SchemaHeader } from "./schemaHeader";

/**
 * Validates input against a Zod schema and throws CanonError on failure.
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new CanonError(
      "VALIDATION_FAILED",
      `Schema validation failed: ${result.error.message}`,
      { errors: result.error.errors }
    );
  }
  return result.data;
}

/**
 * Creates a contract schema by extending SchemaHeader with additional fields.
 */
export function createContractSchema<T extends z.ZodRawShape>(
  schemaId: string,
  schemaVersion: string,
  fields: T
): z.ZodObject<{
  _schema_id: z.ZodString;
  _schema_version: z.ZodString;
  _context: z.ZodObject<{
    created_by: z.ZodString;
    created_at: z.ZodString;
    updated_by: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
  }>;
  type: z.ZodString;
} & T> {
  return SchemaHeader.extend(fields) as z.ZodObject<{
    _schema_id: z.ZodString;
    _schema_version: z.ZodString;
    _context: z.ZodObject<{
      created_by: z.ZodString;
      created_at: z.ZodString;
      updated_by: z.ZodOptional<z.ZodString>;
      updated_at: z.ZodOptional<z.ZodString>;
      reason: z.ZodOptional<z.ZodString>;
      source: z.ZodOptional<z.ZodString>;
    }>;
    type: z.ZodString;
  } & T>;
}

