/**
 * IconChevronDown Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Expand sections, scroll down, dropdown menus
 */

import React from 'react';

export interface IconChevronDownProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconChevronDown({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconChevronDownProps) {
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
        d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
        fill={color}
      />
    </svg>
  );
}

export default IconChevronDown;
