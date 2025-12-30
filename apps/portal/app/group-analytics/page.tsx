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
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Group Analytics</h1>
        <p className="na-metadata">Consolidated spend across all subsidiaries</p>
      </div>

      {/* Total Spend Card */}
      <div className="na-card na-p-6 na-mb-6">
        <div className="na-text-center">
          <div className="na-metadata na-mb-2">Total Group Spend</div>
          <div className="na-data-large na-text-primary">
            ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Spend by Category */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Spend by Category</h2>
        <div className="na-card na-overflow-x-auto">
          <table className="na-table-frozen na-w-full">
            <thead>
              <tr className="na-tr">
                <th className="na-th">Category</th>
                <th className="na-th">Total Amount</th>
                <th className="na-th">Transactions</th>
                <th className="na-th">Average</th>
                <th className="na-th">Subsidiaries</th>
              </tr>
            </thead>
            <tbody>
              {spendByCategory.map((category) => (
                <tr key={category.category} className="na-tr na-hover-bg-paper-2">
                  <td className="na-td na-font-semibold">{category.category}</td>
                  <td className="na-td na-data">
                    ${category.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="na-td">{category.transaction_count}</td>
                  <td className="na-td">
                    ${category.average_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="na-td na-text-sm">
                    {category.subsidiaries.map((s) => s.tenant_name).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="na-card na-p-6">
        <h2 className="na-h3 na-mb-4">Top Vendors</h2>
        <div className="na-card na-overflow-x-auto">
          <table className="na-table-frozen na-w-full">
            <thead>
              <tr className="na-tr">
                <th className="na-th">Vendor</th>
                <th className="na-th">Total Amount</th>
                <th className="na-th">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {spendByVendor.slice(0, 10).map((vendor) => (
                <tr key={vendor.vendor_id} className="na-tr na-hover-bg-paper-2">
                  <td className="na-td na-font-semibold">{vendor.vendor_name}</td>
                  <td className="na-td na-data">
                    ${vendor.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="na-td">{vendor.transaction_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

