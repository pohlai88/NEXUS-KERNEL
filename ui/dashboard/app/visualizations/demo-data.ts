/**
 * Demo data for Material Design Data Visualizations
 * Based on NEXUS-KERNEL ERP metrics
 */

import type {
  LineChartData,
  BarChartData,
  PieChartData,
  AreaChartData,
} from '@/components/charts';

// Revenue trend over 6 months
export const revenueLineData: LineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [45000, 52000, 48000, 61000, 58000, 67000],
      color: 'var(--color-primary)',
      fill: true,
    },
    {
      label: 'Target',
      data: [50000, 50000, 55000, 55000, 60000, 60000],
      color: '#10B981',
      fill: false,
    },
  ],
};

// Department budget comparison
export const budgetBarData: BarChartData = {
  labels: ['Sales', 'Marketing', 'Operations', 'R&D', 'HR'],
  datasets: [
    {
      label: 'Allocated',
      data: [120000, 85000, 95000, 110000, 60000],
      color: 'var(--color-primary)',
    },
    {
      label: 'Spent',
      data: [98000, 79000, 88000, 102000, 54000],
      color: '#10B981',
    },
  ],
};

// Project status distribution
export const statusDonutData: PieChartData = {
  data: [
    { label: 'Completed', value: 42, color: '#10B981' },
    { label: 'In Progress', value: 28, color: 'var(--color-primary)' },
    { label: 'Planning', value: 18, color: '#F59E0B' },
    { label: 'On Hold', value: 8, color: '#EF4444' },
    { label: 'Cancelled', value: 4, color: '#6B7280' },
  ],
  centerText: '100',
};

// Inventory levels over time (stacked)
export const inventoryAreaData: AreaChartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  datasets: [
    {
      label: 'Raw Materials',
      data: [3200, 2950, 3100, 2800, 3300, 3450],
      color: '#06B6D4',
      gradientOpacity: [0.6, 0.1],
    },
    {
      label: 'Work in Progress',
      data: [1800, 2100, 1950, 2200, 2050, 1900],
      color: 'var(--color-primary)',
      gradientOpacity: [0.5, 0.05],
    },
    {
      label: 'Finished Goods',
      data: [2500, 2400, 2700, 2600, 2900, 3100],
      color: '#10B981',
      gradientOpacity: [0.4, 0.02],
    },
  ],
};
