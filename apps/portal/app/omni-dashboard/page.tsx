/**
 * Omni-Dashboard Page
 *
 * Group-Level Dashboard: Aggregated view across all subsidiaries.
 * Single Sign-On: Log in once, see everything.
 */

import { ContextSwitcher } from "@/components/tenant/ContextSwitcher";
import { VendorTable } from "@/components/vendors/VendorTable";
import { getRequestContext } from "@/lib/dev-auth-context";
import { TenantAccessRepository } from "@/src/repositories/tenant-access-repository";
import { VendorRepository } from "@/src/repositories/vendor-repository";
import { Suspense } from "react";

interface OmniDashboardPageProps {
  searchParams: Promise<{
    tenant_id?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function OmniDashboardPage({
  searchParams,
}: OmniDashboardPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const tenantAccessRepo = new TenantAccessRepository();
  const vendorRepo = new VendorRepository();

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

  // Fetch vendors from accessible tenants
  let vendors: unknown[] = [];
  let error: string | null = null;

  try {
    if (tenantIdsToQuery.length === 0) {
      vendors = [];
    } else {
      // Query vendors from all accessible tenants
      const { data, error: queryError } = await vendorRepo.supabase
        .from("vmp_vendors")
        .select("*")
        .in("tenant_id", tenantIdsToQuery)
        .order("created_at", { ascending: false });

      if (queryError) {
        throw new Error(`Failed to fetch vendors: ${queryError.message}`);
      }

      vendors = data || [];
    }
  } catch (err) {
    // Graceful error handling - capture message for display
    error = err instanceof Error ? err.message : "Failed to load vendors.";
  }

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Omni-Dashboard</h1>
        <p className="na-metadata">
          Viewing:{" "}
          {selectedTenantId
            ? "Single Company"
            : `All Companies (${accessibleTenants.length})`}
        </p>
      </div>

      <Suspense
        fallback={<div className="na-card na-p-6">Loading context...</div>}
      >
        <ContextSwitcher
          currentTenantId={selectedTenantId}
          userId={ctx.actor.userId}
        />
      </Suspense>

      <div className="na-card na-p-4 na-mb-6">
        <div className="na-grid na-grid-cols-4 na-gap-4">
          <div>
            <div className="na-metadata">Total Vendors</div>
            <div className="na-data-large">{vendors.length}</div>
          </div>
          <div>
            <div className="na-metadata">Accessible Companies</div>
            <div className="na-data-large">{accessibleTenants.length}</div>
          </div>
          <div>
            <div className="na-metadata">Active Vendors</div>
            <div className="na-data-large">
              {
                vendors.filter(
                  (v: unknown) =>
                    (v as { status: string }).status === "APPROVED"
                ).length
              }
            </div>
          </div>
          <div>
            <div className="na-metadata">Pending</div>
            <div className="na-data-large">
              {
                vendors.filter(
                  (v: unknown) => (v as { status: string }).status === "PENDING"
                ).length
              }
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="na-card na-p-6 na-bg-danger-subtle na-text-danger na-mb-6">
          <h2 className="na-h4">Error Loading Vendors</h2>
          <p className="na-body">{error}</p>
        </div>
      ) : (
        <Suspense
          fallback={<div className="na-card na-p-6">Loading vendors...</div>}
        >
          {vendors.length === 0 ? (
            <div className="na-card na-p-6 na-text-center">
              <h2 className="na-h4">No Vendors Found</h2>
              <p className="na-body na-mb-4">
                {selectedTenantId
                  ? "No vendors found for this company."
                  : "No vendors found across accessible companies."}
              </p>
            </div>
          ) : (
            <VendorTable
              initialVendors={
                vendors as Parameters<typeof VendorTable>[0]["initialVendors"]
              }
            />
          )}
        </Suspense>
      )}
    </div>
  );
}
