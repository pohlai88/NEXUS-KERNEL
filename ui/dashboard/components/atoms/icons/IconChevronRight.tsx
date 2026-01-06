/**
 * IconChevronRight Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Navigate forward, next page, expand details
 */

import React from 'react';

export interface IconChevronRightProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconChevronRight({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconChevronRightProps) {
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
        d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"
        fill={color}
      />
    </svg>
  );
}

export default IconChevronRight;
