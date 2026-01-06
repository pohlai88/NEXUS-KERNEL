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

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { PaymentRepository } from '@/src/repositories/payment-repository';
import { InvoiceRepository } from '@/src/repositories/invoice-repository';
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

interface VendorPaymentsPageProps {
  searchParams: {
    view?: 'upcoming' | 'history' | 'all';
    date_from?: string;
    date_to?: string;
  };
}

export default async function VendorPaymentsPage({ searchParams }: VendorPaymentsPageProps) {
  const ctx = getRequestContext();
  const supabase = createClient();
  const paymentRepo = new PaymentRepository();
  const invoiceRepo = new InvoiceRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  const view = searchParams.view || 'all';
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // Build payment query
  let paymentQuery = supabase
    .from('vmp_payments')
    .select('id, payment_ref, payment_date, amount, currency_code, status, payment_method, transaction_id, bank_account_last4, invoice_id, created_at, updated_at, vmp_invoices!left(invoice_num, invoice_number), vmp_companies!inner(name)')
    .in('tenant_id', accessibleTenantIds.length > 0 ? accessibleTenantIds : ['']);

  if (view === 'upcoming') {
    paymentQuery = paymentQuery
      .gte('payment_date', today.toISOString().split('T')[0])
      .lte('payment_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .in('status', ['pending', 'scheduled', 'processing']);
  } else if (view === 'history') {
    paymentQuery = paymentQuery
      .lt('payment_date', today.toISOString().split('T')[0])
      .in('status', ['completed', 'failed', 'cancelled']);
  }

  if (searchParams.date_from) {
    paymentQuery = paymentQuery.gte('payment_date', searchParams.date_from);
  }

  if (searchParams.date_to) {
    paymentQuery = paymentQuery.lte('payment_date', searchParams.date_to);
  }

  paymentQuery = paymentQuery.order('payment_date', { ascending: view === 'upcoming' });

  const { data: payments, error: paymentsError } = await paymentQuery.limit(100);

  if (paymentsError) {
    console.error('Error fetching payments:', paymentsError);
  }

  const paymentList = payments || [];

  // Calculate outstanding amount (approved invoices not yet paid)
  const { data: outstandingInvoices } = await supabase
    .from('vmp_invoices')
    .select('amount, currency_code')
    .in('tenant_id', accessibleTenantIds.length > 0 ? accessibleTenantIds : [''])
    .in('status', ['approved', 'matched'])
    .is('paid_date', null);

  const outstandingAmount = (outstandingInvoices || []).reduce((sum, inv) => {
    return sum + parseFloat((inv.amount || 0).toString());
  }, 0);

  // Get payment summary stats
  const { data: allPayments } = await supabase
    .from('vmp_payments')
    .select('amount, status, payment_date')
    .in('tenant_id', accessibleTenantIds.length > 0 ? accessibleTenantIds : ['']);

  const upcomingPayments = (allPayments || []).filter(
    (p) =>
      p.payment_date >= today.toISOString().split('T')[0] &&
      p.payment_date <= thirtyDaysFromNow.toISOString().split('T')[0] &&
      ['pending', 'scheduled', 'processing'].includes(p.status)
  );

  const upcomingAmount = upcomingPayments.reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

  const completedPayments = (allPayments || []).filter(
    (p) => p.status === 'completed' && p.payment_date < today.toISOString().split('T')[0]
  );

  const completedAmount = completedPayments.reduce((sum, p) => sum + parseFloat((p.amount || 0).toString()), 0);

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Payment Schedule</h1>
        <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-6">
          <div className="caption mb-2">Outstanding Amount</div>
          <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-warning">
            ${outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="caption text-sm mt-2">Unpaid approved invoices</div>
        </div>

        <div className="card p-6">
          <div className="caption mb-2">Upcoming Payments (30 days)</div>
          <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-primary">
            ${upcomingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="caption text-sm mt-2">{upcomingPayments.length} payments scheduled</div>
        </div>

        <div className="card p-6">
          <div className="caption mb-2">Total Paid (This Year)</div>
          <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-success">
            ${completedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="caption text-sm mt-2">{completedPayments.length} payments completed</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <Link
            href="/vendor/payments?view=upcoming"
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${view === 'upcoming' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            Upcoming Payments
          </Link>
          <Link
            href="/vendor/payments?view=history"
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${view === 'history' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            Payment History
          </Link>
          <Link
            href="/vendor/payments?view=all"
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${view === 'all' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            All Payments
          </Link>
        </div>

        {/* Date Range Filter */}
        <form method="get" className="flex gap-4 items-end">
          <input type="hidden" name="view" value={view} />
          <div>
            <label className="caption mb-2 block">Date From</label>
            <input
              type="date"
              name="date_from"
              defaultValue={searchParams.date_from || ''}
              className="input"
            />
          </div>
          <div>
            <label className="caption mb-2 block">Date To</label>
            <input
              type="date"
              name="date_to"
              defaultValue={searchParams.date_to || ''}
              className="input"
            />
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
            Apply Filter
          </button>
          <Link href={`/vendor/payments?view=${view}`} className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
            Clear
          </Link>
        </form>
      </div>

      {/* Payment List */}
      <div className="card p-6">
        <h2 className="section mb-4">
          {view === 'upcoming' ? 'Upcoming Payments' : view === 'history' ? 'Payment History' : 'All Payments'} (
          {paymentList.length})
        </h2>
        {paymentList.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
              {view === 'upcoming'
                ? 'No upcoming payments scheduled.'
                : view === 'history'
                  ? 'No payment history found.'
                  : 'No payments found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-professional w-full w-full">
              <thead>
                <tr className="table-row">
                  <th className="table-header-cell">Payment Ref</th>
                  <th className="table-header-cell">Company</th>
                  <th className="table-header-cell">Invoice #</th>
                  <th className="table-header-cell">Payment Date</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Method</th>
                  <th className="table-header-cell">Transaction ID</th>
                  <th className="table-header-cell">Bank Account</th>
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
                    vmp_invoices: { invoice_num: string | null; invoice_number: string | null } | null;
                    vmp_companies: { name: string };
                  };
                  return (
                    <tr key={p.id} className="table-row hover:bg-nx-surface-well">
                      <td className="table-data-cell font-semibold">{p.payment_ref}</td>
                      <td className="table-data-cell text-sm">{p.vmp_companies?.name || 'Unknown'}</td>
                      <td className="table-data-cell text-sm">
                        {p.vmp_invoices?.invoice_num || p.vmp_invoices?.invoice_number || 'N/A'}
                      </td>
                      <td className="table-data-cell text-sm">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="table-data-cell text-[length:var(--nx-body-size)] text-nx-text-main">
                        ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {p.currency_code || 'USD'}
                      </td>
                      <td className="table-data-cell">
                        <span
                          className={`badge badge-${
                            p.status === 'completed'
                              ? 'badge-success'
                              : p.status === 'failed' || p.status === 'cancelled'
                                ? 'bad'
                                : p.status === 'processing'
                                  ? 'badge-warning'
                                  : 'pending'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="table-data-cell text-sm">{p.payment_method || 'N/A'}</td>
                      <td className="table-data-cell text-sm font-mono text-xs">
                        {p.transaction_id || 'N/A'}
                      </td>
                      <td className="table-data-cell text-sm font-mono">
                        {p.bank_account_last4 ? `****${p.bank_account_last4}` : 'N/A'}
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
