/**
 * IconDownload Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Download actions, export data
 */

import React from 'react';

export interface IconDownloadProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconDownload({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconDownloadProps) {
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
        d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
        fill={color}
      />
    </svg>
  );
}

export default IconDownload;
