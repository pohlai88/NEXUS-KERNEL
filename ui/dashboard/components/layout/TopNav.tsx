'use client';

import React from 'react';

interface TopNavProps {
  title?: string;
  count?: number;
  className?: string;
}

function NotificationIcon() {
  return (
    <button 
      className="relative w-6 h-6 flex items-center justify-center group"
      aria-label="Notifications"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C11.4477 2 11 2.44772 11 3V3.58579C9.16519 4.07802 7.76953 5.55663 7.26756 7.41421L6.58579 10.5858C6.21071 12.1682 5.23045 13.5566 3.85786 14.4645L3.5 14.7071C2.94772 15.0594 2.64645 15.6896 2.72361 16.3229C2.80077 16.9562 3.24365 17.4814 3.85355 17.6629L20.1464 21.6629C20.7563 21.8444 21.4045 21.6483 21.8047 21.1716C22.2049 20.6949 22.2826 20.0283 22.0051 19.4761L20.1421 15.4142C19.0518 13.2335 18.5 10.7905 18.5 8.31018V6C18.5 3.51472 16.4853 1.5 14 1.5C13.4477 1.5 13 1.94772 13 2.5V3C13 3.27614 12.7761 3.5 12.5 3.5C12.2239 3.5 12 3.27614 12 3V2Z"
          fill="var(--color-neutral-700)"
        />
        <circle 
          cx="18" 
          cy="6" 
          r="4" 
          fill="var(--color-primary)"
          className="group-hover:fill-primary-light transition-colors"
        />
      </svg>
    </button>
  );
}

function HelpIcon() {
  return (
    <button 
      className="w-6 h-6 flex items-center justify-center"
      aria-label="Help"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="var(--color-neutral-400)" 
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M12 16V16.5M12 13C12 11.8954 12.8954 11 14 11C15.1046 11 16 11.8954 16 13C16 13.5523 15.7761 14.0536 15.4142 14.4142C15.0523 14.7761 14.5 15 14 15C13 15 12 14.5 12 13.5V13Z"
          stroke="var(--color-neutral-400)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function UserAvatar() {
  return (
    <div 
      className="w-6 h-6 rounded-full overflow-hidden border border-neutral-300"
      style={{
        backgroundColor: 'var(--color-neutral-100)',
      }}
    >
      <div 
        className="w-full h-full flex items-center justify-center text-xs font-semibold"
        style={{ color: 'var(--color-primary)' }}
      >
        TD
      </div>
    </div>
  );
}

export default function TopNav({ 
  title = 'Projects', 
  count = 112,
  className = '' 
}: TopNavProps) {
  return (
    <header
      className={`flex items-center justify-between px-5 ${className}`}
      style={{
        height: '56px',
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Title with Count Badge */}
      <div className="flex items-center gap-2">
        <h1 
          className="text-display font-bold"
          style={{ color: 'var(--color-text)' }}
        >
          {title}
        </h1>
        
        <div
          className="px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: '#EDEDFC', // Indigo/0 from Figma
          }}
        >
          <span 
            className="text-micro font-medium"
            style={{ color: 'var(--color-primary)' }}
          >
            {count}
          </span>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        <NotificationIcon />
        <HelpIcon />
        <UserAvatar />
      </div>
    </header>
  );
}
