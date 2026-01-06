'use client';

import React, { useState, useRef, useEffect } from 'react';

// Popover Props Interface
export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  triggerMode?: 'click' | 'hover';
  closeOnOutsideClick?: boolean;
  offset?: number;
  className?: string;
  contentClassName?: string;
}

export function Popover({
  trigger,
  content,
  position = 'bottom',
  triggerMode = 'click',
  closeOnOutsideClick = true,
  offset = 8,
  className = '',
  contentClassName = '',
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnOutsideClick]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleTriggerClick = () => {
    if (triggerMode === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (triggerMode === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (triggerMode === 'hover') {
      setIsOpen(false);
    }
  };

  // Position styles
  const getPopoverPosition = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: `${offset}px`,
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: `${offset}px`,
        };
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: `${offset}px`,
        };
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: `${offset}px`,
        };
      default:
        return baseStyles;
    }
  };

  // Arrow position
  const getArrowPosition = (): React.CSSProperties => {
    const arrowBase: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    const arrowSize = 6;
    const arrowColor = 'var(--color-gray-900)';

    switch (position) {
      case 'top':
        return {
          ...arrowBase,
          bottom: `-${arrowSize}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: `${arrowColor} transparent transparent transparent`,
        };
      case 'bottom':
        return {
          ...arrowBase,
          top: `-${arrowSize}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent ${arrowColor} transparent`,
        };
      case 'left':
        return {
          ...arrowBase,
          right: `-${arrowSize}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent transparent ${arrowColor}`,
        };
      case 'right':
        return {
          ...arrowBase,
          left: `-${arrowSize}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: `transparent ${arrowColor} transparent transparent`,
        };
      default:
        return arrowBase;
    }
  };

  const popoverContentStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-gray-900)',
    color: 'var(--color-white)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '200px',
    maxWidth: '400px',
    fontSize: 'var(--text-body-size)',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
  };

  return (
    <div
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={triggerRef} onClick={handleTriggerClick} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      {isOpen && (
        <div ref={popoverRef} style={{ ...getPopoverPosition() }}>
          <div className={contentClassName} style={popoverContentStyles}>
            {content}
            <div style={getArrowPosition()} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Popover;
