/**
 * Group Analytics Page
 * 
 * Consolidated Spend Analytics: Real-time group-level analytics.
 * "How much do we spend on shipping?" → "$1,245,678.00" instantly.
 */

import { GroupAnalyticsRepository } from '@/src/repositories/group-analytics-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      groupId: 'default', // TODO: Get from auth
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface GroupAnalyticsPageProps {
  searchParams: {
    category?: string;
    date_from?: string;
    date_to?: string;
  };
}

export default async function GroupAnalyticsPage({ searchParams }: GroupAnalyticsPageProps) {
  const ctx = getRequestContext();
  const analyticsRepo = new GroupAnalyticsRepository();

  // Get spend by category
  const spendByCategory = await analyticsRepo.getSpendByCategory(ctx.actor.groupId || 'default', {
    category: searchParams.category,
    date_from: searchParams.date_from,
    date_to: searchParams.date_to,
  });

  // Get total spend
  const totalSpend = await analyticsRepo.getTotalSpend(ctx.actor.groupId || 'default', {
    date_from: searchParams.date_from,
    date_to: searchParams.date_to,
  });

  // Get spend by vendor
  const spendByVendor = await analyticsRepo.getSpendByVendor(ctx.actor.groupId || 'default', {
    date_from: searchParams.date_from,
    date_to: searchParams.date_to,
  });

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Group Analytics</h1>
        <p className="caption">Consolidated spend across all subsidiaries</p>
      </div>

      {/* Total Spend Card */}
      <div className="card p-6 mb-6">
        <div className="text-center">
          <div className="caption mb-2">Total Group Spend</div>
          <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main text-nx-primary">
            ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Spend by Category */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">Spend by Category</h2>
        <div className="card overflow-x-auto">
          <table className="table-professional w-full w-full">
            <thead>
              <tr className="table-row">
                <th className="table-header-cell">Category</th>
                <th className="table-header-cell">Total Amount</th>
                <th className="table-header-cell">Transactions</th>
                <th className="table-header-cell">Average</th>
                <th className="table-header-cell">Subsidiaries</th>
              </tr>
            </thead>
            <tbody>
              {spendByCategory.map((category) => (
                <tr key={category.category} className="table-row hover:bg-nx-surface-well">
                  <td className="table-data-cell font-semibold">{category.category}</td>
                  <td className="table-data-cell text-[length:var(--nx-body-size)] text-nx-text-main">
                    ${category.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="table-data-cell">{category.transaction_count}</td>
                  <td className="table-data-cell">
                    ${category.average_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="table-data-cell text-sm">
                    {category.subsidiaries.map((s) => s.tenant_name).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="card p-6">
        <h2 className="section mb-4">Top Vendors</h2>
        <div className="card overflow-x-auto">
          <table className="table-professional w-full w-full">
            <thead>
              <tr className="table-row">
                <th className="table-header-cell">Vendor</th>
                <th className="table-header-cell">Total Amount</th>
                <th className="table-header-cell">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {spendByVendor.slice(0, 10).map((vendor) => (
                <tr key={vendor.vendor_id} className="table-row hover:bg-nx-surface-well">
                  <td className="table-data-cell font-semibold">{vendor.vendor_name}</td>
                  <td className="table-data-cell text-[length:var(--nx-body-size)] text-nx-text-main">
                    ${vendor.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="table-data-cell">{vendor.transaction_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

