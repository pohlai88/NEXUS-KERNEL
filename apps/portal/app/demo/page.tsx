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
 * Nexus Design System Showcase
 * Demonstrates all components and patterns using pure HTML with Nexus CSS classes
 */
export default function DemoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--color-void)] p-8" style={{ paddingTop: 'var(--space-12, 3rem)' }}>
      <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <button
            className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main mb-6"
            onClick={() => router.push('/')}
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-4">Nexus Design System Showcase</h1>
          <p className="text-[length:var(--nx-body-size)] text-nx-text-main text-lg">
            Complete component library with pure HTML and Nexus CSS classes
          </p>
        </div>

        {/* Typography Section */}
        <section className="mb-12">
          <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main mb-6">Typography</h2>
          <div className="card p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Heading 1 - 32px Semibold</h1>
                <div className="caption mt-1">Page titles and hero sections</div>
              </div>
              <div>
                <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main">Heading 2 - 24px Semibold</h2>
                <div className="caption mt-1">Section titles</div>
              </div>
              <div>
                <h4 className="text-base font-semibold text-nx-text-main">Heading 4 - 18px Semibold</h4>
                <div className="caption mt-1">Card titles and subsections</div>
              </div>
              <div>
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main">$12,450.00</div>
                <div className="caption mt-1">Data values - 14px monospace</div>
              </div>
              <div>
                <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">$1,234,567.89</div>
                <div className="caption mt-1">Large KPIs - 30px serif</div>
              </div>
              <div>
                <div className="caption">PO-88219 • Feed Supply • Vendor Portal</div>
                <div className="caption mt-1">Metadata - 11px uppercase</div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="mb-12">
          <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main mb-6">Status Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-base font-semibold text-nx-text-main mb-4">CSS Classes (Recommended)</h3>
              <div className="flex flex-wrap gap-4">
                <span className={getStatusClass('success')} role="status">Complete</span>
                <span className={getStatusClass('error')} role="status">Failed</span>
                <span className={getStatusClass('warning')} role="status">Attention Required</span>
                <span className={getStatusClass('pending')} role="status">In Progress</span>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-base font-semibold text-nx-text-main mb-4">Direct CSS Classes</h3>
              <div className="flex flex-wrap gap-4">
                <span className="badge badge-success">Success</span>
                <span className="badge bad">Error</span>
                <span className="badge badge-warning">Warning</span>
                <span className="badge pending">Pending</span>
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="mb-12">
          <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main mb-6">Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-base font-semibold text-nx-text-main mb-4">Card with Actions</h3>
              <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main mb-2">$12,450.00</div>
              <div className="caption mb-4">Invoice #12345</div>
              <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full">
                View Details
              </button>
            </div>

            <div className="card p-6">
              <h3 className="text-base font-semibold text-nx-text-main mb-4">Vendor Card</h3>
              <div className="text-base font-semibold text-nx-text-main mb-2">Acme Corporation</div>
              <div className="text-[length:var(--nx-body-size)] text-nx-text-main mb-2">$89,500.00</div>
              <div className="flex items-center justify-between">
                <span className={getStatusClass('success')} role="status">Approved</span>
                <div className="caption">2h ago</div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-base font-semibold text-nx-text-main mb-4">Action Card</h3>
              <div className="space-y-3">
                <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full">
                  Primary Action
                </button>
                <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary w-full">
                  Secondary
                </button>
                <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main w-full">
                  Ghost
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Button Variants */}
        <section className="mb-12">
          <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main mb-6">Button Variants</h2>
          <div className="card p-6">
            <div className="flex flex-wrap gap-4">
              <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">Primary</button>
              <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">Secondary</button>
              <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">Ghost</button>
              <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-nx-danger text-white hover:bg-nx-danger-text">Danger</button>
            </div>
          </div>
        </section>

        {/* Integration Status */}
        <section>
          <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main mb-6">Integration Status</h2>
          <div className="card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main">Nexus Design System</div>
                <span className={getStatusClass('success')} role="status">Loaded</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main">CSS Classes</div>
                <span className={getStatusClass('success')} role="status">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main">Dark Theme</div>
                <span className={getStatusClass('success')} role="status">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main">Pure HTML</div>
                <span className={getStatusClass('success')} role="status">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main">No React Components</div>
                <span className={getStatusClass('success')} role="status">Ready</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
