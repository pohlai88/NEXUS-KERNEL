'use client';

import React from 'react';

interface ResourcesProps {
  /** If true, shows the count badge. If false, shows the add button */
  added?: boolean;
  /** Count to display when added is true */
  count?: number;
  /** Click handler for add button */
  onAdd?: () => void;
}

export default function Resources({ added = false, count = 3, onAdd }: ResourcesProps) {
  if (added) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px 7px',
          borderRadius: '6px',
          backgroundColor: '#E9EDF5',
          overflow: 'hidden',
        }}
      >
        <span
          className="text-body"
          style={{
            color: 'var(--color-text)',
            lineHeight: '20px',
          }}
        >
          {count}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onAdd}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px',
        borderRadius: '6px',
        backgroundColor: '#EDEDFC',
        border: '1px dashed #807CEA',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#D0CFFC';
        e.currentTarget.style.borderColor = '#5E5ADB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#EDEDFC';
        e.currentTarget.style.borderColor = '#807CEA';
      }}
    >
      {/* Add icon (14x14px) */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 2.625V11.375M11.375 7H2.625"
          stroke="var(--color-text)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
