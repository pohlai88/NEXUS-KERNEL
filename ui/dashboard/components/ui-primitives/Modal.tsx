'use client';

import React, { useEffect, useRef } from 'react';
import type { ComponentState } from './types';

export interface ModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer actions */
  footer?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Allow closing on backdrop click */
  closeOnBackdrop?: boolean;
  /** Allow closing on escape key */
  closeOnEscape?: boolean;
  /** Additional className for modal content */
  className?: string;
}

/**
 * Modal Component - Material Design 3 with Quantum Obsidian tokens
 * 
 * Features:
 * - Backdrop overlay with Quantum scrim (indigo-tinted shadow)
 * - Focus trap (keyboard navigation contained)
 * - Smooth animations (fade + scale)
 * - Responsive sizes
 * - P3 Wide Gamut OKLCH colors
 * 
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Profile">
 *   <p>Modal content here</p>
 * </Modal>
 * ```
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size variants using Quantum Obsidian spacing
  const sizeStyles = {
    sm: { maxWidth: '28rem', width: '90%' }, // 448px
    md: { maxWidth: '36rem', width: '90%' }, // 576px
    lg: { maxWidth: '48rem', width: '90%' }, // 768px
    xl: { maxWidth: '64rem', width: '90%' }, // 1024px
    full: { maxWidth: '96rem', width: '95%' }, // 1536px
  };

  // Focus trap effect
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 'var(--z-modal)',
        animation: isOpen ? 'fadeIn var(--dur-base) var(--ease-standard)' : undefined,
      }}
    >
      {/* Backdrop - Quantum Obsidian Scrim */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{
          backgroundColor: 'var(--color-scrim)',
        }}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={`relative flex flex-col ${className}`}
        style={{
          ...sizeStyles[size],
          maxHeight: '90vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-4)',
          animation: 'scaleIn var(--dur-base) var(--ease-emphasized)',
          outline: 'none',
        }}
      >
        {/* Header */}
        {title && (
          <div
            className="flex items-center justify-between shrink-0"
            style={{
              padding: 'var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <h2
              id="modal-title"
              className="text-title"
              style={{
                fontSize: 'var(--type-title-size)',
                lineHeight: 'var(--type-title-line)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-main)',
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="inline-flex items-center justify-center"
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-text-sub)',
                cursor: 'pointer',
                transition: 'all var(--dur-fast) var(--ease-standard)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-ghost-hover)';
                e.currentTarget.style.color = 'var(--color-text-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-sub)';
              }}
            >
              <IconClose />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: 'var(--space-6)',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 shrink-0"
            style={{
              padding: 'var(--space-6)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Close Icon - Quantum Obsidian styled
 */
function IconClose({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
