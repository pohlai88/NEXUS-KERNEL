/**
 * IconRefresh Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Refresh data, reload page, sync actions
 */

import React from 'react';

export interface IconRefreshProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconRefresh({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconRefreshProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
        fill={color}
      />
    </svg>
  );
}

export default IconRefresh;
