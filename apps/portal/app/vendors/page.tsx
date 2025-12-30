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
    <div className="na-shell-main na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Vendors</h1>
        <a href="/vendors/new" className="na-btn na-btn-primary">
          Create Vendor
        </a>
      </div>

      {/* Filters */}
      <div className="na-card na-p-4 na-mb-6">
        <form method="get" className="na-flex na-gap-4 na-items-end">
          <div>
            <label className="na-metadata na-mb-2 na-block">Status</label>
            <select
              name="status"
              className="na-input"
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
          <div className="na-flex-1">
            <label className="na-metadata na-mb-2 na-block">Search</label>
            <input
              type="text"
              name="search"
              className="na-input na-w-full"
              placeholder="Search by name..."
              defaultValue={searchParams.search || ''}
            />
          </div>
          <button type="submit" className="na-btn na-btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {/* Vendor Table */}
      {vendors.length === 0 ? (
        <div className="na-card na-p-6">
          <h2 className="na-h4">No Vendors Found</h2>
          <p className="na-data na-mb-4">
            No vendors have been created yet. Create your first vendor to get started.
          </p>
          <a href="/vendors/new" className="na-btn na-btn-primary">
            Create First Vendor
          </a>
        </div>
      ) : (
        <VendorTable initialVendors={vendors} />
      )}
    </div>
  );
}

