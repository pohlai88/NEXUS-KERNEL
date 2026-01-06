'use client';

import React from 'react';
import { IconArrowUp, IconArrowDown } from '../atoms/icons';

// KPI Props Interface
export interface KPIProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
  status?: 'success' | 'warning' | 'error' | 'default';
  showProgress?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function KPI({
  title,
  current,
  target,
  unit = '',
  trend,
  trendPercentage,
  status = 'default',
  showProgress = true,
  icon,
  className = '',
}: KPIProps) {
  const percentage = (current / target) * 100;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Status colors
  const statusColorMap = {
    success: {
      bg: 'var(--color-success-light)',
      text: 'var(--color-success)',
      progress: 'var(--color-success)',
    },
    warning: {
      bg: 'var(--color-warning-light)',
      text: 'var(--color-warning)',
      progress: 'var(--color-warning)',
    },
    error: {
      bg: 'var(--color-error-light)',
      text: 'var(--color-error)',
      progress: 'var(--color-error)',
    },
    default: {
      bg: 'var(--color-primary-light)',
      text: 'var(--color-primary)',
      progress: 'var(--color-primary)',
    },
  };

  const colors = statusColorMap[status];

  // Trend colors
  const trendColorMap = {
    up: 'var(--color-success)',
    down: 'var(--color-error)',
    neutral: 'var(--color-gray-600)',
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    padding: 'var(--space-6)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    minWidth: '300px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
  };

  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: colors.bg,
    borderRadius: 'var(--radius-md)',
    color: colors.text,
  };

  const valuesContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--space-3)',
  };

  const currentValueStyles: React.CSSProperties = {
    fontSize: 'var(--text-display-size)',
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1,
  };

  const targetValueStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    fontWeight: 500,
    color: 'var(--color-gray-600)',
  };

  const unitStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    fontWeight: 500,
    color: 'var(--color-gray-600)',
  };

  const progressContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  };

  const progressBarBgStyles: React.CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--color-gray-200)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  };

  const progressBarFillStyles: React.CSSProperties = {
    height: '100%',
    width: `${clampedPercentage}%`,
    backgroundColor: colors.progress,
    borderRadius: 'var(--radius-full)',
    transition: 'width 0.3s ease',
  };

  const progressTextStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-600)',
  };

  const trendContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    color: trend ? trendColorMap[trend] : 'var(--color-gray-600)',
  };

  const trendIconStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
  };

  return (
    <div className={className} style={containerStyles}>
      <div style={headerStyles}>
        <span style={titleStyles}>{title}</span>
        {icon && <div style={iconContainerStyles}>{icon}</div>}
      </div>

      <div style={valuesContainerStyles}>
        <span style={currentValueStyles}>
          {current.toLocaleString()}
          {unit && <span style={unitStyles}> {unit}</span>}
        </span>
        <span style={targetValueStyles}>
          / {target.toLocaleString()}
          {unit && <span> {unit}</span>}
        </span>
      </div>

      {showProgress && (
        <div style={progressContainerStyles}>
          <div style={progressBarBgStyles}>
            <div style={progressBarFillStyles} />
          </div>
          <div style={progressTextStyles}>
            <span>{clampedPercentage.toFixed(1)}% Complete</span>
            {(trend || trendPercentage !== undefined) && (
              <div style={trendContainerStyles}>
                {trend === 'up' && <IconArrowUp style={trendIconStyles} />}
                {trend === 'down' && <IconArrowDown style={trendIconStyles} />}
                {trendPercentage !== undefined && <span>{trendPercentage > 0 ? '+' : ''}{trendPercentage}%</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// KPI Grid for multiple KPIs
export interface KPIGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export function KPIGrid({ children, columns = 3, className = '' }: KPIGridProps) {
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

export default KPI;
