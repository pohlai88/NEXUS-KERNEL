/**
 * IconError Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Error notifications, failed states
 */

import React from 'react';

export interface IconErrorProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconError({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconErrorProps) {
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
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        fill={color}
      />
    </svg>
  );
}

export default IconError;
