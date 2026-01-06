/**
 * My Claims Page (Mobile PWA)
 * 
 * Simplified view for employees to submit claims.
 * Snap & Submit: Take photo, upload, done.
 */

import { Suspense } from 'react';
import { EmployeeClaimRepository } from '@/src/repositories/employee-claim-repository';
import { MobileUpload } from '@/components/documents/MobileUpload';
import { ClaimCategory } from '@nexus/kernel';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
    return {
        actor: {
            userId: 'system', // TODO: Get from auth
            tenantId: 'default', // TODO: Get from auth
            roles: [],
        },
        requestId: crypto.randomUUID(),
    };
}

export default async function MyClaimsPage() {
    const ctx = getRequestContext();
    const claimRepo = new EmployeeClaimRepository();

    // Get employee's claims
    const claims = await claimRepo.getByEmployee(ctx.actor.userId, ctx.actor.tenantId);

    return (
        <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
            <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-6">My Claims</h1>

            {/* Quick Submit Card */}
            <div className="card p-6 mb-6">
                <h2 className="section mb-4">Submit New Claim</h2>
                <form action="/claims/actions" method="post" className="space-y-4">
                    <input type="hidden" name="employee_id" value={ctx.actor.userId} />
                    <input type="hidden" name="tenant_id" value={ctx.actor.tenantId || 'default'} />

                    <div>
                        <label className="caption mb-2 block">Category *</label>
                        <select name="category" className="input w-full" required>
                            <option value="">Select Category</option>
                            {ClaimCategory.values.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="caption mb-2 block">Merchant Name *</label>
                        <input
                            type="text"
                            name="merchant_name"
                            className="input w-full"
                            placeholder="Where did you spend?"
                            required
                        />
                    </div>

                    <div>
                        <label className="caption mb-2 block">Amount *</label>
                        <input
                            type="number"
                            name="amount"
                            step="0.01"
                            min="0"
                            className="input w-full"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="caption mb-2 block">Date *</label>
                        <input
                            type="date"
                            name="claim_date"
                            className="input w-full"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    {/* Snap & Submit Upload */}
                    <div>
                        <label className="caption mb-2 block">Receipt * (No Receipt, No Coin)</label>
                        <MobileUpload
                            documentType="receipt"
                            onUploadComplete={() => {
                                // Handle upload completion
                            }}
                        />
                        <input type="hidden" name="receipt_url" id="receipt_url" />
                    </div>

                    <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full">
                        Submit Claim
                    </button>
                </form>
            </div>

            {/* Claims List */}
            <div className="card p-6">
                <h2 className="section mb-4">My Claims History</h2>
                {claims.length === 0 ? (
                    <div className="text-center p-6">
                        <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">No claims submitted yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim) => (
                            <div key={claim.id} className="card p-4 border border-nx-border">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-nx-text-main">{claim.merchant_name}</h3>
                                        <p className="caption text-sm">{claim.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">${claim.amount.toFixed(2)}</div>
                                        <span className={`badge badge-${claim.status === 'APPROVED' ? 'badge-success' : claim.status === 'REJECTED' ? 'bad' : 'pending'}`}>
                                            {claim.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="caption text-sm mt-2">
                                    {new Date(claim.claim_date).toLocaleDateString()}
                                </div>
                                {claim.policy_validation_errors.length > 0 && (
                                    <div className="card p-2 bg-nx-danger-bg text-nx-danger mt-2">
                                        <p className="caption text-sm">
                                            {claim.policy_validation_errors.join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

