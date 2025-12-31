/**
 * Vendor Dashboard Page
 *
 * Home page for vendors - Summary cards, recent activity, quick actions.
 * First thing vendor sees when logging in.
 */

import { getRequestContext } from "@/lib/dev-auth-context";
import { createClient } from "@/lib/supabase-client";
import { VendorGroupRepository } from "@/src/repositories/vendor-group-repository";
import Link from "next/link";

export default async function VendorDashboardPage() {
  const ctx = getRequestContext();
  const supabase = createClient();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries =
    await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Get summary data
  let pendingInvoices = 0;
  let approvedInvoices = 0;
  let totalOutstanding = 0;
  let nextPaymentDate: string | null = null;
  let recentInvoices: unknown[] = [];

  if (accessibleTenantIds.length > 0) {
    // Get pending invoices count
    const { data: pendingData } = await supabase
      .from("vmp_invoices")
      .select("id, amount")
      .in("tenant_id", accessibleTenantIds)
      .in("status", ["pending", "matched", "under_review"])
      .limit(1000);

    pendingInvoices = pendingData?.length || 0;

    // Get approved invoices count
    const { data: approvedData } = await supabase
      .from("vmp_invoices")
      .select("id, amount")
      .in("tenant_id", accessibleTenantIds)
      .eq("status", "approved")
      .limit(1000);

    approvedInvoices = approvedData?.length || 0;

    // Calculate total outstanding
    const { data: outstandingData } = await supabase
      .from("vmp_invoices")
      .select("amount")
      .in("tenant_id", accessibleTenantIds)
      .in("status", ["approved", "matched"])
      .limit(1000);

    totalOutstanding = (outstandingData || []).reduce(
      (sum, inv) => sum + parseFloat((inv.amount || 0).toString()),
      0
    );

    // Get next payment date (earliest due_date from approved invoices)
    const { data: nextPaymentData } = await supabase
      .from("vmp_invoices")
      .select("due_date")
      .in("tenant_id", accessibleTenantIds)
      .eq("status", "approved")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true })
      .limit(1)
      .single();

    nextPaymentDate = nextPaymentData?.due_date || null;

    // Get recent invoices (last 5)
    const { data: recentData } = await supabase
      .from("vmp_invoices")
      .select(
        "id, invoice_num, amount, status, invoice_date, tenant_id, tenants!inner(name)"
      )
      .in("tenant_id", accessibleTenantIds)
      .order("created_at", { ascending: false })
      .limit(5);

    recentInvoices = recentData || [];
  }

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Vendor Dashboard</h1>
        <p className="na-metadata">Welcome back! Here's your overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 lg:na-grid-cols-4 na-gap-4 na-mb-6">
        <div className="na-card na-p-6">
          <div className="na-metadata na-mb-2">Pending Invoices</div>
          <div className="na-data-large na-text-warn">{pendingInvoices}</div>
          <div className="na-metadata na-text-sm na-mt-2">
            Awaiting approval
          </div>
        </div>

        <div className="na-card na-p-6">
          <div className="na-metadata na-mb-2">Approved Invoices</div>
          <div className="na-data-large na-text-ok">{approvedInvoices}</div>
          <div className="na-metadata na-text-sm na-mt-2">
            Ready for payment
          </div>
        </div>

        <div className="na-card na-p-6">
          <div className="na-metadata na-mb-2">Total Outstanding</div>
          <div className="na-data-large na-text-primary">
            $
            {totalOutstanding.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="na-metadata na-text-sm na-mt-2">Unpaid invoices</div>
        </div>

        <div className="na-card na-p-6">
          <div className="na-metadata na-mb-2">Next Payment</div>
          <div className="na-data-large">
            {nextPaymentDate
              ? new Date(nextPaymentDate).toLocaleDateString()
              : "No scheduled payments"}
          </div>
          <div className="na-metadata na-text-sm na-mt-2">
            {nextPaymentDate ? "Earliest due date" : "No approved invoices"}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Quick Actions</h2>
        <div className="na-flex na-flex-wrap na-gap-4">
          <Link href="/invoices/upload" className="na-btn na-btn-primary">
            📤 Upload Invoice
          </Link>
          <Link href="/vendor/invoices" className="na-btn na-btn-secondary">
            📋 View All Invoices
          </Link>
          <Link href="/vendor/payments" className="na-btn na-btn-secondary">
            💰 Payment Schedule
          </Link>
          <Link href="/vendor/cases" className="na-btn na-btn-secondary">
            📞 Create Case
          </Link>
          <Link href="/vendor/profile" className="na-btn na-btn-ghost">
            ⚙️ Profile Settings
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="na-card na-p-6">
        <h2 className="na-h3 na-mb-4">Recent Invoices</h2>
        {recentInvoices.length === 0 ? (
          <div className="na-text-center na-p-6">
            <p className="na-body">No recent invoices.</p>
            <Link
              href="/invoices/upload"
              className="na-btn na-btn-primary na-mt-4"
            >
              Upload Your First Invoice
            </Link>
          </div>
        ) : (
          <div className="na-card na-overflow-x-auto">
            <table className="na-table-frozen na-w-full">
              <thead>
                <tr className="na-tr">
                  <th className="na-th">Invoice #</th>
                  <th className="na-th">Company</th>
                  <th className="na-th">Amount</th>
                  <th className="na-th">Date</th>
                  <th className="na-th">Status</th>
                  <th className="na-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv: unknown) => {
                  const i = inv as {
                    id: string;
                    invoice_num: string;
                    amount: number;
                    status: string;
                    invoice_date: string;
                    tenants: { name: string };
                  };
                  return (
                    <tr key={i.id} className="na-tr na-hover-bg-paper-2">
                      <td className="na-td na-font-semibold">
                        {i.invoice_num}
                      </td>
                      <td className="na-td na-text-sm">
                        {i.tenants?.name || "Unknown"}
                      </td>
                      <td className="na-td na-data">
                        $
                        {i.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="na-td na-text-sm">
                        {new Date(i.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="na-td">
                        <span
                          className={`na-status na-status-${
                            i.status === "approved"
                              ? "ok"
                              : i.status === "rejected"
                              ? "bad"
                              : "pending"
                          }`}
                        >
                          {i.status}
                        </span>
                      </td>
                      <td className="na-td">
                        <Link
                          href={`/vendor/invoices/${i.id}`}
                          className="na-btn na-btn-ghost na-btn-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
