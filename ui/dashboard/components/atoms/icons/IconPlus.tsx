/**
 * IconPlus Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Add actions, create new items
 */

import React from 'react';

export interface IconPlusProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconPlus({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconPlusProps) {
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
        d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
        fill={color}
      />
    </svg>
  );
}

export default IconPlus;
