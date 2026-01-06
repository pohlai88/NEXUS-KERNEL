'use client';

import React from 'react';

// Divider Props Interface
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
  spacing?: 'none' | 'small' | 'medium' | 'large';
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 1,
  color = 'var(--color-gray-200)',
  spacing = 'medium',
  label,
  labelPosition = 'center',
  className = '',
}: DividerProps) {
  // Spacing mapping
  const spacingMap = {
    none: '0',
    small: 'var(--space-2)',
    medium: 'var(--space-4)',
    large: 'var(--space-6)',
  };

  const spacingValue = spacingMap[spacing];

  // Horizontal Divider
  if (orientation === 'horizontal') {
    if (label) {
      const containerStyles: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        margin: `${spacingValue} 0`,
      };

      const lineStyles: React.CSSProperties = {
        flex: 1,
        height: `${thickness}px`,
        backgroundColor: color,
        borderStyle: variant,
        borderWidth: variant !== 'solid' ? `${thickness}px` : 0,
        borderColor: variant !== 'solid' ? color : 'transparent',
        background: variant === 'solid' ? color : 'transparent',
      };

      const labelStyles: React.CSSProperties = {
        fontSize: 'var(--text-caption-size)',
        fontWeight: 500,
        color: 'var(--color-gray-600)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
      };

      return (
        <div className={className} style={containerStyles}>
          {labelPosition !== 'right' && <div style={lineStyles} />}
          <span style={labelStyles}>{label}</span>
          {labelPosition !== 'left' && <div style={lineStyles} />}
        </div>
      );
    }

    const horizontalStyles: React.CSSProperties = {
      width: '100%',
      height: variant === 'solid' ? `${thickness}px` : 0,
      backgroundColor: variant === 'solid' ? color : 'transparent',
      borderTop: variant !== 'solid' ? `${thickness}px ${variant} ${color}` : 'none',
      margin: `${spacingValue} 0`,
    };

    return <hr className={className} style={horizontalStyles} />;
  }

  // Vertical Divider
  const verticalStyles: React.CSSProperties = {
    width: variant === 'solid' ? `${thickness}px` : 0,
    height: '100%',
    backgroundColor: variant === 'solid' ? color : 'transparent',
    borderLeft: variant !== 'solid' ? `${thickness}px ${variant} ${color}` : 'none',
    margin: `0 ${spacingValue}`,
    display: 'inline-block',
  };

  return <div className={className} style={verticalStyles} />;
}

export default Divider;
