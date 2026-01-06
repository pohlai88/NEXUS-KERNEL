/**
 * Vendor Invoice Detail Page
 * 
 * PRD V-01: Payment Status Transparency
 * - Status timeline (RECEIVED → UNDER_REVIEW → APPROVED → PAID)
 * - Rejection reasons (if rejected)
 * - Matching status (3-way matching)
 * - Payment schedule
 * - Documents (invoice PDF, PO, GRN)
 * - Audit trail
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { InvoiceRepository } from '@/src/repositories/invoice-repository';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

export default async function VendorInvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const ctx = getRequestContext();
  const invoiceRepo = new InvoiceRepository();

  // Get invoice
  const invoice = await invoiceRepo.findById(params.id);

  if (!invoice) {
    notFound();
  }

  // Get status timeline from audit trail
  const supabase = createClient();
  const { data: auditTrail } = await supabase
    .from('audit_events')
    .select('*')
    .eq('entity_type', 'invoice')
    .eq('entity_id', params.id)
    .order('created_at', { ascending: true });

  // Get linked documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('linked_entity_type', 'invoice')
    .eq('linked_entity_id', params.id)
    .order('created_at', { ascending: false });

  // Get 3-way matching status
  const { data: matching } = await supabase
    .from('three_way_matches')
    .select('*')
    .eq('invoice_id', params.id)
    .single();

  // Calculate expected payment date (invoice_date + payment_terms)
  const expectedPaymentDate = invoice.due_date
    ? new Date(invoice.due_date)
    : invoice.invoice_date
      ? new Date(new Date(invoice.invoice_date).getTime() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
      : null;

  // Determine current status display (PRD V-01: Canonical statuses)
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'badge-success' | 'bad' | 'badge-warning' | 'pending' }> =
      {
        received: { label: 'RECEIVED', variant: 'pending' },
        pending: { label: 'UNDER_REVIEW', variant: 'pending' },
        under_review: { label: 'UNDER_REVIEW', variant: 'pending' },
        matched: { label: 'UNDER_REVIEW', variant: 'pending' },
        approved: { label: 'APPROVED_FOR_PAYMENT', variant: 'badge-success' },
        rejected: { label: 'REJECTED', variant: 'bad' },
        paid: { label: 'PAID', variant: 'badge-success' },
        disputed: { label: 'DISPUTED', variant: 'badge-warning' },
        cancelled: { label: 'CANCELLED', variant: 'bad' },
      };

    return statusMap[status.toLowerCase()] || { label: status.toUpperCase(), variant: 'pending' };
  };

  const statusDisplay = getStatusDisplay(invoice.status);

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Invoice {invoice.invoice_num}</h1>
          <p className="caption mt-2">
            Created: {new Date(invoice.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link href="/vendor/invoices" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to Invoices
        </Link>
      </div>

      {/* Status Card (PRD V-01: Payment Status Transparency) */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">Current Status</h2>
        <div className="flex items-center gap-4 mb-4">
          <span className={`badge badge-${statusDisplay.variant} text-lg`}>
            {statusDisplay.label}
          </span>
          <div className="caption text-sm">
            Last updated: {new Date(invoice.updated_at).toLocaleString()}
          </div>
        </div>

        {/* Expected Next Step (PRD V-01) */}
        <div className="card p-4 bg-nx-surface-well mt-4">
          <div className="caption mb-2">Expected Next Step</div>
          <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
            {invoice.status === 'approved'
              ? `Payment scheduled for ${expectedPaymentDate?.toLocaleDateString() || 'TBD'}`
              : invoice.status === 'pending' || invoice.status === 'under_review'
                ? 'Invoice is under review. You will be notified when status changes.'
                : invoice.status === 'rejected'
                  ? 'Invoice was rejected. Please review rejection reason below.'
                  : invoice.status === 'paid'
                    ? 'Invoice has been paid.'
                    : 'Status update pending.'}
          </div>
        </div>

        {/* Expected Payment Date (PRD V-01) */}
        {expectedPaymentDate && (
          <div className="card p-4 bg-nx-surface-well mt-4">
            <div className="caption mb-2">Expected Payment Date</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{expectedPaymentDate.toLocaleDateString()}</div>
            <div className="caption text-sm mt-2">
              Based on invoice date and payment terms
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="caption mb-2 block">Invoice Number</label>
            <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{invoice.invoice_num}</div>
          </div>
          <div>
            <label className="caption mb-2 block">Invoice Date</label>
            <div className="text-[length:var(--nx-body-size)] text-nx-text-main">
              {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div>
            <label className="caption mb-2 block">Amount</label>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
              ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
              {invoice.currency_code || 'USD'}
            </div>
          </div>
          <div>
            <label className="caption mb-2 block">Due Date</label>
            <div className="text-[length:var(--nx-body-size)] text-nx-text-main">
              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline (PRD V-01) */}
      {auditTrail && auditTrail.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="section mb-4">Status Timeline</h2>
          <div className="space-y-4">
            {auditTrail.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-nx-primary mt-2"></div>
                  {index < auditTrail.length - 1 && (
                    <div className="w-0.5 h-8 bg-nx-canvas ml-1"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="caption text-sm">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                  <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-1">{event.action}</div>
                  {event.workflow_state && (
                    <div className="caption text-sm mt-1">
                      {JSON.stringify(event.workflow_state)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Way Matching Status */}
      {matching && (
        <div className="card p-6 mb-6">
          <h2 className="section mb-4">3-Way Matching Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="caption mb-2 block">PO Match</label>
              <span
                className={`badge badge-${matching.po_match ? 'badge-success' : 'bad'}`}
              >
                {matching.po_match ? 'Matched' : 'Not Matched'}
              </span>
            </div>
            <div>
              <label className="caption mb-2 block">GRN Match</label>
              <span
                className={`badge badge-${matching.grn_match ? 'badge-success' : 'bad'}`}
              >
                {matching.grn_match ? 'Matched' : 'Not Matched'}
              </span>
            </div>
            <div>
              <label className="caption mb-2 block">Overall Match</label>
              <span
                className={`badge badge-${matching.match_score >= 0.8 ? 'badge-success' : 'badge-warning'}`}
              >
                {matching.match_score >= 0.8 ? 'Complete' : 'Incomplete'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      {documents && documents.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="section mb-4">Documents</h2>
          <div className="space-y-2">
            {documents.map((doc: unknown) => {
              const d = doc as { id: string; name: string; file_url: string };
              return (
                <div key={d.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{d.name}</div>
                    <div className="caption text-sm">Document</div>
                  </div>
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main px-3 py-1.5 text-sm"
                  >
                    View
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rejection Reason (if rejected) */}
      {invoice.status === 'rejected' && (
        <div className="card p-6 bg-nx-danger-bg text-nx-danger">
          <h2 className="text-base font-semibold text-nx-text-main mb-2">Rejection Reason</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
            {invoice.rejection_reason || 'No rejection reason provided.'}
          </p>
        </div>
      )}
    </div>
  );
}

