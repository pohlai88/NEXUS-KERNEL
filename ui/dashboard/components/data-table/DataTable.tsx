/**
 * DataTable - Comprehensive data table component
 * Based on Figma Data Table v2 Community designs (all 14 variants)
 * Implements: tabs, filtering, sorting, search, pagination, expandable rows, context menus
 */

'use client';

import { useState, useMemo } from 'react';
import { TableTabs } from './TableTabs';
import { TableToolbar } from './TableToolbar';
import { TableRow } from './TableRow';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';
import type { DataTableProps, TableFilters } from './types';

export function DataTable({
  users,
  totalPayable,
  currency = 'USD',
  onPayDues,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
}: DataTableProps) {
  const [filters, setFilters] = useState<TableFilters>({
    tab: 'All',
    sortBy: 'Default',
    userStatus: 'All',
    searchQuery: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Tab filter
    if (filters.tab !== 'All') {
      result = result.filter(user => user.paymentStatus === filters.tab);
    }

    // User status filter
    if (filters.userStatus !== 'All') {
      result = result.filter(user => user.userStatus === filters.userStatus);
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.lastLogin.toLowerCase().includes(query) ||
        user.paymentDate.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'First Name':
        result.sort((a, b) => a.name.split(' ')[0].localeCompare(b.name.split(' ')[0]));
        break;
      case 'Last Name':
        result.sort((a, b) => {
          const aLast = a.name.split(' ').pop() || '';
          const bLast = b.name.split(' ').pop() || '';
          return aLast.localeCompare(bLast);
        });
        break;
      case 'Due Date':
        result.sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
        break;
      case 'Last Login':
        result.sort((a, b) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime());
        break;
    }

    return result;
  }, [users, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const toggleExpand = (userId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleSelect = (userId: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // Action handlers (can be customized via props)
  const handleViewMore = (userId: string) => console.log('View More:', userId);
  const handleEdit = (userId: string) => console.log('Edit:', userId);
  const handleViewProfile = (userId: string) => console.log('View Profile:', userId);
  const handleActivate = (userId: string) => console.log('Activate:', userId);
  const handleDelete = (userId: string) => console.log('Delete:', userId);

  return (
    <div className="bg-nx-surface rounded-lg border border-nx-border shadow-sm">
      <div className="p-6">
        <TableTabs
          activeTab={filters.tab}
          onTabChange={(tab) => handleFiltersChange({ tab })}
          totalPayable={totalPayable}
          currency={currency}
        />

        <TableToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onPayDues={onPayDues}
        />
      </div>

      {paginatedUsers.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-nx-canvas border-y border-nx-border">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded"
                      style={{ accentColor: 'var(--color-primary)' }}
                      checked={paginatedUsers.every(u => selectedRows.has(u.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(paginatedUsers.map(u => u.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-caption font-semibold text-nx-text-sub uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-caption font-semibold text-nx-text-sub uppercase tracking-wider">
                    User Status
                  </th>
                  <th className="py-3 px-4 text-left text-caption font-semibold text-nx-text-sub uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="py-3 px-4 text-left text-caption font-semibold text-nx-text-sub uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    user={user}
                    isExpanded={expandedRows.has(user.id)}
                    isSelected={selectedRows.has(user.id)}
                    onToggleExpand={() => toggleExpand(user.id)}
                    onToggleSelect={() => toggleSelect(user.id)}
                    onViewMore={handleViewMore}
                    onEdit={handleEdit}
                    onViewProfile={handleViewProfile}
                    onActivate={handleActivate}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalRows={filteredUsers.length}
            rowsPerPageOptions={rowsPerPageOptions}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}
    </div>
  );
}

export * from './types';
