'use client';

import { useRouter } from 'next/navigation';

/**
 * Helper function to get Nexus status classes
 */
function getStatusClass(variant: 'success' | 'error' | 'warning' | 'pending'): string {
  const map = {
    success: 'badge badge-success',
    error: 'badge bad',
    warning: 'badge badge-warning',
    pending: 'badge pending',
  };
  return map[variant];
}

/**
 * Nexus Canon Portal - Beast Mode Dashboard
 * Using Nexus Beast Mode Patterns:
 * - Radio Button State Machine (0ms latency view switching)
 * - Bi-directional Sticky Grid (Frozen panes)
 * - Omni Shell Layout (Grid-based application shell)
 */
export default function Home() {
  const router = useRouter();

  const metrics = [
    { label: 'Total Vendors', value: '1,247', change: '+12%', status: 'success' as const },
    { label: 'Active Orders', value: '342', change: '+8%', status: 'success' as const },
    { label: 'Pending Reviews', value: '23', change: '-5%', status: 'warning' as const },
    { label: 'Revenue (MTD)', value: '$2.4M', change: '+24%', status: 'success' as const },
  ];

  const vendors = [
    { id: '1', name: 'Acme Corporation', amount: '$45,200', status: 'approved' as const, date: '2025-01-22' },
    { id: '2', name: 'Tech Solutions Inc', amount: '$12,800', status: 'pending' as const, date: '2025-01-21' },
    { id: '3', name: 'Global Supplies Ltd', amount: '$89,500', status: 'approved' as const, date: '2025-01-20' },
    { id: '4', name: 'Prime Logistics', amount: '$23,100', status: 'pending' as const, date: '2025-01-19' },
    { id: '5', name: 'Digital Dynamics', amount: '$67,300', status: 'approved' as const, date: '2025-01-18' },
    { id: '6', name: 'Supply Chain Pro', amount: '$34,600', status: 'warning' as const, date: '2025-01-17' },
  ];

  return (
    <>
      {/* Beast Mode: Radio Button State Machine for View Switching (0ms latency) */}
      <input type="radio" name="view" id="v-dashboard" className="hidden" defaultChecked suppressHydrationWarning />
      <input type="radio" name="view" id="v-table" className="hidden" suppressHydrationWarning />
      <input type="radio" name="view" id="v-cards" className="hidden" suppressHydrationWarning />

      {/* Beast Mode: Omni Shell Layout (Grid-based application shell) */}
      <div className="shell min-h-screen" suppressHydrationWarning>
        {/* Header */}
        <header className="page-header flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-base font-semibold text-nx-text-main">Nexus Canon</div>
            <div className="caption">Portal</div>
          </div>
          
          {/* View Switcher - Radio State Machine (Beast Mode) */}
          <div className="flex items-center gap-2 flex gap-2 items-center">
            <label htmlFor="v-dashboard" id="lbl-dashboard" className="cursor-pointer">
              Dashboard
            </label>
            <label htmlFor="v-table" id="lbl-table" className="cursor-pointer">
              Table
            </label>
            <label htmlFor="v-cards" id="lbl-cards" className="cursor-pointer">
              Cards
            </label>
          </div>

          <div className="flex items-center gap-4">
            <span className={getStatusClass('success')} role="status">Live</span>
            <button 
              className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main"
              onClick={() => router.push('/demo')}
            >
              Components
            </button>
          </div>
        </header>

        {/* Sidebar Rail */}
        <aside className="flex flex-col gap-4">
          <div className="caption mb-4">Menu</div>
          <div className="flex flex-col gap-2 w-full">
            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main" style={{ justifyContent: 'flex-start' }}>📊 Dashboard</button>
            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main" style={{ justifyContent: 'flex-start' }}>📦 Vendors</button>
            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main" style={{ justifyContent: 'flex-start' }}>💰 Finance</button>
            <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main" style={{ justifyContent: 'flex-start' }}>📈 Reports</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="shell">
          {/* View 1: Dashboard (Default) */}
          <div id="view-dashboard" className="flex-1">
            <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-8">
              {/* Metrics Grid */}
              <div className="grid gap-6 mb-12 grid-responsive">
                {metrics.map((metric, index) => (
                  <div 
                    key={index} 
                    className="card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                  >
                    <div className="caption mb-2">{metric.label}</div>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main mb-2">{metric.value}</div>
                    <span className={getStatusClass(metric.status)} role="status">{metric.change}</span>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid gap-6 mb-12 grid-responsive">
                <div className="card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  <h2 className="text-base font-semibold text-nx-text-main mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full">
                      Create Vendor
                    </button>
                    <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary w-full">
                      View Reports
                    </button>
                    <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main w-full">
                      Settings
                    </button>
                  </div>
                </div>

                <div className="card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  <h2 className="text-base font-semibold text-nx-text-main mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {vendors.slice(0, 3).map((vendor) => (
                      <div key={vendor.id} className="flex items-center justify-between p-3 rounded border border-[var(--color-stroke)] hover:bg-[var(--color-paper-2)] transition-colors">
                        <div>
                          <div className="text-base font-semibold text-nx-text-main">{vendor.name}</div>
                          <div className="text-[length:var(--nx-body-size)] text-nx-text-main text-sm">{vendor.amount}</div>
                        </div>
                        <span className={getStatusClass(vendor.status === 'approved' ? 'success' : vendor.status === 'warning' ? 'warning' : 'pending')} role="status">
                          {vendor.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  <h2 className="text-base font-semibold text-nx-text-main mb-4">System Status</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[length:var(--nx-body-size)] text-nx-text-main">API</div>
                      <span className={getStatusClass('success')} role="status">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[length:var(--nx-body-size)] text-nx-text-main">Database</div>
                      <span className={getStatusClass('success')} role="status">Synced</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[length:var(--nx-body-size)] text-nx-text-main">Cache</div>
                      <span className={getStatusClass('success')} role="status">Warm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View 2: Table View - Beast Mode Bi-directional Sticky Grid */}
          <div id="view-table" className="flex-1">
            <div className="grid-3-col" style={{ height: 'calc(100vh - 200px)' }}>
              <table className="table-professional w-full">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="text-base font-semibold text-nx-text-main">{vendor.name}</td>
                      <td className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.amount}</td>
                      <td>
                        <span className={getStatusClass(vendor.status === 'approved' ? 'success' : vendor.status === 'warning' ? 'warning' : 'pending')} role="status">
                          {vendor.status}
                        </span>
                      </td>
                      <td className="caption">{vendor.date}</td>
                      <td className="caption">Supply Chain</td>
                      <td>
                        <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main text-sm">View</button>
                      </td>
                    </tr>
                  ))}
                  {/* Add more rows to demonstrate sticky behavior */}
                  {Array.from({ length: 20 }).map((_, i) => {
                    // Use deterministic calculation instead of Math.random() to avoid hydration mismatch
                    // Formula: base amount + (index * multiplier) for consistent values
                    const amount = (25000 + (i * 3247.83)).toFixed(2);
                    return (
                      <tr key={`extra-${i}`}>
                        <td className="text-base font-semibold text-nx-text-main">Vendor {i + 7}</td>
                        <td className="text-[length:var(--nx-body-size)] text-nx-text-main">${amount}</td>
                        <td>
                          <span className={getStatusClass(i % 2 === 0 ? 'success' : 'pending')} role="status">
                            {i % 2 === 0 ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="caption">2025-01-{15 - i}</td>
                        <td className="caption">Category {i % 3}</td>
                        <td>
                          <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main text-sm">View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* View 3: Cards View */}
          <div id="view-cards" className="flex-1">
            <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-8">
              <div className="grid gap-6 grid-responsive">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    <h3 className="text-base font-semibold text-nx-text-main mb-4">{vendor.name}</h3>
                    <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main mb-2">{vendor.amount}</div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={getStatusClass(vendor.status === 'approved' ? 'success' : vendor.status === 'warning' ? 'warning' : 'pending')} role="status">
                        {vendor.status}
                      </span>
                      <div className="caption">{vendor.date}</div>
                    </div>
                    <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Beast Mode CSS - Radio State Machine Logic (Pure CSS, 0ms latency) */}
      <style jsx global>{`
        /* Radio State Machine - 0ms latency view switching (Pure CSS) */
        #v-dashboard:checked ~ .shell #lbl-dashboard,
        #v-table:checked ~ .shell #lbl-table,
        #v-cards:checked ~ .shell #lbl-cards {
          background: var(--color-paper-2);
          color: var(--color-lux);
          border: 1px solid var(--color-stroke-strong);
        }

        #v-dashboard:checked ~ .shell #view-dashboard {
          display: block !important;
        }
        #v-table:checked ~ .shell #view-table {
          display: block !important;
        }
        #v-cards:checked ~ .shell #view-cards {
          display: block !important;
        }

        .flex-1 {
          display: none;
          height: 100%;
          overflow: auto;
        }

        .cursor-pointer {
          padding: var(--spacing-1_5) var(--spacing-3);
          border-radius: var(--radius-control);
          border: 1px solid var(--color-stroke);
          background: transparent;
          color: var(--color-clay);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          transition: all var(--default-transition-duration);
        }

        .cursor-pointer:hover {
          background: var(--color-paper-2);
          color: var(--color-lux);
        }

        /* Responsive Grid Utilities using Nexus tokens */
        .grid-responsive {
          grid-template-columns: repeat(1, 1fr);
        }
        @media (width >= 768px) {
          .grid-responsive {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (width >= 1024px) {
          .grid-responsive {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .grid-responsive {
          grid-template-columns: repeat(1, 1fr);
        }
        @media (width >= 768px) {
          .grid-responsive {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .grid-responsive {
          grid-template-columns: repeat(1, 1fr);
        }
        @media (width >= 768px) {
          .grid-responsive {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (width >= 1024px) {
          .grid-responsive {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </>
  );
}
