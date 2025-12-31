/**
 * Unified Payment Run Page
 *
 * "God Mode" for Finance: All invoices together (External Vendors + Employee Claims).
 * One payment file for the bank.
 */

import { getRequestContext } from "@/lib/dev-auth-context";
import { createServiceClient } from "@/lib/supabase-client";
import { TenantAccessRepository } from "@/src/repositories/tenant-access-repository";

interface PaymentRunPageProps {
  searchParams: Promise<{
    tenant_id?: string;
    vendor_type?:
      | "all"
      | "SUPPLIER_EXTERNAL"
      | "SUPPLIER_INTERNAL"
      | "EMPLOYEE_CLAIMANT";
  }>;
}

// Type for invoice data from Supabase query
interface PaymentInvoice {
  id: string;
  amount: number;
  due_date: string;
  vendor_id: string;
  status: string;
  vmp_vendors: {
    vendor_type: string;
    legal_name: string;
    display_name: string | null;
    employee_id: string | null;
  };
  tenants: {
    name: string;
  };
}

export default async function PaymentRunPage({
  searchParams,
}: PaymentRunPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const supabase = createServiceClient();
  const tenantAccessRepo = new TenantAccessRepository();

  // Get accessible tenants
  const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(
    ctx.actor.userId
  );
  const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

  const selectedTenantId = params.tenant_id || null;
  const tenantIdsToQuery = selectedTenantId
    ? [selectedTenantId]
    : accessibleTenantIds;

  // Get all approved invoices (External Vendors + Employee Claims)
  let invoices: PaymentInvoice[] = [];

  if (tenantIdsToQuery.length > 0) {
    let invoiceQuery = supabase
      .from("vmp_invoices")
      .select(
        `
        *,
        vmp_vendors!inner(vendor_type, legal_name, display_name, employee_id),
        tenants!inner(name)
      `
      )
      .in("tenant_id", tenantIdsToQuery)
      .in("status", ["approved", "matched"])
      .order("due_date", { ascending: true });

    // Filter by vendor type if specified
    if (params.vendor_type && params.vendor_type !== "all") {
      invoiceQuery = invoiceQuery.eq(
        "vmp_vendors.vendor_type",
        params.vendor_type
      );
    }

    const { data, error } = await invoiceQuery;

    // Graceful error handling - return empty list on error
    invoices = error ? [] : ((data || []) as PaymentInvoice[]);
  }

  // Group by vendor type for summary
  const summary = invoices.reduce((acc, inv) => {
    const vendorType = inv.vmp_vendors?.vendor_type || "UNKNOWN";
    if (!acc[vendorType]) {
      acc[vendorType] = { count: 0, total: 0 };
    }
    acc[vendorType].count += 1;
    acc[vendorType].total += parseFloat((inv.amount || 0).toString());
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const totalAmount = invoices.reduce(
    (sum, inv) => sum + parseFloat((inv.amount || 0).toString()),
    0
  );

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Payment Run</h1>
        <p className="na-metadata">
          Unified payment for all vendors and employees
        </p>
      </div>

      {/* Summary Cards */}
      <div className="na-card na-p-4 na-mb-6">
        <div className="na-grid na-grid-cols-4 na-gap-4">
          <div>
            <div className="na-metadata">Total Invoices</div>
            <div className="na-data-large">{invoices.length}</div>
          </div>
          <div>
            <div className="na-metadata">Total Amount</div>
            <div className="na-data-large">
              $
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div className="na-metadata">External Vendors</div>
            <div className="na-data-large">
              {summary["SUPPLIER_EXTERNAL"]?.count || 0} ($
              {summary["SUPPLIER_EXTERNAL"]?.total.toLocaleString() || "0"})
            </div>
          </div>
          <div>
            <div className="na-metadata">Employee Claims</div>
            <div className="na-data-large">
              {summary["EMPLOYEE_CLAIMANT"]?.count || 0} ($
              {summary["EMPLOYEE_CLAIMANT"]?.total.toLocaleString() || "0"})
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="na-card na-p-4 na-mb-6">
        <form method="get" className="na-flex na-gap-4 na-items-end">
          <div>
            <label className="na-metadata na-mb-2 na-block">Vendor Type</label>
            <select
              name="vendor_type"
              className="na-input"
              defaultValue={params.vendor_type || "all"}
            >
              <option value="all">All Types</option>
              <option value="SUPPLIER_EXTERNAL">External Vendors</option>
              <option value="SUPPLIER_INTERNAL">Internal Vendors</option>
              <option value="EMPLOYEE_CLAIMANT">Employee Claims</option>
            </select>
          </div>
          <button type="submit" className="na-btn na-btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="na-card na-p-6 na-text-center">
          <h2 className="na-h4">No Invoices to Pay</h2>
          <p className="na-body na-mt-2">All caught up!</p>
        </div>
      ) : (
        <div className="na-card na-overflow-x-auto">
          <table className="na-table-frozen na-w-full">
            <thead>
              <tr className="na-tr">
                <th className="na-th">Vendor</th>
                <th className="na-th">Type</th>
                <th className="na-th">Invoice #</th>
                <th className="na-th">Amount</th>
                <th className="na-th">Due Date</th>
                <th className="na-th">Company</th>
                <th className="na-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: unknown) => {
                const i = inv as {
                  id: string;
                  invoice_num: string;
                  amount: number;
                  currency_code: string;
                  due_date: string;
                  vmp_vendors: {
                    vendor_type: string;
                    legal_name: string;
                    display_name: string | null;
                    employee_id: string | null;
                  };
                  tenants: { name: string };
                };
                const vendorName =
                  i.vmp_vendors?.display_name ||
                  i.vmp_vendors?.legal_name ||
                  "Unknown";
                const vendorType = i.vmp_vendors?.vendor_type || "UNKNOWN";
                const isEmployee = vendorType === "EMPLOYEE_CLAIMANT";

                return (
                  <tr key={i.id} className="na-tr na-hover-bg-paper-2">
                    <td className="na-td">
                      {vendorName}
                      {isEmployee && (
                        <span className="na-badge na-badge-info na-ml-2">
                          Employee
                        </span>
                      )}
                    </td>
                    <td className="na-td na-text-sm">{vendorType}</td>
                    <td className="na-td na-text-sm">{i.invoice_num}</td>
                    <td className="na-td na-data">
                      $
                      {i.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {i.currency_code || "USD"}
                    </td>
                    <td className="na-td na-text-sm">
                      {i.due_date
                        ? new Date(i.due_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="na-td na-text-sm">
                      {i.tenants?.name || "Unknown"}
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

      {/* Bulk Payment Action */}
      {invoices.length > 0 && (
        <div className="na-card na-p-4 na-mt-6">
          <div className="na-flex na-justify-between na-items-center">
            <div>
              <div className="na-metadata">
                Selected: {invoices.length} invoices
              </div>
              <div className="na-data-large">
                Total: $
                {totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <button className="na-btn na-btn-primary na-text-lg na-px-8">
              Pay All ({invoices.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
