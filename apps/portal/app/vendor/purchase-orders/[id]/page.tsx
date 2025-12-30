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
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <div>
          <h1 className="na-h1">Purchase Order {po.po_number}</h1>
          <p className="na-metadata na-mt-2">
            Created: {new Date(po.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link href="/vendor-omni-dashboard?type=pos" className="na-btn na-btn-ghost">
          ← Back to POs
        </Link>
      </div>

      {/* Status Card */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Current Status</h2>
        <div className="na-flex na-items-center na-gap-4 na-mb-4">
          <span
            className={`na-status na-status-${
              po.status === 'acknowledged'
                ? 'ok'
                : po.status === 'rejected'
                  ? 'bad'
                  : 'pending'
            }`}
          >
            {po.status.toUpperCase()}
          </span>
          <div className="na-metadata na-text-sm">
            Last updated: {new Date(po.updated_at).toLocaleString()}
          </div>
        </div>

        {po.acknowledged_at && (
          <div className="na-card na-p-4 na-bg-paper-2 na-mt-4">
            <div className="na-metadata na-mb-2">Acknowledged</div>
            <div className="na-body">
              {po.status === 'acknowledged' ? 'Accepted' : 'Rejected'} on{' '}
              {new Date(po.acknowledged_at).toLocaleString()}
            </div>
            {po.acknowledgment_notes && (
              <div className="na-metadata na-text-sm na-mt-2">Notes: {po.acknowledgment_notes}</div>
            )}
          </div>
        )}
      </div>

      {/* PO Details */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">PO Details</h2>
        <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 na-gap-4">
          <div>
            <label className="na-metadata na-mb-2 na-block">PO Number</label>
            <div className="na-data">{po.po_number}</div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Created Date</label>
            <div className="na-data">{new Date(po.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Amount</label>
            <div className="na-data-large">
              {po.total_amount
                ? `$${po.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : 'N/A'}
            </div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Status</label>
            <div>
              <span
                className={`na-status na-status-${
                  po.status === 'acknowledged'
                    ? 'ok'
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
        <div className="na-card na-p-6 na-mb-6">
          <h2 className="na-h3 na-mb-4">Acknowledge PO</h2>
          <form action="/vendor/purchase-orders/acknowledge" method="post" className="na-space-y-4">
            <input type="hidden" name="po_id" value={po.id} />
            <input type="hidden" name="acknowledged_by" value={ctx.actor.userId} />

            <div>
              <label className="na-metadata na-mb-2 na-block">Action</label>
              <select name="action" className="na-input na-w-full" required>
                <option value="">Select Action</option>
                <option value="accept">Accept PO</option>
                <option value="reject">Reject PO</option>
              </select>
            </div>

            <div>
              <label className="na-metadata na-mb-2 na-block">Notes/Comments</label>
              <textarea
                name="notes"
                className="na-input na-w-full"
                rows={4}
                placeholder="Add any comments or notes..."
              />
            </div>

            <div>
              <label className="na-metadata na-mb-2 na-block">Upload Acknowledgment Document (Optional)</label>
              <input type="file" name="document" className="na-input na-w-full" accept=".pdf,.jpg,.png" />
              <p className="na-metadata na-text-sm na-mt-2">
                Upload signed PO or acknowledgment document
              </p>
            </div>

            <div className="na-flex na-gap-4">
              <button type="submit" className="na-btn na-btn-primary">
                Submit Acknowledgment
              </button>
              <Link href="/vendor-omni-dashboard?type=pos" className="na-btn na-btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Status Timeline */}
      {auditTrail && auditTrail.length > 0 && (
        <div className="na-card na-p-6 na-mb-6">
          <h2 className="na-h3 na-mb-4">Status Timeline</h2>
          <div className="na-space-y-4">
            {auditTrail.map((event) => (
              <div key={event.id} className="na-flex na-gap-4">
                <div className="na-flex-shrink-0">
                  <div className="na-w-2 na-h-2 na-rounded-full na-bg-primary na-mt-2"></div>
                </div>
                <div className="na-flex-1">
                  <div className="na-metadata na-text-sm">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                  <div className="na-body na-mt-1">{event.action}</div>
                  {event.workflow_state && (
                    <div className="na-metadata na-text-sm na-mt-1">
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
        <div className="na-card na-p-6">
          <h2 className="na-h3 na-mb-4">Documents</h2>
          <div className="na-space-y-2">
            {documents.map((doc: unknown) => {
              const d = doc as { id: string; name: string; file_url: string };
              return (
                <div key={d.id} className="na-card na-p-4 na-flex na-items-center na-justify-between">
                  <div>
                    <div className="na-body">{d.name}</div>
                    <div className="na-metadata na-text-sm">Document</div>
                  </div>
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="na-btn na-btn-ghost na-btn-sm"
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
        <div className="na-card na-p-6">
          <h2 className="na-h3 na-mb-4">Acknowledgment Document</h2>
          <div className="na-card na-p-4 na-flex na-items-center na-justify-between">
            <div>
              <div className="na-body">{acknowledgmentDoc.name}</div>
              <div className="na-metadata na-text-sm">Uploaded on acknowledgment</div>
            </div>
            <a
              href={acknowledgmentDoc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="na-btn na-btn-ghost na-btn-sm"
            >
              View
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

