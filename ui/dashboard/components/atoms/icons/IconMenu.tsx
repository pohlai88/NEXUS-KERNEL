/**
 * IconMenu Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Hamburger menu, navigation toggle
 */

import React from 'react';

export interface IconMenuProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconMenu({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconMenuProps) {
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
        d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
        fill={color}
      />
    </svg>
  );
}

export default IconMenu;
