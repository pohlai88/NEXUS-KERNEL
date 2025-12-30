// Vendor Contract - Proof module for PRD Phase 1
import { z } from "zod";
import { createContractSchema, validateOrThrow } from "./zod";
import { createStatusSet } from "./status";
import { createSchemaHeader } from "./schemaHeader";

export const VendorStatus = createStatusSet([
  "PENDING",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const);

export const VendorPayloadSchema = createContractSchema(
  "L3:VENDOR",
  "1.0.0",
  {
    legal_name: z.string().min(2).max(200),
    display_name: z.string().min(2).max(120).optional(),
    country_code: z.string().length(2), // ISO alpha-2
    email: z.string().email().optional(),
    phone: z.string().min(6).max(40).optional(),
    status: VendorStatus.schema.default("PENDING"),
    // Official identifiers ONLY (no typo aliases in L0)
    official_aliases: z
      .array(
        z.discriminatedUnion("type", [
          z.object({
            type: z.literal("SSM"),
            value: z.string().min(3).max(40),
            jurisdiction: z.literal("MY"),
          }),
          z.object({
            type: z.literal("TAX_ID"),
            value: z.string().min(3).max(60),
            jurisdiction: z.string().length(2),
          }),
        ])
      )
      .default([]),
  }
);

export type VendorPayload = z.infer<typeof VendorPayloadSchema>;

export function validateVendorPayload(input: unknown): VendorPayload {
  return validateOrThrow(VendorPayloadSchema, input);
}

// Canon constants for this contract
export const VENDOR_SCHEMA_ID = "L3:VENDOR";
export const VENDOR_SCHEMA_VERSION = "1.0.0";

