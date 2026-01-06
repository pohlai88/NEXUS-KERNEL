'use client';

import React from 'react';
import type { ButtonVariant, ComponentState } from './types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Visual state (controlled externally for demos, otherwise use CSS states) */
  state?: ComponentState;
  /** Icon to display on the left */
  iconLeft?: React.ReactNode;
  /** Icon to display on the right */
  iconRight?: React.ReactNode;
  /** Button text content */
  children?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button Component - Material Design 3 with Quantum Obsidian tokens
 * 
 * 36 Variants:
 * - 3 types: Primary, Secondary, Destructive
 * - 4 states: Default, Hover, Focus, Disabled
 * - 3 icon configs: None, Left, Right (+ Both)
 * 
 * @example
 * ```tsx
 * <Button variant="primary">Save</Button>
 * <Button variant="secondary" iconLeft={<IconCheck />}>Done</Button>
 * <Button variant="destructive" disabled>Delete</Button>
 * ```
 */
export default function Button({
  variant = 'primary',
  state,
  iconLeft,
  iconRight,
  children,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || state === 'disabled';
  const hasIcon = iconLeft || iconRight;
  const iconOnly = hasIcon && !children;

  // Variant-specific styles using Quantum Obsidian tokens
  const variantStyles = {
    primary: {
      default: {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 1px rgba(70, 79, 96, 0.16)',
      },
      hover: {
        backgroundColor: '#4945C4', // Indigo/600 - darker primary
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12), 0px 0px 0px 1px rgba(70, 79, 96, 0.2)',
      },
      focus: {
        backgroundColor: 'var(--color-primary)',
        boxShadow: '0px 0px 0px 3px rgba(94, 90, 219, 0.3), 0px 1px 1px 0px rgba(0, 0, 0, 0.1)',
      },
      disabled: {
        backgroundColor: 'var(--color-neutral-100)',
        color: 'var(--color-neutral-400)',
        border: 'none',
        boxShadow: 'none',
      },
    },
    secondary: {
      default: {
        backgroundColor: 'white',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.1)',
      },
      hover: {
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-neutral-400)',
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)',
      },
      focus: {
        backgroundColor: 'white',
        boxShadow: '0px 0px 0px 3px rgba(94, 90, 219, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.1)',
      },
      disabled: {
        backgroundColor: 'var(--color-neutral-50)',
        color: 'var(--color-neutral-400)',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: 'none',
      },
    },
    destructive: {
      default: {
        backgroundColor: 'var(--color-error)',
        color: 'white',
        border: 'none',
        boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 1px rgba(239, 68, 68, 0.2)',
      },
      hover: {
        backgroundColor: '#DC2626', // Red/600 - darker error
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12), 0px 0px 0px 1px rgba(239, 68, 68, 0.3)',
      },
      focus: {
        backgroundColor: 'var(--color-error)',
        boxShadow: '0px 0px 0px 3px rgba(239, 68, 68, 0.3), 0px 1px 1px 0px rgba(0, 0, 0, 0.1)',
      },
      disabled: {
        backgroundColor: 'var(--color-neutral-100)',
        color: 'var(--color-neutral-400)',
        border: 'none',
        boxShadow: 'none',
      },
    },
  };

  // Get current state styles (default, hover, focus, or disabled)
  const currentState = isDisabled ? 'disabled' : state || 'default';
  const baseStyles = variantStyles[variant][currentState];

  // Base button classes and styles
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 cursor-pointer select-none';
  
  // Padding based on content
  const paddingStyle = iconOnly 
    ? { padding: 'var(--space-2)' } // Icon-only: 8px all around
    : { padding: 'var(--space-2) var(--space-3)' }; // With text: 8px 12px

  // Width
  const widthStyle = fullWidth ? { width: '100%' } : {};

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${baseClasses} ${isDisabled ? 'cursor-not-allowed' : ''} ${className}`}
      style={{
        ...baseStyles,
        ...paddingStyle,
        ...widthStyle,
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '0.02em',
        fontFamily: 'var(--font-body)',
        // Prevent default focus outline (we have custom focus styles)
        outline: 'none',
      }}
      {...props}
    >
      {/* Left Icon */}
      {iconLeft && (
        <span className="inline-flex items-center justify-center" style={{ width: '16px', height: '16px' }}>
          {iconLeft}
        </span>
      )}

      {/* Text Content */}
      {children && <span>{children}</span>}

      {/* Right Icon */}
      {iconRight && (
        <span className="inline-flex items-center justify-center" style={{ width: '16px', height: '16px' }}>
          {iconRight}
        </span>
      )}
    </button>
  );
}

/**
 * Icon Components for Button
 * Extracted from Figma designs, converted to React components
 */

export function IconCheck({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M13.3337 4L6.00033 11.3333L2.66699 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPlus({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M8 3.33337V12.6667M3.33333 8H12.6667"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconArrowRight({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M3.33333 8H12.6667M12.6667 8L8 3.33337M12.6667 8L8 12.6667"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconTrash({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M2 4H3.33333M3.33333 4H14M3.33333 4V13.3333C3.33333 13.687 3.47381 14.0261 3.72386 14.2761C3.97391 14.5262 4.31304 14.6667 4.66667 14.6667H11.3333C11.687 14.6667 12.0261 14.5262 12.2761 14.2761C12.5262 14.0261 12.6667 13.687 12.6667 13.3333V4H3.33333ZM5.33333 4V2.66667C5.33333 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDownload({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconEdit({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M11.3333 2.00004C11.5084 1.82494 11.7163 1.68605 11.9451 1.59129C12.1739 1.49653 12.4191 1.44775 12.6666 1.44775C12.9142 1.44775 13.1594 1.49653 13.3882 1.59129C13.617 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.383 14.4087 2.61182C14.5035 2.84063 14.5523 3.08581 14.5523 3.33337C14.5523 3.58094 14.5035 3.82612 14.4087 4.05493C14.314 4.28375 14.1751 4.49162 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
