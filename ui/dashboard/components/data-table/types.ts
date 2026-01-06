/**
 * Data Table Types - Based on Figma Data Table v2 Community Design
 * Implements comprehensive table with filtering, sorting, pagination, and expandable rows
 */

export type UserStatus = 'Active' | 'Inactive';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Overdue';

export interface User {
  id: string;
  name: string;
  email: string;
  userStatus: UserStatus;
  lastLogin: string;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  amount: number;
  currency: string;
  // Expandable row details
  activityDetails?: {
    date: string;
    userActivity: string;
    detail: string;
  }[];
}

export type TabFilter = 'All' | 'Paid' | 'Unpaid' | 'Overdue';
export type SortBy = 'Default' | 'First Name' | 'Last Name' | 'Due Date' | 'Last Login';
export type UserFilter = 'All' | 'Active' | 'Inactive';

export interface TableFilters {
  tab: TabFilter;
  sortBy: SortBy;
  userStatus: UserFilter;
  searchQuery: string;
}

export interface DataTableProps {
  users: User[];
  totalPayable: number;
  currency: string;
  onPayDues?: () => void;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
}

export interface TableRowProps {
  user: User;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onViewMore: (userId: string) => void;
  onEdit: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onActivate: (userId: string) => void;
  onDelete: (userId: string) => void;
}
