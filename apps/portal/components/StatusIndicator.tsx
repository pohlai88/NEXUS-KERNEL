/**
 * StatusIndicator Helper
 * 
 * Simple helper function to get Nexus CSS classes for status indicators
 * Uses pure CSS classes - no React component overhead
 * 
 * @example
 * ```tsx
 * <span className={getStatusClasses('success')}>Complete</span>
 * <span className={getStatusClasses('error')}>Failed</span>
 * ```
 */

export type StatusVariant = 'success' | 'error' | 'warning' | 'pending';

/**
 * Get Nexus Design System CSS classes for status indicator
 * Returns space-separated class string for use in className
 */
export function getStatusClasses(variant: StatusVariant): string {
  const variantMap = {
    success: 'badge-success',
    error: 'badge-danger',
    warning: 'badge-warning',
    pending: 'badge-neutral',
  };
  return variantMap[variant];
}

/**
 * Simple StatusIndicator component using pure CSS classes
 * No React component overhead - just HTML with Nexus Design System classes
 */
export function StatusIndicator({ 
  variant, 
  label 
}: { 
  variant: StatusVariant; 
  label: string;
}) {
  return (
    <span className={getStatusClasses(variant)} role="status" aria-label={`Status: ${label}`}>
      {label}
    </span>
  );
}

