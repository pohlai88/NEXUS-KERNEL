/**
 * IconMoreVert Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Vertical menu (three dots), action menu
 */

import React from 'react';

export interface IconMoreVertProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconMoreVert({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconMoreVertProps) {
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
        d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill={color}
      />
    </svg>
  );
}

export default IconMoreVert;
