/**
 * Textarea Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Multi-line text input with 20 variants:
 * - 5 states: default, hover, focus, error, disabled
 * - 2 label positions: floating, top
 * - Auto-resize support
 */

'use client';

import React, { useState, useRef, TextareaHTMLAttributes, useEffect } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label */
  label?: string;
  /** Label position */
  labelPosition?: 'floating' | 'top' | 'none';
  /** Error state and message */
  error?: boolean;
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Auto-resize as content grows */
  autoResize?: boolean;
  /** Minimum rows */
  minRows?: number;
  /** Maximum rows (for auto-resize) */
  maxRows?: number;
  /** Full width */
  fullWidth?: boolean;
  /** Character count */
  showCharCount?: boolean;
  /** Maximum character length */
  maxLength?: number;
}

export function Textarea({
  label,
  labelPosition = 'top',
  error = false,
  errorMessage,
  helperText,
  autoResize = false,
  minRows = 3,
  maxRows = 10,
  fullWidth = false,
  showCharCount = false,
  maxLength,
  disabled = false,
  value,
  placeholder,
  className = '',
  onChange,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const [charCount, setCharCount] = useState(value?.toString().length || 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(!!e.target.value);
    setCharCount(e.target.value.length);
    onChange?.(e);

    if (autoResize && textareaRef.current) {
      adjustHeight();
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to get accurate scrollHeight
    textarea.style.height = 'auto';
    
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;
    
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    if (autoResize) {
      adjustHeight();
    }
  }, [value, autoResize]);

  // Determine state for styling
  const state = disabled ? 'disabled' : error ? 'error' : isFocused ? 'focus' : 'default';

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-family-sans)',
  };

  // Textarea wrapper styles
  const wrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    borderColor: error 
      ? 'var(--color-error)' 
      : isFocused 
        ? 'var(--color-primary)' 
        : 'var(--color-gray-300)',
    backgroundColor: disabled ? 'var(--color-gray-100)' : '#FFFFFF',
    transition: 'all 0.2s ease',
    padding: labelPosition === 'floating' ? 'var(--space-5) var(--space-4) var(--space-2)' : 'var(--space-3) var(--space-4)',
    ...(isFocused && !error && {
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
    }),
    ...(error && {
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    }),
  };

  // Textarea element styles
  const textareaStyles: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: 'var(--text-body-size)',
    lineHeight: 'var(--text-body-line-height)',
    color: disabled ? 'var(--color-gray-400)' : 'var(--color-gray-900)',
    resize: autoResize ? 'none' : 'vertical',
    cursor: disabled ? 'not-allowed' : 'text',
    minHeight: `calc(var(--text-body-line-height) * ${minRows})`,
    fontFamily: 'inherit',
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
    left: 'var(--space-4)',
    top: isFocused || hasValue ? 'var(--space-2)' : 'var(--space-4)',
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div style={containerStyles} className={className}>
      {/* Top Label */}
      {labelPosition === 'top' && label && (
        <label style={topLabelStyles}>
          {label}
        </label>
      )}

      {/* Textarea Wrapper */}
      <div style={wrapperStyles}>
        {/* Floating Label */}
        {labelPosition === 'floating' && label && (
          <label style={floatingLabelStyles}>
            {label}
          </label>
        )}

        {/* Textarea Element */}
        <textarea
          ref={textareaRef}
          value={value}
          placeholder={labelPosition === 'floating' ? '' : placeholder}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          style={textareaStyles}
          {...props}
        />
      </div>

      {/* Helper Text / Error Message / Character Count */}
      {(helperText || errorMessage || showCharCount) && (
        <div style={helperTextStyles}>
          <span>
            {error ? errorMessage : helperText}
          </span>
          {showCharCount && (
            <span style={{ color: 'var(--color-gray-500)' }}>
              {charCount}{maxLength ? `/${maxLength}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Textarea;
