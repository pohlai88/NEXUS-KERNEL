'use client';

import React from 'react';

// List Item Interface
export interface ListItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  secondaryText?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export function ListItem({
  children,
  icon,
  secondaryText,
  onClick,
  selected = false,
  disabled = false,
  divider = false,
}: ListItemProps) {
  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    cursor: onClick && !disabled ? 'pointer' : 'default',
    backgroundColor: selected ? 'var(--color-primary-light)' : 'transparent',
    borderBottom: divider ? '1px solid var(--color-gray-200)' : 'none',
    transition: 'background-color 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const iconStyles: React.CSSProperties = {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    color: selected ? 'var(--color-primary)' : 'var(--color-gray-600)',
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  };

  const primaryTextStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    fontWeight: selected ? 600 : 400,
    color: selected ? 'var(--color-primary)' : 'var(--color-gray-900)',
  };

  const secondaryTextStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-600)',
  };

  return (
    <li
      style={itemStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick && !disabled && !selected) {
          e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !disabled && !selected) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {icon && <div style={iconStyles}>{icon}</div>}
      <div style={contentStyles}>
        <div style={primaryTextStyles}>{children}</div>
        {secondaryText && <div style={secondaryTextStyles}>{secondaryText}</div>}
      </div>
    </li>
  );
}

// List Props Interface
export interface ListProps {
  children: React.ReactNode;
  variant?: 'unordered' | 'ordered';
  dense?: boolean;
  className?: string;
}

export function List({
  children,
  variant = 'unordered',
  dense = false,
  className = '',
}: ListProps) {
  const listStyles: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: dense ? 'var(--space-2) 0' : 'var(--space-3) 0',
    backgroundColor: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
  };

  const Component = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <Component className={className} style={listStyles}>
      {children}
    </Component>
  );
}

// Ordered List with Numbers
export interface OrderedListProps {
  items: string[];
  dense?: boolean;
  className?: string;
}

export function OrderedList({ items, dense = false, className = '' }: OrderedListProps) {
  const listStyles: React.CSSProperties = {
    margin: 0,
    padding: dense ? 'var(--space-2) 0 var(--space-2) var(--space-8)' : 'var(--space-3) 0 var(--space-3) var(--space-10)',
    listStylePosition: 'outside',
    backgroundColor: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
  };

  const itemStyles: React.CSSProperties = {
    padding: dense ? 'var(--space-1) var(--space-3)' : 'var(--space-2) var(--space-4)',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-900)',
    lineHeight: 1.6,
  };

  return (
    <ol className={className} style={listStyles}>
      {items.map((item, index) => (
        <li key={index} style={itemStyles}>
          {item}
        </li>
      ))}
    </ol>
  );
}

// Unordered List with Bullets
export interface UnorderedListProps {
  items: string[];
  dense?: boolean;
  className?: string;
}

export function UnorderedList({ items, dense = false, className = '' }: UnorderedListProps) {
  const listStyles: React.CSSProperties = {
    margin: 0,
    padding: dense ? 'var(--space-2) 0 var(--space-2) var(--space-8)' : 'var(--space-3) 0 var(--space-3) var(--space-10)',
    listStyleType: 'disc',
    listStylePosition: 'outside',
    backgroundColor: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
  };

  const itemStyles: React.CSSProperties = {
    padding: dense ? 'var(--space-1) var(--space-3)' : 'var(--space-2) var(--space-4)',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-900)',
    lineHeight: 1.6,
  };

  return (
    <ul className={className} style={listStyles}>
      {items.map((item, index) => (
        <li key={index} style={itemStyles}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default List;
