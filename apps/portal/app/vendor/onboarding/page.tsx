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
        <div className="na-container na-mx-auto na-p-6">
            <div className="na-flex na-items-center na-justify-between na-mb-6">
                <h1 className="na-h1">Onboarding Status</h1>
                <Link href="/vendor/dashboard" className="na-btn na-btn-ghost">
                    ← Back to Dashboard
                </Link>
            </div>

            {!onboarding ? (
                <div className="na-card na-p-6 na-text-center">
                    <h2 className="na-h4">No Onboarding Record Found</h2>
                    <p className="na-body na-mt-2">
                        Your onboarding process has not been initiated. Please contact your procurement team.
                    </p>
                    <Link href="/vendor/dashboard" className="na-btn na-btn-primary na-mt-4">
                        ← Back to Dashboard
                    </Link>
                </div>
            ) : (
                <>
                    {/* Status Overview */}
                    <div className="na-card na-p-6 na-mb-6">
                        <h2 className="na-h3 na-mb-4">Onboarding Progress</h2>

                        {/* Progress Bar */}
                        <div className="na-mb-6">
                            <div className="na-flex na-items-center na-justify-between na-mb-2">
                                <span className="na-body na-font-semibold">Current Stage: {onboarding.stage.replace('_', ' ').toUpperCase()}</span>
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
                                className={`na-status na-status-${onboarding.status === 'completed'
                                    ? 'ok'
                                    : onboarding.status === 'rejected'
                                        ? 'bad'
                                        : onboarding.status === 'in_progress'
                                            ? 'warn'
                                            : 'pending'
                                    }`}
                            >
                                {onboarding.status.toUpperCase()}
                            </span>
                        </div>

                        {/* Stage Timeline */}
                        <div className="na-grid na-grid-cols-1 md:na-grid-cols-6 na-gap-2 na-mt-6">
                            {['submitted', 'document_collection', 'verification', 'approval', 'document_signing', 'completed'].map((stage) => {
                                const isActive = onboarding.stage === stage;
                                const isCompleted = stageProgress[onboarding.stage] > stageProgress[stage];
                                return (
                                    <div
                                        key={stage}
                                        className={`na-card na-p-3 na-text-center ${isActive ? 'na-bg-primary-subtle' : isCompleted ? 'na-bg-ok-subtle' : 'na-bg-paper-2'
                                            }`}
                                    >
                                        <div className="na-metadata na-text-xs na-mb-1">{stage.replace('_', ' ')}</div>
                                        {isCompleted && <div className="na-text-ok">✓</div>}
                                        {isActive && <div className="na-text-primary">→</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Required Documents */}
                    <div className="na-card na-p-6 na-mb-6">
                        <h2 className="na-h3 na-mb-4">Required Documents</h2>
                        {requiredDocs.length === 0 ? (
                            <p className="na-body">No documents required.</p>
                        ) : (
                            <div className="na-space-y-3">
                                {requiredDocs.map((doc) => {
                                    const submitted = submittedDocs.find((d) => d?.name.includes(doc.name));
                                    return (
                                        <div
                                            key={doc.id}
                                            className="na-card na-p-4 na-flex na-items-center na-justify-between"
                                        >
                                            <div>
                                                <div className="na-body na-font-semibold">{doc.name}</div>
                                                <div className="na-metadata na-text-sm">Type: {doc.type}</div>
                                            </div>
                                            <div>
                                                {submitted ? (
                                                    <span className="na-status na-status-ok">Uploaded</span>
                                                ) : (
                                                    <span className="na-status na-status-pending">Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Upload Document Form */}
                        {onboarding.stage === 'document_collection' && onboarding.status === 'in_progress' && (
                            <div className="na-mt-6 na-card na-p-4 na-bg-paper-2">
                                <h3 className="na-h4 na-mb-4">Upload Document</h3>
                                <p className="na-body na-text-sm na-mb-4">
                                    Please contact your procurement team to upload required documents. Document upload functionality will be available soon.
                                </p>
                                <Link href="/vendor/cases" className="na-btn na-btn-secondary">
                                    View Case for Document Upload
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Checklist Items */}
                    {checklistItems.length > 0 && (
                        <div className="na-card na-p-6 na-mb-6">
                            <h2 className="na-h3 na-mb-4">Checklist</h2>
                            <div className="na-space-y-2">
                                {checklistItems.map((item) => (
                                    <div key={item.id} className="na-card na-p-3 na-flex na-items-center na-gap-3">
                                        <input
                                            type="checkbox"
                                            checked={item.completed}
                                            disabled
                                            className="na-checkbox"
                                        />
                                        <span className={item.completed ? 'na-body na-line-through' : 'na-body'}>
                                            {item.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verification Notes */}
                    {onboarding.verification_notes && (
                        <div className="na-card na-p-6 na-mb-6">
                            <h2 className="na-h3 na-mb-4">Verification Notes</h2>
                            <div className="na-card na-p-4 na-bg-paper-2">
                                <p className="na-body">{onboarding.verification_notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {onboarding.rejected_reason && (
                        <div className="na-card na-p-6 na-mb-6 na-bg-danger-subtle">
                            <h2 className="na-h3 na-mb-4 na-text-danger">Rejection Reason</h2>
                            <div className="na-card na-p-4 na-bg-paper-2">
                                <p className="na-body">{onboarding.rejected_reason}</p>
                            </div>
                            <Link href="/vendor/cases" className="na-btn na-btn-primary na-mt-4">
                                View Case Details
                            </Link>
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

