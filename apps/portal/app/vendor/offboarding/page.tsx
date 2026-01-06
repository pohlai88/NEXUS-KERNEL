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
      <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
        <div className="card p-6 text-center">
          <h2 className="text-base font-semibold text-nx-text-main">Vendor Not Found</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">
            Your vendor profile could not be loaded. Please contact support.
          </p>
          <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4">
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
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Account Deactivation</h1>
        <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Warning Notice */}
      <div className="card p-6 mb-6 bg-nx-warning-bg">
        <h2 className="section mb-4 text-nx-warning">⚠️ Important Notice</h2>
        <div className="space-y-2">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
            <strong>Account deactivation is permanent.</strong> Once your account is deactivated:
          </p>
          <ul className="list-disc list-inside text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-sm space-y-1">
            <li>You will lose access to the vendor portal</li>
            <li>All pending invoices will be handled according to company policy</li>
            <li>You will receive a data export of your account information</li>
            <li>You can request reactivation by contacting your procurement team</li>
          </ul>
        </div>
      </div>

      {!offboarding || canRequest ? (
        /* Request Offboarding Form */
        <div className="card p-6">
          <h2 className="section mb-4">Request Account Deactivation</h2>
          <form action={createOffboardingAction} className="space-y-4">
            <input type="hidden" name="vendor_id" value={vendorId} />
            <input type="hidden" name="company_id" value={vendor.tenant_id} />

            <div>
              <label className="caption mb-2 block">
                Reason for Deactivation <span className="text-nx-danger">*</span>
              </label>
              <textarea
                name="reason"
                className="input w-full"
                rows={5}
                required
                placeholder="Please provide a reason for account deactivation..."
              />
              <div className="caption text-sm mt-1">
                This information will be reviewed by the procurement team.
              </div>
            </div>

            <div>
              <label className="caption mb-2 block">Effective Date (Optional)</label>
              <input
                type="date"
                name="effective_date"
                className="input w-full"
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="caption text-sm mt-1">
                When should the deactivation take effect? Leave blank for immediate processing.
              </div>
            </div>

            <div className="card p-4 bg-nx-surface-well">
              <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-sm">
                <strong>By submitting this request, you acknowledge that:</strong>
              </p>
              <ul className="list-disc list-inside text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-sm mt-2 space-y-1">
                <li>Your account will be deactivated after approval</li>
                <li>All pending transactions will be handled according to company policy</li>
                <li>You will receive a data export of your account information</li>
                <li>You can contact support to request reactivation</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-nx-danger text-white hover:bg-nx-danger-text">
                Submit Deactivation Request
              </button>
              <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      ) : (
        /* Offboarding Status */
        <>
          {/* Status Overview */}
          <div className="card p-6 mb-6">
            <h2 className="section mb-4">Offboarding Status</h2>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main font-semibold">
                  Current Stage: {offboarding.stage.replace('_', ' ').toUpperCase()}
                </span>
                <span className="caption">{currentProgress}%</span>
              </div>
              <div className="w-full bg-nx-surface-well rounded-full h-2">
                <div
                  className="bg-nx-primary h-2 rounded-full transition-all"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <span
                className={`badge badge-${
                  offboarding.status === 'completed'
                    ? 'badge-success'
                    : offboarding.status === 'rejected'
                      ? 'bad'
                      : offboarding.status === 'in_progress'
                        ? 'badge-warning'
                      : offboarding.status === 'cancelled'
                        ? 'pending'
                        : 'pending'
                }`}
              >
                {offboarding.status.toUpperCase()}
              </span>
            </div>

            {/* Request Details */}
            <div className="card p-4 bg-nx-surface-well mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="caption mb-2 block">Requested Date</label>
                  <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
                    {new Date(offboarding.requested_at).toLocaleString()}
                  </div>
                </div>
                {offboarding.approved_at && (
                  <div>
                    <label className="caption mb-2 block">Approved Date</label>
                    <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
                      {new Date(offboarding.approved_at).toLocaleString()}
                    </div>
                  </div>
                )}
                {offboarding.completed_at && (
                  <div>
                    <label className="caption mb-2 block">Completed Date</label>
                    <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
                      {new Date(offboarding.completed_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="card p-4 bg-nx-surface-well mt-4">
              <label className="caption mb-2 block">Reason</label>
              <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{offboarding.reason}</p>
            </div>
          </div>

          {/* Rejection Reason */}
          {offboarding.rejected_reason && (
            <div className="card p-6 mb-6 bg-nx-danger-bg">
              <h2 className="section mb-4 text-nx-danger">Rejection Reason</h2>
              <div className="card p-4 bg-nx-surface-well">
                <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{offboarding.rejected_reason}</p>
              </div>
              <Link href="/vendor/cases" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4">
                View Case Details
              </Link>
            </div>
          )}

          {/* Cancellation Reason */}
          {offboarding.cancellation_reason && (
            <div className="card p-6 mb-6 bg-nx-surface-well">
              <h2 className="section mb-4">Cancellation Reason</h2>
              <div className="card p-4 bg-nx-surface-well">
                <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{offboarding.cancellation_reason}</p>
              </div>
            </div>
          )}

          {/* Data Export */}
          {offboarding.data_export_url && (
            <div className="card p-6 mb-6">
              <h2 className="section mb-4">Data Export</h2>
              <div className="card p-4 bg-nx-surface-well">
                <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mb-4">
                  Your account data export is ready for download.
                </p>
                <a
                  href={offboarding.data_export_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary"
                >
                  Download Data Export
                </a>
              </div>
            </div>
          )}

          {/* Cancel Request (if pending) */}
          {offboarding.status === 'pending' && (
            <div className="card p-6">
              <h2 className="section mb-4">Cancel Request</h2>
              <form action={cancelOffboardingAction.bind(null, offboarding.id)} className="space-y-4">
                <div>
                  <label className="caption mb-2 block">
                    Cancellation Reason <span className="text-nx-danger">*</span>
                  </label>
                  <textarea
                    name="cancellation_reason"
                    className="input w-full"
                    rows={3}
                    required
                    placeholder="Why are you cancelling this request?"
                  />
                </div>
                <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
                  Cancel Deactivation Request
                </button>
              </form>
            </div>
          )}

          {/* Case Link */}
          {caseData && (
            <div className="card p-6">
              <h2 className="section mb-4">Related Case</h2>
              <div className="card p-4 bg-nx-surface-well">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main font-semibold">{caseData.subject}</div>
                    <div className="caption text-sm">Case ID: {caseData.id}</div>
                  </div>
                  <Link href={`/vendor/cases?case_id=${caseData.id}`} className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
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

