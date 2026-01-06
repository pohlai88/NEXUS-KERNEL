'use client';

import React from 'react';
import { IconArrowUp, IconArrowDown } from './icons';

// Stat Props Interface
export interface StatProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default';
  size?: 'default' | 'large';
  className?: string;
}

export function Stat({
  label,
  value,
  trend,
  trendValue,
  icon,
  color = 'default',
  size = 'default',
  className = '',
}: StatProps) {
  // Color mapping
  const colorMap = {
    primary: {
      bg: 'var(--color-primary-light)',
      text: 'var(--color-primary)',
      icon: 'var(--color-primary)',
    },
    success: {
      bg: 'var(--color-success-light)',
      text: 'var(--color-success)',
      icon: 'var(--color-success)',
    },
    warning: {
      bg: 'var(--color-warning-light)',
      text: 'var(--color-warning)',
      icon: 'var(--color-warning)',
    },
    error: {
      bg: 'var(--color-error-light)',
      text: 'var(--color-error)',
      icon: 'var(--color-error)',
    },
    default: {
      bg: 'var(--color-gray-100)',
      text: 'var(--color-gray-900)',
      icon: 'var(--color-gray-600)',
    },
  };

  const colors = colorMap[color];

  // Trend colors
  const trendColorMap = {
    up: 'var(--color-success)',
    down: 'var(--color-error)',
    neutral: 'var(--color-gray-600)',
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: size === 'large' ? 'var(--space-4)' : 'var(--space-3)',
    padding: size === 'large' ? 'var(--space-6)' : 'var(--space-5)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    minWidth: size === 'large' ? '280px' : '220px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: size === 'large' ? 'var(--text-body-size)' : 'var(--text-caption-size)',
    fontWeight: 500,
    color: 'var(--color-gray-600)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size === 'large' ? '48px' : '40px',
    height: size === 'large' ? '48px' : '40px',
    backgroundColor: colors.bg,
    borderRadius: 'var(--radius-md)',
    color: colors.icon,
  };

  const valueStyles: React.CSSProperties = {
    fontSize: size === 'large' ? 'var(--text-display-size)' : 'var(--text-headline-size)',
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1.2,
  };

  const trendContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 500,
    color: trend ? trendColorMap[trend] : 'var(--color-gray-600)',
  };

  const trendIconStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
  };

  return (
    <div className={className} style={containerStyles}>
      <div style={headerStyles}>
        <span style={labelStyles}>{label}</span>
        {icon && <div style={iconContainerStyles}>{icon}</div>}
      </div>
      <div style={valueStyles}>{value}</div>
      {(trend || trendValue) && (
        <div style={trendContainerStyles}>
          {trend === 'up' && <IconArrowUp style={trendIconStyles} />}
          {trend === 'down' && <IconArrowDown style={trendIconStyles} />}
          {trendValue && <span>{trendValue}</span>}
        </div>
      )}
    </div>
  );
}

// Stat Grid for multiple stats
export interface StatGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export function StatGrid({ children, columns = 4, className = '' }: StatGridProps) {
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: 'var(--space-4)',
  };

  return (
    <div className={className} style={gridStyles}>
      {children}
    </div>
  );
}

export default Stat;
