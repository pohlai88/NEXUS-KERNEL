/**
 * IconLogout Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Logout actions, sign out
 */

import React from 'react';

export interface IconLogoutProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconLogout({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconLogoutProps) {
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
        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
        fill={color}
      />
    </svg>
  );
}

export default IconLogout;
