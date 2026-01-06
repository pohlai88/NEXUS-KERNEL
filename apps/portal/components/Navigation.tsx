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
      <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-nx-text-main">Nexus Canon</div>
            <div className="caption">Portal</div>
          </div>
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${pathname === item.path ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'} flex items-center gap-2`}
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
