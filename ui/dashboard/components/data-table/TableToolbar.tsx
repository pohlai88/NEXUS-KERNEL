/**
 * TableToolbar - Filter button, Search input, and Action button
 * Based on Figma designs: nodes 136:32 (search), 419:8725 (filter), 170:231 (view more)
 */

import { Search } from 'lucide-react';
import { FilterButton } from './FilterButton';
import type { TableFilters, SortBy, UserFilter } from './types';

interface TableToolbarProps {
  filters: TableFilters;
  onFiltersChange: (filters: Partial<TableFilters>) => void;
  onPayDues?: () => void;
}

export function TableToolbar({ filters, onFiltersChange, onPayDues }: TableToolbarProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <FilterButton
        sortBy={filters.sortBy}
        userStatus={filters.userStatus}
        onSortByChange={(sortBy: SortBy) => onFiltersChange({ sortBy })}
        onUserStatusChange={(userStatus: UserFilter) => onFiltersChange({ userStatus })}
      />
      
      <div className="flex-1 relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-nx-text-faint" 
          size={18}
        />
        <input
          type="text"
          placeholder="Search Users by Name, Email or Date"
          value={filters.searchQuery}
          onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          className="w-full pl-10 pr-4 py-2 text-body border-2 rounded-lg
                     focus:outline-none transition-colors"
          style={{
            borderColor: filters.searchQuery ? 'var(--color-primary)' : '#e5e7eb',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => {
            if (!filters.searchQuery) {
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}
        />
      </div>

      {onPayDues && (
        <button
          onClick={onPayDues}
          className="px-6 py-2 text-white font-medium rounded-lg
                     transition-all interactive"
          style={{
            backgroundColor: 'var(--color-primary)',
          }}
        >
          PAY DUES
        </button>
      )}
    </div>
  );
}
