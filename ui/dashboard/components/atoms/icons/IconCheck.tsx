/**
 * IconCheck Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Success states, checkboxes, confirmations
 */

import React from 'react';

export interface IconCheckProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconCheck({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconCheckProps) {
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
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
        fill={color}
      />
    </svg>
  );
}

export default IconCheck;
