/**
 * Vendor Omni-Dashboard Page
 *
 * Vendor Groups: All work across subsidiaries in one unified view.
 * Single Sign-On: Log in once, see all POs, invoices, cases from all subsidiaries.
 */

import { VendorContextSwitcher } from "@/components/vendor/VendorContextSwitcher";
import { getRequestContext } from "@/lib/dev-auth-context";
import { createServiceClient } from "@/lib/supabase-client";
import { VendorGroupRepository } from "@/src/repositories/vendor-group-repository";
import { Suspense } from "react";

interface VendorOmniDashboardPageProps {
  searchParams: Promise<{
    tenant_id?: string;
    type?: "invoices" | "pos" | "cases";
  }>;
}

export default async function VendorOmniDashboardPage({
  searchParams,
}: VendorOmniDashboardPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const vendorGroupRepo = new VendorGroupRepository();
  const supabase = createServiceClient();

  // Get accessible subsidiaries for vendor user
  const accessibleSubsidiaries =
    await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Get selected tenant (or null for "All Subsidiaries")
  const selectedTenantId = params.tenant_id || null;
  const tenantIdsToQuery = selectedTenantId
    ? [selectedTenantId]
    : accessibleTenantIds;

  // Get view type (invoices, POs, cases)
  const viewType = params.type || "invoices";

  // Fetch data based on view type
  let items: unknown[] = [];
  let error: string | null = null;

  try {
    if (tenantIdsToQuery.length === 0) {
      items = [];
    } else {
      switch (viewType) {
        case "invoices":
          const { data: invoices, error: invoicesError } = await supabase
            .from("vmp_invoices")
            .select("*")
            .in("tenant_id", tenantIdsToQuery)
            .order("created_at", { ascending: false })
            .limit(100);

          if (invoicesError)
            throw new Error(
              `Failed to fetch invoices: ${invoicesError.message}`
            );
          items = invoices || [];
          break;

        case "pos":
          const { data: pos, error: posError } = await supabase
            .from("vmp_po_refs")
            .select("*")
            .in("tenant_id", tenantIdsToQuery)
            .order("created_at", { ascending: false })
            .limit(100);

          if (posError)
            throw new Error(`Failed to fetch POs: ${posError.message}`);
          items = pos || [];
          break;

        case "cases":
          const { data: cases, error: casesError } = await supabase
            .from("vmp_cases")
            .select("*")
            .in("tenant_id", tenantIdsToQuery)
            .order("created_at", { ascending: false })
            .limit(100);

          if (casesError)
            throw new Error(`Failed to fetch cases: ${casesError.message}`);
          items = cases || [];
          break;
      }
    }
  } catch (err) {
    // Graceful error handling - capture message for display
    error = err instanceof Error ? err.message : "Failed to load data.";
  }

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Vendor Omni-Dashboard</h1>
        <p className="na-metadata">
          Viewing:{" "}
          {selectedTenantId
            ? "Single Subsidiary"
            : `All Subsidiaries (${accessibleSubsidiaries.length})`}
        </p>
      </div>

      <Suspense
        fallback={<div className="na-card na-p-6">Loading context...</div>}
      >
        <VendorContextSwitcher
          currentTenantId={selectedTenantId}
          userId={ctx.actor.userId}
        />
      </Suspense>

      {/* View Type Selector - Using Link components for RSC compatibility */}
      <div className="na-card na-p-4 na-mb-6">
        <div className="na-flex na-gap-4">
          <a
            href={`/vendor-omni-dashboard?${
              selectedTenantId ? `tenant_id=${selectedTenantId}&` : ""
            }type=invoices`}
            className={`na-btn ${
              viewType === "invoices" ? "na-btn-primary" : "na-btn-secondary"
            }`}
          >
            Invoices
          </a>
          <a
            href={`/vendor-omni-dashboard?${
              selectedTenantId ? `tenant_id=${selectedTenantId}&` : ""
            }type=pos`}
            className={`na-btn ${
              viewType === "pos" ? "na-btn-primary" : "na-btn-secondary"
            }`}
          >
            Purchase Orders
          </a>
          <a
            href={`/vendor-omni-dashboard?${
              selectedTenantId ? `tenant_id=${selectedTenantId}&` : ""
            }type=cases`}
            className={`na-btn ${
              viewType === "cases" ? "na-btn-primary" : "na-btn-secondary"
            }`}
          >
            Cases
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="na-card na-p-4 na-mb-6">
        <div className="na-grid na-grid-cols-4 na-gap-4">
          <div>
            <div className="na-metadata">Total {viewType}</div>
            <div className="na-data-large">{items.length}</div>
          </div>
          <div>
            <div className="na-metadata">Accessible Subsidiaries</div>
            <div className="na-data-large">{accessibleSubsidiaries.length}</div>
          </div>
          <div>
            <div className="na-metadata">Pending</div>
            <div className="na-data-large">
              {
                items.filter(
                  (item: unknown) =>
                    (item as { status: string }).status === "pending"
                ).length
              }
            </div>
          </div>
          <div>
            <div className="na-metadata">Completed</div>
            <div className="na-data-large">
              {
                items.filter(
                  (item: unknown) =>
                    (item as { status: string }).status === "completed" ||
                    (item as { status: string }).status === "approved"
                ).length
              }
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {error ? (
        <div className="na-card na-p-6 na-bg-danger-subtle na-text-danger na-mb-6">
          <h2 className="na-h4">Error Loading Data</h2>
          <p className="na-body">{error}</p>
        </div>
      ) : (
        <Suspense
          fallback={<div className="na-card na-p-6">Loading data...</div>}
        >
          {items.length === 0 ? (
            <div className="na-card na-p-6 na-text-center">
              <h2 className="na-h4">No {viewType} Found</h2>
              <p className="na-body na-mb-4">
                {selectedTenantId
                  ? `No ${viewType} found for this subsidiary.`
                  : `No ${viewType} found across accessible subsidiaries.`}
              </p>
            </div>
          ) : (
            <div className="na-card na-overflow-x-auto">
              <table className="na-table-frozen na-w-full">
                <thead>
                  <tr className="na-tr">
                    <th className="na-th">ID</th>
                    <th className="na-th">Subsidiary</th>
                    <th className="na-th">Status</th>
                    <th className="na-th">Created</th>
                    <th className="na-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: unknown) => {
                    const i = item as {
                      id: string;
                      tenant_id: string;
                      status: string;
                      created_at: string;
                    };
                    const subsidiary = accessibleSubsidiaries.find(
                      (s) => s.tenant_id === i.tenant_id
                    );
                    return (
                      <tr key={i.id} className="na-tr na-hover-bg-paper-2">
                        <td className="na-td na-text-sm">
                          {i.id.slice(0, 8)}...
                        </td>
                        <td className="na-td na-text-sm">
                          {subsidiary?.tenant_id.slice(0, 8) || "Unknown"}
                        </td>
                        <td className="na-td">
                          <span className="na-status na-status-pending">
                            {i.status}
                          </span>
                        </td>
                        <td className="na-td na-text-sm">
                          {new Date(i.created_at).toLocaleDateString()}
                        </td>
                        <td className="na-td">
                          <button className="na-btn na-btn-ghost na-btn-sm">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
}
