/**
 * Kernel Steward Dashboard
 * 
 * The Architect - Configures L1 tenants, maps L0 value sets,
 * sets Group credit limits. Keeps the "Iron Dome" from becoming a "Rust Dome".
 * 
 * Shows:
 * - Tenant configuration
 * - L0 Value Sets (Jurisdictional Value Sets)
 * - Group credit limits
 * - Kernel Registry concepts
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

interface KernelStewardPageProps {
    searchParams: {
        tenant_id?: string;
        group_id?: string;
    };
}

export default async function KernelStewardPage({ searchParams }: KernelStewardPageProps) {
    const ctx = getRequestContext();
    const supabase = createClient();
    const tenantAccessRepo = new TenantAccessRepository();

    // Get accessible tenants
    const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(ctx.actor.userId);
    const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

    // Get selected tenant (or null for "All Companies")
    const selectedTenantId = searchParams.tenant_id || null;
    const tenantIdsToQuery = selectedTenantId ? [selectedTenantId] : accessibleTenantIds;

    // Fetch configuration data
    let tenants: unknown[] = [];
    let groups: unknown[] = [];
    let creditExposure: unknown[] = [];
    let globalMetadata: unknown[] = [];
    let error: string | null = null;

    try {
        if (tenantIdsToQuery.length > 0) {
            // Get tenants
            const { data: tenantsData, error: tenantsError } = await supabase
                .from('tenants')
                .select('*')
                .in('id', tenantIdsToQuery)
                .order('created_at', { ascending: false });

            if (tenantsError) {
                throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
            }

            tenants = tenantsData || [];

            // Get groups
            const { data: groupsData, error: groupsError } = await supabase
                .from('groups')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (groupsError) {
                throw new Error(`Failed to fetch groups: ${groupsError.message}`);
            }

            groups = groupsData || [];

            // Get group credit exposure
            const { data: creditData, error: creditError } = await supabase
                .from('group_credit_exposure')
                .select('*, global_vendors(legal_name, tax_id), groups(name)')
                .order('total_exposure', { ascending: false })
                .limit(50);

            if (creditError) {
                throw new Error(`Failed to fetch credit exposure: ${creditError.message}`);
            }

            creditExposure = creditData || [];

            // Get L0 metadata (from mdm_global_metadata)
            const { data: metadataData, error: metadataError } = await supabase
                .from('mdm_global_metadata')
                .select('*')
                .eq('tier', 'tier1')
                .order('created_at', { ascending: false })
                .limit(50);

            if (metadataError) {
                // This is optional - metadata might not exist
                console.warn('Failed to fetch metadata:', metadataError.message);
            } else {
                globalMetadata = metadataData || [];
            }
        }
    } catch (err) {
        console.error('Failed to fetch kernel configuration data:', err);
        error = err instanceof Error ? err.message : 'Failed to load kernel configuration data.';
    }

    return (
        <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-2">Kernel Steward</h1>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
                        The Architect - Configures L1 tenants, maps L0 value sets, sets Group credit limits
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="caption">Tenants</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{tenants.length}</div>
                </div>
                <div className="card p-4">
                    <div className="caption">Groups</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{groups.length}</div>
                </div>
                <div className="card p-4">
                    <div className="caption">Credit Limits</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{creditExposure.length}</div>
                </div>
                <div className="card p-4">
                    <div className="caption">L0 Concepts</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{globalMetadata.length}</div>
                </div>
            </div>

            {error ? (
                <div className="card p-6 bg-nx-danger-bg text-nx-danger mb-6">
                    <h2 className="text-base font-semibold text-nx-text-main">Error Loading Configuration</h2>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{error}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tenants Configuration */}
                    {tenants.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">L1 Tenants</h2>
                            <div className="space-y-3">
                                {tenants.map((tenant: any) => (
                                    <div
                                        key={tenant.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">{tenant.name}</span>
                                                    <span className={`badge ${
                                                        tenant.status === 'active' ? 'bg-nx-success-bg text-nx-success' :
                                                        tenant.status === 'suspended' ? 'bg-nx-warning-bg text-nx-warning' :
                                                        'bg-nx-surface-well'
                                                    }`}>
                                                        {tenant.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Slug: {tenant.slug}
                                                </div>
                                                <div className="text-sm text-nx-text-muted">
                                                    Tier: {tenant.subscription_tier || 'free'}
                                                </div>
                                            </div>
                                            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary">
                                                Configure
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Groups Configuration */}
                    {groups.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">Groups</h2>
                            <div className="space-y-3">
                                {groups.map((group: any) => (
                                    <div
                                        key={group.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium mb-2">{group.name}</div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Legal: {group.legal_name}
                                                </div>
                                                <div className="text-sm text-nx-text-muted">
                                                    Country: {group.country_code}
                                                </div>
                                            </div>
                                            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary">
                                                Configure
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Credit Limits */}
                    {creditExposure.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">Group Credit Limits</h2>
                            <div className="space-y-3">
                                {creditExposure.map((exposure: any) => (
                                    <div
                                        key={exposure.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">
                                                        {exposure.global_vendors?.legal_name || 'Unknown Vendor'}
                                                    </span>
                                                    {exposure.is_over_limit && (
                                                        <span className="badge bg-nx-danger-bg text-nx-danger">
                                                            Over Limit
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Group: {exposure.groups?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Exposure: ${exposure.total_exposure?.toLocaleString() || '0.00'} / 
                                                    Limit: ${exposure.credit_limit?.toLocaleString() || '0.00'}
                                                </div>
                                                <div className="text-sm text-nx-text-muted">
                                                    Available: ${exposure.available_credit?.toLocaleString() || '0.00'}
                                                </div>
                                            </div>
                                            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary">
                                                Adjust Limit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* L0 Metadata */}
                    {globalMetadata.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-base font-semibold text-nx-text-main mb-4">L0 Value Sets (Kernel Registry)</h2>
                            <div className="space-y-3">
                                {globalMetadata.map((metadata: any) => (
                                    <div
                                        key={metadata.id}
                                        className="p-4 border border-nx-border rounded-lg hover:bg-nx-surface-well transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">{metadata.label}</span>
                                                    <span className="badge bg-nx-primary-light text-nx-primary">
                                                        {metadata.tier}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Canonical Key: {metadata.canonical_key}
                                                </div>
                                                <div className="text-sm text-nx-text-muted mb-1">
                                                    Domain: {metadata.domain} / Module: {metadata.module}
                                                </div>
                                                <div className="text-sm text-nx-text-muted">
                                                    {metadata.description || 'No description'}
                                                </div>
                                            </div>
                                            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer px-3 py-1.5 text-sm btn-primary">
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {tenants.length === 0 && groups.length === 0 && creditExposure.length === 0 && (
                        <div className="card p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-nx-surface-well rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-semibold text-nx-text-main mb-2">No Configuration Found</h2>
                            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
                                Start by configuring your first tenant or group.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

