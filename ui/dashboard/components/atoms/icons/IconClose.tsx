/**
 * IconClose Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Close modals, dismiss notifications, cancel actions
 */

import React from 'react';

export interface IconCloseProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconClose({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconCloseProps) {
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
        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
        fill={color}
      />
    </svg>
  );
}

export default IconClose;
