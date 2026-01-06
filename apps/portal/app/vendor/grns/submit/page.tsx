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
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Submit GRN</h1>
        <Link href="/vendor-omni-dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to Dashboard
        </Link>
      </div>

      {/* GRN Submission Form */}
      <div className="card p-6">
        <h2 className="section mb-4">GRN Details</h2>
        <form action="/vendor/grns/submit" method="post" className="space-y-4">
          <input type="hidden" name="submitted_by" value={ctx.actor.userId} />

          {/* PO Selection */}
          <div>
            <label className="caption mb-2 block">Purchase Order *</label>
            <select
              name="po_id"
              className="input w-full"
              required
              defaultValue={searchParams.po_id || ''}
            >
              <option value="">Select PO</option>
              {availablePOs?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.po_number} - {new Date(p.created_at || p.po_date).toLocaleDateString()} - $
                  {p.total_amount?.toLocaleString() || 'N/A'}
                </option>
              ))}
            </select>
            {po && (
              <div className="card p-3 bg-nx-surface-well mt-2">
                <div className="caption text-sm">
                  Selected PO: {po.po_number} - Amount: ${po.amount?.toLocaleString() || 'N/A'}
                </div>
              </div>
            )}
          </div>

          {/* GRN Number */}
          <div>
            <label className="caption mb-2 block">GRN Number *</label>
            <input
              type="text"
              name="grn_number"
              className="input w-full"
              placeholder="GRN-2025-001"
              required
            />
          </div>

          {/* GRN Date */}
          <div>
            <label className="caption mb-2 block">GRN Date *</label>
            <input
              type="date"
              name="grn_date"
              className="input w-full"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="caption mb-2 block">Quantity</label>
            <input
              type="number"
              name="quantity"
              className="input w-full"
              placeholder="Enter quantity received"
              min="0"
              step="0.01"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="caption mb-2 block">Condition</label>
            <select name="condition" className="input w-full">
              <option value="">Select Condition</option>
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="partial">Partial</option>
              <option value="missing">Missing Items</option>
            </select>
          </div>

          {/* GRN Document Upload */}
          <div>
            <label className="caption mb-2 block">GRN Document *</label>
            <DocumentUpload
              onUploadComplete={() => {
                // Handle upload completion
              }}
            />
            <input type="hidden" name="document_id" id="document_id" />
            <p className="caption text-sm mt-2">
              Upload Goods Receipt Note document (PDF, JPG, PNG)
            </p>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
              Submit GRN
            </button>
            <Link href="/vendor-omni-dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

