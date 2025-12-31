/**
 * L1 Domain: Claim Policy Engine
 *
 * The Code Gate: Policy hooks that run before database write.
 * Replaces Google Sheets mapping hell with automated validation.
 */

import { createClient } from "@/lib/supabase-client";
import {
  CLAIM_POLICY_LIMITS,
  type EmployeeClaimPayload,
} from "@nexus/canon-claim";

export interface PolicyValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  auto_approve: boolean;
}

export interface PolicyCheckContext {
  employee_id: string;
  tenant_id: string;
  charge_to_tenant_id?: string;
  year: number;
}

export class ClaimPolicyEngine {
  private supabase = createClient();

  /**
   * Validate claim against policy (Code Gate)
   *
   * This runs BEFORE database write. Bad claims never enter the system.
   */
  async validateClaim(
    claim: EmployeeClaimPayload,
    context: PolicyCheckContext
  ): Promise<PolicyValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let autoApprove = false;

    // Gate 1: Check Category Limits
    const categoryLimit =
      CLAIM_POLICY_LIMITS[claim.category as keyof typeof CLAIM_POLICY_LIMITS];
    if (!categoryLimit) {
      errors.push(`Invalid claim category: ${claim.category}`);
      return { passed: false, errors, warnings, auto_approve: false };
    }

    // Check per-claim limit
    if (
      categoryLimit.max_per_claim &&
      claim.amount > categoryLimit.max_per_claim
    ) {
      errors.push(
        `GATE_BLOCK: Claim exceeds $${categoryLimit.max_per_claim} limit for ${claim.category}. Request rejected.`
      );
    }

    // Check auto-approve threshold (only for categories with auto_approve flag)
    if (
      "auto_approve" in categoryLimit &&
      categoryLimit.auto_approve &&
      claim.amount <= 50
    ) {
      autoApprove = true;
    }

    // Gate 2: Check Annual Limits (only for categories with max_per_year)
    if ("max_per_year" in categoryLimit && categoryLimit.max_per_year) {
      const annualTotal = await this.getAnnualTotal(
        context.employee_id,
        claim.category,
        context.year,
        context.charge_to_tenant_id || context.tenant_id
      );

      if (annualTotal + claim.amount > categoryLimit.max_per_year) {
        errors.push(
          `GATE_BLOCK: Annual limit for ${claim.category} is $${
            categoryLimit.max_per_year
          }. Current total: $${annualTotal.toFixed(
            2
          )}. This claim would exceed limit.`
        );
      }
    }

    // Gate 3: Check Evidence Requirements
    if (claim.category === "ENTERTAINMENT") {
      if (!claim.metadata?.attendees || claim.metadata.attendees.length === 0) {
        errors.push(
          `GATE_BLOCK: Entertainment claims must list attendees. No hiding drinking buddies.`
        );
      }
    }

    const requiresOdometer =
      "requires_odometer" in categoryLimit && categoryLimit.requires_odometer;
    if (claim.category === "FUEL" || requiresOdometer) {
      if (!claim.metadata?.odometer_start || !claim.metadata?.odometer_end) {
        errors.push(
          `GATE_BLOCK: Fuel/Mileage claims require odometer readings (start and end).`
        );
      }
      if (!claim.metadata?.odometer_photo_url) {
        errors.push(
          `GATE_BLOCK: Fuel claims require odometer photo. No evidence, no coin.`
        );
      }
    }

    // Gate 4: Duplicate Check (The "Double Dip" Blocker)
    const duplicate = await this.checkDuplicate(
      context.employee_id,
      claim.amount,
      claim.merchant_name,
      claim.claim_date
    );

    if (duplicate) {
      errors.push(
        `GATE_BLOCK: Duplicate claim detected. You already claimed this on ${duplicate.created_at}.`
      );
    }

    // Gate 5: Receipt Required ("No Receipt, No Coin")
    if (!claim.receipt_url) {
      errors.push(`GATE_BLOCK: Receipt is required. No receipt, no coin.`);
    }

    // Gate 6: Multi-Company Validation (Federation)
    if (
      claim.charge_to_tenant_id &&
      claim.charge_to_tenant_id !== context.tenant_id
    ) {
      // Verify employee has access to charge_to_tenant
      const hasAccess = await this.checkEmployeeAccessToTenant(
        context.employee_id,
        claim.charge_to_tenant_id
      );

      if (!hasAccess) {
        errors.push(
          `GATE_BLOCK: You do not have access to charge expenses to this subsidiary.`
        );
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      auto_approve: autoApprove,
    };
  }

  /**
   * Get annual total for category
   */
  private async getAnnualTotal(
    employeeId: string,
    category: string,
    year: number,
    tenantId: string
  ): Promise<number> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await this.supabase
      .from("employee_claims")
      .select("amount")
      .eq("employee_id", employeeId)
      .eq("category", category)
      .eq("tenant_id", tenantId)
      .in("status", ["APPROVED", "PAID"])
      .gte("claim_date", startDate)
      .lte("claim_date", endDate);

    if (error) {
      console.error("Failed to get annual total:", error);
      return 0;
    }

    return (data || []).reduce(
      (sum, claim) => sum + parseFloat((claim.amount || 0).toString()),
      0
    );
  }

  /**
   * Check for duplicate claims
   */
  private async checkDuplicate(
    employeeId: string,
    amount: number,
    merchantName: string,
    claimDate: string
  ): Promise<{ created_at: string } | null> {
    const { data, error } = await this.supabase
      .from("employee_claims")
      .select("created_at")
      .eq("employee_id", employeeId)
      .eq("amount", amount)
      .ilike("merchant_name", merchantName)
      .eq("claim_date", claimDate.split("T")[0]) // Compare dates only
      .in("status", ["SUBMITTED", "PENDING_APPROVAL", "APPROVED", "PAID"])
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No duplicate
      }
      console.error("Failed to check duplicate:", error);
      return null;
    }

    return data;
  }

  /**
   * Check if employee has access to tenant (for multi-company claims)
   */
  private async checkEmployeeAccessToTenant(
    employeeId: string,
    tenantId: string
  ): Promise<boolean> {
    // Check if employee has tenant_access (via federation)
    const { data, error } = await this.supabase
      .from("tenant_access")
      .select("id")
      .eq("user_id", employeeId)
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("Failed to check employee access:", error);
      return false;
    }

    return !!data;
  }
}
