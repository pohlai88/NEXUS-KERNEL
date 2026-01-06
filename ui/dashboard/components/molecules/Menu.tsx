/**
 * Menu Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Dropdown menu with support for regular items, dividers, and headers
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IconChevronRight } from '../atoms/icons';

export interface MenuItem {
  /** Item type */
  type: 'item' | 'divider' | 'header';
  /** Item label (required for item and header types) */
  label?: string;
  /** Item icon */
  icon?: React.ReactNode;
  /** Click handler (for item type) */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Danger/destructive action */
  danger?: boolean;
  /** Submenu items (for nested menus) */
  submenu?: MenuItem[];
}

export interface MenuProps {
  /** Menu items */
  items: MenuItem[];
  /** Trigger element */
  trigger: React.ReactNode;
  /** Menu position */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Menu variant */
  variant?: 'dropdown' | 'context';
  /** Close on item click */
  closeOnClick?: boolean;
}

export function Menu({
  items,
  trigger,
  position = 'bottom-left',
  variant = 'dropdown',
  closeOnClick = true,
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    
    item.onClick?.();
    
    if (closeOnClick && item.type === 'item') {
      setIsOpen(false);
    }
  };

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': {
      top: '100%',
      left: 0,
      marginTop: 'var(--space-2)',
    },
    'bottom-right': {
      top: '100%',
      right: 0,
      marginTop: 'var(--space-2)',
    },
    'top-left': {
      bottom: '100%',
      left: 0,
      marginBottom: 'var(--space-2)',
    },
    'top-right': {
      bottom: '100%',
      right: 0,
      marginBottom: 'var(--space-2)',
    },
  };

  // Trigger container styles
  const triggerContainerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  // Menu container styles
  const menuContainerStyles: React.CSSProperties = {
    position: 'absolute',
    ...positionStyles[position],
    minWidth: '200px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: 'var(--space-2)',
    zIndex: 1000,
    fontFamily: 'var(--font-family-sans)',
    animation: 'menuSlideIn 0.15s ease-out',
  };

  // Menu item styles
  const getMenuItemStyles = (item: MenuItem): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--text-body-size)',
    color: item.danger 
      ? 'var(--color-error)' 
      : item.disabled 
        ? 'var(--color-gray-400)' 
        : 'var(--color-gray-900)',
    cursor: item.disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--radius-md)',
    transition: 'background-color 0.2s ease',
    backgroundColor: 'transparent',
    opacity: item.disabled ? 0.5 : 1,
    userSelect: 'none',
  });

  // Divider styles
  const dividerStyles: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'var(--color-gray-200)',
    margin: 'var(--space-2) 0',
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    color: 'var(--color-gray-600)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.type === 'divider') {
      return <div key={`divider-${index}`} style={dividerStyles} />;
    }

    if (item.type === 'header') {
      return (
        <div key={`header-${index}`} style={headerStyles}>
          {item.label}
        </div>
      );
    }

    return (
      <div
        key={`item-${index}`}
        style={getMenuItemStyles(item)}
        onClick={() => handleItemClick(item)}
        onMouseEnter={(e) => {
          if (!item.disabled) {
            e.currentTarget.style.backgroundColor = item.danger 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'var(--color-gray-100)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        role="menuitem"
        aria-disabled={item.disabled}
      >
        {/* Icon */}
        {item.icon && (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {item.icon}
          </div>
        )}

        {/* Label */}
        <div style={{ flex: 1 }}>
          {item.label}
        </div>

        {/* Submenu indicator */}
        {item.submenu && (
          <IconChevronRight size={16} color="var(--color-gray-400)" />
        )}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes menuSlideIn {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div style={triggerContainerStyles}>
        {/* Trigger */}
        <div ref={triggerRef} onClick={handleTriggerClick}>
          {trigger}
        </div>

        {/* Menu */}
        {isOpen && (
          <div ref={menuRef} style={menuContainerStyles} role="menu">
            {items.map((item, index) => renderMenuItem(item, index))}
          </div>
        )}
      </div>
    </>
  );
}

export default Menu;
