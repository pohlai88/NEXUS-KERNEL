/**
 * System Control Team Landing Page
 * 
 * The Elite 10% - The "Pilots" for the Ferrari
 * 
 * Three specialized roles:
 * 1. Exception Handler - Resolves the 5% of invoices that the system blocks
 * 2. Fraud Hunter - Reviews high-value changes, bank account changes, risk anomalies
 * 3. Kernel Steward - Configures L1 tenants, L0 value sets, Group credit limits
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { TenantAccessRepository } from '@/src/repositories/tenant-access-repository';
import { BreakGlassRepository } from '@/src/repositories/break-glass-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
    return {
        actor: {
            userId: 'system', // TODO: Get from auth
            tenantId: null,
            roles: [],
        },
        requestId: crypto.randomUUID(),
    };
}

export default async function SystemControlPage() {
    const ctx = getRequestContext();
    const supabase = createClient();
    const tenantAccessRepo = new TenantAccessRepository();
    const breakGlassRepo = new BreakGlassRepository();

    // Get accessible tenants
    const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(ctx.actor.userId);
    const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

    // Fetch live counts
    let exceptionCount = 0;
    let riskCount = 0;
    let configCount = 0;

    try {
        if (accessibleTenantIds.length > 0) {
            // Exception count (blocked invoices + cases + escalations)
            const [invoicesResult, casesResult, escalationsResult] = await Promise.all([
                supabase
                    .from('vmp_invoices')
                    .select('id', { count: 'exact', head: true })
                    .in('tenant_id', accessibleTenantIds)
                    .in('status', ['disputed', 'pending']),
                supabase
                    .from('vmp_cases')
                    .select('id', { count: 'exact', head: true })
                    .in('tenant_id', accessibleTenantIds)
                    .in('status', ['blocked', 'waiting_internal']),
                breakGlassRepo.getBySeniorManager(ctx.actor.userId),
            ]);

            exceptionCount = (invoicesResult.count || 0) + (casesResult.count || 0) + 
                escalationsResult.filter((e) => e.status === 'pending' || e.status === 'acknowledged').length;

            // Risk count (high-value payments + watchlist)
            const [paymentsResult, watchlistResult] = await Promise.all([
                supabase
                    .from('vmp_payments')
                    .select('id', { count: 'exact', head: true })
                    .in('tenant_id', accessibleTenantIds)
                    .gte('amount', 10000),
                supabase
                    .from('group_risk_watchlist')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'active'),
            ]);

            riskCount = (paymentsResult.count || 0) + (watchlistResult.count || 0);

            // Config count (tenants + groups + credit limits)
            const [tenantsResult, groupsResult, creditResult] = await Promise.all([
                supabase
                    .from('tenants')
                    .select('id', { count: 'exact', head: true })
                    .in('id', accessibleTenantIds),
                supabase
                    .from('groups')
                    .select('id', { count: 'exact', head: true }),
                supabase
                    .from('group_credit_exposure')
                    .select('id', { count: 'exact', head: true }),
            ]);

            configCount = (tenantsResult.count || 0) + (groupsResult.count || 0) + (creditResult.count || 0);
        }
    } catch (err) {
        console.error('Failed to fetch live counts:', err);
    }
    return (
        <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-2">System Control Team</h1>
                <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
                    The Elite 10% - The "Pilots" for the Ferrari. Machines handle the Happy Path. 
                    You handle the Context.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Exception Handler */}
                <Link href="/system-control/exception-handler" className="card p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-nx-warning-bg rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-nx-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="section">Exception Handler</h2>
                                {exceptionCount > 0 && (
                                    <span className="badge bg-nx-warning-bg text-nx-warning">
                                        {exceptionCount} Active
                                    </span>
                                )}
                            </div>
                            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted mb-4">
                                The Mechanic. Resolves the 5% of invoices that the system blocks.
                                Price variances, matching failures, missing documents.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-nx-text-muted">
                                <span className="font-medium">Role:</span>
                                <span>Resolving blocks, not entering invoices</span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Fraud Hunter */}
                <Link href="/system-control/fraud-hunter" className="card p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-nx-danger-bg rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-nx-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="section">Fraud Hunter</h2>
                                {riskCount > 0 && (
                                    <span className="badge bg-nx-danger-bg text-nx-danger">
                                        {riskCount} Items
                                    </span>
                                )}
                            </div>
                            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted mb-4">
                                The Guard. Reviews high-value changes, bank account modifications,
                                and risk anomalies the AI missed.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-nx-text-muted">
                                <span className="font-medium">Role:</span>
                                <span>Risk Analyst, anomaly detection</span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Kernel Steward */}
                <Link href="/system-control/kernel-steward" className="card p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-nx-primary-light rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-nx-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="section">Kernel Steward</h2>
                                {configCount > 0 && (
                                    <span className="badge bg-nx-primary-light text-nx-primary">
                                        {configCount} Configs
                                    </span>
                                )}
                            </div>
                            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted mb-4">
                                The Architect. Configures L1 tenants, maps L0 value sets,
                                sets Group credit limits. Keeps the "Iron Dome" from becoming a "Rust Dome".
                            </p>
                            <div className="flex items-center gap-2 text-sm text-nx-text-muted">
                                <span className="font-medium">Role:</span>
                                <span>Platform Owner, system configuration</span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="mt-8 card p-6 bg-nx-surface-well">
                <h3 className="text-base font-semibold text-nx-text-main mb-4">The Automation Paradox</h3>
                <div className="space-y-3 text-sm">
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
                        <strong>What You Are Killing (The 90%):</strong> Data Entry Clerks, Email Chasers, 
                        Reconciliation Staff, Master Data Cleaners. These jobs are dead. 
                        If you keep them, you are paying people to watch a machine work.
                    </p>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
                        <strong>What You MUST Keep (The 10% Elite):</strong> Exception Handlers, Fraud Hunters, 
                        Kernel Stewards. Machines are great at the Happy Path. They are terrible at Context.
                    </p>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main font-medium text-nx-primary">
                        Recommendation: Cut 90%. Keep the top 10% as "System Controllers."
                    </p>
                </div>
            </div>
        </div>
    );
}

