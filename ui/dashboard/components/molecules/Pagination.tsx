import React from 'react';
import { IconChevronLeft, IconChevronRight } from '../atoms/icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  showTotal?: boolean;
  totalItems?: number;
  maxVisible?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = false,
  showTotal = false,
  totalItems = 0,
  maxVisible = 7,
  className = '',
}: PaginationProps) {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    backgroundColor: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
    flexWrap: 'wrap',
  };

  const pagesContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  };

  const buttonStyles = (isActive: boolean, isDisabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    height: '36px',
    padding: '0 var(--space-2)',
    fontSize: 'var(--text-body-size)',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? '#FFFFFF' : isDisabled ? 'var(--color-gray-400)' : 'var(--color-gray-700)',
    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
    border: '1px solid',
    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
  });

  const ellipsisStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    height: '36px',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-500)',
  };

  const selectStyles: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-900)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    outline: 'none',
  };

  const infoStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-600)',
    marginLeft: 'auto',
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
      
      const shouldShowLeftEllipsis = leftSiblingIndex > 2;
      const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

      if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
        // Show last 5 pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show both ellipses
        pages.push(1);
        pages.push('...');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={className} style={containerStyles}>
      {/* Previous Button */}
      <button
        style={buttonStyles(false, currentPage === 1)}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <IconChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      <div style={pagesContainerStyles}>
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <div key={`ellipsis-${index}`} style={ellipsisStyles}>
                ...
              </div>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              style={buttonStyles(isActive, false)}
              onClick={() => onPageChange(pageNum)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        style={buttonStyles(false, currentPage === totalPages)}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <IconChevronRight size={18} />
      </button>

      {/* Page Size Selector */}
      {showPageSize && onPageSizeChange && (
        <select
          style={selectStyles}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      )}

      {/* Total Items Info */}
      {showTotal && (
        <div style={infoStyles}>
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} -{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </div>
      )}
    </div>
  );
}

export default Pagination;
