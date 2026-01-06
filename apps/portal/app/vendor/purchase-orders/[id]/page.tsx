/**
 * Vendor PO Detail & Acknowledgment Page
 * 
 * View PO details, Acknowledge PO (Accept/Reject), Add comments, Upload acknowledgment document.
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { PORepository } from '@/src/repositories/po-repository';
import { DocumentRepository } from '@/src/repositories/document-repository';
import { VendorGroupRepository } from '@/src/repositories/vendor-group-repository';
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

interface PODetailPageProps {
  params: {
    id: string;
  };
}

export default async function VendorPODetailPage({ params }: PODetailPageProps) {
  const ctx = getRequestContext();
  const poRepo = new PORepository();
  const docRepo = new DocumentRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get PO
  const po = await poRepo.findById(params.id);

  if (!po) {
    notFound();
  }

  // Get accessible subsidiaries
  const accessibleSubsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Verify vendor has access to this PO (using company_id)
  // In production, this would check vendor_user_access -> vendor_group -> vmp_vendors -> company_id
  // For now, we'll allow if PO exists and is in accessible companies
  // Note: accessibleTenantIds contains tenant_ids, but PO uses company_id
  // In production, map tenant_id to company_id or use a unified identifier

  // Get PO documents
  const supabase = createClient();
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('linked_entity_type', 'purchase_order')
    .eq('linked_entity_id', params.id)
    .order('created_at', { ascending: false });

  // Get acknowledgment document if exists
  const acknowledgmentDoc = po.acknowledgment_document_id
    ? await docRepo.getById(po.acknowledgment_document_id)
    : null;

  // Get audit trail for status timeline
  const { data: auditTrail } = await supabase
    .from('audit_events')
    .select('*')
    .eq('entity_type', 'purchase_order')
    .eq('entity_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Purchase Order {po.po_number}</h1>
          <p className="caption mt-2">
            Created: {new Date(po.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link href="/vendor-omni-dashboard?type=pos" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to POs
        </Link>
      </div>

      {/* Status Card */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">Current Status</h2>
        <div className="flex items-center gap-4 mb-4">
          <span
            className={`badge badge-${
              po.status === 'acknowledged'
                ? 'badge-success'
                : po.status === 'rejected'
                  ? 'bad'
                  : 'pending'
            }`}
          >
            {po.status.toUpperCase()}
          </span>
          <div className="caption text-sm">
            Last updated: {new Date(po.updated_at).toLocaleString()}
          </div>
        </div>

        {po.acknowledged_at && (
          <div className="card p-4 bg-nx-surface-well mt-4">
            <div className="caption mb-2">Acknowledged</div>
            <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
              {po.status === 'acknowledged' ? 'Accepted' : 'Rejected'} on{' '}
              {new Date(po.acknowledged_at).toLocaleString()}
            </div>
            {po.acknowledgment_notes && (
              <div className="caption text-sm mt-2">Notes: {po.acknowledgment_notes}</div>
            )}
          </div>
        )}
      </div>

      {/* PO Details */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">PO Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="caption mb-2 block">PO Number</label>
            <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{po.po_number}</div>
          </div>
          <div>
            <label className="caption mb-2 block">Created Date</label>
            <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{new Date(po.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <label className="caption mb-2 block">Amount</label>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
              {po.total_amount
                ? `$${po.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : 'N/A'}
            </div>
          </div>
          <div>
            <label className="caption mb-2 block">Status</label>
            <div>
              <span
                className={`badge badge-${
                  po.status === 'acknowledged'
                    ? 'badge-success'
                    : po.status === 'rejected'
                      ? 'bad'
                      : 'pending'
                }`}
              >
                {po.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgment Section (if not acknowledged) */}
      {!po.acknowledged_at && (
        <div className="card p-6 mb-6">
          <h2 className="section mb-4">Acknowledge PO</h2>
          <form action="/vendor/purchase-orders/acknowledge" method="post" className="space-y-4">
            <input type="hidden" name="po_id" value={po.id} />
            <input type="hidden" name="acknowledged_by" value={ctx.actor.userId} />

            <div>
              <label className="caption mb-2 block">Action</label>
              <select name="action" className="input w-full" required>
                <option value="">Select Action</option>
                <option value="accept">Accept PO</option>
                <option value="reject">Reject PO</option>
              </select>
            </div>

            <div>
              <label className="caption mb-2 block">Notes/Comments</label>
              <textarea
                name="notes"
                className="input w-full"
                rows={4}
                placeholder="Add any comments or notes..."
              />
            </div>

            <div>
              <label className="caption mb-2 block">Upload Acknowledgment Document (Optional)</label>
              <input type="file" name="document" className="input w-full" accept=".pdf,.jpg,.png" />
              <p className="caption text-sm mt-2">
                Upload signed PO or acknowledgment document
              </p>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
                Submit Acknowledgment
              </button>
              <Link href="/vendor-omni-dashboard?type=pos" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Status Timeline */}
      {auditTrail && auditTrail.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="section mb-4">Status Timeline</h2>
          <div className="space-y-4">
            {auditTrail.map((event) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-nx-primary mt-2"></div>
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

      {/* Documents */}
      {documents && documents.length > 0 && (
        <div className="card p-6">
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

      {/* Acknowledgment Document */}
      {acknowledgmentDoc && (
        <div className="card p-6">
          <h2 className="section mb-4">Acknowledgment Document</h2>
          <div className="card p-4 flex items-center justify-between">
            <div>
              <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{acknowledgmentDoc.name}</div>
              <div className="caption text-sm">Uploaded on acknowledgment</div>
            </div>
            <a
              href={acknowledgmentDoc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main px-3 py-1.5 text-sm"
            >
              View
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

