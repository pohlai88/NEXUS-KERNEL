// Employee Claim Schemas - L1 Domain Contract
// Derived from @aibos/kernel primitives

import { z } from "zod";
import { ClaimCategory, ClaimStatus } from "./status";

/**
 * Employee Claim Contract Schema
 *
 * Defines the structure for employee claims (treating them as invoices).
 *
 * Shadow Vendor Pattern:
 * - Employee = Vendor (L0)
 * - Claims as Invoices: Same database table, same process.
 */
export const EmployeeClaimSchema = z.object({
  // Employee Identity (Links to Vendor Profile)
  employee_id: z.string().uuid(), // Links to auth.users.id
  employee_vendor_id: z.string().uuid(), // Links to vmp_vendors.id (auto-created)

  // Claim Details
  amount: z.number().positive({ message: "Amount must be positive" }),
  category: z.enum(ClaimCategory.values as [string, ...string[]]),
  merchant_name: z.string().min(1, "Merchant name is required"),
  claim_date: z.string().datetime(), // ISO 8601

  // THE EVIDENCE (Required - "No Receipt, No Coin")
  receipt_url: z.string().url({ message: "Receipt URL is required" }),
  receipt_file_id: z.string().uuid().optional(), // Links to documents table

  // Context specific to claim type
  metadata: z
    .object({
      attendees: z.array(z.string()).optional(), // Required for Entertainment
      odometer_start: z.number().optional(), // Required for Fuel/Mileage
      odometer_end: z.number().optional(),
      odometer_photo_url: z.string().url().optional(), // Required for Fuel
      destination: z.string().optional(), // For Travel
      purpose: z.string().optional(), // Business purpose
      currency_code: z.string().default("USD"),
    })
    .optional(),

  // Multi-Company Support (Federation)
  charge_to_tenant_id: z.string().uuid().optional(), // Charge to different subsidiary

  // Status
  status: z.enum(ClaimStatus.values as [string, ...string[]]).default("DRAFT"),
});

export type EmployeeClaimPayload = z.infer<typeof EmployeeClaimSchema>;
