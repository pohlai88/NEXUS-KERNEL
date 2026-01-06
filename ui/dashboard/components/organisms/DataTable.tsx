import React, { useState, useMemo } from 'react';
import { IconArrowUp, IconArrowDown, IconFilter, IconSearch } from '../atoms/icons';

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  defaultPageSize?: number;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T = any>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortable = true,
  filterable = true,
  pagination = true,
  defaultPageSize = 10,
  striped = true,
  hoverable = true,
  bordered = false,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global filter
    if (filterQuery) {
      result = result.filter((row) =>
        columns.some((col) => {
          const value = col.accessor(row);
          return String(value).toLowerCase().includes(filterQuery.toLowerCase());
        })
      );
    }

    // Column-specific filters
    Object.entries(columnFilters).forEach(([key, query]) => {
      if (query) {
        const column = columns.find((col) => col.key === key);
        if (column) {
          result = result.filter((row) => {
            const value = column.accessor(row);
            return String(value).toLowerCase().includes(query.toLowerCase());
          });
        }
      }
    });

    return result;
  }, [data, columns, filterQuery, columnFilters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    const column = columns.find((col) => col.key === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = String(column.accessor(a));
      const bValue = String(column.accessor(b));

      const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable && !sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection((prev) => {
        if (prev === 'asc') return 'desc';
        if (prev === 'desc') return null;
        return 'asc';
      });
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleColumnFilter = (columnKey: string, query: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: query,
    }));
    setCurrentPage(1);
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    backgroundColor: '#FFFFFF',
    border: bordered ? '1px solid var(--color-gray-200)' : 'none',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  };

  const toolbarStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-gray-200)',
  };

  const searchContainerStyles: React.CSSProperties = {
    position: 'relative',
    flex: 1,
  };

  const searchIconStyles: React.CSSProperties = {
    position: 'absolute',
    left: 'var(--space-3)',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-gray-400)',
    pointerEvents: 'none',
  };

  const searchInputStyles: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-2) var(--space-3) var(--space-2) var(--space-8)',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-900)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
  };

  const tableWrapperStyles: React.CSSProperties = {
    overflowX: 'auto',
  };

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 'var(--text-body-size)',
  };

  const theadStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-gray-50)',
    borderBottom: '2px solid var(--color-gray-200)',
  };

  const thStyles = (column: DataTableColumn<T>): React.CSSProperties => ({
    padding: 'var(--space-3) var(--space-4)',
    textAlign: column.align || 'left',
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
    cursor: (column.sortable || sortable) ? 'pointer' : 'default',
    userSelect: 'none',
    width: column.width,
  });

  const sortIconContainerStyles: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    marginLeft: 'var(--space-1)',
    verticalAlign: 'middle',
  };

  const tbodyStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
  };

  const trStyles = (index: number, clickable: boolean): React.CSSProperties => ({
    borderBottom: '1px solid var(--color-gray-200)',
    backgroundColor: striped && index % 2 === 1 ? 'var(--color-gray-50)' : 'transparent',
    cursor: clickable ? 'pointer' : 'default',
    transition: 'background-color 0.15s ease',
  });

  const tdStyles = (column: DataTableColumn<T>): React.CSSProperties => ({
    padding: 'var(--space-3) var(--space-4)',
    textAlign: column.align || 'left',
    color: 'var(--color-gray-900)',
  });

  const columnFilterStyles: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-1) var(--space-2)',
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-900)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-sm)',
    marginTop: 'var(--space-2)',
    outline: 'none',
  };

  const paginationContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4)',
    borderTop: '1px solid var(--color-gray-200)',
  };

  const paginationInfoStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-600)',
  };

  const paginationControlsStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  };

  const pageSizeSelectorStyles: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-900)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    outline: 'none',
  };

  const pageButtonStyles = (active: boolean, disabled: boolean): React.CSSProperties => ({
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-caption-size)',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--color-primary)' : 'var(--color-gray-700)',
    backgroundColor: active ? 'var(--color-primary-50)' : 'transparent',
    border: '1px solid',
    borderColor: active ? 'var(--color-primary)' : 'var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  });

  const emptyStateStyles: React.CSSProperties = {
    padding: 'var(--space-8)',
    textAlign: 'center',
    color: 'var(--color-gray-500)',
    fontSize: 'var(--text-body-size)',
  };

  const loadingOverlayStyles: React.CSSProperties = {
    position: 'relative',
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-gray-500)',
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Toolbar */}
      {filterable && (
        <div style={toolbarStyles}>
          <div style={searchContainerStyles}>
            <div style={searchIconStyles}>
              <IconSearch size={16} />
            </div>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => {
                setFilterQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search all columns..."
              style={searchInputStyles}
            />
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={loadingOverlayStyles}>Loading...</div>
      ) : paginatedData.length === 0 ? (
        <div style={emptyStateStyles}>{emptyMessage}</div>
      ) : (
        <div style={tableWrapperStyles}>
          <table style={tableStyles}>
            <thead style={theadStyles}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={thStyles(column)}
                    onClick={() => handleSort(column.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start' }}>
                      <span>{column.header}</span>
                      {(column.sortable || sortable) && (
                        <span style={sortIconContainerStyles}>
                          <IconArrowUp
                            size={12}
                            color={sortColumn === column.key && sortDirection === 'asc' ? 'var(--color-primary)' : 'var(--color-gray-400)'}
                          />
                          <IconArrowDown
                            size={12}
                            color={sortColumn === column.key && sortDirection === 'desc' ? 'var(--color-primary)' : 'var(--color-gray-400)'}
                            style={{ marginTop: '-4px' }}
                          />
                        </span>
                      )}
                    </div>
                    {(column.filterable || filterable) && (
                      <input
                        type="text"
                        value={columnFilters[column.key] || ''}
                        onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Filter ${column.header}...`}
                        style={columnFilterStyles}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={tbodyStyles}>
              {paginatedData.map((row, index) => (
                <tr
                  key={keyExtractor(row, index)}
                  style={trStyles(index, !!onRowClick)}
                  onClick={() => onRowClick?.(row, index)}
                  onMouseEnter={(e) => {
                    if (hoverable && onRowClick) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hoverable) {
                      e.currentTarget.style.backgroundColor = striped && index % 2 === 1 ? 'var(--color-gray-50)' : 'transparent';
                    }
                  }}
                >
                  {columns.map((column) => (
                    <td key={column.key} style={tdStyles(column)}>
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && paginatedData.length > 0 && (
        <div style={paginationContainerStyles}>
          <div style={paginationInfoStyles}>
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div style={paginationControlsStyles}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={pageSizeSelectorStyles}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={pageButtonStyles(false, currentPage === 1)}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={pageButtonStyles(currentPage === page, false)}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && <span style={{ color: 'var(--color-gray-400)' }}>...</span>}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={pageButtonStyles(false, currentPage === totalPages)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
