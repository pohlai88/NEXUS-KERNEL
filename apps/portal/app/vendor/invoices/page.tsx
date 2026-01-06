/**
 * Vendor Invoice List Page
 * 
 * PRD V-01: Payment Status Transparency
 * - Filter by: Status, Date Range, Amount, Subsidiary
 * - Sort by: Date, Amount, Status
 * - Search by: Invoice Number, PO Number
 * - Export to Excel/PDF
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { InvoiceRepository } from '@/src/repositories/invoice-repository';
import { VendorGroupRepository } from '@/src/repositories/vendor-group-repository';
import Link from 'next/link';
import { InvoiceStatusDisplay } from '@/components/invoices/InvoiceStatusDisplay';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      vendorGroupId: 'default', // TODO: Get from vendor_user_access
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface VendorInvoicesPageProps {
  searchParams: {
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    sort?: 'date' | 'amount' | 'status';
    order?: 'asc' | 'desc';
  };
}

export default async function VendorInvoicesPage({ searchParams }: VendorInvoicesPageProps) {
  const ctx = getRequestContext();
  const supabase = createClient();
  const invoiceRepo = new InvoiceRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Build query
  let query = supabase
    .from('vmp_invoices')
    .select('id, invoice_num, invoice_number, invoice_date, amount, currency_code, status, due_date, created_at, updated_at, company_id, vmp_companies!inner(name)')
    .in('tenant_id', accessibleTenantIds.length > 0 ? accessibleTenantIds : ['']);

  // Apply filters
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams.date_from) {
    query = query.gte('invoice_date', searchParams.date_from);
  }

  if (searchParams.date_to) {
    query = query.lte('invoice_date', searchParams.date_to);
  }

  if (searchParams.search) {
    query = query.or(`invoice_num.ilike.%${searchParams.search}%,invoice_number.ilike.%${searchParams.search}%,po_ref.ilike.%${searchParams.search}%`);
  }

  // Apply sorting
  const sortBy = searchParams.sort || 'date';
  const order = searchParams.order || 'desc';

  if (sortBy === 'date') {
    query = query.order('invoice_date', { ascending: order === 'asc' });
  } else if (sortBy === 'amount') {
    query = query.order('amount', { ascending: order === 'asc' });
  } else if (sortBy === 'status') {
    query = query.order('status', { ascending: order === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: invoices, error } = await query.limit(100);

  if (error) {
    console.error('Error fetching invoices:', error);
  }

  const invoiceList = invoices || [];

  // Get status counts for filter badges
  const { data: statusCounts } = await supabase
    .from('vmp_invoices')
    .select('status')
    .in('tenant_id', accessibleTenantIds.length > 0 ? accessibleTenantIds : ['']);

  const statusCountMap = (statusCounts || []).reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">My Invoices</h1>
        <Link href="/invoices/upload" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
          📤 Upload Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">Filters</h2>
        <form method="get" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="caption mb-2 block">Status</label>
              <select
                name="status"
                defaultValue={searchParams.status || ''}
                className="input w-full"
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
              <label className="caption mb-2 block">Date From</label>
              <input
                type="date"
                name="date_from"
                defaultValue={searchParams.date_from || ''}
                className="input w-full"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="caption mb-2 block">Date To</label>
              <input
                type="date"
                name="date_to"
                defaultValue={searchParams.date_to || ''}
                className="input w-full"
              />
            </div>

            {/* Search */}
            <div>
              <label className="caption mb-2 block">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Invoice #, PO #"
                defaultValue={searchParams.search || ''}
                className="input w-full"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <div>
              <label className="caption mb-2 block">Sort By</label>
              <select
                name="sort"
                defaultValue={searchParams.sort || 'date'}
                className="input"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div>
              <label className="caption mb-2 block">Order</label>
              <select
                name="order"
                defaultValue={searchParams.order || 'desc'}
                className="input"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="flex items-end gap-2 mt-6">
              <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
                Apply Filters
              </button>
              <Link href="/vendor/invoices" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
                Clear
              </Link>
            </div>
          </div>
        </form>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href="/vendor/invoices"
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm ${!searchParams.status ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            All ({invoiceList.length})
          </Link>
          {Object.entries(statusCountMap).map(([status, count]) => (
            <Link
              key={status}
              href={`/vendor/invoices?status=${status}`}
              className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm ${searchParams.status === status ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
            >
              {status} ({count})
            </Link>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="card p-6">
        <h2 className="section mb-4">Invoices ({invoiceList.length})</h2>
        {invoiceList.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">No invoices found.</p>
            <Link href="/invoices/upload" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4">
              Upload Your First Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-professional w-full w-full">
              <thead>
                <tr className="table-row">
                  <th className="table-header-cell">Invoice #</th>
                  <th className="table-header-cell">Company</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Due Date</th>
                  <th className="table-header-cell">Actions</th>
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
                    <tr key={i.id} className="table-row hover:bg-nx-surface-well">
                      <td className="table-data-cell font-semibold">
                        {i.invoice_num || i.invoice_number || 'N/A'}
                      </td>
                      <td className="table-data-cell text-sm">{i.vmp_companies?.name || 'Unknown'}</td>
                      <td className="table-data-cell text-sm">
                        {i.invoice_date ? new Date(i.invoice_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="table-data-cell text-[length:var(--nx-body-size)] text-nx-text-main">
                        {i.amount
                          ? `$${i.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${i.currency_code || 'USD'}`
                          : 'N/A'}
                      </td>
                      <td className="table-data-cell">
                        <Suspense fallback={<span className="badge badge-info">Loading...</span>}>
                          <InvoiceStatusDisplay invoiceId={i.id} />
                        </Suspense>
                      </td>
                      <td className="table-data-cell text-sm">
                        {i.due_date ? new Date(i.due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="table-data-cell">
                        <Link
                          href={`/vendor/invoices/${i.id}`}
                          className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main px-3 py-1.5 text-sm"
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

