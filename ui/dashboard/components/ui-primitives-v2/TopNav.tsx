'use client';

import React from 'react';

interface TopNavProps {
  /** Title of the current page */
  title?: string;
  /** Badge count to display next to the title */
  badgeCount?: number;
  /** Show notification indicator */
  hasNotification?: boolean;
  /** Avatar image URL */
  avatarUrl?: string;
  /** User name for avatar alt text */
  userName?: string;
}

export default function TopNav({
  title = 'Projects',
  badgeCount = 112,
  hasNotification = false,
  avatarUrl,
  userName = 'User',
}: TopNavProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-background)',
        height: '56px',
        width: '100%',
        position: 'relative',
        borderBottom: '1px solid rgba(213,219,229,0.5)',
      }}
    >
      {/* Title and badge */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <h2
          className="text-display"
          style={{
            fontSize: '24px',
            fontWeight: 700,
            lineHeight: '32px',
            color: '#222834',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {badgeCount !== undefined && (
          <div
            style={{
              backgroundColor: '#EDEDFC',
              padding: '2px 6px',
              borderRadius: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="text-micro"
              style={{
                color: '#5E5ADB',
                lineHeight: '18px',
              }}
            >
              {badgeCount}
            </span>
          </div>
        )}
      </div>

      {/* Right side icons */}
      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Notification icon */}
        <button
          style={{
            width: '24px',
            height: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            padding: 0,
          }}
        >
          {/* Bell icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke="#868FA0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke="#868FA0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Red notification dot */}
          {hasNotification && (
            <div
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EF5466',
              }}
            />
          )}
        </button>

        {/* Help icon */}
        <button
          style={{
            width: '24px',
            height: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#868FA0" strokeWidth="2" />
            <path
              d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
              stroke="#868FA0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="17" r="1" fill="#868FA0" />
          </svg>
        </button>

        {/* Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(213,219,229,0.5)',
            backgroundColor: 'var(--color-background)',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#EDEDFC',
                color: '#5E5ADB',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
