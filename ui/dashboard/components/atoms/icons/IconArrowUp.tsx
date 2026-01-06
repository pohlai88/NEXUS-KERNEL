/**
 * IconArrowUp Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Upward movement, increase indicators, scroll up
 */

import React from 'react';

export interface IconArrowUpProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function IconArrowUp({ 
  size = 24, 
  color = 'currentColor',
  className = '',
  style 
}: IconArrowUpProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
        fill={color}
      />
    </svg>
  );
}

export default IconArrowUp;
