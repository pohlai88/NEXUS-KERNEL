/**
 * IconHome Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Home navigation, dashboard link
 */

import React from 'react';

export interface IconHomeProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconHome({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconHomeProps) {
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
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"
        fill={color}
      />
    </svg>
  );
}

export default IconHome;
