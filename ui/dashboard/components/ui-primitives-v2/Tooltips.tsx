'use client';

import React from 'react';

interface ResourceTooltipProps {
  /** Tooltip text content */
  text?: string;
  /** Position of the tooltip arrow */
  arrowPosition?: 'top' | 'bottom';
}

export default function ResourceTooltip({
  text = "Assign resources",
  arrowPosition = 'bottom',
}: ResourceTooltipProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow:
          '0px 0px 1px 0px #FFFFFF, 0px 15px 35px -5px rgba(17,24,38,0.35), 0px 5px 15px -3px rgba(0,0,0,0.2)',
      }}
    >
      {arrowPosition === 'top' && <TooltipArrow direction="up" />}
      
      <div
        className="text-body"
        style={{
          backgroundColor: '#171C26',
          color: '#B9B6FA',
          padding: '12px 16px',
          borderRadius: '8px',
          lineHeight: '16px',
        }}
      >
        {text}
      </div>
      
      {arrowPosition === 'bottom' && <TooltipArrow direction="down" />}
    </div>
  );
}

interface TooltipArrowProps {
  direction: 'up' | 'down';
}

function TooltipArrow({ direction }: TooltipArrowProps) {
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
        <path
          d="M0 0H28L14 7.13043L0 0Z"
          fill="#171C26"
        />
      </svg>
    </div>
  );
}

interface InfoTooltipProps {
  /** Tooltip content text */
  text?: string;
}

export function InfoTooltip({
  text = "This is a note, user fills in while changing the status, which explains the current project status.",
}: InfoTooltipProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow:
          '0px 0px 1px 0px #FFFFFF, 0px 15px 35px -5px rgba(17,24,38,0.35), 0px 5px 15px -3px rgba(0,0,0,0.2)',
      }}
    >
      <TooltipArrow direction="down" />
      
      <div
        className="text-body"
        style={{
          backgroundColor: '#171C26',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '8px',
          lineHeight: '24px',
          maxWidth: '368px',
        }}
      >
        {text}
      </div>
    </div>
  );
}

interface ResourceListTooltipProps {
  /** List of resources to display */
  resources?: string[];
}

export function ResourceListTooltip({
  resources = ['UX/UI Design', 'Frontend', 'Backend'],
}: ResourceListTooltipProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow:
          '0px 0px 1px 0px #FFFFFF, 0px 15px 35px -5px rgba(17,24,38,0.35), 0px 5px 15px -3px rgba(0,0,0,0.2)',
      }}
    >
      <TooltipArrow direction="down" />
      
      <div
        style={{
          backgroundColor: '#171C26',
          padding: '12px 16px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <p
          className="text-micro"
          style={{
            color: '#B9B6FA',
            textTransform: 'uppercase',
            lineHeight: '18px',
          }}
        >
          RESOURCES
        </p>
        {resources.map((resource, index) => (
          <p
            key={index}
            className="text-body"
            style={{
              color: '#FFFFFF',
              lineHeight: '20px',
            }}
          >
            {resource}
          </p>
        ))}
      </div>
    </div>
  );
}
