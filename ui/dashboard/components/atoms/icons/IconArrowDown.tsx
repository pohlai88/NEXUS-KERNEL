/**
 * IconArrowDown Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Downward movement, decrease indicators, scroll down
 */

import React from 'react';

export interface IconArrowDownProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function IconArrowDown({ 
  size = 24, 
  color = 'currentColor',
  className = '',
  style 
}: IconArrowDownProps) {
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
        d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"
        fill={color}
      />
    </svg>
  );
}

export default IconArrowDown;
