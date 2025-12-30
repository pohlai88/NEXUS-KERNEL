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
 * AIBOS Design System Showcase
 * Demonstrates all components and patterns using pure HTML with AIBOS CSS classes
 */
export default function DemoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--color-void)] na-p-8" style={{ paddingTop: 'var(--space-12, 3rem)' }}>
      <div className="na-container na-mx-auto max-w-7xl">
        {/* Header */}
        <div className="na-mb-12">
          <button
            className="na-btn na-btn-ghost na-mb-6"
            onClick={() => router.push('/')}
          >
            ← Back to Dashboard
          </button>
          <h1 className="na-h1 na-mb-4">AIBOS Design System Showcase</h1>
          <p className="na-data text-lg">
            Complete component library with pure HTML and AIBOS CSS classes
          </p>
        </div>

        {/* Typography Section */}
        <section className="na-mb-12">
          <h2 className="na-h2 na-mb-6">Typography</h2>
          <div className="na-card na-p-6">
            <div className="space-y-6">
              <div>
                <h1 className="na-h1">Heading 1 - 32px Semibold</h1>
                <div className="na-metadata mt-1">Page titles and hero sections</div>
              </div>
              <div>
                <h2 className="na-h2">Heading 2 - 24px Semibold</h2>
                <div className="na-metadata mt-1">Section titles</div>
              </div>
              <div>
                <h4 className="na-h4">Heading 4 - 18px Semibold</h4>
                <div className="na-metadata mt-1">Card titles and subsections</div>
              </div>
              <div>
                <div className="na-data">$12,450.00</div>
                <div className="na-metadata mt-1">Data values - 14px monospace</div>
              </div>
              <div>
                <div className="na-data-large">$1,234,567.89</div>
                <div className="na-metadata mt-1">Large KPIs - 30px serif</div>
              </div>
              <div>
                <div className="na-metadata">PO-88219 • Feed Supply • Vendor Portal</div>
                <div className="na-metadata mt-1">Metadata - 11px uppercase</div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="na-mb-12">
          <h2 className="na-h2 na-mb-6">Status Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="na-card na-p-6">
              <h3 className="na-h4 na-mb-4">CSS Classes (Recommended)</h3>
              <div className="flex flex-wrap gap-4">
                <span className={getStatusClass('success')} role="status">Complete</span>
                <span className={getStatusClass('error')} role="status">Failed</span>
                <span className={getStatusClass('warning')} role="status">Attention Required</span>
                <span className={getStatusClass('pending')} role="status">In Progress</span>
              </div>
            </div>
            <div className="na-card na-p-6">
              <h3 className="na-h4 na-mb-4">Direct CSS Classes</h3>
              <div className="flex flex-wrap gap-4">
                <span className="na-status ok">Success</span>
                <span className="na-status bad">Error</span>
                <span className="na-status warn">Warning</span>
                <span className="na-status pending">Pending</span>
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="na-mb-12">
          <h2 className="na-h2 na-mb-6">Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="na-card na-p-6">
              <h3 className="na-h4 na-mb-4">Card with Actions</h3>
              <div className="na-data-large na-mb-2">$12,450.00</div>
              <div className="na-metadata na-mb-4">Invoice #12345</div>
              <button className="na-btn na-btn-primary w-full">
                View Details
              </button>
            </div>

            <div className="na-card na-p-6">
              <h3 className="na-h4 na-mb-4">Vendor Card</h3>
              <div className="na-h4 na-mb-2">Acme Corporation</div>
              <div className="na-data na-mb-2">$89,500.00</div>
              <div className="flex items-center justify-between">
                <span className={getStatusClass('success')} role="status">Approved</span>
                <div className="na-metadata">2h ago</div>
              </div>
            </div>

            <div className="na-card na-p-6">
              <h3 className="na-h4 na-mb-4">Action Card</h3>
              <div className="space-y-3">
                <button className="na-btn na-btn-primary w-full">
                  Primary Action
                </button>
                <button className="na-btn na-btn-secondary w-full">
                  Secondary
                </button>
                <button className="na-btn na-btn-ghost w-full">
                  Ghost
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Button Variants */}
        <section className="na-mb-12">
          <h2 className="na-h2 na-mb-6">Button Variants</h2>
          <div className="na-card na-p-6">
            <div className="flex flex-wrap gap-4">
              <button className="na-btn na-btn-primary">Primary</button>
              <button className="na-btn na-btn-secondary">Secondary</button>
              <button className="na-btn na-btn-ghost">Ghost</button>
              <button className="na-btn na-btn-danger">Danger</button>
            </div>
          </div>
        </section>

        {/* Integration Status */}
        <section>
          <h2 className="na-h2 na-mb-6">Integration Status</h2>
          <div className="na-card na-p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="na-data">AIBOS Design System</div>
                <span className={getStatusClass('success')} role="status">Loaded</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="na-data">CSS Classes</div>
                <span className={getStatusClass('success')} role="status">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="na-data">Dark Theme</div>
                <span className={getStatusClass('success')} role="status">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="na-data">Pure HTML</div>
                <span className={getStatusClass('success')} role="status">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="na-data">No React Components</div>
                <span className={getStatusClass('success')} role="status">Ready</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
