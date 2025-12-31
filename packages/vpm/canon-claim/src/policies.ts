// Claim Policy Limits - L1 Domain Policy Configuration
//
// These limits are enforced by the Code Gate (policy hooks).
// This is DOMAIN LOGIC - it does NOT belong in Kernel (L0).

/**
 * Claim Policy Limits
 *
 * Defines per-category limits and auto-approval rules.
 */
export const CLAIM_POLICY_LIMITS = {
  MEDICAL: { max_per_claim: 500, max_per_year: 2000 },
  TRAVEL: { max_per_claim: 5000, max_per_year: 20000 },
  ENTERTAINMENT: { max_per_claim: 200, max_per_year: 1000 },
  OFFICE_SUPPLIES: { max_per_claim: 50, auto_approve: true }, // Auto-approve under $50
  FUEL: { max_per_claim: 200, requires_odometer: true },
  MEALS: { max_per_claim: 100, max_per_day: 50 },
  ACCOMMODATION: { max_per_claim: 300, max_per_night: 150 },
  OTHER: { max_per_claim: 500, requires_approval: true },
} as const;

export type ClaimCategoryKey = keyof typeof CLAIM_POLICY_LIMITS;
export type ClaimPolicyConfig = (typeof CLAIM_POLICY_LIMITS)[ClaimCategoryKey];
