/**
 * Unified Payment Run Page
 * 
 * "God Mode" for Finance: All invoices together (External Vendors + Employee Claims).
 * One payment file for the bank.
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { TenantAccessRepository } from '@/src/repositories/tenant-access-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: null, // null = all companies
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface PaymentRunPageProps {
  searchParams: {
    tenant_id?: string;
    vendor_type?: 'all' | 'SUPPLIER_EXTERNAL' | 'SUPPLIER_INTERNAL' | 'EMPLOYEE_CLAIMANT';
  };
}

export default async function PaymentRunPage({ searchParams }: PaymentRunPageProps) {
  const ctx = getRequestContext();
  const supabase = createClient();
  const tenantAccessRepo = new TenantAccessRepository();

  // Get accessible tenants
  const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(ctx.actor.userId);
  const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

  const selectedTenantId = searchParams.tenant_id || null;
  const tenantIdsToQuery = selectedTenantId ? [selectedTenantId] : accessibleTenantIds;

  // Get all approved invoices (External Vendors + Employee Claims)
  let invoices: unknown[] = [];

  if (tenantIdsToQuery.length > 0) {
    let invoiceQuery = supabase
      .from('vmp_invoices')
      .select(`
        *,
        vmp_vendors!inner(vendor_type, legal_name, display_name, employee_id),
        tenants!inner(name)
      `)
      .in('tenant_id', tenantIdsToQuery)
      .in('status', ['approved', 'matched'])
      .order('due_date', { ascending: true });

    // Filter by vendor type if specified
    if (searchParams.vendor_type && searchParams.vendor_type !== 'all') {
      invoiceQuery = invoiceQuery.eq('vmp_vendors.vendor_type', searchParams.vendor_type);
    }

    const { data, error } = await invoiceQuery;

    if (error) {
      console.error('Failed to fetch invoices:', error);
    } else {
      invoices = data || [];
    }
  }

  // Group by vendor type for summary
  const summary = invoices.reduce(
    (acc, inv: unknown) => {
      const i = inv as { vmp_vendors: { vendor_type: string }; amount: number };
      const vendorType = i.vmp_vendors?.vendor_type || 'UNKNOWN';
      if (!acc[vendorType]) {
        acc[vendorType] = { count: 0, total: 0 };
      }
      acc[vendorType].count += 1;
      acc[vendorType].total += parseFloat((i.amount || 0).toString());
      return acc;
    },
    {} as Record<string, { count: number; total: number }>
  );

  const totalAmount = invoices.reduce(
    (sum, inv: unknown) => sum + parseFloat(((inv as { amount: number }).amount || 0).toString()),
    0
  );

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Payment Run</h1>
        <p className="caption">Unified payment for all vendors and employees</p>
      </div>

      {/* Summary Cards */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="caption">Total Invoices</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{invoices.length}</div>
          </div>
          <div>
            <div className="caption">Total Amount</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className="caption">External Vendors</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
              {summary['SUPPLIER_EXTERNAL']?.count || 0} (${summary['SUPPLIER_EXTERNAL']?.total.toLocaleString() || '0'})
            </div>
          </div>
          <div>
            <div className="caption">Employee Claims</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
              {summary['EMPLOYEE_CLAIMANT']?.count || 0} (${summary['EMPLOYEE_CLAIMANT']?.total.toLocaleString() || '0'})
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4 mb-6">
        <form method="get" className="flex gap-4 items-end">
          <div>
            <label className="caption mb-2 block">Vendor Type</label>
            <select name="vendor_type" className="input" defaultValue={searchParams.vendor_type || 'all'}>
              <option value="all">All Types</option>
              <option value="SUPPLIER_EXTERNAL">External Vendors</option>
              <option value="SUPPLIER_INTERNAL">Internal Vendors</option>
              <option value="EMPLOYEE_CLAIMANT">Employee Claims</option>
            </select>
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">Filter</button>
        </form>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="card p-6 text-center">
          <h2 className="text-base font-semibold text-nx-text-main">No Invoices to Pay</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">All caught up!</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-professional w-full w-full">
            <thead>
              <tr className="table-row">
                <th className="table-header-cell">Vendor</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Invoice #</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Due Date</th>
                <th className="table-header-cell">Company</th>
                <th className="table-header-cell">Actions</th>
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
                  vmp_vendors: { vendor_type: string; legal_name: string; display_name: string | null; employee_id: string | null };
                  tenants: { name: string };
                };
                const vendorName = i.vmp_vendors?.display_name || i.vmp_vendors?.legal_name || 'Unknown';
                const vendorType = i.vmp_vendors?.vendor_type || 'UNKNOWN';
                const isEmployee = vendorType === 'EMPLOYEE_CLAIMANT';

                return (
                  <tr key={i.id} className="table-row hover:bg-nx-surface-well">
                    <td className="table-data-cell">
                      {vendorName}
                      {isEmployee && <span className="badge badge-info ml-2">Employee</span>}
                    </td>
                    <td className="table-data-cell text-sm">{vendorType}</td>
                    <td className="table-data-cell text-sm">{i.invoice_num}</td>
                    <td className="table-data-cell text-[length:var(--nx-body-size)] text-nx-text-main">
                      ${i.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {i.currency_code || 'USD'}
                    </td>
                    <td className="table-data-cell text-sm">
                      {i.due_date ? new Date(i.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-data-cell text-sm">{i.tenants?.name || 'Unknown'}</td>
                    <td className="table-data-cell">
                      <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main px-3 py-1.5 text-sm">View</button>
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
        <div className="card p-4 mt-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="caption">Selected: {invoices.length} invoices</div>
              <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
                Total: ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary text-lg px-8">
              Pay All ({invoices.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

