/**
 * StatusIndicator Helper
 * 
 * Simple helper function to get AIBOS CSS classes for status indicators
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
 * Get AIBOS CSS classes for status indicator
 * Returns space-separated class string for use in className
 */
export function getStatusClasses(variant: StatusVariant): string {
  const variantMap = {
    success: 'na-status ok',
    error: 'na-status bad',
    warning: 'na-status warn',
    pending: 'na-status pending',
  };
  return variantMap[variant];
}

/**
 * Simple StatusIndicator component using pure CSS classes
 * No React component overhead - just HTML with AIBOS classes
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

