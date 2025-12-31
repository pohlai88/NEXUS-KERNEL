// Claim Status Sets - L1 Domain
// Derived from @aibos/kernel primitives

import { createStatusSet } from "@aibos/kernel";

/**
 * Claim Category Status Set
 *
 * The "Allowed List" - No more free-text "Miscellaneous"
 */
export const ClaimCategory = createStatusSet([
  "MEDICAL",
  "TRAVEL",
  "ENTERTAINMENT",
  "OFFICE_SUPPLIES",
  "FUEL",
  "MEALS",
  "ACCOMMODATION",
  "OTHER",
] as const);

/**
 * Claim Status Set
 *
 * Defines the lifecycle states for employee claims.
 */
export const ClaimStatus = createStatusSet([
  "DRAFT",
  "SUBMITTED",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "PAID",
  "CANCELLED",
] as const);
