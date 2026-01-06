'use client';

import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  count?: number;
}

/**
 * DashboardLayout - Complete layout shell using CSS Grid
 * 
 * Structure:
 * ┌──────────┬──────────────────────────────────────┐
 * │          │         Top Nav                      │
 * │ Sidebar  ├──────────────────────────────────────┤
 * │ (72px)   │                                      │
 * │          │         Main Content                 │
 * │          │         (scrollable)                 │
 * └──────────┴──────────────────────────────────────┘
 * 
 * Features:
 * - Fixed sidebar (72px width)
 * - Fixed top nav (56px height)
 * - Scrollable main content area
 * - Quantum Obsidian design tokens
 * - Responsive grid layout
 */
export default function DashboardLayout({ 
  children, 
  title = 'Projects',
  count = 112 
}: DashboardLayoutProps) {
  return (
    <div 
      className="dashboard-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 1fr',
        gridTemplateRows: '56px 1fr',
        gridTemplateAreas: `
          "sidebar topnav"
          "sidebar main"
        `,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar - Fixed left column spanning full height */}
      <div style={{ gridArea: 'sidebar' }}>
        <Sidebar />
      </div>

      {/* Top Navigation - Fixed top bar */}
      <div style={{ gridArea: 'topnav' }}>
        <TopNav title={title} count={count} />
      </div>

      {/* Main Content Area - Scrollable */}
      <main
        style={{
          gridArea: 'main',
          overflow: 'auto',
          backgroundColor: 'var(--color-background)',
          padding: 'var(--space-page)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
