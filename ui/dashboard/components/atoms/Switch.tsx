/**
 * Switch Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Toggle switch with 12 variants:
 * - 3 states: off, on, disabled
 * - 3 label positions: right, left, none
 * - 2 sizes: default, small
 */

'use client';

import React, { InputHTMLAttributes } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Switch label */
  label?: string;
  /** Label position */
  labelPosition?: 'right' | 'left' | 'none';
  /** Size variant */
  size?: 'default' | 'small';
  /** Error state */
  error?: boolean;
  /** Custom onChange handler with checked state */
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  label,
  labelPosition = 'right',
  size = 'default',
  error = false,
  checked = false,
  disabled = false,
  className = '',
  onCheckedChange,
  onChange,
  ...props
}: SwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onCheckedChange?.(e.target.checked);
  };

  // Size configuration
  const sizeConfig = {
    default: {
      width: 44,
      height: 24,
      thumbSize: 20,
      thumbOffset: 2,
    },
    small: {
      width: 36,
      height: 20,
      thumbSize: 16,
      thumbOffset: 2,
    },
  };

  const config = sizeConfig[size];
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

  // Switch wrapper styles
  const switchWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: config.width,
    height: config.height,
    flexShrink: 0,
  };

  // Switch track styles
  const trackStyles: React.CSSProperties = {
    position: 'absolute',
    width: config.width,
    height: config.height,
    borderRadius: config.height / 2,
    backgroundColor: error
      ? 'var(--color-error)'
      : checked
        ? 'var(--color-primary)'
        : 'var(--color-gray-300)',
    transition: 'background-color 0.2s ease',
    ...(disabled && {
      opacity: 0.5,
      backgroundColor: checked ? 'var(--color-gray-400)' : 'var(--color-gray-200)',
    }),
  };

  // Switch thumb styles
  const thumbStyles: React.CSSProperties = {
    position: 'absolute',
    width: config.thumbSize,
    height: config.thumbSize,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s ease',
    transform: checked
      ? `translateX(${config.width - config.thumbSize - config.thumbOffset * 2}px)`
      : 'translateX(0)',
    left: config.thumbOffset,
    top: config.thumbOffset,
  };

  // Hidden input styles
  const hiddenInputStyles: React.CSSProperties = {
    position: 'absolute',
    opacity: 0,
    width: config.width,
    height: config.height,
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

  return (
    <label style={containerStyles} className={className}>
      <div style={switchWrapperStyles}>
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          style={hiddenInputStyles}
          aria-checked={checked}
          {...props}
        />

        {/* Visual switch track */}
        <div style={trackStyles} />

        {/* Switch thumb */}
        <div style={thumbStyles} />
      </div>

      {/* Label */}
      {labelPosition !== 'none' && label && (
        <span style={labelStyles}>{label}</span>
      )}
    </label>
  );
}

export default Switch;
