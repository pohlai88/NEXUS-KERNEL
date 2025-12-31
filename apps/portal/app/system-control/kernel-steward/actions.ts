"use server";

/**
 * Kernel Steward Server Actions
 *
 * L0 Kernel configuration persistence:
 * - Update tenant settings (L1)
 * - Update group settings
 * - Adjust credit limits
 * - Update kernel concepts
 */

import { createServiceClient } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TenantConfig {
  id: string;
  name?: string;
  status?: "active" | "suspended" | "deleted";
  subscription_tier?: "free" | "basic" | "professional" | "enterprise";
  max_users?: number;
  max_companies?: number;
  settings?: Record<string, unknown>;
}

interface GroupConfig {
  id: string;
  name?: string;
  legal_name?: string;
  country_code?: string;
  metadata?: Record<string, unknown>;
}

interface CreditLimitConfig {
  group_id: string;
  global_vendor_id: string;
  credit_limit: number;
}

// ============================================================================
// Tenant Configuration Actions
// ============================================================================

/**
 * Update tenant configuration
 */
export async function updateTenantConfig(
  config: TenantConfig
): Promise<ActionResult<TenantConfig>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("tenants")
      .update({
        name: config.name,
        status: config.status,
        subscription_tier: config.subscription_tier,
        max_users: config.max_users,
        max_companies: config.max_companies,
        settings: config.settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", config.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/system-control/kernel-steward");
    return { success: true, data: data as TenantConfig };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update tenant config",
    };
  }
}

/**
 * Get tenant configuration
 */
export async function getTenantConfig(
  tenantId: string
): Promise<ActionResult<TenantConfig>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as TenantConfig };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get tenant config",
    };
  }
}

// ============================================================================
// Group Configuration Actions
// ============================================================================

/**
 * Update group configuration
 */
export async function updateGroupConfig(
  config: GroupConfig
): Promise<ActionResult<GroupConfig>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("groups")
      .update({
        name: config.name,
        legal_name: config.legal_name,
        country_code: config.country_code,
        metadata: config.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", config.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/system-control/kernel-steward");
    return { success: true, data: data as GroupConfig };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update group config",
    };
  }
}

/**
 * Get group configuration
 */
export async function getGroupConfig(
  groupId: string
): Promise<ActionResult<GroupConfig>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as GroupConfig };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get group config",
    };
  }
}

// ============================================================================
// Credit Limit Actions
// ============================================================================

/**
 * Update group credit limit
 */
export async function updateCreditLimit(
  config: CreditLimitConfig
): Promise<ActionResult> {
  try {
    const supabase = createServiceClient();

    // Check if exposure record exists
    const { data: existing } = await supabase
      .from("group_credit_exposure")
      .select("id")
      .eq("group_id", config.group_id)
      .eq("global_vendor_id", config.global_vendor_id)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("group_credit_exposure")
        .update({
          credit_limit: config.credit_limit,
          available_credit: config.credit_limit, // Will be recalculated
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Create new
      const { error } = await supabase.from("group_credit_exposure").insert({
        group_id: config.group_id,
        global_vendor_id: config.global_vendor_id,
        credit_limit: config.credit_limit,
        available_credit: config.credit_limit,
        total_exposure: 0,
      });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/system-control/kernel-steward");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update credit limit",
    };
  }
}

// ============================================================================
// L0 Kernel Concept Actions
// ============================================================================

/**
 * Get all active L0 concepts
 */
export async function getKernelConcepts(): Promise<ActionResult<unknown[]>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("kernel_concept_registry")
      .select("*")
      .eq("is_active", true)
      .order("concept_category")
      .order("concept_name");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to get kernel concepts",
    };
  }
}

/**
 * Get L0 value sets with values
 */
export async function getValueSets(): Promise<ActionResult<unknown[]>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("kernel_value_set_registry")
      .select(
        `
        *,
        kernel_value_set_values (*)
      `
      )
      .eq("is_active", true)
      .order("value_set_id");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get value sets",
    };
  }
}

/**
 * Get identity mappings
 */
export async function getIdentityMappings(): Promise<ActionResult<unknown[]>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("kernel_identity_mapping")
      .select("*")
      .eq("is_active", true)
      .order("external_system")
      .order("entity_type");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to get identity mappings",
    };
  }
}
