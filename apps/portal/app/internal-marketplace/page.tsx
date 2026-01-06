/**
 * Internal Marketplace Page
 * 
 * Group Inventory Visibility: Subsidiaries can see inventory from other subsidiaries.
 * "Subsidiary A has 50 extra laptops. Subsidiary B needs laptops and requests transfer."
 */

import { Suspense } from 'react';
import { InternalMarketplaceRepository } from '@/src/repositories/internal-marketplace-repository';
import { ContextSwitcher } from '@/components/tenant/ContextSwitcher';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      groupId: 'default', // TODO: Get from auth
      tenantId: null, // null = all companies
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface InternalMarketplacePageProps {
  searchParams: {
    item_code?: string;
    item_name?: string;
    category?: string;
    tenant_id?: string;
  };
}

export default async function InternalMarketplacePage({ searchParams }: InternalMarketplacePageProps) {
  const ctx = getRequestContext();
  const marketplaceRepo = new InternalMarketplaceRepository();

  // Search inventory across group
  const inventoryItems = await marketplaceRepo.searchInventory(ctx.actor.groupId || 'default', {
    item_code: searchParams.item_code,
    item_name: searchParams.item_name,
    category: searchParams.category,
    tenant_id: searchParams.tenant_id,
  });

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Internal Marketplace</h1>
        <p className="caption">Group inventory visibility across all subsidiaries</p>
      </div>

      <Suspense fallback={<div className="card p-6">Loading context...</div>}>
        <ContextSwitcher
          currentTenantId={searchParams.tenant_id || null}
          onTenantChange={(tenantId) => {
            const params = new URLSearchParams(searchParams as Record<string, string>);
            if (tenantId) {
              params.set('tenant_id', tenantId);
            } else {
              params.delete('tenant_id');
            }
            window.location.href = `/internal-marketplace?${params.toString()}`;
          }}
          userId={ctx.actor.userId}
        />
      </Suspense>

      {/* Search Filters */}
      <div className="card p-4 mb-6">
        <form method="get" className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="caption mb-2 block">Search</label>
            <input
              type="text"
              name="item_name"
              className="input w-full"
              placeholder="Search items..."
              defaultValue={searchParams.item_name || ''}
            />
          </div>
          <div>
            <label className="caption mb-2 block">Category</label>
            <select name="category" className="input" defaultValue={searchParams.category || ''}>
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="furniture">Furniture</option>
            </select>
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Inventory Grid */}
      {inventoryItems.length === 0 ? (
        <div className="card p-6 text-center">
          <h2 className="text-base font-semibold text-nx-text-main">No Inventory Found</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">
            No items found matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventoryItems.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-nx-text-main">{item.item_name}</h3>
                  <p className="caption text-sm">{item.item_code}</p>
                </div>
                <span className="badge badge-info">{item.tenant_name}</span>
              </div>
              <div className="mb-4">
                <div className="caption">Available</div>
                <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{item.quantity_available}</div>
              </div>
              {item.unit_price && (
                <div className="mb-4">
                  <div className="caption">Price</div>
                  <div className="text-[length:var(--nx-body-size)] text-nx-text-main">
                    ${item.unit_price.toLocaleString()} {item.currency_code}
                  </div>
                </div>
              )}
              <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full">
                Request Transfer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

