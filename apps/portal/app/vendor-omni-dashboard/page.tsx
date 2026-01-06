/**
 * Vendor Omni-Dashboard Page
 * 
 * Vendor Groups: All work across subsidiaries in one unified view.
 * Single Sign-On: Log in once, see all POs, invoices, cases from all subsidiaries.
 */

import { Suspense } from 'react';
import { VendorContextSwitcher } from '@/components/vendor/VendorContextSwitcher';
import { VendorGroupRepository } from '@/src/repositories/vendor-group-repository';
import { createClient } from '@/lib/supabase-client';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: null, // null = all subsidiaries
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface VendorOmniDashboardPageProps {
  searchParams: {
    tenant_id?: string;
    type?: 'invoices' | 'pos' | 'cases';
  };
}

export default async function VendorOmniDashboardPage({ searchParams }: VendorOmniDashboardPageProps) {
  const ctx = getRequestContext();
  const vendorGroupRepo = new VendorGroupRepository();
  const supabase = createClient();

  // Get accessible subsidiaries for vendor user
  const accessibleSubsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Get selected tenant (or null for "All Subsidiaries")
  const selectedTenantId = searchParams.tenant_id || null;
  const tenantIdsToQuery = selectedTenantId ? [selectedTenantId] : accessibleTenantIds;

  // Get view type (invoices, POs, cases)
  const viewType = searchParams.type || 'invoices';

  // Fetch data based on view type
  let items: unknown[] = [];
  let error: string | null = null;

  try {
    if (tenantIdsToQuery.length === 0) {
      items = [];
    } else {
      switch (viewType) {
        case 'invoices':
          const { data: invoices, error: invoicesError } = await supabase
            .from('vmp_invoices')
            .select('*')
            .in('tenant_id', tenantIdsToQuery)
            .order('created_at', { ascending: false })
            .limit(100);

          if (invoicesError) throw new Error(`Failed to fetch invoices: ${invoicesError.message}`);
          items = invoices || [];
          break;

        case 'pos':
          const { data: pos, error: posError } = await supabase
            .from('vmp_po_refs')
            .select('*')
            .in('tenant_id', tenantIdsToQuery)
            .order('created_at', { ascending: false })
            .limit(100);

          if (posError) throw new Error(`Failed to fetch POs: ${posError.message}`);
          items = pos || [];
          break;

        case 'cases':
          const { data: cases, error: casesError } = await supabase
            .from('vmp_cases')
            .select('*')
            .in('tenant_id', tenantIdsToQuery)
            .order('created_at', { ascending: false })
            .limit(100);

          if (casesError) throw new Error(`Failed to fetch cases: ${casesError.message}`);
          items = cases || [];
          break;
      }
    }
  } catch (err) {
    console.error('Failed to fetch data:', err);
    error = err instanceof Error ? err.message : 'Failed to load data.';
  }

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Vendor Omni-Dashboard</h1>
        <p className="caption">
          Viewing: {selectedTenantId ? 'Single Subsidiary' : `All Subsidiaries (${accessibleSubsidiaries.length})`}
        </p>
      </div>

      <Suspense fallback={<div className="card p-6">Loading context...</div>}>
        <VendorContextSwitcher
          currentTenantId={selectedTenantId}
          onTenantChange={(tenantId) => {
            // Update URL with new tenant_id
            const params = new URLSearchParams(searchParams as Record<string, string>);
            if (tenantId) {
              params.set('tenant_id', tenantId);
            } else {
              params.delete('tenant_id');
            }
            window.location.href = `/vendor-omni-dashboard?${params.toString()}`;
          }}
          userId={ctx.actor.userId}
        />
      </Suspense>

      {/* View Type Selector */}
      <div className="card p-4 mb-6">
        <div className="flex gap-4">
          <button
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${viewType === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              const params = new URLSearchParams(searchParams as Record<string, string>);
              params.set('type', 'invoices');
              window.location.href = `/vendor-omni-dashboard?${params.toString()}`;
            }}
          >
            Invoices
          </button>
          <button
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${viewType === 'pos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              const params = new URLSearchParams(searchParams as Record<string, string>);
              params.set('type', 'pos');
              window.location.href = `/vendor-omni-dashboard?${params.toString()}`;
            }}
          >
            Purchase Orders
          </button>
          <button
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${viewType === 'cases' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              const params = new URLSearchParams(searchParams as Record<string, string>);
              params.set('type', 'cases');
              window.location.href = `/vendor-omni-dashboard?${params.toString()}`;
            }}
          >
            Cases
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="caption">Total {viewType}</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{items.length}</div>
          </div>
          <div>
            <div className="caption">Accessible Subsidiaries</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{accessibleSubsidiaries.length}</div>
          </div>
          <div>
            <div className="caption">Pending</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
              {items.filter((item: unknown) => (item as { status: string }).status === 'pending').length}
            </div>
          </div>
          <div>
            <div className="caption">Completed</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">
              {items.filter((item: unknown) => (item as { status: string }).status === 'completed' || (item as { status: string }).status === 'approved').length}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {error ? (
        <div className="card p-6 bg-nx-danger-bg text-nx-danger mb-6">
          <h2 className="text-base font-semibold text-nx-text-main">Error Loading Data</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{error}</p>
        </div>
      ) : (
        <Suspense fallback={<div className="card p-6">Loading data...</div>}>
          {items.length === 0 ? (
            <div className="card p-6 text-center">
              <h2 className="text-base font-semibold text-nx-text-main">No {viewType} Found</h2>
              <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mb-4">
                {selectedTenantId
                  ? `No ${viewType} found for this subsidiary.`
                  : `No ${viewType} found across accessible subsidiaries.`}
              </p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="table-professional w-full w-full">
                <thead>
                  <tr className="table-row">
                    <th className="table-header-cell">ID</th>
                    <th className="table-header-cell">Subsidiary</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Created</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: unknown) => {
                    const i = item as { id: string; tenant_id: string; status: string; created_at: string };
                    const subsidiary = accessibleSubsidiaries.find((s) => s.tenant_id === i.tenant_id);
                    return (
                      <tr key={i.id} className="table-row hover:bg-nx-surface-well">
                        <td className="table-data-cell text-sm">{i.id.slice(0, 8)}...</td>
                        <td className="table-data-cell text-sm">{subsidiary?.tenant_id.slice(0, 8) || 'Unknown'}</td>
                        <td className="table-data-cell">
                          <span className="badge badge-info">{i.status}</span>
                        </td>
                        <td className="table-data-cell text-sm">
                          {new Date(i.created_at).toLocaleDateString()}
                        </td>
                        <td className="table-data-cell">
                          <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main px-3 py-1.5 text-sm">View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
}

