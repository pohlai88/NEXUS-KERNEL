/**
 * Pagination - Rows per page selector and page navigation
 * Based on Figma design: node 423:4410 (pagination footer)
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalRows: number;
  rowsPerPageOptions: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalRows,
  rowsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  return (
    <div className="flex items-center justify-between py-4 px-4 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-body text-gray-600">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded text-body
                     focus:outline-none transition-colors"
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-body text-gray-600">
          {startRow}-{endRow} of {totalRows}
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
