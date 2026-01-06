/**
 * Vendor List Page
 * 
 * Server Component - Fetches vendors server-side.
 * Uses vendorCRUD for data access.
 */

import { vendorCRUD } from '@/src/cruds/vendor-crud';
import { VendorTable } from '@/components/vendors/VendorTable';
import type { RequestContext } from '@nexus/cruds';

// TODO: Get RequestContext from authentication middleware
function getRequestContext(): RequestContext {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: 'default', // TODO: Get from auth
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface VendorsPageProps {
  searchParams: {
    status?: string;
    search?: string;
    country?: string;
  };
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const ctx = getRequestContext();

  // Fetch vendors with filters
  const vendors = await vendorCRUD.list(ctx, {
    status: searchParams.status,
    search: searchParams.search,
    country_code: searchParams.country,
  });

  return (
    <div className="shell p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Vendors</h1>
        <a href="/vendors/new" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
          Create Vendor
        </a>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <form method="get" className="flex gap-4 items-end">
          <div>
            <label className="caption mb-2 block">Status</label>
            <select
              name="status"
              className="input"
              defaultValue={searchParams.status || ''}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="caption mb-2 block">Search</label>
            <input
              type="text"
              name="search"
              className="input w-full"
              placeholder="Search by name..."
              defaultValue={searchParams.search || ''}
            />
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {/* Vendor Table */}
      {vendors.length === 0 ? (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-nx-text-main">No Vendors Found</h2>
          <p className="text-[length:var(--nx-body-size)] text-nx-text-main mb-4">
            No vendors have been created yet. Create your first vendor to get started.
          </p>
          <a href="/vendors/new" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">
            Create First Vendor
          </a>
        </div>
      ) : (
        <VendorTable initialVendors={vendors} />
      )}
    </div>
  );
}

