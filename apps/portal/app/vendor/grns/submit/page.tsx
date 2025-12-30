/**
 * Vendor GRN Submission Page
 *
 * Submit GRN (Goods Receipt Note): Link to PO, Upload GRN document, Enter GRN details.
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { PORepository } from '@/src/repositories/po-repository';
import { VendorGroupRepository } from '@/src/repositories/vendor-group-repository';
import Link from 'next/link';
import { DocumentUpload } from '@/components/documents/DocumentUpload';

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

interface GRNSubmitPageProps {
  searchParams: {
    po_id?: string;
  };
}

export default async function VendorGRNSubmitPage({ searchParams }: GRNSubmitPageProps) {
  const ctx = getRequestContext();
  const supabase = createClient();
  const poRepo = new PORepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Get PO if provided
  let po = null;
  if (searchParams.po_id) {
    po = await poRepo.findById(searchParams.po_id);
  }

  // Get available POs for selection
  const { data: availablePOs } = await supabase
    .from('vmp_po_refs')
    .select('id, po_number, po_date, amount, currency_code')
    .in('tenant_id', accessibleTenantIds.length > 0 ? accessibleTenantIds : [''])
    .in('status', ['acknowledged', 'in_progress'])
    .order('po_date', { ascending: false })
    .limit(50);

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Submit GRN</h1>
        <Link href="/vendor-omni-dashboard" className="na-btn na-btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>

      {/* GRN Submission Form */}
      <div className="na-card na-p-6">
        <h2 className="na-h3 na-mb-4">GRN Details</h2>
        <form action="/vendor/grns/submit" method="post" className="na-space-y-4">
          <input type="hidden" name="submitted_by" value={ctx.actor.userId} />

          {/* PO Selection */}
          <div>
            <label className="na-metadata na-mb-2 na-block">Purchase Order *</label>
            <select
              name="po_id"
              className="na-input na-w-full"
              required
              defaultValue={searchParams.po_id || ''}
            >
              <option value="">Select PO</option>
              {availablePOs?.map((p: { id: string; po_number: string; po_date: string; amount?: number; created_at?: string; total_amount?: number }) => (
                <option key={p.id} value={p.id}>
                  {p.po_number} - {new Date(p.created_at || p.po_date).toLocaleDateString()} - $
                  {(p.total_amount ?? p.amount)?.toLocaleString() || 'N/A'}
                </option>
              ))}
            </select>
            {po && (
              <div className="na-card na-p-3 na-bg-paper-2 na-mt-2">
                <div className="na-metadata na-text-sm">
                  Selected PO: {po.po_number} - Amount: ${((po as { amount?: number; total_amount?: number }).total_amount ?? (po as { amount?: number }).amount)?.toLocaleString() || 'N/A'}
                </div>
              </div>
            )}
          </div>

          {/* GRN Number */}
          <div>
            <label className="na-metadata na-mb-2 na-block">GRN Number *</label>
            <input
              type="text"
              name="grn_number"
              className="na-input na-w-full"
              placeholder="GRN-2025-001"
              required
            />
          </div>

          {/* GRN Date */}
          <div>
            <label className="na-metadata na-mb-2 na-block">GRN Date *</label>
            <input
              type="date"
              name="grn_date"
              className="na-input na-w-full"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="na-metadata na-mb-2 na-block">Quantity</label>
            <input
              type="number"
              name="quantity"
              className="na-input na-w-full"
              placeholder="Enter quantity received"
              min="0"
              step="0.01"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="na-metadata na-mb-2 na-block">Condition</label>
            <select name="condition" className="na-input na-w-full">
              <option value="">Select Condition</option>
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="partial">Partial</option>
              <option value="missing">Missing Items</option>
            </select>
          </div>

          {/* GRN Document Upload */}
          <div>
            <label className="na-metadata na-mb-2 na-block">GRN Document *</label>
            <DocumentUpload
              onUploadComplete={() => {
                // Handle upload completion
              }}
            />
            <input type="hidden" name="document_id" id="document_id" />
            <p className="na-metadata na-text-sm na-mt-2">
              Upload Goods Receipt Note document (PDF, JPG, PNG)
            </p>
          </div>

          <div className="na-flex na-gap-4">
            <button type="submit" className="na-btn na-btn-primary">
              Submit GRN
            </button>
            <Link href="/vendor-omni-dashboard" className="na-btn na-btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

