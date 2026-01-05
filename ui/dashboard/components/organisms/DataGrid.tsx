'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button, Input, Checkbox } from '../atoms';

// Column Definition
export interface DataGridColumn<T = any> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  width?: string | number;
  sortable?: boolean;
  editable?: boolean;
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';
  options?: Array<{ label: string; value: any }>;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

// Sort Configuration
export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// Filter Configuration
export interface FilterConfig {
  column: string;
  value: string;
}

export interface DataGridProps<T = any> {
  columns: DataGridColumn<T>[];
  data: T[];
  onEdit?: (rowIndex: number, columnId: string, newValue: any) => void;
  onDelete?: (rowIndex: number) => void;
  onAdd?: (newRow: Partial<T>) => void;
  onBulkDelete?: (selectedRows: number[]) => void;
  rowKey?: keyof T;
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  showActions?: boolean;
  className?: string;
}

export const DataGrid = <T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  onAdd,
  onBulkDelete,
  rowKey = 'id' as keyof T,
  pagination = true,
  pageSize = 10,
  selectable = true,
  sortable = true,
  filterable = true,
  editable = true,
  showActions = true,
  className = '',
}: DataGridProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  // Get cell value
  const getCellValue = useCallback((row: T, column: DataGridColumn<T>): any => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    if (filters.length === 0) return data;

    return data.filter(row => {
      return filters.every(filter => {
        const column = columns.find(col => col.id === filter.column);
        if (!column) return true;

        const value = getCellValue(row, column);
        const filterValue = filter.value.toLowerCase();
        const cellValue = String(value).toLowerCase();

        return cellValue.includes(filterValue);
      });
    });
  }, [data, filters, columns, getCellValue]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const column = columns.find(col => col.id === sortConfig.column);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getCellValue(a, column);
      const bValue = getCellValue(b, column);

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, columns, getCellValue]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = useCallback((columnId: string) => {
    setSortConfig(prev => {
      if (prev?.column === columnId) {
        return {
          column: columnId,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { column: columnId, direction: 'asc' };
    });
  }, []);

  // Handle filter
  const handleFilter = useCallback((columnId: string, value: string) => {
    setFilters(prev => {
      const existing = prev.filter(f => f.column !== columnId);
      if (value.trim()) {
        return [...existing, { column: columnId, value }];
      }
      return existing;
    });
    setCurrentPage(1);
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((rowIndex: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      const allIndexes = paginatedData.map((_, index) => {
        const globalIndex = (currentPage - 1) * pageSize + index;
        return globalIndex;
      });
      setSelectedRows(new Set(allIndexes));
    }
  }, [selectedRows.size, paginatedData.length, currentPage, pageSize]);

  // Handle edit start
  const handleEditStart = useCallback((rowIndex: number, columnId: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, column: columnId });
    setEditValue(currentValue);
  }, []);

  // Handle edit save
  const handleEditSave = useCallback(() => {
    if (editingCell && onEdit) {
      onEdit(editingCell.row, editingCell.column, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, onEdit]);

  // Handle edit cancel
  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (onBulkDelete && selectedRows.size > 0) {
      onBulkDelete(Array.from(selectedRows));
      setSelectedRows(new Set());
    }
  }, [onBulkDelete, selectedRows]);

  const containerStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
    overflow: 'hidden',
  };

  const toolbarStyles: React.CSSProperties = {
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-gray-200)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-3)',
  };

  const bulkActionsStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    fontSize: 'var(--text-sm-size)',
    color: 'var(--color-gray-600)',
  };

  const tableWrapperStyles: React.CSSProperties = {
    overflowX: 'auto',
  };

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 'var(--text-sm-size)',
  };

  const thStyles: React.CSSProperties = {
    padding: 'var(--space-3)',
    textAlign: 'left',
    fontWeight: 600,
    color: 'var(--color-gray-700)',
    backgroundColor: 'var(--color-gray-50)',
    borderBottom: '1px solid var(--color-gray-200)',
    whiteSpace: 'nowrap',
  };

  const tdStyles: React.CSSProperties = {
    padding: 'var(--space-3)',
    borderBottom: '1px solid var(--color-gray-100)',
  };

  const paginationStyles: React.CSSProperties = {
    padding: 'var(--space-4)',
    borderTop: '1px solid var(--color-gray-200)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const paginationInfoStyles: React.CSSProperties = {
    fontSize: 'var(--text-sm-size)',
    color: 'var(--color-gray-600)',
  };

  const paginationButtonsStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Toolbar */}
      {(selectable || showActions) && (
        <div style={toolbarStyles}>
          <div style={bulkActionsStyles}>
            {selectedRows.size > 0 && (
              <>
                <span>{selectedRows.size} selected</span>
                {onBulkDelete && (
                  <Button
                    variant="secondary"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Button>
                )}
              </>
            )}
          </div>

          <div>
            {onAdd && (
              <Button
                variant="primary"
                onClick={() => onAdd({})}
              >
                + Add Row
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={tableWrapperStyles}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {selectable && (
                <th style={{ ...thStyles, width: '50px' }}>
                  <Checkbox
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}

              {columns.map(column => (
                <th
                  key={column.id}
                  style={{
                    ...thStyles,
                    width: column.width,
                    textAlign: column.align || 'left',
                    cursor: column.sortable !== false && sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (column.sortable !== false && sortable) {
                      handleSort(column.id);
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span>{column.header}</span>
                    {column.sortable !== false && sortable && (
                      <span style={{ opacity: 0.5 }}>
                        {sortConfig?.column === column.id
                          ? sortConfig.direction === 'asc'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {showActions && (
                <th style={{ ...thStyles, width: '120px' }}>Actions</th>
              )}
            </tr>

            {/* Filter Row */}
            {filterable && (
              <tr>
                {selectable && <th style={thStyles}></th>}
                {columns.map(column => (
                  <th key={`filter-${column.id}`} style={{ ...thStyles, padding: 'var(--space-2)' }}>
                    <Input
                      type="text"
                      placeholder={`Filter ${column.header}...`}
                      onChange={(e) => handleFilter(column.id, e.target.value)}
                    />
                  </th>
                ))}
                {showActions && <th style={thStyles}></th>}
              </tr>
            )}
          </thead>

          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const globalIndex = (currentPage - 1) * pageSize + rowIndex;
              const isSelected = selectedRows.has(globalIndex);

              return (
                <tr
                  key={row[rowKey] ?? rowIndex}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                  }}
                >
                  {selectable && (
                    <td style={tdStyles}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleRowSelect(globalIndex)}
                      />
                    </td>
                  )}

                  {columns.map(column => {
                    const cellValue = getCellValue(row, column);
                    const isEditing = editingCell?.row === globalIndex && editingCell?.column === column.id;

                    return (
                      <td
                        key={column.id}
                        style={{
                          ...tdStyles,
                          textAlign: column.align || 'left',
                        }}
                        onDoubleClick={() => {
                          if (column.editable !== false && editable && onEdit) {
                            handleEditStart(globalIndex, column.id, cellValue);
                          }
                        }}
                      >
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                            <Input
                              type={column.type || 'text'}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                            />
                            <Button
                              variant="secondary"
                              onClick={handleEditSave}
                            >
                              ✓
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={handleEditCancel}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : column.render ? (
                          column.render(cellValue, row, globalIndex)
                        ) : (
                          String(cellValue)
                        )}
                      </td>
                    );
                  })}

                  {showActions && (
                    <td style={tdStyles}>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        {onDelete && (
                          <Button
                            variant="secondary"
                            onClick={() => onDelete(globalIndex)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div style={paginationStyles}>
          <div style={paginationInfoStyles}>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>

          <div style={paginationButtonsStyles}>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, current, and adjacent pages
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, array) => {
                // Add ellipsis for gaps
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span style={{ padding: '0 var(--space-2)' }}>...</span>
                    )}
                    <Button
                      variant={page === currentPage ? 'primary' : 'secondary'}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}

            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
