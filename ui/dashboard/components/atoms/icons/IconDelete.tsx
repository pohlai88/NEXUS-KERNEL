/**
 * IconDelete Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Delete actions, remove items
 */

import React from 'react';

export interface IconDeleteProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconDelete({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconDeleteProps) {
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
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        fill={color}
      />
    </svg>
  );
}

export default IconDelete;
