/**
 * Vendor Offboarding Request Page
 *
 * PRD: Supplier Offboarding Workflow
 * - Request account deactivation
 * - View offboarding status
 * - Cancel offboarding request (if pending)
 * - Download data export (if available)
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { SupplierOffboardingRepository } from '@/src/repositories/supplier-offboarding-repository';
import { VendorRepository } from '@/src/repositories/vendor-repository';
import { CaseRepository } from '@/src/repositories/case-repository';
import Link from 'next/link';
import { createOffboardingAction, cancelOffboardingAction } from '@/app/offboarding/actions';

// Type for form actions that return results (Next.js 16 pattern)
type FormAction = (formData: FormData) => void | Promise<void>;

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      vendorId: 'default', // TODO: Get from vendor_user_access
      tenantId: null,
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export default async function VendorOffboardingPage() {
  const ctx = getRequestContext();
  const supabase = createClient();
  const offboardingRepo = new SupplierOffboardingRepository();
  const vendorRepo = new VendorRepository();
  const caseRepo = new CaseRepository();

  // Get vendor ID from user access
  const vendorId = ctx.actor.vendorId || 'default';

  // Get vendor
  const vendor = await vendorRepo.findById(vendorId);

  if (!vendor) {
    return (
      <div className="na-container na-mx-auto na-p-6">
        <div className="na-card na-p-6 na-text-center">
          <h2 className="na-h4">Vendor Not Found</h2>
          <p className="na-body na-mt-2">
            Your vendor profile could not be loaded. Please contact support.
          </p>
          <Link href="/vendor/dashboard" className="na-btn na-btn-primary na-mt-4">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Get existing offboarding request
  const offboarding = await offboardingRepo.getByVendor(vendorId);

  // Get case if offboarding exists
  let caseData = null;
  if (offboarding) {
    caseData = await caseRepo.getById(offboarding.case_id);
  }

  // Stage progress mapping
  const stageProgress: Record<string, number> = {
    requested: 10,
    review: 30,
    approval: 50,
    data_export: 70,
    access_revocation: 90,
    completed: 100,
    cancelled: 0,
  };

  const currentProgress = offboarding ? stageProgress[offboarding.stage] || 0 : 0;

  // Check if vendor can request offboarding (no active request)
  const canRequest = !offboarding || offboarding.status === 'cancelled' || offboarding.status === 'rejected';

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Account Deactivation</h1>
        <Link href="/vendor/dashboard" className="na-btn na-btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Warning Notice */}
      <div className="na-card na-p-6 na-mb-6 na-bg-warn-subtle">
        <h2 className="na-h3 na-mb-4 na-text-warn">⚠️ Important Notice</h2>
        <div className="na-space-y-2">
          <p className="na-body">
            <strong>Account deactivation is permanent.</strong> Once your account is deactivated:
          </p>
          <ul className="na-list-disc na-list-inside na-body na-text-sm na-space-y-1">
            <li>You will lose access to the vendor portal</li>
            <li>All pending invoices will be handled according to company policy</li>
            <li>You will receive a data export of your account information</li>
            <li>You can request reactivation by contacting your procurement team</li>
          </ul>
        </div>
      </div>

      {!offboarding || canRequest ? (
        /* Request Offboarding Form */
        <div className="na-card na-p-6">
          <h2 className="na-h3 na-mb-4">Request Account Deactivation</h2>
          <form action={createOffboardingAction as unknown as FormAction} className="na-space-y-4">
            <input type="hidden" name="vendor_id" value={vendorId} />
            <input type="hidden" name="company_id" value={vendor.tenant_id} />

            <div>
              <label className="na-metadata na-mb-2 na-block">
                Reason for Deactivation <span className="na-text-danger">*</span>
              </label>
              <textarea
                name="reason"
                className="na-input na-w-full"
                rows={5}
                required
                placeholder="Please provide a reason for account deactivation..."
              />
              <div className="na-metadata na-text-sm na-mt-1">
                This information will be reviewed by the procurement team.
              </div>
            </div>

            <div>
              <label className="na-metadata na-mb-2 na-block">Effective Date (Optional)</label>
              <input
                type="date"
                name="effective_date"
                className="na-input na-w-full"
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="na-metadata na-text-sm na-mt-1">
                When should the deactivation take effect? Leave blank for immediate processing.
              </div>
            </div>

            <div className="na-card na-p-4 na-bg-paper-2">
              <p className="na-body na-text-sm">
                <strong>By submitting this request, you acknowledge that:</strong>
              </p>
              <ul className="na-list-disc na-list-inside na-body na-text-sm na-mt-2 na-space-y-1">
                <li>Your account will be deactivated after approval</li>
                <li>All pending transactions will be handled according to company policy</li>
                <li>You will receive a data export of your account information</li>
                <li>You can contact support to request reactivation</li>
              </ul>
            </div>

            <div className="na-flex na-gap-2">
              <button type="submit" className="na-btn na-btn-danger">
                Submit Deactivation Request
              </button>
              <Link href="/vendor/dashboard" className="na-btn na-btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      ) : (
        /* Offboarding Status */
        <>
          {/* Status Overview */}
          <div className="na-card na-p-6 na-mb-6">
            <h2 className="na-h3 na-mb-4">Offboarding Status</h2>

            {/* Progress Bar */}
            <div className="na-mb-6">
              <div className="na-flex na-items-center na-justify-between na-mb-2">
                <span className="na-body na-font-semibold">
                  Current Stage: {offboarding.stage.replace('_', ' ').toUpperCase()}
                </span>
                <span className="na-metadata">{currentProgress}%</span>
              </div>
              <div className="na-w-full na-bg-paper-2 na-rounded-full na-h-2">
                <div
                  className="na-bg-primary na-h-2 na-rounded-full na-transition-all"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className="na-mb-4">
              <span
                className={`na-status na-status-${
                  offboarding.status === 'completed'
                    ? 'ok'
                    : offboarding.status === 'rejected'
                      ? 'bad'
                      : offboarding.status === 'in_progress'
                        ? 'warn'
                      : offboarding.status === 'cancelled'
                        ? 'pending'
                        : 'pending'
                }`}
              >
                {offboarding.status.toUpperCase()}
              </span>
            </div>

            {/* Request Details */}
            <div className="na-card na-p-4 na-bg-paper-2 na-mt-4">
              <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 na-gap-4">
                <div>
                  <label className="na-metadata na-mb-2 na-block">Requested Date</label>
                  <div className="na-body">
                    {new Date(offboarding.requested_at).toLocaleString()}
                  </div>
                </div>
                {offboarding.approved_at && (
                  <div>
                    <label className="na-metadata na-mb-2 na-block">Approved Date</label>
                    <div className="na-body">
                      {new Date(offboarding.approved_at).toLocaleString()}
                    </div>
                  </div>
                )}
                {offboarding.completed_at && (
                  <div>
                    <label className="na-metadata na-mb-2 na-block">Completed Date</label>
                    <div className="na-body">
                      {new Date(offboarding.completed_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="na-card na-p-4 na-bg-paper-2 na-mt-4">
              <label className="na-metadata na-mb-2 na-block">Reason</label>
              <p className="na-body">{offboarding.reason}</p>
            </div>
          </div>

          {/* Rejection Reason */}
          {offboarding.rejected_reason && (
            <div className="na-card na-p-6 na-mb-6 na-bg-danger-subtle">
              <h2 className="na-h3 na-mb-4 na-text-danger">Rejection Reason</h2>
              <div className="na-card na-p-4 na-bg-paper-2">
                <p className="na-body">{offboarding.rejected_reason}</p>
              </div>
              <Link href="/vendor/cases" className="na-btn na-btn-primary na-mt-4">
                View Case Details
              </Link>
            </div>
          )}

          {/* Cancellation Reason */}
          {offboarding.cancellation_reason && (
            <div className="na-card na-p-6 na-mb-6 na-bg-paper-2">
              <h2 className="na-h3 na-mb-4">Cancellation Reason</h2>
              <div className="na-card na-p-4 na-bg-paper-2">
                <p className="na-body">{offboarding.cancellation_reason}</p>
              </div>
            </div>
          )}

          {/* Data Export */}
          {offboarding.data_export_url && (
            <div className="na-card na-p-6 na-mb-6">
              <h2 className="na-h3 na-mb-4">Data Export</h2>
              <div className="na-card na-p-4 na-bg-paper-2">
                <p className="na-body na-mb-4">
                  Your account data export is ready for download.
                </p>
                <a
                  href={offboarding.data_export_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="na-btn na-btn-primary"
                >
                  Download Data Export
                </a>
              </div>
            </div>
          )}

          {/* Cancel Request (if pending) */}
          {offboarding.status === 'pending' && (
            <div className="na-card na-p-6">
              <h2 className="na-h3 na-mb-4">Cancel Request</h2>
              <form action={cancelOffboardingAction.bind(null, offboarding.id) as unknown as FormAction} className="na-space-y-4">
                <div>
                  <label className="na-metadata na-mb-2 na-block">
                    Cancellation Reason <span className="na-text-danger">*</span>
                  </label>
                  <textarea
                    name="cancellation_reason"
                    className="na-input na-w-full"
                    rows={3}
                    required
                    placeholder="Why are you cancelling this request?"
                  />
                </div>
                <button type="submit" className="na-btn na-btn-secondary">
                  Cancel Deactivation Request
                </button>
              </form>
            </div>
          )}

          {/* Case Link */}
          {caseData && (
            <div className="na-card na-p-6">
              <h2 className="na-h3 na-mb-4">Related Case</h2>
              <div className="na-card na-p-4 na-bg-paper-2">
                <div className="na-flex na-items-center na-justify-between">
                  <div>
                    <div className="na-body na-font-semibold">{caseData.subject}</div>
                    <div className="na-metadata na-text-sm">Case ID: {caseData.id}</div>
                  </div>
                  <Link href={`/vendor/cases?case_id=${caseData.id}`} className="na-btn na-btn-secondary">
                    View Case
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

