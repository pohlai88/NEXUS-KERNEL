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
        <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-2">Exception Handler</h1>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
                        The Mechanic - Resolves the 5% of invoices that the system blocks
                    </p>
                </div>
                <div className="text-right">
                    <div className="caption">Total Exceptions</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-warning">{totalExceptions}</div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="caption">Blocked Invoices</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{blockedInvoices.length}</div>
                </div>
                <div className="card p-4">
                    <div className="caption">Blocked Cases</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{blockedCases.length}</div>
                </div>
                <div className="card p-4">
                    <div className="caption">Escalations</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{escalations.length}</div>
                </div>
                <div className="card p-4">
                    <div className="caption">Accessible Companies</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{accessibleTenants.length}</div>
                </div>
            </div>

            {error ? (
                <div className="card p-6 bg-nx-danger-bg text-nx-danger mb-6">
                    <h2 className="text-base font-semibold text-nx-text-main">Error Loading Exceptions</h2>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{error}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Blocked Invoices */}
                    {blockedInvoices.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">Blocked Invoices</h2>
                            <div className="space-y-3">
                                {blockedInvoices.map((invoice: any) => (
                                    <div
                                        key={invoice.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">
                                                        {invoice.invoice_number || invoice.invoice_num || 'N/A'}
                                                    </span>
                                                    <span className="badge bg-nx-warning-bg text-nx-warning">
                                                        {invoice.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Vendor: {invoice.vmp_vendors?.name || invoice.vmp_vendors?.legal_name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Amount: {invoice.currency_code || 'USD'} {invoice.amount?.toLocaleString() || '0.00'}
                                                </div>
                                                {invoice.current_status_reason_text && (
                                                    <div className="text-sm text-nx-text-muted mt-2">
                                                        Reason: {invoice.current_status_reason_text}
                                                    </div>
                                                )}
                                            </div>
                                            <a
                                                href={`/cases?invoice_id=${invoice.id}`}
                                                className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary"
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
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">Blocked Cases</h2>
                            <div className="space-y-3">
                                {blockedCases.map((caseItem: any) => (
                                    <div
                                        key={caseItem.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">{caseItem.subject}</span>
                                                    <span className="badge bg-nx-warning-bg text-nx-warning">
                                                        {caseItem.status}
                                                    </span>
                                                    <span className="badge bg-nx-surface-well">
                                                        {caseItem.case_type}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Vendor: {caseItem.vmp_vendors?.name || caseItem.vmp_vendors?.legal_name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-nx-text-muted">
                                                    Owner: {caseItem.owner_team}
                                                </div>
                                            </div>
                                            <a
                                                href={`/cases/${caseItem.id}`}
                                                className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary"
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
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">Break Glass Escalations</h2>
                            <div className="space-y-3">
                                {escalations.map((escalation: any) => (
                                    <div
                                        key={escalation.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">{escalation.reason}</span>
                                                    <span className={`badge ${
                                                        escalation.priority === 'emergency' ? 'bg-nx-danger-bg text-nx-danger' :
                                                        escalation.priority === 'critical' ? 'bg-nx-warning-bg text-nx-warning' :
                                                        'bg-nx-surface-well'
                                                    }`}>
                                                        {escalation.priority}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    {escalation.description}
                                                </div>
                                                <div className="text-sm text-nx-text-muted">
                                                    Type: {escalation.escalation_type}
                                                </div>
                                            </div>
                                            <a
                                                href={`/escalations/break-glass/${escalation.id}`}
                                                className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary"
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
                        <div className="card p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-nx-success-bg rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-nx-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-base font-semibold text-nx-text-main mb-2">No Exceptions Found</h2>
                            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
                                The system is running smoothly. All invoices are processing normally.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

