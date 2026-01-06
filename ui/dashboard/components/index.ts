/**
 * Component Library - Master Barrel Export
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Atomic Design Structure:
 * - atoms/       Smallest building blocks (Button, Input, Icon, etc.)
 * - molecules/   Simple combinations (Toast, Menu, etc.)
 * - organisms/   Complex components (DataTable, Charts, etc.)
 * - layout/      Page structure components
 */

// ========================================
// ATOMS
// ========================================
export * from './atoms';

// ========================================
// MOLECULES
// ========================================
export * from './molecules';

// ========================================
// ORGANISMS
// ========================================

// Data Table
export { DataTable } from './data-table/DataTable';
export { EmptyState } from './data-table/EmptyState';
export { FilterButton } from './data-table/FilterButton';
export { Pagination } from './data-table/Pagination';
export { StatusBadge } from './data-table/StatusBadge';
export { TableRow } from './data-table/TableRow';
export { TableToolbar } from './data-table/TableToolbar';
export { TableTabs } from './data-table/TableTabs';

// Charts
export { LineChart } from './charts/LineChart';
export { BarChart } from './charts/BarChart';
export { DonutChart } from './charts/DonutChart';
export { AreaChart } from './charts/AreaChart';

// ========================================
// LAYOUT
// ========================================
export { default as DashboardLayout } from './layout/DashboardLayout';
export { default as Sidebar } from './layout/Sidebar';
export { default as TopNav } from './layout/TopNav';
