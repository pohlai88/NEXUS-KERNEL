/**
 * IconFilter Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Filter actions, refine results
 */

import React from 'react';

export interface IconFilterProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconFilter({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconFilterProps) {
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
        d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
        fill={color}
      />
    </svg>
  );
}

export default IconFilter;
