/**
 * FilterButton - Dropdown filter for sorting and user status
 * Based on Figma design: node 419:8730 (filter dropdown)
 */

import { useState, useRef, useEffect } from 'react';
import { Filter } from 'lucide-react';
import type { SortBy, UserFilter } from './types';

interface FilterButtonProps {
  sortBy: SortBy;
  userStatus: UserFilter;
  onSortByChange: (sortBy: SortBy) => void;
  onUserStatusChange: (userStatus: UserFilter) => void;
}

const SORT_OPTIONS: SortBy[] = ['Default', 'First Name', 'Last Name', 'Due Date', 'Last Login'];
const USER_OPTIONS: UserFilter[] = ['All', 'Active', 'Inactive'];

export function FilterButton({ sortBy, userStatus, onSortByChange, onUserStatusChange }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg
                   transition-all interactive text-body"
        style={{
          borderColor: isOpen ? 'var(--color-primary)' : '#e5e7eb',
        }}
      >
        <Filter size={18} style={{ color: 'var(--color-primary)' }} />
        Filter
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 bg-nx-surface rounded-lg shadow-lg
                     border border-nx-border p-4 z-50"
          style={{ 
            width: '230px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="mb-4">
            <div className="text-caption font-medium text-nx-text-muted mb-2">SORT BY:</div>
            {SORT_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center justify-between py-2 cursor-pointer
                           hover:bg-nx-surface-well rounded px-2 -mx-2"
              >
                <span className="text-body">{option}</span>
                <input
                  type="radio"
                  name="sortBy"
                  checked={sortBy === option}
                  onChange={() => onSortByChange(option)}
                  className="w-5 h-5"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
              </label>
            ))}
          </div>

          <div>
            <div className="text-caption font-medium text-nx-text-muted mb-2">USERS:</div>
            {USER_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center justify-between py-2 cursor-pointer
                           hover:bg-nx-surface-well rounded px-2 -mx-2"
              >
                <span className="text-body">{option}</span>
                <input
                  type="radio"
                  name="userStatus"
                  checked={userStatus === option}
                  onChange={() => onUserStatusChange(option)}
                  className="w-5 h-5"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
