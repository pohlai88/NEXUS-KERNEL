/**
 * Breadcrumb Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Hierarchical navigation trail showing user's location
 */

'use client';

import React from 'react';
import { IconChevronRight, IconHome } from '../atoms/icons';

export interface BreadcrumbItem {
  /** Item label */
  label: string;
  /** Click handler (if clickable) */
  onClick?: () => void;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional href (for Next.js Link) */
  href?: string;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator icon */
  separator?: React.ReactNode;
  /** Show home icon on first item */
  showHomeIcon?: boolean;
  /** Maximum items to show (collapse middle items) */
  maxItems?: number;
  /** Size variant */
  size?: 'default' | 'small';
}

export function Breadcrumb({
  items,
  separator = <IconChevronRight size={16} color="var(--color-gray-400)" />,
  showHomeIcon = false,
  maxItems,
  size = 'default',
}: BreadcrumbProps) {
  const fontSize = size === 'small' ? 'var(--text-caption-size)' : 'var(--text-body-size)';
  
  // Collapse items if maxItems is set
  let displayItems = items;
  if (maxItems && items.length > maxItems) {
    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(-(maxItems - 1));
    displayItems = [
      ...firstItems,
      { label: '...', onClick: undefined },
      ...lastItems,
    ];
  }

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-family-sans)',
    fontSize,
  };

  const itemStyles = (isLast: boolean, isClickable: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    color: isLast ? 'var(--color-gray-900)' : 'var(--color-gray-600)',
    fontWeight: isLast ? 500 : 400,
    cursor: isClickable ? 'pointer' : 'default',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    ...(isClickable && {
      ':hover': {
        color: 'var(--color-primary)',
      },
    }),
  });

  const separatorStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  return (
    <nav aria-label="Breadcrumb" style={containerStyles}>
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const isFirst = index === 0;
        const isClickable = !!item.onClick || !!item.href;
        const isEllipsis = item.label === '...';

        return (
          <React.Fragment key={index}>
            {/* Breadcrumb Item */}
            {isClickable && !isLast ? (
              <button
                onClick={item.onClick}
                style={{
                  ...itemStyles(isLast, isClickable),
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
                aria-current={isLast ? 'page' : undefined}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-gray-600)';
                }}
              >
                {isFirst && showHomeIcon && <IconHome size={size === 'small' ? 14 : 16} color="currentColor" />}
                {item.icon && !showHomeIcon && item.icon}
                <span>{item.label}</span>
              </button>
            ) : (
              <span
                style={itemStyles(isLast, false)}
                aria-current={isLast ? 'page' : undefined}
              >
                {isFirst && showHomeIcon && <IconHome size={size === 'small' ? 14 : 16} color="currentColor" />}
                {item.icon && !showHomeIcon && !isEllipsis && item.icon}
                <span>{item.label}</span>
              </span>
            )}

            {/* Separator */}
            {!isLast && (
              <span style={separatorStyles} aria-hidden="true">
                {separator}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
