/**
 * IconChevronUp Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Collapse sections, scroll up, expand menus upward
 */

import React from 'react';

export interface IconChevronUpProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconChevronUp({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconChevronUpProps) {
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
        d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"
        fill={color}
      />
    </svg>
  );
}

export default IconChevronUp;
