/**
 * TableTabs - Tab navigation for filtering (All, Paid, Unpaid, Overdue)
 * Based on Figma design: node 423:4410 (main table with tabs)
 */

import type { TabFilter } from './types';

interface TableTabsProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  totalPayable: number;
  currency: string;
}

const TABS: TabFilter[] = ['All', 'Paid', 'Unpaid', 'Overdue'];

export function TableTabs({ activeTab, onTabChange, totalPayable, currency }: TableTabsProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-6">
        <h2 className="text-section text-gray-500 font-medium tracking-wide">
          TABLE HEADING
        </h2>
        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="px-4 py-2 text-body font-medium transition-all relative"
              style={{
                color: activeTab === tab ? 'var(--color-primary)' : '#6b7280',
              }}
            >
              {tab}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="text-body text-gray-600">
        Total payable amount:{' '}
        <span 
          className="font-semibold text-lg"
          style={{ color: 'var(--color-primary)' }}
        >
          ${totalPayable.toFixed(2)} {currency}
        </span>
      </div>
    </div>
  );
}
