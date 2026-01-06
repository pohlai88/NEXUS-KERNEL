'use client';

import React from 'react';

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Dot indicator (minimal badge) */
  dot?: boolean;
  /** Icon element */
  icon?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Badge Component - Material Design 3 with Quantum Obsidian tokens
 * 
 * Features:
 * - 7 semantic variants (P3 OKLCH colors)
 * - 3 size options
 * - Dot indicator mode
 * - Icon support
 * - Interactive (clickable) mode
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" size="sm" icon={<IconAlert />}>Pending</Badge>
 * <Badge variant="danger" dot />
 * ```
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
  onClick,
}: BadgeProps) {
  const isInteractive = !!onClick;

  // Quantum Obsidian variant styles (P3 OKLCH colors)
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary-light)',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-primary)',
    },
    secondary: {
      backgroundColor: 'var(--color-surface-well)',
      color: 'var(--color-text-main)',
      border: '1px solid var(--color-border-strong)',
    },
    success: {
      backgroundColor: 'var(--color-success-bg)',
      color: 'var(--color-success-text)',
      border: '1px solid var(--color-success)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-bg)',
      color: 'var(--color-warning-text)',
      border: '1px solid var(--color-warning)',
    },
    danger: {
      backgroundColor: 'var(--color-danger-bg)',
      color: 'var(--color-danger-text)',
      border: '1px solid var(--color-danger)',
    },
    info: {
      backgroundColor: 'var(--color-info-bg)',
      color: 'var(--color-info-text)',
      border: '1px solid var(--color-info)',
    },
    neutral: {
      backgroundColor: 'var(--color-surface-well)',
      color: 'var(--color-text-sub)',
      border: '1px solid var(--color-border)',
    },
  };

  // Size configurations
  const sizeStyles = {
    sm: {
      fontSize: 'var(--type-micro-size)',
      lineHeight: 'var(--type-micro-line)',
      padding: dot ? '0' : '0 var(--space-2)',
      height: dot ? '6px' : '1.25rem',
      minWidth: dot ? '6px' : undefined,
      gap: 'var(--space-1)',
    },
    md: {
      fontSize: 'var(--type-caption-size)',
      lineHeight: 'var(--type-caption-line)',
      padding: dot ? '0' : '0 var(--space-3)',
      height: dot ? '8px' : '1.5rem',
      minWidth: dot ? '8px' : undefined,
      gap: 'var(--space-1)',
    },
    lg: {
      fontSize: 'var(--type-body-size)',
      lineHeight: 'var(--type-body-line)',
      padding: dot ? '0' : 'var(--space-1) var(--space-3)',
      height: dot ? '10px' : '2rem',
      minWidth: dot ? '10px' : undefined,
      gap: 'var(--space-2)',
    },
  };

  const baseStyles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const Element = isInteractive ? 'button' : 'span';

  return (
    <Element
      onClick={onClick}
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        ...baseStyles,
        ...sizeStyle,
        fontWeight: 'var(--weight-medium)',
        borderRadius: dot ? '50%' : 'var(--radius-xs)',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'all var(--dur-fast) var(--ease-standard)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...(isInteractive && {
          outline: 'none',
        }),
      }}
      {...(isInteractive && {
        type: 'button' as const,
        onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.opacity = '0.85';
          e.currentTarget.style.transform = 'scale(1.05)';
        },
        onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1)';
        },
      })}
    >
      {!dot && (
        <>
          {/* Icon */}
          {icon && (
            <span className="inline-flex items-center justify-center" style={{ width: '12px', height: '12px' }}>
              {icon}
            </span>
          )}
          {/* Content */}
          <span>{children}</span>
        </>
      )}
    </Element>
  );
}

/**
 * BadgeGroup - For grouping multiple badges
 */
export interface BadgeGroupProps {
  children: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export function BadgeGroup({ children, spacing = 'normal', className = '' }: BadgeGroupProps) {
  const spacingMap = {
    tight: 'var(--space-1)',
    normal: 'var(--space-2)',
    loose: 'var(--space-3)',
  };

  return (
    <div
      className={`inline-flex flex-wrap items-center ${className}`}
      style={{
        gap: spacingMap[spacing],
      }}
    >
      {children}
    </div>
  );
}
