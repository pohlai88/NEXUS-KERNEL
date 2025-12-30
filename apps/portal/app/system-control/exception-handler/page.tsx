/**
 * Exception Handler Dashboard
 * 
 * The Mechanic - Resolves the 5% of invoices that the system blocks.
 * 
 * Shows:
 * - Blocked invoices (price variances, matching failures)
 * - Cases requiring resolution
 * - Break Glass escalations
 * - Missing documents/evidence
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { TenantAccessRepository } from '@/src/repositories/tenant-access-repository';
import { CaseRepository } from '@/src/repositories/case-repository';
import { BreakGlassRepository } from '@/src/repositories/break-glass-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
    return {
        actor: {
            userId: 'system', // TODO: Get from auth
            tenantId: null, // null = all companies
            roles: [],
        },
        requestId: crypto.randomUUID(),
    };
}

interface ExceptionHandlerPageProps {
    searchParams: {
        tenant_id?: string;
        status?: string;
        priority?: string;
    };
}

export default async function ExceptionHandlerPage({ searchParams }: ExceptionHandlerPageProps) {
    const ctx = getRequestContext();
    const supabase = createClient();
    const tenantAccessRepo = new TenantAccessRepository();
    const caseRepo = new CaseRepository();
    const breakGlassRepo = new BreakGlassRepository();

    // Get accessible tenants
    const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(ctx.actor.userId);
    const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

    // Get selected tenant (or null for "All Companies")
    const selectedTenantId = searchParams.tenant_id || null;
    const tenantIdsToQuery = selectedTenantId ? [selectedTenantId] : accessibleTenantIds;

    // Fetch blocked invoices (status = 'disputed' or 'pending' with matching issues)
    let blockedInvoices: unknown[] = [];
    let blockedCases: unknown[] = [];
    let escalations: unknown[] = [];
    let error: string | null = null;

    try {
        if (tenantIdsToQuery.length > 0) {
            // Get blocked invoices
            const { data: invoicesData, error: invoicesError } = await supabase
                .from('vmp_invoices')
                .select('*, vmp_vendors(name, legal_name), vmp_companies(name)')
                .in('tenant_id', tenantIdsToQuery)
                .in('status', ['disputed', 'pending'])
                .order('created_at', { ascending: false })
                .limit(50);

            if (invoicesError) {
                throw new Error(`Failed to fetch invoices: ${invoicesError.message}`);
            }

            blockedInvoices = invoicesData || [];

            // Get blocked cases (status = 'blocked' or 'waiting_internal')
            const { data: casesData, error: casesError } = await supabase
                .from('vmp_cases')
                .select('*, vmp_vendors(name, legal_name), vmp_companies(name)')
                .in('tenant_id', tenantIdsToQuery)
                .in('status', ['blocked', 'waiting_internal'])
                .order('created_at', { ascending: false })
                .limit(50);

            if (casesError) {
                throw new Error(`Failed to fetch cases: ${casesError.message}`);
            }

            blockedCases = casesData || [];

            // Get pending escalations
            const escalationsData = await breakGlassRepo.getBySeniorManager(ctx.actor.userId);
            escalations = escalationsData.filter((e) => e.status === 'pending' || e.status === 'acknowledged');
        }
    } catch (err) {
        console.error('Failed to fetch exception data:', err);
        error = err instanceof Error ? err.message : 'Failed to load exception data.';
    }

    const totalExceptions = blockedInvoices.length + blockedCases.length + escalations.length;

    return (
        <div className="na-container na-mx-auto na-p-6">
            <div className="na-flex na-items-center na-justify-between na-mb-6">
                <div>
                    <h1 className="na-h1 na-mb-2">Exception Handler</h1>
                    <p className="na-body na-text-muted">
                        The Mechanic - Resolves the 5% of invoices that the system blocks
                    </p>
                </div>
                <div className="na-text-right">
                    <div className="na-metadata">Total Exceptions</div>
                    <div className="na-data-large na-text-warning">{totalExceptions}</div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="na-grid na-grid-cols-4 na-gap-4 na-mb-6">
                <div className="na-card na-p-4">
                    <div className="na-metadata">Blocked Invoices</div>
                    <div className="na-data-large">{blockedInvoices.length}</div>
                </div>
                <div className="na-card na-p-4">
                    <div className="na-metadata">Blocked Cases</div>
                    <div className="na-data-large">{blockedCases.length}</div>
                </div>
                <div className="na-card na-p-4">
                    <div className="na-metadata">Escalations</div>
                    <div className="na-data-large">{escalations.length}</div>
                </div>
                <div className="na-card na-p-4">
                    <div className="na-metadata">Accessible Companies</div>
                    <div className="na-data-large">{accessibleTenants.length}</div>
                </div>
            </div>

            {error ? (
                <div className="na-card na-p-6 na-bg-danger-subtle na-text-danger na-mb-6">
                    <h2 className="na-h4">Error Loading Exceptions</h2>
                    <p className="na-body">{error}</p>
                </div>
            ) : (
                <div className="na-space-y-6">
                    {/* Blocked Invoices */}
                    {blockedInvoices.length > 0 && (
                        <div className="na-card na-p-6">
                            <h2 className="na-h4 na-mb-4">Blocked Invoices</h2>
                            <div className="na-space-y-3">
                                {blockedInvoices.map((invoice: any) => (
                                    <div
                                        key={invoice.id}
                                        className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors"
                                    >
                                        <div className="na-flex na-items-start na-justify-between">
                                            <div className="na-flex-1">
                                                <div className="na-flex na-items-center na-gap-2 na-mb-2">
                                                    <span className="na-font-medium">
                                                        {invoice.invoice_number || invoice.invoice_num || 'N/A'}
                                                    </span>
                                                    <span className="na-badge na-bg-warning-subtle na-text-warning">
                                                        {invoice.status}
                                                    </span>
                                                </div>
                                                <div className="na-text-sm na-text-muted na-mb-1">
                                                    Vendor: {invoice.vmp_vendors?.name || invoice.vmp_vendors?.legal_name || 'Unknown'}
                                                </div>
                                                <div className="na-text-sm na-text-muted na-mb-1">
                                                    Amount: {invoice.currency_code || 'USD'} {invoice.amount?.toLocaleString() || '0.00'}
                                                </div>
                                                {invoice.current_status_reason_text && (
                                                    <div className="na-text-sm na-text-muted na-mt-2">
                                                        Reason: {invoice.current_status_reason_text}
                                                    </div>
                                                )}
                                            </div>
                                            <a
                                                href={`/cases?invoice_id=${invoice.id}`}
                                                className="na-btn na-btn-sm na-btn-primary"
                                            >
                                                Resolve
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Blocked Cases */}
                    {blockedCases.length > 0 && (
                        <div className="na-card na-p-6">
                            <h2 className="na-h4 na-mb-4">Blocked Cases</h2>
                            <div className="na-space-y-3">
                                {blockedCases.map((caseItem: any) => (
                                    <div
                                        key={caseItem.id}
                                        className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors"
                                    >
                                        <div className="na-flex na-items-start na-justify-between">
                                            <div className="na-flex-1">
                                                <div className="na-flex na-items-center na-gap-2 na-mb-2">
                                                    <span className="na-font-medium">{caseItem.subject}</span>
                                                    <span className="na-badge na-bg-warning-subtle na-text-warning">
                                                        {caseItem.status}
                                                    </span>
                                                    <span className="na-badge na-bg-muted">
                                                        {caseItem.case_type}
                                                    </span>
                                                </div>
                                                <div className="na-text-sm na-text-muted na-mb-1">
                                                    Vendor: {caseItem.vmp_vendors?.name || caseItem.vmp_vendors?.legal_name || 'Unknown'}
                                                </div>
                                                <div className="na-text-sm na-text-muted">
                                                    Owner: {caseItem.owner_team}
                                                </div>
                                            </div>
                                            <a
                                                href={`/cases/${caseItem.id}`}
                                                className="na-btn na-btn-sm na-btn-primary"
                                            >
                                                Resolve
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Escalations */}
                    {escalations.length > 0 && (
                        <div className="na-card na-p-6">
                            <h2 className="na-h4 na-mb-4">Break Glass Escalations</h2>
                            <div className="na-space-y-3">
                                {escalations.map((escalation: any) => (
                                    <div
                                        key={escalation.id}
                                        className="na-p-4 na-border na-rounded-lg hover:na-bg-muted na-transition-colors"
                                    >
                                        <div className="na-flex na-items-start na-justify-between">
                                            <div className="na-flex-1">
                                                <div className="na-flex na-items-center na-gap-2 na-mb-2">
                                                    <span className="na-font-medium">{escalation.reason}</span>
                                                    <span className={`na-badge ${
                                                        escalation.priority === 'emergency' ? 'na-bg-danger-subtle na-text-danger' :
                                                        escalation.priority === 'critical' ? 'na-bg-warning-subtle na-text-warning' :
                                                        'na-bg-muted'
                                                    }`}>
                                                        {escalation.priority}
                                                    </span>
                                                </div>
                                                <div className="na-text-sm na-text-muted na-mb-1">
                                                    {escalation.description}
                                                </div>
                                                <div className="na-text-sm na-text-muted">
                                                    Type: {escalation.escalation_type}
                                                </div>
                                            </div>
                                            <a
                                                href={`/escalations/break-glass/${escalation.id}`}
                                                className="na-btn na-btn-sm na-btn-primary"
                                            >
                                                Review
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {totalExceptions === 0 && (
                        <div className="na-card na-p-12 na-text-center">
                            <div className="na-w-16 na-h-16 na-mx-auto na-mb-4 na-bg-success-subtle na-rounded-full na-flex na-items-center na-justify-center">
                                <svg className="na-w-8 na-h-8 na-text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="na-h4 na-mb-2">No Exceptions Found</h2>
                            <p className="na-body na-text-muted">
                                The system is running smoothly. All invoices are processing normally.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

