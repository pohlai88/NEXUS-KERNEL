/**
 * Omni-Dashboard Page
 * 
 * Group-Level Dashboard: Aggregated view across all subsidiaries.
 * Single Sign-On: Log in once, see everything.
 */

import { Suspense } from 'react';
import { ContextSwitcher } from '@/components/tenant/ContextSwitcher';
import { VendorTable } from '@/components/vendors/VendorTable';
import { VendorRepository } from '@/src/repositories/vendor-repository';
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

interface OmniDashboardPageProps {
    searchParams: {
        tenant_id?: string;
        status?: string;
        search?: string;
    };
}

export default async function OmniDashboardPage({ searchParams }: OmniDashboardPageProps) {
    const ctx = getRequestContext();
    const tenantAccessRepo = new TenantAccessRepository();
    const vendorRepo = new VendorRepository();

    // Get accessible tenants
    const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(ctx.actor.userId);
    const accessibleTenantIds = accessibleTenants.map((t) => t.tenant_id);

    // Get selected tenant (or null for "All Companies")
    const selectedTenantId = searchParams.tenant_id || null;
    const tenantIdsToQuery = selectedTenantId ? [selectedTenantId] : accessibleTenantIds;

    // Fetch vendors from accessible tenants
    let vendors: unknown[] = [];
    let error: string | null = null;

    try {
        if (tenantIdsToQuery.length === 0) {
            vendors = [];
        } else {
            // Query vendors from all accessible tenants
            const { data, error: queryError } = await vendorRepo.supabase
                .from('vmp_vendors')
                .select('*')
                .in('tenant_id', tenantIdsToQuery)
                .order('created_at', { ascending: false });

            if (queryError) {
                throw new Error(`Failed to fetch vendors: ${queryError.message}`);
            }

            vendors = data || [];
        }
    } catch (err) {
        console.error('Failed to fetch vendors:', err);
        error = err instanceof Error ? err.message : 'Failed to load vendors.';
    }

    return (
        <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Omni-Dashboard</h1>
                <p className="caption">
                    Viewing: {selectedTenantId ? 'Single Company' : `All Companies (${accessibleTenants.length})`}
                </p>
            </div>

            <Suspense fallback={<div className="card p-6">Loading context...</div>}>
                <ContextSwitcher
                    currentTenantId={selectedTenantId}
                    onTenantChange={(tenantId) => {
                        // Update URL with new tenant_id
                        const params = new URLSearchParams(searchParams as Record<string, string>);
                        if (tenantId) {
                            params.set('tenant_id', tenantId);
                        } else {
                            params.delete('tenant_id');
                        }
                        window.location.href = `/omni-dashboard?${params.toString()}`;
                    }}
                    userId={ctx.actor.userId}
                />
            </Suspense>

            <div className="card p-4 mb-6">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <div className="caption">Total Vendors</div>
                        <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{vendors.length}</div>
                    </div>
                    <div>
                        <div className="caption">Accessible Companies</div>
                        <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{accessibleTenants.length}</div>
                    </div>
                    <div>
                        <div className="caption">Active Vendors</div>
                        <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
                            {vendors.filter((v: unknown) => (v as { status: string }).status === 'APPROVED').length}
                        </div>
                    </div>
                    <div>
                        <div className="caption">Pending</div>
                        <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
                            {vendors.filter((v: unknown) => (v as { status: string }).status === 'PENDING').length}
                        </div>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="card p-6 bg-nx-danger-bg text-nx-danger mb-6">
                    <h2 className="text-base font-semibold text-nx-text-main">Error Loading Vendors</h2>
                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{error}</p>
                </div>
            ) : (
                <Suspense fallback={<div className="card p-6">Loading vendors...</div>}>
                    {vendors.length === 0 ? (
                        <div className="card p-6 text-center">
                            <h2 className="text-base font-semibold text-nx-text-main">No Vendors Found</h2>
                            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mb-4">
                                {selectedTenantId
                                    ? 'No vendors found for this company.'
                                    : 'No vendors found across accessible companies.'}
                            </p>
                        </div>
                    ) : (
                        <VendorTable initialVendors={vendors as Parameters<typeof VendorTable>[0]['initialVendors']} />
                    )}
                </Suspense>
            )}
        </div>
    );
}

