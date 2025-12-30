'use client';

import { useRouter, usePathname } from 'next/navigation';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Omni-Dashboard', path: '/omni-dashboard', icon: '🌐' },
    { label: 'Exceptions', path: '/exceptions', icon: '🚨' },
    { label: 'Staleness', path: '/staleness', icon: '⏰' },
    { label: 'Upload Invoice', path: '/invoices/upload', icon: '📤' },
    { label: 'System Control', path: '/system-control', icon: '⚡' },
    { label: 'Components', path: '/demo', icon: '🎨' },
  ];

  return (
    <nav className="border-b border-[var(--color-stroke)] bg-[var(--color-paper)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="na-container na-mx-auto na-p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="na-h4">Nexus Canon</div>
            <div className="na-metadata">Portal</div>
          </div>
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`na-btn ${pathname === item.path ? 'na-btn-primary' : 'na-btn-ghost'} flex items-center gap-2`}
                onClick={() => router.push(item.path)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
