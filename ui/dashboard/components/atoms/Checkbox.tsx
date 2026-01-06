/**
 * Checkbox Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Checkbox with 24 variants:
 * - 4 states: unchecked, checked, indeterminate, disabled
 * - 3 label positions: right, left, none
 * - 2 sizes: default, small
 */

'use client';

import React, { InputHTMLAttributes } from 'react';
import { IconCheck } from './icons/IconCheck';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Checkbox label */
  label?: string;
  /** Label position */
  labelPosition?: 'right' | 'left' | 'none';
  /** Indeterminate state (partial selection) */
  indeterminate?: boolean;
  /** Size variant */
  size?: 'default' | 'small';
  /** Error state */
  error?: boolean;
  /** Custom onChange handler with checked state */
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  label,
  labelPosition = 'right',
  indeterminate = false,
  size = 'default',
  error = false,
  checked = false,
  disabled = false,
  className = '',
  onCheckedChange,
  onChange,
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onCheckedChange?.(e.target.checked);
  };

  const checkboxSize = size === 'small' ? 16 : 20;
  const labelFontSize = size === 'small' ? 'var(--text-caption-size)' : 'var(--text-body-size)';

  // Container styles
  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-family-sans)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row',
  };

  // Checkbox wrapper styles
  const checkboxWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: checkboxSize,
    height: checkboxSize,
    flexShrink: 0,
  };

  // Checkbox box styles
  const checkboxBoxStyles: React.CSSProperties = {
    position: 'absolute',
    width: checkboxSize,
    height: checkboxSize,
    borderRadius: 'var(--radius-sm)',
    border: '2px solid',
    borderColor: error
      ? 'var(--color-error)'
      : checked || indeterminate
        ? 'var(--color-primary)'
        : 'var(--color-gray-400)',
    backgroundColor: checked || indeterminate
      ? disabled
        ? 'var(--color-gray-300)'
        : 'var(--color-primary)'
      : 'transparent',
    transition: 'all 0.2s ease',
    ...(disabled && {
      opacity: 0.5,
    }),
  };

  // Hidden input styles
  const hiddenInputStyles: React.CSSProperties = {
    position: 'absolute',
    opacity: 0,
    width: checkboxSize,
    height: checkboxSize,
    cursor: disabled ? 'not-allowed' : 'pointer',
    margin: 0,
  };

  // Label styles
  const labelStyles: React.CSSProperties = {
    fontSize: labelFontSize,
    lineHeight: 'var(--text-body-line-height)',
    color: error
      ? 'var(--color-error)'
      : disabled
        ? 'var(--color-gray-400)'
        : 'var(--color-gray-900)',
    userSelect: 'none',
  };

  // Check icon
  const renderCheckIcon = () => {
    if (indeterminate) {
      return (
        <svg
          width={checkboxSize - 4}
          height={checkboxSize - 4}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <path
            d="M2 8h12"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    if (checked) {
      return (
        <svg
          width={checkboxSize - 4}
          height={checkboxSize - 4}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <path
            d="M3 8l3 3 7-7"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    return null;
  };

  return (
    <label style={containerStyles} className={className}>
      <div style={checkboxWrapperStyles}>
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          style={hiddenInputStyles}
          aria-checked={indeterminate ? 'mixed' : checked}
          {...props}
        />

        {/* Visual checkbox */}
        <div style={checkboxBoxStyles} />

        {/* Check/Indeterminate icon */}
        {renderCheckIcon()}
      </div>

      {/* Label */}
      {labelPosition !== 'none' && label && (
        <span style={labelStyles}>{label}</span>
      )}
    </label>
  );
}

export default Checkbox;
