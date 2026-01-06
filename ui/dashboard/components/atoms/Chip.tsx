/**
 * Chip Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Compact elements for tags, categories, and filters
 * 6 color variants with removable/static options
 */

'use client';

import React from 'react';
import { IconClose } from './icons/IconClose';

export interface ChipProps {
  /** Chip label */
  label: string;
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Size variant */
  size?: 'default' | 'small';
  /** Removable with close button */
  removable?: boolean;
  /** Remove handler */
  onRemove?: () => void;
  /** Click handler (for non-removable chips) */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Optional icon on the left */
  icon?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export function Chip({
  label,
  variant = 'default',
  size = 'default',
  removable = false,
  onRemove,
  onClick,
  disabled = false,
  icon,
  className = '',
}: ChipProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onRemove?.();
    }
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  // Color configurations
  const colorConfig = {
    default: {
      background: 'var(--color-gray-100)',
      text: 'var(--color-gray-700)',
      border: 'var(--color-gray-300)',
    },
    primary: {
      background: 'rgba(99, 102, 241, 0.1)',
      text: 'var(--color-primary)',
      border: 'var(--color-primary)',
    },
    success: {
      background: 'rgba(16, 185, 129, 0.1)',
      text: '#10B981',
      border: '#10B981',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.1)',
      text: '#F59E0B',
      border: '#F59E0B',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.1)',
      text: 'var(--color-error)',
      border: 'var(--color-error)',
    },
    info: {
      background: 'rgba(59, 130, 246, 0.1)',
      text: '#3B82F6',
      border: '#3B82F6',
    },
  };

  const colors = colorConfig[variant];

  // Size configuration
  const sizeConfig = {
    default: {
      height: 32,
      padding: '0 var(--space-3)',
      fontSize: 'var(--text-body-size)',
      iconSize: 16,
    },
    small: {
      height: 24,
      padding: '0 var(--space-2)',
      fontSize: 'var(--text-caption-size)',
      iconSize: 14,
    },
  };

  const sizeStyles = sizeConfig[size];

  // Container styles
  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    height: sizeStyles.height,
    padding: sizeStyles.padding,
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: sizeStyles.height / 2,
    fontSize: sizeStyles.fontSize,
    fontWeight: 500,
    color: colors.text,
    fontFamily: 'var(--font-family-sans)',
    cursor: onClick && !disabled ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    ...(onClick && !disabled && {
      ':hover': {
        backgroundColor: colors.background,
        filter: 'brightness(0.95)',
      },
    }),
  };

  // Close button styles
  const closeButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
    marginLeft: 'var(--space-1)',
    marginRight: 'calc(var(--space-1) * -1)',
  };

  return (
    <div
      style={containerStyles}
      className={className}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (onClick && !disabled) {
          e.currentTarget.style.filter = 'brightness(0.95)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'brightness(1)';
      }}
    >
      {/* Icon */}
      {icon && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      )}

      {/* Label */}
      <span>{label}</span>

      {/* Remove button */}
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          style={closeButtonStyles}
          disabled={disabled}
          aria-label="Remove"
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          <IconClose size={sizeStyles.iconSize} color={colors.text} />
        </button>
      )}
    </div>
  );
}

export default Chip;
