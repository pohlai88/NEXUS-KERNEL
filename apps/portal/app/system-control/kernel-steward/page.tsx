/**
 * Kernel Steward Dashboard
 *
 * The Architect - Configures L1 tenants, maps L0 value sets,
 * sets Group credit limits. Keeps the "Iron Dome" from becoming a "Rust Dome".
 *
 * Shows:
 * - Tenant configuration
 * - L0 Value Sets (Jurisdictional Value Sets)
 * - Group credit limits
 * - Kernel Registry concepts
 */

import { getRequestContext } from "@/lib/dev-auth-context";
import { createServiceClient } from "@/lib/supabase-client";
import { TenantAccessRepository } from "@/src/repositories/tenant-access-repository";
import {
  CreditExposureCard,
  GroupCard,
  MetadataCard,
  TenantCard,
} from "./KernelStewardClient";

interface KernelStewardPageProps {
  searchParams: Promise<{
    tenant_id?: string;
    group_id?: string;
  }>;
}

export default async function KernelStewardPage({
  searchParams,
}: KernelStewardPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const supabase = createServiceClient();
  const tenantAccessRepo = new TenantAccessRepository();

  // Get accessible tenants
  const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(
    ctx.actor.userId
  );
  const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

  // Get selected tenant (or null for "All Companies")
  const selectedTenantId = params.tenant_id || null;
  const tenantIdsToQuery = selectedTenantId
    ? [selectedTenantId]
    : accessibleTenantIds;

  // Fetch configuration data
  let tenants: unknown[] = [];
  let groups: unknown[] = [];
  let creditExposure: unknown[] = [];
  let globalMetadata: unknown[] = [];
  let error: string | null = null;

  try {
    if (tenantIdsToQuery.length > 0) {
      // Get tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("*")
        .in("id", tenantIdsToQuery)
        .order("created_at", { ascending: false });

      if (tenantsError) {
        throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
      }

      tenants = tenantsData || [];

      // Get groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (groupsError) {
        throw new Error(`Failed to fetch groups: ${groupsError.message}`);
      }

      groups = groupsData || [];

      // Get group credit exposure
      const { data: creditData, error: creditError } = await supabase
        .from("group_credit_exposure")
        .select("*, global_vendors(legal_name, tax_id), groups(name)")
        .order("total_exposure", { ascending: false })
        .limit(50);

      if (creditError) {
        throw new Error(
          `Failed to fetch credit exposure: ${creditError.message}`
        );
      }

      creditExposure = creditData || [];

      // Get L0 metadata (from mdm_global_metadata)
      const { data: metadataData, error: metadataError } = await supabase
        .from("mdm_global_metadata")
        .select("*")
        .eq("tier", "tier1")
        .order("created_at", { ascending: false })
        .limit(50);

      if (metadataError) {
        // Optional - metadata might not exist, use empty array
      } else {
        globalMetadata = metadataData || [];
      }
    }
  } catch (err) {
    // Graceful error handling - capture message for display
    error =
      err instanceof Error
        ? err.message
        : "Failed to load kernel configuration data.";
  }

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <div>
          <h1 className="na-h1 na-mb-2">Kernel Steward</h1>
          <p className="na-body na-text-muted">
            The Architect - Configures L1 tenants, maps L0 value sets, sets
            Group credit limits
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="na-grid na-grid-cols-4 na-gap-4 na-mb-6">
        <div className="na-card na-p-4">
          <div className="na-metadata">Tenants</div>
          <div className="na-data-large">{tenants.length}</div>
        </div>
        <div className="na-card na-p-4">
          <div className="na-metadata">Groups</div>
          <div className="na-data-large">{groups.length}</div>
        </div>
        <div className="na-card na-p-4">
          <div className="na-metadata">Credit Limits</div>
          <div className="na-data-large">{creditExposure.length}</div>
        </div>
        <div className="na-card na-p-4">
          <div className="na-metadata">L0 Concepts</div>
          <div className="na-data-large">{globalMetadata.length}</div>
        </div>
      </div>

      {error ? (
        <div className="na-card na-p-6 na-bg-danger-subtle na-text-danger na-mb-6">
          <h2 className="na-h4">Error Loading Configuration</h2>
          <p className="na-body">{error}</p>
        </div>
      ) : (
        <div className="na-space-y-6">
          {/* Tenants Configuration */}
          {tenants.length > 0 && (
            <div className="na-card na-p-6">
              <h2 className="na-h4 na-mb-4">L1 Tenants</h2>
              <div className="na-space-y-3">
                {tenants.map((tenant: any) => (
                  <TenantCard key={tenant.id} tenant={tenant} />
                ))}
              </div>
            </div>
          )}

          {/* Groups Configuration */}
          {groups.length > 0 && (
            <div className="na-card na-p-6">
              <h2 className="na-h4 na-mb-4">Groups</h2>
              <div className="na-space-y-3">
                {groups.map((group: any) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

          {/* Credit Limits */}
          {creditExposure.length > 0 && (
            <div className="na-card na-p-6">
              <h2 className="na-h4 na-mb-4">Group Credit Limits</h2>
              <div className="na-space-y-3">
                {creditExposure.map((exposure: any) => (
                  <CreditExposureCard key={exposure.id} exposure={exposure} />
                ))}
              </div>
            </div>
          )}

          {/* L0 Metadata */}
          {globalMetadata.length > 0 && (
            <div className="na-card na-p-6">
              <h2 className="na-h4 na-mb-4">L0 Value Sets (Kernel Registry)</h2>
              <div className="na-space-y-3">
                {globalMetadata.map((metadata: any) => (
                  <MetadataCard key={metadata.id} metadata={metadata} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {tenants.length === 0 &&
            groups.length === 0 &&
            creditExposure.length === 0 && (
              <div className="na-card na-p-12 na-text-center">
                <div className="na-w-16 na-h-16 na-mx-auto na-mb-4 na-bg-muted na-rounded-full na-flex na-items-center na-justify-center">
                  <svg
                    className="na-w-8 na-h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="na-h4 na-mb-2">No Configuration Found</h2>
                <p className="na-body na-text-muted">
                  Start by configuring your first tenant or group.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
