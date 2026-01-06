/**
 * IconUpload Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Upload actions, import data
 */

import React from 'react';

export interface IconUploadProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconUpload({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconUploadProps) {
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
        d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"
        fill={color}
      />
    </svg>
  );
}

export default IconUpload;
