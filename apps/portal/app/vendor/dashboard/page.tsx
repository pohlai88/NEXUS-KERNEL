/**
 * Vendor Dashboard Page
 * 
 * Home page for vendors - Summary cards, recent activity, quick actions.
 * First thing vendor sees when logging in.
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { VendorGroupRepository } from '@/src/repositories/vendor-group-repository';
import Link from 'next/link';

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

export default async function VendorDashboardPage() {
  const ctx = getRequestContext();
  const supabase = createClient();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
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
      .from('vmp_invoices')
      .select('id, amount')
      .in('tenant_id', accessibleTenantIds)
      .in('status', ['pending', 'matched', 'under_review'])
      .limit(1000);

    pendingInvoices = pendingData?.length || 0;

    // Get approved invoices count
    const { data: approvedData } = await supabase
      .from('vmp_invoices')
      .select('id, amount')
      .in('tenant_id', accessibleTenantIds)
      .eq('status', 'approved')
      .limit(1000);

    approvedInvoices = approvedData?.length || 0;

    // Calculate total outstanding
    const { data: outstandingData } = await supabase
      .from('vmp_invoices')
      .select('amount')
      .in('tenant_id', accessibleTenantIds)
      .in('status', ['approved', 'matched'])
      .limit(1000);

    totalOutstanding = (outstandingData || []).reduce(
      (sum, inv) => sum + parseFloat((inv.amount || 0).toString()),
      0
    );

    // Get next payment date (earliest due_date from approved invoices)
    const { data: nextPaymentData } = await supabase
      .from('vmp_invoices')
      .select('due_date')
      .in('tenant_id', accessibleTenantIds)
      .eq('status', 'approved')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
      .limit(1)
      .single();

    nextPaymentDate = nextPaymentData?.due_date || null;

    // Get recent invoices (last 5)
    const { data: recentData } = await supabase
      .from('vmp_invoices')
      .select('id, invoice_num, amount, status, invoice_date, tenant_id, tenants!inner(name)')
      .in('tenant_id', accessibleTenantIds)
      .order('created_at', { ascending: false })
      .limit(5);

    recentInvoices = recentData || [];
  }

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Vendor Dashboard</h1>
        <p className="caption">Welcome back! Here's your overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-6">
          <div className="caption mb-2">Pending Invoices</div>
          <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-warning">{pendingInvoices}</div>
          <div className="caption text-sm mt-2">Awaiting approval</div>
        </div>

        <div className="card p-6">
          <div className="caption mb-2">Approved Invoices</div>
          <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-success">{approvedInvoices}</div>
          <div className="caption text-sm mt-2">Ready for payment</div>
        </div>

        <div className="card p-6">
          <div className="caption mb-2">Total Outstanding</div>
          <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-primary">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="caption text-sm mt-2">Unpaid invoices</div>
        </div>

        <div className="card p-6">
          <div className="caption mb-2">Next Payment</div>
          <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
            {nextPaymentDate
              ? new Date(nextPaymentDate).toLocaleDateString()
              : 'No scheduled payments'}
          </div>
          <div className="caption text-sm mt-2">
            {nextPaymentDate ? 'Earliest due date' : 'No approved invoices'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/invoices/upload" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
            📤 Upload Invoice
          </Link>
          <Link href="/vendor/invoices" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
            📋 View All Invoices
          </Link>
          <Link href="/vendor/payments" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
            💰 Payment Schedule
          </Link>
          <Link href="/vendor/cases" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
            📞 Create Case
          </Link>
          <Link href="/vendor/profile" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
            ⚙️ Profile Settings
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="section mb-4">Recent Invoices</h2>
        {recentInvoices.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">No recent invoices.</p>
            <Link href="/invoices/upload" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4">
              Upload Your First Invoice
            </Link>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="table-professional w-full w-full">
              <thead>
                <tr className="table-row">
                  <th className="table-header-cell">Invoice #</th>
                  <th className="table-header-cell">Company</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
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
                    <tr key={i.id} className="table-row hover:bg-nx-surface-well">
                      <td className="table-data-cell font-semibold">{i.invoice_num}</td>
                      <td className="table-data-cell text-sm">{i.tenants?.name || 'Unknown'}</td>
                      <td className="table-data-cell text-[length:var(--nx-body-size)] text-nx-text-main">
                        ${i.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="table-data-cell text-sm">
                        {new Date(i.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="table-data-cell">
                        <span
                          className={`badge badge-${
                            i.status === 'approved'
                              ? 'badge-success'
                              : i.status === 'rejected'
                                ? 'bad'
                                : 'pending'
                          }`}
                        >
                          {i.status}
                        </span>
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

