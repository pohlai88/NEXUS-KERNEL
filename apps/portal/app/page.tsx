'use client';

import { useRouter } from 'next/navigation';

/**
 * Helper function to get AIBOS status classes
 */
function getStatusClass(variant: 'success' | 'error' | 'warning' | 'pending'): string {
  const map = {
    success: 'na-status ok',
    error: 'na-status bad',
    warning: 'na-status warn',
    pending: 'na-status pending',
  };
  return map[variant];
}

/**
 * Nexus Canon Portal - Beast Mode Dashboard
 * Using AIBOS Beast Mode Patterns:
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
      <input type="radio" name="view" id="v-dashboard" className="na-state-radio" defaultChecked suppressHydrationWarning />
      <input type="radio" name="view" id="v-table" className="na-state-radio" suppressHydrationWarning />
      <input type="radio" name="view" id="v-cards" className="na-state-radio" suppressHydrationWarning />

      {/* Beast Mode: Omni Shell Layout (Grid-based application shell) */}
      <div className="na-shell-omni min-h-screen" suppressHydrationWarning>
        {/* Header */}
        <header className="na-shell-head na-flex na-items-center justify-between na-px-6">
          <div className="na-flex na-items-center na-gap-4">
            <div className="na-h4">Nexus Canon</div>
            <div className="na-metadata">Portal</div>
          </div>
          
          {/* View Switcher - Radio State Machine (Beast Mode) */}
          <div className="na-flex na-items-center na-gap-2 na-view-controls">
            <label htmlFor="v-dashboard" id="lbl-dashboard" className="na-state-label">
              Dashboard
            </label>
            <label htmlFor="v-table" id="lbl-table" className="na-state-label">
              Table
            </label>
            <label htmlFor="v-cards" id="lbl-cards" className="na-state-label">
              Cards
            </label>
          </div>

          <div className="na-flex na-items-center na-gap-4">
            <span className={getStatusClass('success')} role="status">Live</span>
            <button 
              className="na-btn na-btn-ghost"
              onClick={() => router.push('/demo')}
            >
              Components
            </button>
          </div>
        </header>

        {/* Sidebar Rail */}
        <aside className="na-shell-rail">
          <div className="na-metadata na-mb-4">Menu</div>
          <div className="na-flex na-flex-col na-gap-2 w-full">
            <button className="na-btn na-btn-ghost" style={{ justifyContent: 'flex-start' }}>📊 Dashboard</button>
            <button className="na-btn na-btn-ghost" style={{ justifyContent: 'flex-start' }}>📦 Vendors</button>
            <button className="na-btn na-btn-ghost" style={{ justifyContent: 'flex-start' }}>💰 Finance</button>
            <button className="na-btn na-btn-ghost" style={{ justifyContent: 'flex-start' }}>📈 Reports</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="na-shell-main">
          {/* View 1: Dashboard (Default) */}
          <div id="view-dashboard" className="na-view-pane">
            <div className="na-container na-mx-auto na-p-8">
              {/* Metrics Grid */}
              <div className="grid gap-6 na-mb-12 na-grid-responsive-4">
                {metrics.map((metric, index) => (
                  <div 
                    key={index} 
                    className="na-card na-p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                  >
                    <div className="na-metadata na-mb-2">{metric.label}</div>
                    <div className="na-data-large na-mb-2">{metric.value}</div>
                    <span className={getStatusClass(metric.status)} role="status">{metric.change}</span>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid gap-6 na-mb-12 na-grid-responsive-3">
                <div className="na-card na-p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  <h2 className="na-h4 na-mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <button className="na-btn na-btn-primary w-full">
                      Create Vendor
                    </button>
                    <button className="na-btn na-btn-secondary w-full">
                      View Reports
                    </button>
                    <button className="na-btn na-btn-ghost w-full">
                      Settings
                    </button>
                  </div>
                </div>

                <div className="na-card na-p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  <h2 className="na-h4 na-mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {vendors.slice(0, 3).map((vendor) => (
                      <div key={vendor.id} className="flex items-center justify-between na-p-3 rounded border border-[var(--color-stroke)] hover:bg-[var(--color-paper-2)] transition-colors">
                        <div>
                          <div className="na-h4">{vendor.name}</div>
                          <div className="na-data text-sm">{vendor.amount}</div>
                        </div>
                        <span className={getStatusClass(vendor.status === 'approved' ? 'success' : vendor.status === 'warning' ? 'warning' : 'pending')} role="status">
                          {vendor.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="na-card na-p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  <h2 className="na-h4 na-mb-4">System Status</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="na-data">API</div>
                      <span className={getStatusClass('success')} role="status">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="na-data">Database</div>
                      <span className={getStatusClass('success')} role="status">Synced</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="na-data">Cache</div>
                      <span className={getStatusClass('success')} role="status">Warm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View 2: Table View - Beast Mode Bi-directional Sticky Grid */}
          <div id="view-table" className="na-view-pane">
            <div className="na-grid-frozen" style={{ height: 'calc(100vh - 200px)' }}>
              <table className="na-table-frozen">
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
                      <td className="na-h4">{vendor.name}</td>
                      <td className="na-data">{vendor.amount}</td>
                      <td>
                        <span className={getStatusClass(vendor.status === 'approved' ? 'success' : vendor.status === 'warning' ? 'warning' : 'pending')} role="status">
                          {vendor.status}
                        </span>
                      </td>
                      <td className="na-metadata">{vendor.date}</td>
                      <td className="na-metadata">Supply Chain</td>
                      <td>
                        <button className="na-btn na-btn-ghost text-sm">View</button>
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
                        <td className="na-h4">Vendor {i + 7}</td>
                        <td className="na-data">${amount}</td>
                        <td>
                          <span className={getStatusClass(i % 2 === 0 ? 'success' : 'pending')} role="status">
                            {i % 2 === 0 ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="na-metadata">2025-01-{15 - i}</td>
                        <td className="na-metadata">Category {i % 3}</td>
                        <td>
                          <button className="na-btn na-btn-ghost text-sm">View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* View 3: Cards View */}
          <div id="view-cards" className="na-view-pane">
            <div className="na-container na-mx-auto na-p-8">
              <div className="grid gap-6 na-grid-responsive-3-cards">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="na-card na-p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    <h3 className="na-h4 na-mb-4">{vendor.name}</h3>
                    <div className="na-data-large na-mb-2">{vendor.amount}</div>
                    <div className="flex items-center justify-between na-mb-4">
                      <span className={getStatusClass(vendor.status === 'approved' ? 'success' : vendor.status === 'warning' ? 'warning' : 'pending')} role="status">
                        {vendor.status}
                      </span>
                      <div className="na-metadata">{vendor.date}</div>
                    </div>
                    <button className="na-btn na-btn-primary w-full">
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
        #v-dashboard:checked ~ .na-shell-omni #lbl-dashboard,
        #v-table:checked ~ .na-shell-omni #lbl-table,
        #v-cards:checked ~ .na-shell-omni #lbl-cards {
          background: var(--color-paper-2);
          color: var(--color-lux);
          border: 1px solid var(--color-stroke-strong);
        }

        #v-dashboard:checked ~ .na-shell-omni #view-dashboard {
          display: block !important;
        }
        #v-table:checked ~ .na-shell-omni #view-table {
          display: block !important;
        }
        #v-cards:checked ~ .na-shell-omni #view-cards {
          display: block !important;
        }

        .na-view-pane {
          display: none;
          height: 100%;
          overflow: auto;
        }

        .na-state-label {
          padding: var(--spacing-1_5) var(--spacing-3);
          border-radius: var(--radius-control);
          border: 1px solid var(--color-stroke);
          background: transparent;
          color: var(--color-clay);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          transition: all var(--default-transition-duration);
        }

        .na-state-label:hover {
          background: var(--color-paper-2);
          color: var(--color-lux);
        }

        /* Responsive Grid Utilities using AIBOS tokens */
        .na-grid-responsive-4 {
          grid-template-columns: repeat(1, 1fr);
        }
        @media (width >= 768px) {
          .na-grid-responsive-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (width >= 1024px) {
          .na-grid-responsive-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .na-grid-responsive-3 {
          grid-template-columns: repeat(1, 1fr);
        }
        @media (width >= 768px) {
          .na-grid-responsive-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .na-grid-responsive-3-cards {
          grid-template-columns: repeat(1, 1fr);
        }
        @media (width >= 768px) {
          .na-grid-responsive-3-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (width >= 1024px) {
          .na-grid-responsive-3-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </>
  );
}
