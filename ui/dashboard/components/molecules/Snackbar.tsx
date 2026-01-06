'use client';

import React, { useEffect, useState } from 'react';
import { IconCheck, IconError, IconWarning, IconInfo, IconClose } from '../atoms/icons';

// Snackbar Props Interface
export interface SnackbarProps {
  message: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  position?: 'bottom-left' | 'bottom-center' | 'bottom-right';
  open: boolean;
  onClose?: () => void;
  autoHideDuration?: number; // milliseconds, 0 = no auto-hide
  action?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function Snackbar({
  message,
  variant = 'default',
  position = 'bottom-left',
  open,
  onClose,
  autoHideDuration = 5000,
  action,
  showIcon = true,
  className = '',
}: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    setIsVisible(open);
  }, [open]);

  // Auto-hide timer
  useEffect(() => {
    if (!isVisible || autoHideDuration === 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [isVisible, autoHideDuration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for exit animation
    }
  };

  // Variant colors and icons
  const variantConfig = {
    default: {
      backgroundColor: 'var(--color-gray-800)',
      icon: null,
    },
    success: {
      backgroundColor: 'var(--color-success)',
      icon: <IconCheck />,
    },
    error: {
      backgroundColor: 'var(--color-error)',
      icon: <IconError />,
    },
    warning: {
      backgroundColor: 'var(--color-warning)',
      icon: <IconWarning />,
    },
    info: {
      backgroundColor: 'var(--color-info)',
      icon: <IconInfo />,
    },
  };

  const config = variantConfig[variant];

  // Position styles
  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      bottom: '24px',
      zIndex: 1400,
    };

    switch (position) {
      case 'bottom-left':
        return { ...baseStyles, left: '24px' };
      case 'bottom-center':
        return { ...baseStyles, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':
        return { ...baseStyles, right: '24px' };
      default:
        return baseStyles;
    }
  };

  const snackbarStyles: React.CSSProperties = {
    ...getPositionStyles(),
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    backgroundColor: config.backgroundColor,
    color: 'var(--color-white)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '288px',
    maxWidth: '568px',
    fontSize: 'var(--text-body-size)',
    opacity: isVisible ? 1 : 0,
    transform: `translateY(${isVisible ? 0 : '20px'})`,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    pointerEvents: isVisible ? 'auto' : 'none',
  };

  const iconStyles: React.CSSProperties = {
    flexShrink: 0,
    width: '20px',
    height: '20px',
  };

  const messageStyles: React.CSSProperties = {
    flex: 1,
    fontSize: 'var(--text-body-size)',
    lineHeight: 1.5,
  };

  const closeButtonStyles: React.CSSProperties = {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    color: 'var(--color-white)',
    cursor: 'pointer',
    padding: 'var(--space-1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    opacity: 0.8,
    transition: 'opacity 0.2s ease',
  };

  const actionStyles: React.CSSProperties = {
    flexShrink: 0,
    marginLeft: 'var(--space-2)',
  };

  if (!isVisible && !open) return null;

  return (
    <div className={className} style={snackbarStyles}>
      {showIcon && config.icon && <div style={iconStyles}>{config.icon}</div>}
      <div style={messageStyles}>{message}</div>
      {action && <div style={actionStyles}>{action}</div>}
      {onClose && (
        <button
          onClick={handleClose}
          style={closeButtonStyles}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
          aria-label="Close"
        >
          <IconClose />
        </button>
      )}
    </div>
  );
}

// Snackbar Manager Hook (Optional)
export function useSnackbar() {
  const [snackbars, setSnackbars] = useState<
    Array<{ id: string; message: string; variant?: SnackbarProps['variant'] }>
  >([]);

  const showSnackbar = (
    message: string,
    variant: SnackbarProps['variant'] = 'default'
  ) => {
    const id = Date.now().toString();
    setSnackbars((prev) => [...prev, { id, message, variant }]);
  };

  const hideSnackbar = (id: string) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  };

  return { snackbars, showSnackbar, hideSnackbar };
}

export default Snackbar;
