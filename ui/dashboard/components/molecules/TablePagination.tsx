import React from 'react';

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showFirstLast?: boolean;
  maxPageButtons?: number;
  disabled?: boolean;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showFirstLast = true,
  maxPageButtons = 7,
  disabled = false,
  className = '',
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = (): number[] => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfWindow = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(1, currentPage - halfWindow);
    let endPage = Math.min(totalPages, currentPage + halfWindow);

    if (currentPage <= halfWindow) {
      endPage = maxPageButtons;
    } else if (currentPage + halfWindow >= totalPages) {
      startPage = totalPages - maxPageButtons + 1;
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = getPageNumbers();

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const infoStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-600)',
  };

  const pageSizeContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  };

  const selectStyles: React.CSSProperties = {
    padding: 'var(--space-1) var(--space-3) var(--space-1) var(--space-2)',
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-900)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    outline: 'none',
  };

  const controlsStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  };

  const buttonStyles = (active: boolean, isDisabled: boolean): React.CSSProperties => ({
    minWidth: '32px',
    height: '32px',
    padding: '0 var(--space-2)',
    fontSize: 'var(--text-caption-size)',
    fontWeight: active ? 600 : 400,
    color: active ? '#FFFFFF' : 'var(--color-gray-700)',
    backgroundColor: active ? 'var(--color-primary)' : '#FFFFFF',
    border: '1px solid',
    borderColor: active ? 'var(--color-primary)' : 'var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  });

  const ellipsisStyles: React.CSSProperties = {
    padding: '0 var(--space-1)',
    color: 'var(--color-gray-400)',
    fontSize: 'var(--text-caption-size)',
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Info & Page Size */}
      <div style={infoStyles}>
        <span>
          Showing {startItem}-{endItem} of {totalItems}
        </span>
        {onPageSizeChange && (
          <div style={pageSizeContainerStyles}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={selectStyles}
              disabled={disabled}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div style={controlsStyles}>
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || disabled}
            style={buttonStyles(false, currentPage === 1)}
            onMouseEnter={(e) => {
              if (currentPage !== 1 && !disabled) {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            First
          </button>
        )}

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          style={buttonStyles(false, currentPage === 1)}
          onMouseEnter={(e) => {
            if (currentPage !== 1 && !disabled) {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          Previous
        </button>

        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={buttonStyles(false, false)}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              1
            </button>
            <span style={ellipsisStyles}>...</span>
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={buttonStyles(currentPage === page, false)}
            onMouseEnter={(e) => {
              if (currentPage !== page && !disabled) {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== page) {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
          >
            {page}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            <span style={ellipsisStyles}>...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              style={buttonStyles(false, false)}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          style={buttonStyles(false, currentPage === totalPages)}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages && !disabled) {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          Next
        </button>

        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || disabled}
            style={buttonStyles(false, currentPage === totalPages)}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages && !disabled) {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            Last
          </button>
        )}
      </div>
    </div>
  );
}

export default TablePagination;
