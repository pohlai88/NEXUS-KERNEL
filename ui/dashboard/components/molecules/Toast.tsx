/**
 * Toast Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Notification toast with 4 types and 3 positions
 */

'use client';

import React, { useEffect, useState } from 'react';
import { IconSuccess, IconError, IconWarning, IconInfo, IconClose } from '../atoms/icons';

export interface ToastProps {
  /** Toast type */
  type: 'success' | 'error' | 'warning' | 'info';
  /** Toast message */
  message: string;
  /** Toast description (optional) */
  description?: string;
  /** Position on screen */
  position?: 'top-right' | 'bottom-right' | 'top-center';
  /** Auto dismiss duration in ms (0 = no auto dismiss) */
  duration?: number;
  /** Close handler */
  onClose?: () => void;
  /** Show close button */
  showCloseButton?: boolean;
}

export function Toast({
  type,
  message,
  description,
  position = 'top-right',
  duration = 5000,
  onClose,
  showCloseButton = true,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  // Type configurations
  const typeConfig = {
    success: {
      icon: <IconSuccess size={24} color="#10B981" />,
      backgroundColor: '#ECFDF5',
      borderColor: '#10B981',
      iconColor: '#10B981',
      textColor: '#065F46',
    },
    error: {
      icon: <IconError size={24} color="#EF4444" />,
      backgroundColor: '#FEF2F2',
      borderColor: '#EF4444',
      iconColor: '#EF4444',
      textColor: '#991B1B',
    },
    warning: {
      icon: <IconWarning size={24} color="#F59E0B" />,
      backgroundColor: '#FFFBEB',
      borderColor: '#F59E0B',
      iconColor: '#F59E0B',
      textColor: '#92400E',
    },
    info: {
      icon: <IconInfo size={24} color="#3B82F6" />,
      backgroundColor: '#EFF6FF',
      borderColor: '#3B82F6',
      iconColor: '#3B82F6',
      textColor: '#1E40AF',
    },
  };

  const config = typeConfig[type];

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': {
      top: 'var(--space-6)',
      right: 'var(--space-6)',
    },
    'bottom-right': {
      bottom: 'var(--space-6)',
      right: 'var(--space-6)',
    },
    'top-center': {
      top: 'var(--space-6)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
  };

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    ...positionStyles[position],
    minWidth: '320px',
    maxWidth: '480px',
    backgroundColor: config.backgroundColor,
    border: `1px solid ${config.borderColor}`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-3)',
    fontFamily: 'var(--font-family-sans)',
    animation: isExiting 
      ? 'toastSlideOut 0.3s ease-in forwards' 
      : 'toastSlideIn 0.3s ease-out',
  };

  // Content styles
  const contentStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  };

  // Message styles
  const messageStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    color: config.textColor,
    lineHeight: 'var(--text-body-line-height)',
  };

  // Description styles
  const descriptionStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    color: config.textColor,
    lineHeight: 'var(--text-caption-line-height)',
    opacity: 0.8,
  };

  // Close button styles
  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    transition: 'opacity 0.2s ease',
  };

  return (
    <>
      <style>
        {`
          @keyframes toastSlideIn {
            from {
              opacity: 0;
              transform: ${position === 'top-center' ? 'translate(-50%, -20px)' : 'translateX(20px)'};
            }
            to {
              opacity: 1;
              transform: ${position === 'top-center' ? 'translate(-50%, 0)' : 'translateX(0)'};
            }
          }
          
          @keyframes toastSlideOut {
            from {
              opacity: 1;
              transform: ${position === 'top-center' ? 'translate(-50%, 0)' : 'translateX(0)'};
            }
            to {
              opacity: 0;
              transform: ${position === 'top-center' ? 'translate(-50%, -20px)' : 'translateX(20px)'};
            }
          }
        `}
      </style>

      <div style={containerStyles} role="alert" aria-live="polite">
        {/* Icon */}
        <div style={{ flexShrink: 0 }}>
          {config.icon}
        </div>

        {/* Content */}
        <div style={contentStyles}>
          <div style={messageStyles}>{message}</div>
          {description && (
            <div style={descriptionStyles}>{description}</div>
          )}
        </div>

        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            style={closeButtonStyles}
            aria-label="Close notification"
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
          >
            <IconClose size={20} color={config.textColor} />
          </button>
        )}
      </div>
    </>
  );
}

/**
 * ToastContainer Component
 * Container for managing multiple toasts
 */
export interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}

export default Toast;
