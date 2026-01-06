/**
 * IconCalendar Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Usage: Date selection, calendar views, scheduling
 */

import React from 'react';

export interface IconCalendarProps {
  size?: number;
  color?: string;
  className?: string;
}

export function IconCalendar({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}: IconCalendarProps) {
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
        d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"
        fill={color}
      />
    </svg>
  );
}

export default IconCalendar;
