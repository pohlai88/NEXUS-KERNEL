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
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Internal Marketplace</h1>
        <p className="na-metadata">Group inventory visibility across all subsidiaries</p>
      </div>

      <Suspense fallback={<div className="na-card na-p-6">Loading context...</div>}>
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
      <div className="na-card na-p-4 na-mb-6">
        <form method="get" className="na-flex na-gap-4 na-items-end">
          <div className="na-flex-1">
            <label className="na-metadata na-mb-2 na-block">Search</label>
            <input
              type="text"
              name="item_name"
              className="na-input na-w-full"
              placeholder="Search items..."
              defaultValue={searchParams.item_name || ''}
            />
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Category</label>
            <select name="category" className="na-input" defaultValue={searchParams.category || ''}>
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="furniture">Furniture</option>
            </select>
          </div>
          <button type="submit" className="na-btn na-btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Inventory Grid */}
      {inventoryItems.length === 0 ? (
        <div className="na-card na-p-6 na-text-center">
          <h2 className="na-h4">No Inventory Found</h2>
          <p className="na-body na-mt-2">
            No items found matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 lg:na-grid-cols-3 na-gap-4">
          {inventoryItems.map((item) => (
            <div key={item.id} className="na-card na-p-4">
              <div className="na-flex na-justify-between na-items-start na-mb-2">
                <div>
                  <h3 className="na-h5">{item.item_name}</h3>
                  <p className="na-metadata na-text-sm">{item.item_code}</p>
                </div>
                <span className="na-badge na-badge-info">{item.tenant_name}</span>
              </div>
              <div className="na-mb-4">
                <div className="na-metadata">Available</div>
                <div className="na-data-large">{item.quantity_available}</div>
              </div>
              {item.unit_price && (
                <div className="na-mb-4">
                  <div className="na-metadata">Price</div>
                  <div className="na-data">
                    ${item.unit_price.toLocaleString()} {item.currency_code}
                  </div>
                </div>
              )}
              <button className="na-btn na-btn-primary na-w-full">
                Request Transfer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

