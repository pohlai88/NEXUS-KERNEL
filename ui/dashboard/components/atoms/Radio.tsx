/**
 * Radio Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Radio button with 16 variants:
 * - 3 states: unchecked, checked, disabled
 * - 3 label positions: right, left, none
 * - 2 sizes: default, small
 */

'use client';

import React, { InputHTMLAttributes } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Radio label */
  label?: string;
  /** Label position */
  labelPosition?: 'right' | 'left' | 'none';
  /** Size variant */
  size?: 'default' | 'small';
  /** Error state */
  error?: boolean;
  /** Value for radio button */
  value: string;
  /** Custom onChange handler with value */
  onValueChange?: (value: string) => void;
}

export function Radio({
  label,
  labelPosition = 'right',
  size = 'default',
  error = false,
  checked = false,
  disabled = false,
  value,
  className = '',
  onValueChange,
  onChange,
  ...props
}: RadioProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (e.target.checked) {
      onValueChange?.(value);
    }
  };

  const radioSize = size === 'small' ? 16 : 20;
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

  // Radio wrapper styles
  const radioWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: radioSize,
    height: radioSize,
    flexShrink: 0,
  };

  // Radio circle (outer) styles
  const radioCircleStyles: React.CSSProperties = {
    position: 'absolute',
    width: radioSize,
    height: radioSize,
    borderRadius: '50%',
    border: '2px solid',
    borderColor: error
      ? 'var(--color-error)'
      : checked
        ? 'var(--color-primary)'
        : 'var(--color-gray-400)',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    ...(disabled && {
      opacity: 0.5,
    }),
  };

  // Radio dot (inner) styles
  const radioDotStyles: React.CSSProperties = {
    position: 'relative',
    width: radioSize * 0.5,
    height: radioSize * 0.5,
    borderRadius: '50%',
    backgroundColor: disabled
      ? 'var(--color-gray-400)'
      : error
        ? 'var(--color-error)'
        : 'var(--color-primary)',
    transform: checked ? 'scale(1)' : 'scale(0)',
    transition: 'transform 0.2s ease',
    zIndex: 1,
  };

  // Hidden input styles
  const hiddenInputStyles: React.CSSProperties = {
    position: 'absolute',
    opacity: 0,
    width: radioSize,
    height: radioSize,
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
      <div style={radioWrapperStyles}>
        {/* Hidden native radio */}
        <input
          type="radio"
          checked={checked}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          style={hiddenInputStyles}
          {...props}
        />

        {/* Visual radio circle */}
        <div style={radioCircleStyles} />

        {/* Radio dot */}
        <div style={radioDotStyles} />
      </div>

      {/* Label */}
      {labelPosition !== 'none' && label && (
        <span style={labelStyles}>{label}</span>
      )}
    </label>
  );
}

/**
 * RadioGroup Component
 * Container for managing multiple radio buttons
 */
export interface RadioGroupProps {
  /** Radio group name (required for grouping) */
  name: string;
  /** Currently selected value */
  value?: string;
  /** Change handler with selected value */
  onChange?: (value: string) => void;
  /** Radio options */
  options: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
  /** Label position for all radios */
  labelPosition?: 'right' | 'left' | 'none';
  /** Size for all radios */
  size?: 'default' | 'small';
  /** Error state */
  error?: boolean;
  /** Group label */
  label?: string;
  /** Orientation */
  orientation?: 'vertical' | 'horizontal';
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  labelPosition = 'right',
  size = 'default',
  error = false,
  label,
  orientation = 'vertical',
}: RadioGroupProps) {
  const groupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: orientation === 'vertical' ? 'var(--space-3)' : 'var(--space-6)',
    fontFamily: 'var(--font-family-sans)',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    color: error ? 'var(--color-error)' : 'var(--color-gray-700)',
    marginBottom: 'var(--space-2)',
  };

  return (
    <div>
      {label && <div style={labelStyles}>{label}</div>}
      <div style={groupStyles} role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            labelPosition={labelPosition}
            size={size}
            error={error}
            checked={value === option.value}
            disabled={option.disabled}
            onValueChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

export default Radio;
