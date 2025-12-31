/**
 * Vendor Payment Schedule & History Page
 *
 * PRD V-01: Payment Status Transparency (MUST)
 * - Upcoming Payments (next 30 days)
 * - Payment History (past payments)
 * - Payment Details: Amount, Date, Reference, Bank Account
 * - Outstanding Amount (total unpaid invoices)
 * - Payment Calendar View
 */

import { getRequestContext } from "@/lib/dev-auth-context";
import { createServiceClient } from "@/lib/supabase-client";
import { InvoiceRepository } from "@/src/repositories/invoice-repository";
import { PaymentRepository } from "@/src/repositories/payment-repository";
import { VendorGroupRepository } from "@/src/repositories/vendor-group-repository";
import Link from "next/link";

interface VendorPaymentsPageProps {
  searchParams: Promise<{
    view?: "upcoming" | "history" | "all";
    date_from?: string;
    date_to?: string;
  }>;
}

export default async function VendorPaymentsPage({
  searchParams,
}: VendorPaymentsPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const supabase = createServiceClient();
  const paymentRepo = new PaymentRepository();
  const invoiceRepo = new InvoiceRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries =
    await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  const view = params.view || "all";
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // Build payment query
  let paymentQuery = supabase
    .from("vmp_payments")
    .select(
      "id, payment_ref, payment_date, amount, currency_code, status, payment_method, transaction_id, bank_account_last4, invoice_id, created_at, updated_at, vmp_invoices!left(invoice_num, invoice_number), vmp_companies!inner(name)"
    )
    .in(
      "tenant_id",
      accessibleTenantIds.length > 0 ? accessibleTenantIds : [""]
    );

  if (view === "upcoming") {
    paymentQuery = paymentQuery
      .gte("payment_date", today.toISOString().split("T")[0])
      .lte("payment_date", thirtyDaysFromNow.toISOString().split("T")[0])
      .in("status", ["pending", "scheduled", "processing"]);
  } else if (view === "history") {
    paymentQuery = paymentQuery
      .lt("payment_date", today.toISOString().split("T")[0])
      .in("status", ["completed", "failed", "cancelled"]);
  }

  if (params.date_from) {
    paymentQuery = paymentQuery.gte("payment_date", params.date_from);
  }

  if (params.date_to) {
    paymentQuery = paymentQuery.lte("payment_date", params.date_to);
  }

  paymentQuery = paymentQuery.order("payment_date", {
    ascending: view === "upcoming",
  });

  const { data: payments, error: paymentsError } = await paymentQuery.limit(
    100
  );

  // Graceful error handling - return empty list on error
  const paymentList = paymentsError ? [] : payments || [];

  // Calculate outstanding amount (approved invoices not yet paid)
  const { data: outstandingInvoices } = await supabase
    .from("vmp_invoices")
    .select("amount, currency_code")
    .in(
      "tenant_id",
      accessibleTenantIds.length > 0 ? accessibleTenantIds : [""]
    )
    .in("status", ["approved", "matched"])
    .is("paid_date", null);

  const outstandingAmount = (outstandingInvoices || []).reduce((sum, inv) => {
    return sum + parseFloat((inv.amount || 0).toString());
  }, 0);

  // Get payment summary stats
  const { data: allPayments } = await supabase
    .from("vmp_payments")
    .select("amount, status, payment_date")
    .in(
      "tenant_id",
      accessibleTenantIds.length > 0 ? accessibleTenantIds : [""]
    );

  const upcomingPayments = (allPayments || []).filter(
    (p) =>
      p.payment_date >= today.toISOString().split("T")[0] &&
      p.payment_date <= thirtyDaysFromNow.toISOString().split("T")[0] &&
      ["pending", "scheduled", "processing"].includes(p.status)
  );

  const upcomingAmount = upcomingPayments.reduce(
    (sum, p) => sum + parseFloat((p.amount || 0).toString()),
    0
  );

  const completedPayments = (allPayments || []).filter(
    (p) =>
      p.status === "completed" &&
      p.payment_date < today.toISOString().split("T")[0]
  );

  const completedAmount = completedPayments.reduce(
    (sum, p) => sum + parseFloat((p.amount || 0).toString()),
    0
  );

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Payment Schedule</h1>
        <Link href="/vendor/dashboard" className="na-btn na-btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="na-grid na-grid-cols-1 md:na-grid-cols-3 na-gap-4 na-mb-6">
        <div className="na-card na-p-6">
          <div className="na-metadata na-mb-2">Outstanding Amount</div>
          <div className="na-data-large na-text-warn">
            $
            {outstandingAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="na-metadata na-text-sm na-mt-2">
            Unpaid approved invoices
          </div>
        </div>

        <div className="na-card na-p-6">
          <div className="na-metadata na-mb-2">Upcoming Payments (30 days)</div>
          <div className="na-data-large na-text-primary">
            $
            {upcomingAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="na-metadata na-text-sm na-mt-2">
            {upcomingPayments.length} payments scheduled
          </div>
        </div>

        <div className="na-card na-p-6">
          <div className="na-metadata na-mb-2">Total Paid (This Year)</div>
          <div className="na-data-large na-text-ok">
            $
            {completedAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="na-metadata na-text-sm na-mt-2">
            {completedPayments.length} payments completed
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="na-card na-p-6 na-mb-6">
        <div className="na-flex na-gap-4 na-mb-4">
          <Link
            href="/vendor/payments?view=upcoming"
            className={`na-btn ${
              view === "upcoming" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            Upcoming Payments
          </Link>
          <Link
            href="/vendor/payments?view=history"
            className={`na-btn ${
              view === "history" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            Payment History
          </Link>
          <Link
            href="/vendor/payments?view=all"
            className={`na-btn ${
              view === "all" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            All Payments
          </Link>
        </div>

        {/* Date Range Filter */}
        <form method="get" className="na-flex na-gap-4 na-items-end">
          <input type="hidden" name="view" value={view} />
          <div>
            <label className="na-metadata na-mb-2 na-block">Date From</label>
            <input
              type="date"
              name="date_from"
              defaultValue={params.date_from || ""}
              className="na-input"
            />
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Date To</label>
            <input
              type="date"
              name="date_to"
              defaultValue={params.date_to || ""}
              className="na-input"
            />
          </div>
          <button type="submit" className="na-btn na-btn-primary">
            Apply Filter
          </button>
          <Link
            href={`/vendor/payments?view=${view}`}
            className="na-btn na-btn-ghost"
          >
            Clear
          </Link>
        </form>
      </div>

      {/* Payment List */}
      <div className="na-card na-p-6">
        <h2 className="na-h3 na-mb-4">
          {view === "upcoming"
            ? "Upcoming Payments"
            : view === "history"
            ? "Payment History"
            : "All Payments"}{" "}
          ({paymentList.length})
        </h2>
        {paymentList.length === 0 ? (
          <div className="na-text-center na-p-6">
            <p className="na-body">
              {view === "upcoming"
                ? "No upcoming payments scheduled."
                : view === "history"
                ? "No payment history found."
                : "No payments found."}
            </p>
          </div>
        ) : (
          <div className="na-overflow-x-auto">
            <table className="na-table-frozen na-w-full">
              <thead>
                <tr className="na-tr">
                  <th className="na-th">Payment Ref</th>
                  <th className="na-th">Company</th>
                  <th className="na-th">Invoice #</th>
                  <th className="na-th">Payment Date</th>
                  <th className="na-th">Amount</th>
                  <th className="na-th">Status</th>
                  <th className="na-th">Method</th>
                  <th className="na-th">Transaction ID</th>
                  <th className="na-th">Bank Account</th>
                </tr>
              </thead>
              <tbody>
                {paymentList.map((payment: unknown) => {
                  const p = payment as {
                    id: string;
                    payment_ref: string;
                    payment_date: string;
                    amount: number;
                    currency_code: string;
                    status: string;
                    payment_method: string;
                    transaction_id: string | null;
                    bank_account_last4: string | null;
                    invoice_id: string | null;
                    vmp_invoices: {
                      invoice_num: string | null;
                      invoice_number: string | null;
                    } | null;
                    vmp_companies: { name: string };
                  };
                  return (
                    <tr key={p.id} className="na-tr na-hover-bg-paper-2">
                      <td className="na-td na-font-semibold">
                        {p.payment_ref}
                      </td>
                      <td className="na-td na-text-sm">
                        {p.vmp_companies?.name || "Unknown"}
                      </td>
                      <td className="na-td na-text-sm">
                        {p.vmp_invoices?.invoice_num ||
                          p.vmp_invoices?.invoice_number ||
                          "N/A"}
                      </td>
                      <td className="na-td na-text-sm">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="na-td na-data">
                        $
                        {p.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {p.currency_code || "USD"}
                      </td>
                      <td className="na-td">
                        <span
                          className={`na-status na-status-${
                            p.status === "completed"
                              ? "ok"
                              : p.status === "failed" ||
                                p.status === "cancelled"
                              ? "bad"
                              : p.status === "processing"
                              ? "warn"
                              : "pending"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="na-td na-text-sm">
                        {p.payment_method || "N/A"}
                      </td>
                      <td className="na-td na-text-sm na-font-mono na-text-xs">
                        {p.transaction_id || "N/A"}
                      </td>
                      <td className="na-td na-text-sm na-font-mono">
                        {p.bank_account_last4
                          ? `****${p.bank_account_last4}`
                          : "N/A"}
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
