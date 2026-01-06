/**
 * Fraud Hunter Dashboard
 * 
 * The Guard - Reviews high-value changes, bank account modifications,
 * and risk anomalies the AI missed.
 * 
 * Shows:
 * - High-value transactions requiring review
 * - Bank account changes
 * - Risk watchlist items
 * - Anomaly detection alerts
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { TenantAccessRepository } from '@/src/repositories/tenant-access-repository';

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

interface FraudHunterPageProps {
    searchParams: {
        tenant_id?: string;
        risk_level?: string;
    };
}

export default async function FraudHunterPage({ searchParams }: FraudHunterPageProps) {
    const ctx = getRequestContext();
    const supabase = createClient();
    const tenantAccessRepo = new TenantAccessRepository();

    // Get accessible tenants
    const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(ctx.actor.userId);
    const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

    // Get selected tenant (or null for "All Companies")
    const selectedTenantId = searchParams.tenant_id || null;
    const tenantIdsToQuery = selectedTenantId ? [selectedTenantId] : accessibleTenantIds;

    // Fetch risk data
    let highValuePayments: unknown[] = [];
    let riskWatchlist: unknown[] = [];
    let bankAccountChanges: unknown[] = [];
    let error: string | null = null;

    try {
        if (tenantIdsToQuery.length > 0) {
            // Get high-value payments (over $10k) requiring review
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('vmp_payments')
                .select('*, vmp_vendors(name, legal_name, bank_name, account_number), vmp_companies(name)')
                .in('tenant_id', tenantIdsToQuery)
                .gte('amount', 10000)
                .order('created_at', { ascending: false })
                .limit(50);

            if (paymentsError) {
                throw new Error(`Failed to fetch payments: ${paymentsError.message}`);
            }

            highValuePayments = paymentsData || [];

            // Get risk watchlist items
            const { data: watchlistData, error: watchlistError } = await supabase
                .from('group_risk_watchlist')
                .select('*, global_vendors(legal_name, tax_id, risk_status), groups(name)')
                .eq('status', 'active')
                .order('flagged_at', { ascending: false })
                .limit(50);

            if (watchlistError) {
                throw new Error(`Failed to fetch watchlist: ${watchlistError.message}`);
            }

            riskWatchlist = watchlistData || [];

            // Get recent vendor bank account changes (from audit trail)
            // Note: This would need to query audit_trail for vendor bank account changes
            // For now, we'll show a placeholder
            bankAccountChanges = [];
        }
    } catch (err) {
        console.error('Failed to fetch fraud detection data:', err);
        error = err instanceof Error ? err.message : 'Failed to load fraud detection data.';
    }

    const totalRisks = highValuePayments.length + riskWatchlist.length + bankAccountChanges.length;

    return (
        <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-2">Fraud Hunter</h1>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
                        The Guard - Reviews high-value changes, bank account modifications, and risk anomalies
                    </p>
                </div>
                <div className="text-right">
                    <div className="caption">Total Risk Items</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-danger">{totalRisks}</div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="caption">High-Value Payments</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{highValuePayments.length}</div>
                    <div className="text-xs text-nx-text-muted mt-1">≥ $10,000</div>
                </div>
                <div className="card p-4">
                    <div className="caption">Risk Watchlist</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{riskWatchlist.length}</div>
                    <div className="text-xs text-nx-text-muted mt-1">Active flags</div>
                </div>
                <div className="card p-4">
                    <div className="caption">Bank Changes</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{bankAccountChanges.length}</div>
                    <div className="text-xs text-nx-text-muted mt-1">Requires verification</div>
                </div>
                <div className="card p-4">
                    <div className="caption">Accessible Companies</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{accessibleTenants.length}</div>
                </div>
            </div>

            {error ? (
                <div className="card p-6 bg-nx-danger-bg text-nx-danger mb-6">
                    <h2 className="text-base font-semibold text-nx-text-main">Error Loading Risk Data</h2>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{error}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* High-Value Payments */}
                    {highValuePayments.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">High-Value Payments Requiring Review</h2>
                            <div className="space-y-3">
                                {highValuePayments.map((payment: any) => (
                                    <div
                                        key={payment.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">
                                                        {payment.payment_ref || payment.id}
                                                    </span>
                                                    <span className="badge bg-nx-danger-bg text-nx-danger">
                                                        ${payment.amount?.toLocaleString() || '0.00'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Vendor: {payment.vmp_vendors?.name || payment.vmp_vendors?.legal_name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Bank: {payment.vmp_vendors?.bank_name || 'N/A'} 
                                                    {payment.vmp_vendors?.account_number && (
                                                        <span className="ml-2">***{payment.vmp_vendors.account_number.slice(-4)}</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-nx-text-muted">
                                                    Date: {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <a
                                                    href={`/payments/${payment.id}`}
                                                    className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary"
                                                >
                                                    Review
                                                </a>
                                                <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm border border-nx-border bg-transparent hover:bg-nx-surface-well">
                                                    Verify Bank
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risk Watchlist */}
                    {riskWatchlist.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">Risk Watchlist</h2>
                            <div className="space-y-3">
                                {riskWatchlist.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">
                                                        {item.global_vendors?.legal_name || 'Unknown Vendor'}
                                                    </span>
                                                    <span className={`badge ${
                                                        item.risk_level === 'critical' ? 'bg-nx-danger-bg text-nx-danger' :
                                                        item.risk_level === 'high' ? 'bg-nx-warning-bg text-nx-warning' :
                                                        'bg-nx-surface-well'
                                                    }`}>
                                                        {item.risk_level}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Reason: {item.risk_reason}
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Tax ID: {item.global_vendors?.tax_id || 'N/A'}
                                                </div>
                                                {item.requires_group_cfo_approval && (
                                                    <div className="text-xs text-nx-warning mt-2">
                                                        ⚠️ Requires Group CFO Approval
                                                    </div>
                                                )}
                                                {item.requires_group_ceo_approval && (
                                                    <div className="text-xs text-nx-danger mt-2">
                                                        ⚠️ Requires Group CEO Approval
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary">
                                                    Review
                                                </button>
                                                <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm border border-nx-border bg-transparent hover:bg-nx-surface-well">
                                                    Call Vendor
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bank Account Changes */}
                    {bankAccountChanges.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">Bank Account Changes Requiring Verification</h2>
                            <div className="space-y-3">
                                {bankAccountChanges.map((change: any) => (
                                    <div
                                        key={change.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium mb-2">{change.vendor_name}</div>
                                                <div className="text-sm text-nx-text-muted">
                                                    Old: {change.old_bank_account}
                                                </div>
                                                <div className="text-sm text-nx-text-muted">
                                                    New: {change.new_bank_account}
                                                </div>
                                            </div>
                                            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary">
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {totalRisks === 0 && (
                        <div className="card p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-nx-success-bg rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-nx-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-semibold text-nx-text-main mb-2">No Risk Items Found</h2>
                            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
                                All transactions are within normal parameters. No anomalies detected.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

