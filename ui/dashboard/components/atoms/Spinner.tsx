/**
 * Spinner Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Loading indicator with three size variants
 */

'use client';

import React from 'react';

export interface SpinnerProps {
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Color variant */
  color?: 'primary' | 'white' | 'gray';
  /** Optional className for additional styling */
  className?: string;
}

export function Spinner({ 
  size = 'medium',
  color = 'primary',
  className = '' 
}: SpinnerProps) {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 48
  };

  const colorMap = {
    primary: 'var(--color-primary)',
    white: '#FFFFFF',
    gray: 'var(--color-gray-500)'
  };

  const spinnerSize = sizeMap[size];
  const spinnerColor = colorMap[color];

  return (
    <div
      className={className}
      style={{
        display: 'inline-block',
        width: spinnerSize,
        height: spinnerSize
      }}
      role="status"
      aria-label="Loading"
    >
      <svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'spin 1s linear infinite'
        }}
      >
        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={spinnerColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="62.83"
          strokeDashoffset="47"
          opacity="0.25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={spinnerColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="62.83"
          strokeDashoffset="47"
        />
      </svg>
    </div>
  );
}

export default Spinner;
