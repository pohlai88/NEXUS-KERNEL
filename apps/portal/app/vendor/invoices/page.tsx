/**
 * Vendor Invoice List Page
 *
 * PRD V-01: Payment Status Transparency
 * - Filter by: Status, Date Range, Amount, Subsidiary
 * - Sort by: Date, Amount, Status
 * - Search by: Invoice Number, PO Number
 * - Export to Excel/PDF
 */

import { InvoiceStatusDisplay } from "@/components/invoices/InvoiceStatusDisplay";
import { getRequestContext } from "@/lib/dev-auth-context";
import { createServiceClient } from "@/lib/supabase-client";
import { InvoiceRepository } from "@/src/repositories/invoice-repository";
import { VendorGroupRepository } from "@/src/repositories/vendor-group-repository";
import Link from "next/link";
import { Suspense } from "react";

interface VendorInvoicesPageProps {
  searchParams: Promise<{
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    sort?: "date" | "amount" | "status";
    order?: "asc" | "desc";
  }>;
}

export default async function VendorInvoicesPage({
  searchParams,
}: VendorInvoicesPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const supabase = createServiceClient();
  const invoiceRepo = new InvoiceRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries =
    await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Build query
  let query = supabase
    .from("vmp_invoices")
    .select(
      "id, invoice_num, invoice_number, invoice_date, amount, currency_code, status, due_date, created_at, updated_at, company_id, vmp_companies!inner(name)"
    )
    .in(
      "tenant_id",
      accessibleTenantIds.length > 0 ? accessibleTenantIds : [""]
    );

  // Apply filters
  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.date_from) {
    query = query.gte("invoice_date", params.date_from);
  }

  if (params.date_to) {
    query = query.lte("invoice_date", params.date_to);
  }

  if (params.search) {
    query = query.or(
      `invoice_num.ilike.%${params.search}%,invoice_number.ilike.%${params.search}%,po_ref.ilike.%${params.search}%`
    );
  }

  // Apply sorting
  const sortBy = params.sort || "date";
  const order = params.order || "desc";

  if (sortBy === "date") {
    query = query.order("invoice_date", { ascending: order === "asc" });
  } else if (sortBy === "amount") {
    query = query.order("amount", { ascending: order === "asc" });
  } else if (sortBy === "status") {
    query = query.order("status", { ascending: order === "asc" });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: invoices, error } = await query.limit(100);

  // Graceful error handling - return empty list on error
  const invoiceList = error ? [] : invoices || [];

  // Get status counts for filter badges
  const { data: statusCounts } = await supabase
    .from("vmp_invoices")
    .select("status")
    .in(
      "tenant_id",
      accessibleTenantIds.length > 0 ? accessibleTenantIds : [""]
    );

  const statusCountMap = (statusCounts || []).reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">My Invoices</h1>
        <Link href="/invoices/upload" className="na-btn na-btn-primary">
          📤 Upload Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Filters</h2>
        <form method="get" className="na-space-y-4">
          <div className="na-grid na-grid-cols-1 md:na-grid-cols-4 na-gap-4">
            {/* Status Filter */}
            <div>
              <label className="na-metadata na-mb-2 na-block">Status</label>
              <select
                name="status"
                defaultValue={params.status || ""}
                className="na-input na-w-full"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="na-metadata na-mb-2 na-block">Date From</label>
              <input
                type="date"
                name="date_from"
                defaultValue={params.date_from || ""}
                className="na-input na-w-full"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="na-metadata na-mb-2 na-block">Date To</label>
              <input
                type="date"
                name="date_to"
                defaultValue={params.date_to || ""}
                className="na-input na-w-full"
              />
            </div>

            {/* Search */}
            <div>
              <label className="na-metadata na-mb-2 na-block">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Invoice #, PO #"
                defaultValue={params.search || ""}
                className="na-input na-w-full"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="na-flex na-items-center na-gap-4">
            <div>
              <label className="na-metadata na-mb-2 na-block">Sort By</label>
              <select
                name="sort"
                defaultValue={params.sort || "date"}
                className="na-input"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div>
              <label className="na-metadata na-mb-2 na-block">Order</label>
              <select
                name="order"
                defaultValue={params.order || "desc"}
                className="na-input"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="na-flex na-items-end na-gap-2 na-mt-6">
              <button type="submit" className="na-btn na-btn-primary">
                Apply Filters
              </button>
              <Link href="/vendor/invoices" className="na-btn na-btn-ghost">
                Clear
              </Link>
            </div>
          </div>
        </form>

        {/* Status Badges */}
        <div className="na-flex na-flex-wrap na-gap-2 na-mt-4">
          <Link
            href="/vendor/invoices"
            className={`na-btn na-btn-sm ${
              !params.status ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            All ({invoiceList.length})
          </Link>
          {Object.entries(statusCountMap).map(([status, count]) => (
            <Link
              key={status}
              href={`/vendor/invoices?status=${status}`}
              className={`na-btn na-btn-sm ${
                params.status === status ? "na-btn-primary" : "na-btn-ghost"
              }`}
            >
              {status} ({count})
            </Link>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="na-card na-p-6">
        <h2 className="na-h3 na-mb-4">Invoices ({invoiceList.length})</h2>
        {invoiceList.length === 0 ? (
          <div className="na-text-center na-p-6">
            <p className="na-body">No invoices found.</p>
            <Link
              href="/invoices/upload"
              className="na-btn na-btn-primary na-mt-4"
            >
              Upload Your First Invoice
            </Link>
          </div>
        ) : (
          <div className="na-overflow-x-auto">
            <table className="na-table-frozen na-w-full">
              <thead>
                <tr className="na-tr">
                  <th className="na-th">Invoice #</th>
                  <th className="na-th">Company</th>
                  <th className="na-th">Date</th>
                  <th className="na-th">Amount</th>
                  <th className="na-th">Status</th>
                  <th className="na-th">Due Date</th>
                  <th className="na-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoiceList.map((inv: unknown) => {
                  const i = inv as {
                    id: string;
                    invoice_num: string | null;
                    invoice_number: string | null;
                    invoice_date: string;
                    amount: number | null;
                    currency_code: string;
                    status: string;
                    due_date: string | null;
                    created_at: string;
                    vmp_companies: { name: string };
                  };
                  return (
                    <tr key={i.id} className="na-tr na-hover-bg-paper-2">
                      <td className="na-td na-font-semibold">
                        {i.invoice_num || i.invoice_number || "N/A"}
                      </td>
                      <td className="na-td na-text-sm">
                        {i.vmp_companies?.name || "Unknown"}
                      </td>
                      <td className="na-td na-text-sm">
                        {i.invoice_date
                          ? new Date(i.invoice_date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="na-td na-data">
                        {i.amount
                          ? `$${i.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })} ${i.currency_code || "USD"}`
                          : "N/A"}
                      </td>
                      <td className="na-td">
                        <Suspense
                          fallback={
                            <span className="na-status na-status-pending">
                              Loading...
                            </span>
                          }
                        >
                          <InvoiceStatusDisplay invoiceId={i.id} />
                        </Suspense>
                      </td>
                      <td className="na-td na-text-sm">
                        {i.due_date
                          ? new Date(i.due_date).toLocaleDateString()
                          : "N/A"}
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
