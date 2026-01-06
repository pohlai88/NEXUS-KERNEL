/**
 * IconUser Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: User profile, account settings, person representation
 */

import React from 'react';

export interface IconUserProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconUser({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconUserProps) {
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
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        fill={color}
      />
    </svg>
  );
}

export default IconUser;
