import { DashboardLayout } from '@/components/layout';

export default function LayoutDemoPage() {
  return (
    <DashboardLayout title="Projects" count={112}>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-title font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Dashboard Layout Shell
          </h2>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Complete layout grid with Sidebar, TopNav, and scrollable main content area.
          </p>
        </div>

        {/* Layout Information */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Layout Structure
          </h3>
          
          <div className="space-y-3 text-body" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-start gap-3">
              <div 
                className="w-2 h-2 mt-2 rounded-full" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Sidebar:</strong> Fixed 72px width, full height navigation with logo and menu items
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div 
                className="w-2 h-2 mt-2 rounded-full" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              <div>
                <strong style={{ color: 'var(--color-text)' }}>TopNav:</strong> Fixed 56px height with title, count badge, notifications, help, and user avatar
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div 
                className="w-2 h-2 mt-2 rounded-full" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Main Content:</strong> Scrollable area using CSS Grid with Quantum Obsidian tokens
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-body font-medium" style={{ color: 'var(--color-text)' }}>
                CSS Grid Layout
              </h4>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                72px sidebar + 1fr main content<br />
                56px top nav + 1fr scrollable area
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-body font-medium" style={{ color: 'var(--color-text)' }}>
                Fixed Navigation
              </h4>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                Sidebar and TopNav remain visible<br />
                Only main content scrolls
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-body font-medium" style={{ color: 'var(--color-text)' }}>
                Quantum Obsidian
              </h4>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                All colors, spacing, typography<br />
                from design token system
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-body font-medium" style={{ color: 'var(--color-text)' }}>
                Interactive States
              </h4>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                Menu hover/active states<br />
                Notification badge animation
              </p>
            </div>
          </div>
        </div>

        {/* Demo Content - Shows scrolling */}
        <div className="space-y-4">
          <h3 className="text-subtitle font-semibold" style={{ color: 'var(--color-text)' }}>
            Scrollable Content Area
          </h3>
          
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h4 className="text-body font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Content Block {i + 1}
              </h4>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                This content demonstrates the scrollable main area. The sidebar and top navigation 
                remain fixed while this content scrolls vertically.
              </p>
            </div>
          ))}
        </div>

        {/* Usage Example */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: '#EDEDFC', // Indigo/0
            border: '1px solid var(--color-primary)'
          }}
        >
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Usage
          </h3>
          
          <pre 
            className="text-small p-4 rounded overflow-x-auto"
            style={{ 
              backgroundColor: 'white',
              border: '1px solid var(--color-border)'
            }}
          >
{`import { DashboardLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <DashboardLayout title="Projects" count={112}>
      {/* Your page content here */}
    </DashboardLayout>
  );
}`}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}
