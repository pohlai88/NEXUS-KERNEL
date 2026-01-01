import { z } from "zod";
import { CanonId } from "./canonId";

export const SchemaVersion = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "Schema version must be semantic (x.y.z)");

export type SchemaVersion = z.infer<typeof SchemaVersion>;

export const SchemaHeader = z.object({
  _schema_id: CanonId,
  _schema_version: SchemaVersion,
  _context: z.object({
    created_by: z.string(),
    created_at: z.string().datetime(),
    updated_by: z.string().optional(),
    updated_at: z.string().datetime().optional(),
    reason: z.string().optional(),
    source: z.string().optional(),
  }),
  type: z.string(),
});

export type SchemaHeader = z.infer<typeof SchemaHeader>;

export function createSchemaHeader(
  schemaId: CanonId,
  schemaVersion: SchemaVersion,
  context: {
    created_by: string;
    created_at?: Date;
    updated_by?: string;
    updated_at?: Date;
    reason?: string;
    source?: string;
  }
): SchemaHeader {
  const now = new Date().toISOString();
  return {
    _schema_id: schemaId,
    _schema_version: schemaVersion,
    _context: {
      created_by: context.created_by,
      created_at: context.created_at?.toISOString() ?? now,
      updated_by: context.updated_by,
      updated_at: context.updated_at?.toISOString(),
      reason: context.reason,
      source: context.source,
    },
    type: schemaId.split(":")[1]?.toLowerCase() ?? "unknown",
  };
}

