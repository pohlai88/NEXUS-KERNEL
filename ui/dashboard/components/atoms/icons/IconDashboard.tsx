/**
 * IconDashboard Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Dashboard navigation, overview pages
 */

import React from 'react';

export interface IconDashboardProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconDashboard({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconDashboardProps) {
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
        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
        fill={color}
      />
    </svg>
  );
}

export default IconDashboard;
