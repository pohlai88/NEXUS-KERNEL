/**
 * IconWarning Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Warning notifications, caution states
 */

import React from 'react';

export interface IconWarningProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconWarning({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconWarningProps) {
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
        d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
        fill={color}
      />
    </svg>
  );
}

export default IconWarning;
