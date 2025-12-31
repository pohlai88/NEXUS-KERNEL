// Vendor Status Sets - L1 Domain
// Derived from @aibos/kernel primitives

import { createStatusSet } from "@aibos/kernel";

/**
 * Vendor Status Set
 *
 * Defines the lifecycle states for vendor records.
 */
export const VendorStatus = createStatusSet([
  "PENDING",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const);

/**
 * Vendor Type Classification
 *
 * Defines vendor types including employees as claimants (Shadow Vendor pattern).
 */
export const VendorType = createStatusSet([
  "SUPPLIER_EXTERNAL", // Acme Corp (External vendor)
  "SUPPLIER_INTERNAL", // Subsidiary B (Internal vendor)
  "EMPLOYEE_CLAIMANT", // John Doe (Staff - Shadow Vendor)
] as const);
