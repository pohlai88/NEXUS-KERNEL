/**
 * UI Primitives - Shared Types
 * Data Table v3 Interactive Components
 * 
 * Material Design 3 components converted to Quantum Obsidian design system
 */

export type ComponentState = 'default' | 'hover' | 'focus' | 'disabled';
export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
export type InputIcon = 'none' | 'left' | 'right' | 'left-right' | 'addon';
export type TagColor = 'gray' | 'green' | 'orange' | 'red' | 'indigo' | 'blue';
export type DropdownType = 'dropdown' | 'select-menu';
export type CheckboxType = 'unchecked' | 'checked' | 'indeterminate';

/**
 * Quantum Obsidian Color Mappings
 * Maps Material Design colors to design tokens
 */
export const colorTokens = {
  // Primary colors
  indigo: {
    500: 'var(--color-primary)',        // #6366F1 (close to Figma #5E5ADB)
    600: 'var(--color-primary-dark)',
    300: 'var(--color-primary-light)',
    0: 'var(--color-primary-bg)',
  },
  
  // Grayscale
  gray: {
    900: 'var(--color-text)',            // #171C26
    700: 'var(--color-text-sub)',        // #464F60
    500: 'var(--color-text-muted)',      // #687182
    400: 'var(--color-text-disabled)',   // #868FA0
    300: 'var(--color-border-light)',    // #A1A9B8
    100: 'var(--color-bg-secondary)',    // #D5DBE5
    50: 'var(--color-bg-tertiary)',      // #E9EDF5
    0: 'var(--color-bg)',                // #F7F9FC
  },
  
  // Status colors
  success: 'var(--color-success)',       // Green
  warning: 'var(--color-warning)',       // Orange
  error: 'var(--color-error)',           // Red
  info: 'var(--color-info)',             // Blue
  
  // Base
  white: '#FFFFFF',
} as const;

/**
 * Quantum Obsidian Spacing
 */
export const spacing = {
  1: 'var(--space-1)',   // 4px
  2: 'var(--space-2)',   // 8px
  3: 'var(--space-3)',   // 12px
  4: 'var(--space-4)',   // 16px
  6: 'var(--space-6)',   // 24px
  8: 'var(--space-8)',   // 32px
} as const;

/**
 * Typography Mappings
 */
export const typography = {
  display: 'text-display',
  headline: 'text-headline',
  title: 'text-title',
  body: 'text-body',
  caption: 'text-caption',
  micro: 'text-micro',
  label: 'text-label',
  overline: 'text-overline',
} as const;

/**
 * Shadow/Elevation System
 * Material Design elevations converted to Quantum Obsidian
 */
export const elevations = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // Custom button elevations (from Figma)
  button: {
    default: '0 1px 1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(70, 79, 96, 0.16)',
    hover: '0 1px 1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(70, 79, 96, 0.32)',
    focus: '0 1px 1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(70, 79, 96, 0.32), 0 0 0 4px rgba(94, 90, 219, 0.4)',
    disabled: '0 0 0 1px rgba(70, 79, 96, 0.2)',
  },
  
  input: {
    default: '0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(134, 143, 160, 0.16)',
    hover: '0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(134, 143, 160, 0.4)',
    focus: '0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(134, 143, 160, 0.32), 0 0 0 4px rgba(94, 90, 219, 0.4)',
    disabled: '0 0 0 1px rgba(134, 143, 160, 0.24)',
  },
} as const;

/**
 * Base Component Props
 */
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

export interface StateProps {
  state?: ComponentState;
}

export interface LabelProps {
  label?: string;
  required?: boolean;
}
