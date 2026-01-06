/**
 * IconChevronLeft Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Navigate back, previous page, collapse sidebar
 */

import React from 'react';

export interface IconChevronLeftProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconChevronLeft({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconChevronLeftProps) {
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
        d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"
        fill={color}
      />
    </svg>
  );
}

export default IconChevronLeft;
