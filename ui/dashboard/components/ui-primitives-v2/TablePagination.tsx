'use client';

import React, { useState } from 'react';

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export default function TablePagination({
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) {
  const [showRowsMenu, setShowRowsMenu] = useState(false);
  
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '20px',
        padding: '12px 20px',
        width: '100%',
      }}
    >
      {/* Items count */}
      <p
        className="text-micro"
        style={{
          flex: '1 0 0',
          color: 'var(--color-text-muted)',
          minWidth: 0,
        }}
      >
        {startItem}-{endItem} of {totalItems}
      </p>

      {/* Rows per page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
        <span className="text-micro" style={{ color: 'var(--color-text-muted)' }}>
          Rows per page:
        </span>
        <button
          onClick={() => setShowRowsMenu(!showRowsMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0 2px',
          }}
        >
          <span className="text-micro" style={{ color: 'var(--color-text-muted)' }}>
            {rowsPerPage}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M5 6.5L8 9.5L11 6.5"
              stroke="var(--color-text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Rows per page menu */}
        {showRowsMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              zIndex: 1000,
            }}
          >
            <RowsPerPageMenu
              currentValue={rowsPerPage}
              onSelect={(value) => {
                onRowsPerPageChange(value);
                setShowRowsMenu(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Previous button */}
        <button
          onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px 4px',
            borderRadius: '6px',
            border: 'none',
            cursor: canGoPrevious ? 'pointer' : 'not-allowed',
            backgroundColor: canGoPrevious ? '#FFFFFF' : 'var(--color-background)',
            boxShadow: canGoPrevious
              ? '0px 1px 1px 0px rgba(0,0,0,0.1), 0px 0px 0px 1px rgba(70,79,96,0.16)'
              : '0px 0px 0px 1px rgba(70,79,96,0.2)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke={canGoPrevious ? 'var(--color-text)' : 'var(--color-text-sub)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Page indicator */}
        <span className="text-micro" style={{ color: 'var(--color-text-muted)' }}>
          <span style={{ color: 'var(--color-text)' }}>{currentPage}</span>/{totalPages}
        </span>

        {/* Next button */}
        <button
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px 4px',
            borderRadius: '6px',
            border: 'none',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            backgroundColor: canGoNext ? '#FFFFFF' : 'var(--color-background)',
            boxShadow: canGoNext
              ? '0px 1px 1px 0px rgba(0,0,0,0.1), 0px 0px 0px 1px rgba(70,79,96,0.16)'
              : '0px 0px 0px 1px rgba(70,79,96,0.2)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke={canGoNext ? 'var(--color-text)' : 'var(--color-text-sub)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface RowsPerPageMenuProps {
  currentValue: number;
  onSelect: (value: number) => void;
}

function RowsPerPageMenu({ currentValue, onSelect }: RowsPerPageMenuProps) {
  const options = [5, 10, 15, 20, 30, 40, 50];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '6px',
        padding: '4px',
        boxShadow:
          '0px 0px 0px 1px rgba(152,161,178,0.1), 0px 15px 35px -5px rgba(17,24,38,0.2), 0px 5px 15px 0px rgba(0,0,0,0.08)',
        minWidth: '56px',
      }}
    >
      {options.map((value) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className="text-body"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '4px 10px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: currentValue === value ? 'var(--color-primary)' : 'transparent',
            color: currentValue === value ? '#FFFFFF' : 'var(--color-text)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (currentValue !== value) {
              e.currentTarget.style.backgroundColor = 'var(--color-background)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentValue !== value) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
