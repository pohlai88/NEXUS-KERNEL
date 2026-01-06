/**
 * IconArrowRight Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Forward navigation, next actions, right movement
 */

import React from 'react';

export interface IconArrowRightProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconArrowRight({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconArrowRightProps) {
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
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
        fill={color}
      />
    </svg>
  );
}

export default IconArrowRight;
