/**
 * Input Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Text input with 40 variants:
 * - 5 states: default, hover, focus, error, disabled
 * - 4 icon positions: none, left, right, both
 * - 2 label styles: floating, top
 */

'use client';

import React, { useState, useRef, InputHTMLAttributes } from 'react';
import { IconSearch } from './icons/IconSearch';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Label position */
  labelPosition?: 'floating' | 'top' | 'none';
  /** Error state and message */
  error?: boolean;
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Icon position */
  iconPosition?: 'none' | 'left' | 'right' | 'both';
  /** Custom left icon (defaults to search) */
  leftIcon?: React.ReactNode;
  /** Custom right icon */
  rightIcon?: React.ReactNode;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  /** Full width */
  fullWidth?: boolean;
}

export function Input({
  label,
  labelPosition = 'top',
  error = false,
  errorMessage,
  helperText,
  iconPosition = 'none',
  leftIcon,
  rightIcon,
  type = 'text',
  fullWidth = false,
  disabled = false,
  value,
  placeholder,
  className = '',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  // Determine state for styling
  const state = disabled ? 'disabled' : error ? 'error' : isFocused ? 'focus' : 'default';

  // Icon components
  const defaultLeftIcon = type === 'search' ? <IconSearch size={20} color="var(--color-gray-500)" /> : null;
  const renderLeftIcon = leftIcon || defaultLeftIcon;
  const hasLeftIcon = iconPosition === 'left' || iconPosition === 'both';
  const hasRightIcon = iconPosition === 'right' || iconPosition === 'both';

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-family-sans)',
  };

  // Input wrapper styles
  const wrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    borderColor: error 
      ? 'var(--color-error)' 
      : isFocused 
        ? 'var(--color-primary)' 
        : 'var(--color-gray-300)',
    backgroundColor: disabled ? 'var(--color-gray-100)' : '#FFFFFF',
    transition: 'all 0.2s ease',
    paddingLeft: hasLeftIcon ? 'var(--space-3)' : 'var(--space-4)',
    paddingRight: hasRightIcon ? 'var(--space-3)' : 'var(--space-4)',
    gap: 'var(--space-2)',
    ...(isFocused && !error && {
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
    }),
    ...(error && {
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    }),
  };

  // Input element styles
  const inputStyles: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: 'var(--text-body-size)',
    lineHeight: 'var(--text-body-line-height)',
    color: disabled ? 'var(--color-gray-400)' : 'var(--color-gray-900)',
    padding: labelPosition === 'floating' ? 'var(--space-5) 0 var(--space-2) 0' : 'var(--space-3) 0',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  // Top label styles
  const topLabelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 500,
    color: error ? 'var(--color-error)' : 'var(--color-gray-700)',
    marginBottom: 'var(--space-2)',
  };

  // Floating label styles
  const floatingLabelStyles: React.CSSProperties = {
    position: 'absolute',
    left: hasLeftIcon ? 'calc(var(--space-3) + 24px)' : 'var(--space-4)',
    top: isFocused || hasValue ? 'var(--space-2)' : '50%',
    transform: isFocused || hasValue ? 'translateY(0)' : 'translateY(-50%)',
    fontSize: isFocused || hasValue ? 'var(--text-micro-size)' : 'var(--text-body-size)',
    fontWeight: 500,
    color: error 
      ? 'var(--color-error)' 
      : isFocused 
        ? 'var(--color-primary)' 
        : 'var(--color-gray-500)',
    transition: 'all 0.2s ease',
    pointerEvents: 'none',
    backgroundColor: '#FFFFFF',
    padding: '0 var(--space-1)',
  };

  // Helper/error text styles
  const helperTextStyles: React.CSSProperties = {
    fontSize: 'var(--text-micro-size)',
    color: error ? 'var(--color-error)' : 'var(--color-gray-600)',
    marginTop: 'var(--space-2)',
  };

  return (
    <div style={containerStyles} className={className}>
      {/* Top Label */}
      {labelPosition === 'top' && label && (
        <label style={topLabelStyles}>
          {label}
        </label>
      )}

      {/* Input Wrapper */}
      <div style={wrapperStyles}>
        {/* Left Icon */}
        {hasLeftIcon && (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {renderLeftIcon}
          </div>
        )}

        {/* Floating Label */}
        {labelPosition === 'floating' && label && (
          <label style={floatingLabelStyles}>
            {label}
          </label>
        )}

        {/* Input Element */}
        <input
          ref={inputRef}
          type={type}
          value={value}
          placeholder={labelPosition === 'floating' ? '' : placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          style={inputStyles}
          {...props}
        />

        {/* Right Icon */}
        {hasRightIcon && (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {rightIcon}
          </div>
        )}
      </div>

      {/* Helper Text or Error Message */}
      {(helperText || errorMessage) && (
        <div style={helperTextStyles}>
          {error ? errorMessage : helperText}
        </div>
      )}
    </div>
  );
}

export default Input;
