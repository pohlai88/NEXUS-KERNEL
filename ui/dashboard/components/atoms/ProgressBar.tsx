'use client';

import React from 'react';

// ProgressBar Props Interface
export interface ProgressBarProps {
  value?: number; // 0-100 for determinate, undefined for indeterminate
  variant?: 'linear' | 'circular';
  size?: 'default' | 'small';
  showLabel?: boolean;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function ProgressBar({
  value,
  variant = 'linear',
  size = 'default',
  showLabel = false,
  label,
  color = 'primary',
  className = '',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value || 0));
  const isIndeterminate = value === undefined || value === null;

  // Color mapping
  const colorMap = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
  };

  const backgroundColor = colorMap[color];

  // Linear Progress Bar
  if (variant === 'linear') {
    const height = size === 'small' ? '4px' : '8px';

    const containerStyles: React.CSSProperties = {
      width: '100%',
      height,
      backgroundColor: 'var(--color-gray-200)',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      position: 'relative',
    };

    const barStyles: React.CSSProperties = {
      height: '100%',
      backgroundColor,
      borderRadius: 'var(--radius-full)',
      transition: isIndeterminate ? 'none' : 'width 0.3s ease',
      width: isIndeterminate ? '30%' : `${clampedValue}%`,
    };

    const indeterminateStyles: React.CSSProperties = isIndeterminate
      ? {
          animation: 'progressIndeterminate 1.5s ease-in-out infinite',
          position: 'absolute',
          left: 0,
        }
      : {};

    return (
      <div className={className}>
        {showLabel && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--text-caption-size)',
              color: 'var(--color-gray-700)',
            }}
          >
            <span>{label || 'Progress'}</span>
            {!isIndeterminate && <span>{clampedValue}%</span>}
          </div>
        )}
        <div style={containerStyles}>
          <div style={{ ...barStyles, ...indeterminateStyles }} />
        </div>
        <style jsx>{`
          @keyframes progressIndeterminate {
            0% {
              left: -30%;
            }
            100% {
              left: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  // Circular Progress Bar
  if (variant === 'circular') {
    const circleSize = size === 'small' ? 40 : 80;
    const strokeWidth = size === 'small' ? 4 : 6;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate ? 0 : circumference - (clampedValue / 100) * circumference;

    const svgStyles: React.CSSProperties = {
      width: circleSize,
      height: circleSize,
      transform: 'rotate(-90deg)',
    };

    const circleBackgroundStyles: React.CSSProperties = {
      fill: 'none',
      stroke: 'var(--color-gray-200)',
      strokeWidth,
    };

    const circleProgressStyles: React.CSSProperties = {
      fill: 'none',
      stroke: backgroundColor,
      strokeWidth,
      strokeLinecap: 'round',
      strokeDasharray: circumference,
      strokeDashoffset: offset,
      transition: isIndeterminate ? 'none' : 'stroke-dashoffset 0.3s ease',
    };

    const indeterminateCircleStyles: React.CSSProperties = isIndeterminate
      ? {
          animation: 'progressCircularIndeterminate 1.5s linear infinite',
        }
      : {};

    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <svg style={svgStyles}>
            <circle cx={circleSize / 2} cy={circleSize / 2} r={radius} style={circleBackgroundStyles} />
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              style={{ ...circleProgressStyles, ...indeterminateCircleStyles }}
            />
          </svg>
          {showLabel && !isIndeterminate && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(90deg)',
                fontSize: size === 'small' ? 'var(--text-caption-size)' : 'var(--text-body-size)',
                fontWeight: 600,
                color: 'var(--color-gray-900)',
              }}
            >
              {clampedValue}%
            </div>
          )}
        </div>
        {label && (
          <span
            style={{
              fontSize: 'var(--text-caption-size)',
              color: 'var(--color-gray-700)',
            }}
          >
            {label}
          </span>
        )}
        <style jsx>{`
          @keyframes progressCircularIndeterminate {
            0% {
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 100, 200;
              stroke-dashoffset: -50;
            }
            100% {
              stroke-dasharray: 100, 200;
              stroke-dashoffset: -150;
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
}

export default ProgressBar;
