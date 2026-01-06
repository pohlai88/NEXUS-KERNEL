/**
 * Vendor Onboarding Status Page
 * 
 * PRD: Supplier Onboarding Workflow
 * - View onboarding status and progress
 * - Upload required documents
 * - Track checklist items
 * - View verification notes
 * - See case activity
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { SupplierOnboardingRepository } from '@/src/repositories/supplier-onboarding-repository';
import { VendorRepository } from '@/src/repositories/vendor-repository';
import { CaseRepository } from '@/src/repositories/case-repository';
import { DocumentRepository } from '@/src/repositories/document-repository';
import Link from 'next/link';
import { updateOnboardingStageAction } from '@/app/onboarding/actions';

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

export default async function VendorOnboardingPage() {
    const ctx = getRequestContext();
    const supabase = createClient();
    const onboardingRepo = new SupplierOnboardingRepository();
    const vendorRepo = new VendorRepository();
    const caseRepo = new CaseRepository();
    const docRepo = new DocumentRepository();

    // Get vendor ID from user access
    // In production: vendor_user_access -> vendor_group -> vmp_vendors
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

    // Get onboarding status
    const onboarding = await onboardingRepo.getByVendor(vendorId);

    // Get case if onboarding exists
    let caseData = null;
    if (onboarding) {
        caseData = await caseRepo.getById(onboarding.case_id);
    }

    // Get submitted documents
    const submittedDocIds = onboarding?.submitted_documents as string[] | undefined;
    const submittedDocs = submittedDocIds
        ? await Promise.all(
            submittedDocIds.map((docId) => docRepo.getById(docId)).filter((p) => p !== null)
        )
        : [];

    // Get required documents
    const requiredDocs = (onboarding?.required_documents as Array<{ id: string; name: string; type: string }>) || [];

    // Get checklist items
    const checklistItems = (onboarding?.checklist_items as Array<{ id: string; name: string; completed: boolean }>) || [];

    // Stage progress mapping
    const stageProgress: Record<string, number> = {
        submitted: 10,
        document_collection: 30,
        verification: 50,
        approval: 70,
        document_signing: 90,
        completed: 100,
        rejected: 0,
    };

    const currentProgress = onboarding ? stageProgress[onboarding.stage] || 0 : 0;

    return (
        <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Onboarding Status</h1>
                <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
                    ← Back to Dashboard
                </Link>
            </div>

            {!onboarding ? (
                <div className="card p-6 text-center">
                    <h2 className="text-base font-semibold text-nx-text-main">No Onboarding Record Found</h2>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">
                        Your onboarding process has not been initiated. Please contact your procurement team.
                    </p>
                    <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4">
                        ← Back to Dashboard
                    </Link>
                </div>
            ) : (
                <>
                    {/* Status Overview */}
                    <div className="card p-6 mb-6">
                        <h2 className="section mb-4">Onboarding Progress</h2>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main font-semibold">Current Stage: {onboarding.stage.replace('_', ' ').toUpperCase()}</span>
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
                                className={`badge badge-${onboarding.status === 'completed'
                                    ? 'badge-success'
                                    : onboarding.status === 'rejected'
                                        ? 'bad'
                                        : onboarding.status === 'in_progress'
                                            ? 'badge-warning'
                                            : 'pending'
                                    }`}
                            >
                                {onboarding.status.toUpperCase()}
                            </span>
                        </div>

                        {/* Stage Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mt-6">
                            {['submitted', 'document_collection', 'verification', 'approval', 'document_signing', 'completed'].map((stage) => {
                                const isActive = onboarding.stage === stage;
                                const isCompleted = stageProgress[onboarding.stage] > stageProgress[stage];
                                return (
                                    <div
                                        key={stage}
                                        className={`card p-3 text-center ${isActive ? 'bg-nx-primary-light' : isCompleted ? 'bg-nx-success-bg' : 'bg-nx-surface-well'
                                            }`}
                                    >
                                        <div className="caption text-xs mb-1">{stage.replace('_', ' ')}</div>
                                        {isCompleted && <div className="text-nx-success">✓</div>}
                                        {isActive && <div className="text-nx-primary">→</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Required Documents */}
                    <div className="card p-6 mb-6">
                        <h2 className="section mb-4">Required Documents</h2>
                        {requiredDocs.length === 0 ? (
                            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">No documents required.</p>
                        ) : (
                            <div className="space-y-3">
                                {requiredDocs.map((doc) => {
                                    const submitted = submittedDocs.find((d) => d?.name.includes(doc.name));
                                    return (
                                        <div
                                            key={doc.id}
                                            className="card p-4 flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main font-semibold">{doc.name}</div>
                                                <div className="caption text-sm">Type: {doc.type}</div>
                                            </div>
                                            <div>
                                                {submitted ? (
                                                    <span className="badge badge-success">Uploaded</span>
                                                ) : (
                                                    <span className="badge badge-info">Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Upload Document Form */}
                        {onboarding.stage === 'document_collection' && onboarding.status === 'in_progress' && (
                            <div className="mt-6 card p-4 bg-nx-surface-well">
                                <h3 className="text-base font-semibold text-nx-text-main mb-4">Upload Document</h3>
                                <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-sm mb-4">
                                    Please contact your procurement team to upload required documents. Document upload functionality will be available soon.
                                </p>
                                <Link href="/vendor/cases" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
                                    View Case for Document Upload
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Checklist Items */}
                    {checklistItems.length > 0 && (
                        <div className="card p-6 mb-6">
                            <h2 className="section mb-4">Checklist</h2>
                            <div className="space-y-2">
                                {checklistItems.map((item) => (
                                    <div key={item.id} className="card p-3 flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={item.completed}
                                            disabled
                                            className="accent-nx-primary cursor-pointer"
                                        />
                                        <span className={item.completed ? 'text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main line-through' : 'text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main'}>
                                            {item.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verification Notes */}
                    {onboarding.verification_notes && (
                        <div className="card p-6 mb-6">
                            <h2 className="section mb-4">Verification Notes</h2>
                            <div className="card p-4 bg-nx-surface-well">
                                <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{onboarding.verification_notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {onboarding.rejected_reason && (
                        <div className="card p-6 mb-6 bg-nx-danger-bg">
                            <h2 className="section mb-4 text-nx-danger">Rejection Reason</h2>
                            <div className="card p-4 bg-nx-surface-well">
                                <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{onboarding.rejected_reason}</p>
                            </div>
                            <Link href="/vendor/cases" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4">
                                View Case Details
                            </Link>
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

