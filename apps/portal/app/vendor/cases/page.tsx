/**
 * Vendor Case Management Page
 *
 * PRD S-02: No Manual Communication Dependency
 * - View all cases (Open, In Progress, Resolved)
 * - Create new case (Dispute, Question, Request)
 * - Case detail page with messages
 * - Upload evidence/documents
 * - Case status tracking
 */

import { getRequestContext } from "@/lib/dev-auth-context";
import { createServiceClient } from "@/lib/supabase-client";
import { CaseRepository } from "@/src/repositories/case-repository";
import { VendorGroupRepository } from "@/src/repositories/vendor-group-repository";
import Link from "next/link";

interface VendorCasesPageProps {
  searchParams: Promise<{
    status?: string;
    case_type?: string;
    search?: string;
  }>;
}

export default async function VendorCasesPage({
  searchParams,
}: VendorCasesPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const supabase = createServiceClient();
  const caseRepo = new CaseRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries =
    await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Get vendor IDs from accessible subsidiaries
  // In production, this would query vendor_user_access -> vendor_group -> vmp_vendors
  const { data: vendorAccess } = await supabase
    .from("vendor_user_access")
    .select("vendor_group_id")
    .eq("user_id", ctx.actor.userId)
    .limit(1)
    .single();

  const vendorGroupId = vendorAccess?.vendor_group_id;

  // Build case query
  let query = supabase
    .from("vmp_cases")
    .select(
      "id, case_type, status, subject, owner_team, sla_due_at, escalation_level, created_at, updated_at, vmp_companies!inner(name), vmp_vendors!inner(name)"
    )
    .in(
      "tenant_id",
      accessibleTenantIds.length > 0 ? accessibleTenantIds : [""]
    );

  if (vendorGroupId) {
    // Filter by vendor group (in production, would use vendor_id from vendor_user_access)
    // For now, we'll show all cases for accessible tenants
  }

  // Apply filters
  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.case_type) {
    query = query.eq("case_type", params.case_type);
  }

  if (params.search) {
    query = query.ilike("subject", `%${params.search}%`);
  }

  query = query.order("created_at", { ascending: false });

  const { data: cases, error } = await query.limit(100);

  // Graceful error handling - return empty list on error
  const caseList = error ? [] : cases || [];

  // Get status counts
  const { data: statusCounts } = await supabase
    .from("vmp_cases")
    .select("status")
    .in(
      "tenant_id",
      accessibleTenantIds.length > 0 ? accessibleTenantIds : [""]
    );

  const statusCountMap = (statusCounts || []).reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">My Cases</h1>
        <Link href="/vendor/cases/new" className="na-btn na-btn-primary">
          ➕ Create Case
        </Link>
      </div>

      {/* Filters */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Filters</h2>
        <form method="get" className="na-space-y-4">
          <div className="na-grid na-grid-cols-1 md:na-grid-cols-3 na-gap-4">
            {/* Status Filter */}
            <div>
              <label className="na-metadata na-mb-2 na-block">Status</label>
              <select
                name="status"
                defaultValue={params.status || ""}
                className="na-input na-w-full"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="waiting_supplier">Waiting for Supplier</option>
                <option value="waiting_internal">
                  Waiting for Internal Team
                </option>
                <option value="resolved">Resolved</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Case Type Filter */}
            <div>
              <label className="na-metadata na-mb-2 na-block">Case Type</label>
              <select
                name="case_type"
                defaultValue={params.case_type || ""}
                className="na-input na-w-full"
              >
                <option value="">All Types</option>
                <option value="invoice">Invoice</option>
                <option value="payment">Payment</option>
                <option value="soa">SOA</option>
                <option value="onboarding">Onboarding</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="na-metadata na-mb-2 na-block">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Search by subject..."
                defaultValue={params.search || ""}
                className="na-input na-w-full"
              />
            </div>
          </div>

          <div className="na-flex na-gap-2">
            <button type="submit" className="na-btn na-btn-primary">
              Apply Filters
            </button>
            <Link href="/vendor/cases" className="na-btn na-btn-ghost">
              Clear
            </Link>
          </div>
        </form>

        {/* Status Badges */}
        <div className="na-flex na-flex-wrap na-gap-2 na-mt-4">
          <Link
            href="/vendor/cases"
            className={`na-btn na-btn-sm ${
              !params.status ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            All ({caseList.length})
          </Link>
          {Object.entries(statusCountMap).map(([status, count]) => (
            <Link
              key={status}
              href={`/vendor/cases?status=${status}`}
              className={`na-btn na-btn-sm ${
                params.status === status ? "na-btn-primary" : "na-btn-ghost"
              }`}
            >
              {status.replace("_", " ")} ({count})
            </Link>
          ))}
        </div>
      </div>

      {/* Case List */}
      <div className="na-card na-p-6">
        <h2 className="na-h3 na-mb-4">Cases ({caseList.length})</h2>
        {caseList.length === 0 ? (
          <div className="na-text-center na-p-6">
            <p className="na-body">No cases found.</p>
            <Link
              href="/vendor/cases/new"
              className="na-btn na-btn-primary na-mt-4"
            >
              Create Your First Case
            </Link>
          </div>
        ) : (
          <div className="na-space-y-4">
            {caseList.map((caseItem: unknown) => {
              const c = caseItem as {
                id: string;
                case_type: string;
                status: string;
                subject: string;
                owner_team: string;
                sla_due_at: string | null;
                escalation_level: number;
                created_at: string;
                updated_at: string;
                vmp_companies: { name: string };
                vmp_vendors: { name: string };
              };
              return (
                <Link
                  key={c.id}
                  href={`/vendor/cases/${c.id}`}
                  className="na-card na-p-4 na-block na-hover-bg-paper-2 na-transition"
                >
                  <div className="na-flex na-items-start na-justify-between na-gap-4">
                    <div className="na-flex-1">
                      <div className="na-flex na-items-center na-gap-2 na-mb-2">
                        <h3 className="na-h4">{c.subject}</h3>
                        <span
                          className={`na-status na-status-${
                            c.status === "resolved"
                              ? "ok"
                              : c.status === "blocked"
                              ? "bad"
                              : c.status === "waiting_supplier"
                              ? "warn"
                              : "pending"
                          }`}
                        >
                          {c.status.replace("_", " ")}
                        </span>
                        <span className="na-metadata na-text-xs">
                          {c.case_type}
                        </span>
                      </div>
                      <div className="na-metadata na-text-sm na-mb-2">
                        Assigned to: {c.owner_team} team
                        {c.vmp_companies?.name && ` • ${c.vmp_companies.name}`}
                      </div>
                      <div className="na-metadata na-text-xs">
                        Created: {new Date(c.created_at).toLocaleDateString()}
                        {c.sla_due_at && (
                          <span className="na-ml-4">
                            SLA Due:{" "}
                            {new Date(c.sla_due_at).toLocaleDateString()}
                          </span>
                        )}
                        {c.escalation_level > 0 && (
                          <span className="na-ml-4 na-text-warn">
                            Escalated (Level {c.escalation_level})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="na-flex-shrink-0">
                      <span className="na-btn na-btn-ghost na-btn-sm">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
