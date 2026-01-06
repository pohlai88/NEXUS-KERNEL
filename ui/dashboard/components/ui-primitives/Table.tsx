'use client';

import React, { useState } from 'react';

export interface TableColumn<T = any> {
  /** Column key (must match data property) */
  key: string;
  /** Column header label */
  label: string;
  /** Custom cell renderer */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Column width */
  width?: string | number;
  /** Enable sorting */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom header className */
  headerClassName?: string;
  /** Custom cell className */
  cellClassName?: string;
}

export interface TableProps<T = any> {
  /** Table columns configuration */
  columns: TableColumn<T>[];
  /** Table data */
  data: T[];
  /** Enable row hover effect */
  hoverable?: boolean;
  /** Enable zebra striping */
  striped?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys */
  selectedRows?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (selectedRows: Set<string | number>) => void;
  /** Row key field (default: 'id') */
  rowKey?: string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
  /** Compact mode (reduced padding) */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

/**
 * Table Component - Material Design 3 with Quantum Obsidian tokens
 * 
 * Features:
 * - Column sorting
 * - Row selection (multi-select)
 * - Hover states
 * - Zebra striping
 * - Responsive design
 * - Custom cell rendering
 * - P3 Wide Gamut OKLCH colors
 * 
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> },
 *   ]}
 *   data={users}
 *   hoverable
 *   selectable
 * />
 * ```
 */
export default function Table<T = any>({
  columns,
  data,
  hoverable = true,
  striped = false,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  rowKey = 'id',
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  compact = false,
  className = '',
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle column sort
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      // Cycle: asc -> desc -> null
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') setSortColumn(null);
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId: string | number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    onSelectionChange?.(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      onSelectionChange?.(new Set());
    } else {
      const allIds = new Set(data.map((row: any) => row[rowKey]));
      onSelectionChange?.(allIds);
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const cellPadding = compact ? 'var(--space-2) var(--space-3)' : 'var(--space-3) var(--space-4)';

  return (
    <div
      className={`overflow-x-auto ${className}`}
      style={{
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 'var(--type-body-size)',
          lineHeight: 'var(--type-body-line)',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-surface-well)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {/* Select All Checkbox */}
            {selectable && (
              <th
                style={{
                  width: '48px',
                  padding: cellPadding,
                  textAlign: 'center',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: 'var(--color-primary)',
                  }}
                  aria-label="Select all rows"
                />
              </th>
            )}

            {/* Column Headers */}
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className={column.headerClassName}
                style={{
                  padding: cellPadding,
                  textAlign: column.align || 'left',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-main)',
                  width: column.width,
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  transition: 'background-color var(--dur-fast) var(--ease-standard)',
                }}
                onMouseEnter={(e) => {
                  if (column.sortable) {
                    e.currentTarget.style.backgroundColor = 'var(--color-selected)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="inline-flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span style={{ opacity: sortColumn === column.key ? 1 : 0.4 }}>
                      {sortColumn === column.key && sortDirection === 'asc' && <IconSortAsc />}
                      {sortColumn === column.key && sortDirection === 'desc' && <IconSortDesc />}
                      {sortColumn !== column.key && <IconSort />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                }}
              >
                Loading...
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row: any, rowIndex) => {
              const rowId = row[rowKey];
              const isSelected = selectedRows.has(rowId);

              return (
                <tr
                  key={rowId || rowIndex}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--color-selected)'
                      : striped && rowIndex % 2 === 1
                      ? 'var(--color-surface-well)'
                      : 'transparent',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color var(--dur-fast) var(--ease-standard)',
                  }}
                  onMouseEnter={(e) => {
                    if (hoverable && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-well)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor =
                        striped && rowIndex % 2 === 1 ? 'var(--color-surface-well)' : 'transparent';
                    }
                  }}
                >
                  {/* Selection Checkbox */}
                  {selectable && (
                    <td
                      style={{
                        padding: cellPadding,
                        textAlign: 'center',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(rowId)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: 'var(--color-primary)',
                        }}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}

                  {/* Data Cells */}
                  {columns.map((column) => {
                    const value = row[column.key];
                    const content = column.render ? column.render(value, row, rowIndex) : value;

                    return (
                      <td
                        key={column.key}
                        className={column.cellClassName}
                        style={{
                          padding: cellPadding,
                          textAlign: column.align || 'left',
                          color: 'var(--color-text-main)',
                        }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Sort Icons - Quantum Obsidian styled
 */
function IconSort() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 4V12M8 4L5 7M8 4L11 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSortAsc() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 12V4M8 4L5 7M8 4L11 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSortDesc() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 4V12M8 12L5 9M8 12L11 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
