'use client';

import React from 'react';

interface NameTooltipProps {
  /** Name to display in the tooltip */
  name: string;
  /** Position of the tooltip arrow */
  arrowPosition?: 'top' | 'bottom';
  /** Arrow alignment (horizontal offset) */
  arrowOffset?: 'left' | 'center' | 'right';
}

export default function NameTooltip({
  name,
  arrowPosition = 'top',
  arrowOffset = 'center',
}: NameTooltipProps) {
  const getArrowLeftPosition = () => {
    switch (arrowOffset) {
      case 'left':
        return '39px'; // Roger Vaccaro position
      case 'right':
        return '45px'; // Tatiana Dias position
      default:
        return '50%'; // Center aligned
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow:
          '0px 0px 0px 1px rgba(136,143,170,0.1), 0px 15px 35px 0px rgba(26,34,64,0.1), 0px 5px 15px 0px rgba(0,0,0,0.12)',
      }}
    >
      {arrowPosition === 'top' && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            justifyContent: arrowOffset === 'center' ? 'center' : 'flex-start',
            paddingLeft: arrowOffset === 'left' || arrowOffset === 'right' ? getArrowLeftPosition() : undefined,
          }}
        >
          <NameTooltipArrow direction="down" />
        </div>
      )}

      <div
        className="text-body"
        style={{
          backgroundColor: '#222834',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '8px',
          lineHeight: '16px',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>

      {arrowPosition === 'bottom' && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            justifyContent: arrowOffset === 'center' ? 'center' : 'flex-start',
            paddingLeft: arrowOffset === 'left' ? '20px' : arrowOffset === 'right' ? '20px' : undefined,
          }}
        >
          <NameTooltipArrow direction="up" />
        </div>
      )}
    </div>
  );
}

interface NameTooltipArrowProps {
  direction: 'up' | 'down';
}

function NameTooltipArrow({ direction }: NameTooltipArrowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: direction === 'down' ? 'scaleY(-1)' : undefined,
      }}
    >
      <svg width="28" height="8" viewBox="0 0 28 8" fill="none">
        <path d="M0 0H28L14 7.13043L0 0Z" fill="#222834" />
      </svg>
    </div>
  );
}
