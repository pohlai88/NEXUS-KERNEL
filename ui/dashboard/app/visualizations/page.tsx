/**
 * Data Visualizations Page
 * Material Design charts with Quantum Obsidian tokens
 */

'use client';

import { LineChart, BarChart, DonutChart, AreaChart } from '@/components/charts';
import {
  revenueLineData,
  budgetBarData,
  statusDonutData,
  inventoryAreaData,
} from './demo-data';

export default function VisualizationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display font-semibold mb-2">
          Data Visualizations
        </h1>
        <p className="text-body" style={{ color: 'var(--color-text-sub)' }}>
          Material Design charts integrated with Quantum Obsidian design tokens
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8">
        {/* Row 1: Line Chart (full width) */}
        <div className="grid grid-cols-1">
          <LineChart
            data={revenueLineData}
            title="Revenue Performance"
            subtitle="Monthly revenue vs. target for Q1-Q2 2024"
            height={320}
            showLegend={true}
            showGrid={true}
            animate={true}
          />
        </div>

        {/* Row 2: Bar Chart + Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BarChart
            data={budgetBarData}
            title="Department Budgets"
            subtitle="Budget allocation vs. actual spending"
            height={340}
            showLegend={true}
            showGrid={true}
            animate={true}
          />
          <DonutChart
            data={statusDonutData}
            title="Project Status"
            subtitle="Distribution of 100 active projects"
            height={340}
            showLegend={true}
            animate={true}
            innerRadius={0.65}
          />
        </div>

        {/* Row 3: Area Chart (full width) */}
        <div className="grid grid-cols-1">
          <AreaChart
            data={inventoryAreaData}
            title="Inventory Levels"
            subtitle="Stacked view of inventory across 6 weeks"
            height={320}
            showLegend={true}
            showGrid={true}
            animate={true}
            stacked={true}
          />
        </div>

        {/* Row 4: Horizontal Bar Chart + Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BarChart
            data={budgetBarData}
            title="Horizontal View"
            subtitle="Same budget data in horizontal layout"
            height={340}
            showLegend={true}
            showGrid={true}
            animate={true}
            horizontal={true}
          />
          <DonutChart
            data={statusDonutData}
            title="Pie Chart Variant"
            subtitle="Full pie without inner radius"
            height={340}
            showLegend={true}
            animate={true}
            innerRadius={0}
          />
        </div>

        {/* Row 5: Overlapping Area Chart */}
        <div className="grid grid-cols-1">
          <AreaChart
            data={inventoryAreaData}
            title="Inventory Trends (Overlapping)"
            subtitle="Non-stacked view showing individual trends"
            height={320}
            showLegend={true}
            showGrid={true}
            animate={true}
            stacked={false}
          />
        </div>
      </div>

      {/* Design System Notes */}
      <div
        className="mt-12 p-6 rounded-lg border-l-4"
        style={{
          backgroundColor: '#F9FAFB',
          borderLeftColor: 'var(--color-primary)',
        }}
      >
        <h3 className="text-title font-semibold mb-3">Design System Integration</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-body font-medium mb-2">Colors</h4>
            <ul className="text-caption space-y-1" style={{ color: 'var(--color-text-sub)' }}>
              <li>• Primary: var(--color-primary) #6366F1</li>
              <li>• Success: #10B981 (Green)</li>
              <li>• Warning: #F59E0B (Orange)</li>
              <li>• Danger: #EF4444 (Red)</li>
              <li>• Info: #06B6D4 (Cyan)</li>
              <li>• Neutral: #6B7280 (Gray)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-body font-medium mb-2">Typography</h4>
            <ul className="text-caption space-y-1" style={{ color: 'var(--color-text-sub)' }}>
              <li>• Display: .text-display (48px/1.2)</li>
              <li>• Title: .text-title (20px/1.3)</li>
              <li>• Body: .text-body (16px/1.5)</li>
              <li>• Caption: .text-caption (14px/1.4)</li>
              <li>• Micro: .text-micro (12px/1.3)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-body font-medium mb-2">Features</h4>
            <ul className="text-caption space-y-1" style={{ color: 'var(--color-text-sub)' }}>
              <li>• Smooth SVG animations (0.8-1.5s)</li>
              <li>• Hover interactions with tooltips</li>
              <li>• Responsive legends</li>
              <li>• Optional grid lines</li>
              <li>• Percentage labels</li>
            </ul>
          </div>
          <div>
            <h4 className="text-body font-medium mb-2">Customization</h4>
            <ul className="text-caption space-y-1" style={{ color: 'var(--color-text-sub)' }}>
              <li>• Title & subtitle support</li>
              <li>• Configurable heights</li>
              <li>• Toggle animations</li>
              <li>• Show/hide legends & grids</li>
              <li>• Stacked vs. overlapping areas</li>
              <li>• Vertical vs. horizontal bars</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
