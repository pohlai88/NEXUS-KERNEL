'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: string;
  /** Disabled state */
  disabled?: boolean;
  /** Icon (optional) */
  icon?: React.ReactNode;
  /** Description (optional) */
  description?: string;
}

export interface SelectProps {
  /** Available options */
  options: SelectOption[];
  /** Selected value */
  value?: string | number;
  /** Selected values (multi-select) */
  values?: (string | number)[];
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Multi-select change handler */
  onMultiChange?: (values: (string | number)[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Enable multi-select */
  multiple?: boolean;
  /** Enable search/filter */
  searchable?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Select/Dropdown Component - Material Design 3 with Quantum Obsidian tokens
 * 
 * Features:
 * - Single and multi-select modes
 * - Searchable options
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Icon and description support
 * - P3 Wide Gamut OKLCH colors
 * 
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { value: 'active', label: 'Active', icon: <IconCheck /> },
 *     { value: 'inactive', label: 'Inactive' },
 *   ]}
 *   value={status}
 *   onChange={setStatus}
 *   searchable
 * />
 * ```
 */
export default function Select({
  options,
  value,
  values = [],
  onChange,
  onMultiChange,
  placeholder = 'Select...',
  disabled = false,
  error = false,
  multiple = false,
  searchable = false,
  size = 'md',
  fullWidth = false,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = multiple ? values : value !== undefined ? [value] : [];

  // Size styles
  const sizeStyles = {
    sm: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--type-caption-size)' },
    md: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--type-body-size)' },
    lg: { padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--type-body-size)' },
  };

  // Filter options by search query
  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  // Get selected option labels
  const getSelectedLabel = () => {
    if (selectedValues.length === 0) return placeholder;
    if (multiple) {
      return `${selectedValues.length} selected`;
    }
    return options.find((opt) => opt.value === value)?.label || placeholder;
  };

  // Handle option select
  const handleSelect = (optionValue: string | number) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onMultiChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      searchInputRef.current?.focus();
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        width: fullWidth ? '100%' : '240px',
      }}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex items-center justify-between w-full"
        style={{
          ...sizeStyles[size],
          backgroundColor: disabled ? 'var(--color-surface-well)' : 'var(--color-surface)',
          color: selectedValues.length === 0 ? 'var(--color-text-muted)' : 'var(--color-text-main)',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--dur-fast) var(--ease-standard)',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = 'var(--color-border-strong)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !error) {
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-light)';
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span>{getSelectedLabel()}</span>
        <IconChevronDown
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--dur-fast) var(--ease-standard)',
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 flex flex-col"
          style={{
            marginTop: 'var(--space-1)',
            maxHeight: '320px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-3)',
            zIndex: 'var(--z-dropdown)',
            overflow: 'hidden',
          }}
        >
          {/* Search Input */}
          {searchable && (
            <div
              style={{
                padding: 'var(--space-2)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--type-body-size)',
                  color: 'var(--color-text-main)',
                  backgroundColor: 'var(--color-surface-well)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--type-body-size)',
                }}
              >
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className="flex items-center gap-3 w-full text-left"
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      backgroundColor: isHighlighted
                        ? 'var(--color-surface-well)'
                        : isSelected
                        ? 'var(--color-primary-light)'
                        : 'transparent',
                      color: option.disabled ? 'var(--color-text-faint)' : 'var(--color-text-main)',
                      cursor: option.disabled ? 'not-allowed' : 'pointer',
                      border: 'none',
                      fontSize: 'var(--type-body-size)',
                      transition: 'background-color var(--dur-fast) var(--ease-standard)',
                    }}
                    onMouseEnter={(e) => {
                      if (!option.disabled) {
                        setHighlightedIndex(index);
                      }
                    }}
                  >
                    {/* Checkbox (multi-select) */}
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: 'var(--color-primary)',
                        }}
                        tabIndex={-1}
                      />
                    )}

                    {/* Icon */}
                    {option.icon && (
                      <span className="inline-flex items-center justify-center" style={{ width: '16px', height: '16px' }}>
                        {option.icon}
                      </span>
                    )}

                    {/* Label & Description */}
                    <div className="flex-1">
                      <div style={{ fontWeight: isSelected ? 'var(--weight-semibold)' : 'var(--weight-regular)' }}>
                        {option.label}
                      </div>
                      {option.description && (
                        <div
                          style={{
                            fontSize: 'var(--type-caption-size)',
                            color: 'var(--color-text-sub)',
                            marginTop: 'var(--space-1)',
                          }}
                        >
                          {option.description}
                        </div>
                      )}
                    </div>

                    {/* Checkmark (single-select) */}
                    {!multiple && isSelected && (
                      <IconCheck style={{ color: 'var(--color-primary)' }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Icons */
function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
