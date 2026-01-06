/**
 * AvatarGroup Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Multiple avatars with overlap and overflow indicator
 */

'use client';

import React from 'react';
import { Avatar, AvatarProps } from './Avatar';

export interface AvatarGroupProps {
  /** Array of avatar configurations */
  avatars: AvatarProps[];
  /** Maximum avatars to show */
  max?: number;
  /** Size variant for all avatars */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Overlap amount in pixels (negative margin) */
  overlap?: number;
  /** Show total count */
  showTotal?: boolean;
  /** Click handler for overflow (+N) */
  onOverflowClick?: () => void;
}

export function AvatarGroup({
  avatars,
  max = 5,
  size = 'md',
  overlap,
  showTotal = false,
  onOverflowClick,
}: AvatarGroupProps) {
  // Size configuration for default overlap
  const sizeConfig = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const avatarSize = sizeConfig[size];
  const defaultOverlap = avatarSize * 0.25; // 25% overlap by default
  const overlapAmount = overlap ?? defaultOverlap;

  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);
  const hasOverflow = remainingCount > 0;

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-family-sans)',
  };

  const avatarWrapperStyles = (index: number): React.CSSProperties => ({
    position: 'relative',
    marginLeft: index > 0 ? -overlapAmount : 0,
    transition: 'transform 0.2s ease, z-index 0.2s ease',
    zIndex: visibleAvatars.length - index,
  });

  const overflowStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: avatarSize,
    height: avatarSize,
    borderRadius: '50%',
    backgroundColor: 'var(--color-gray-300)',
    color: 'var(--color-gray-700)',
    fontSize: avatarSize * 0.35,
    fontWeight: 600,
    marginLeft: -overlapAmount,
    cursor: onOverflowClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    border: '2px solid #FFFFFF',
    zIndex: 0,
    flexShrink: 0,
  };

  return (
    <div style={containerStyles}>
      {/* Visible Avatars */}
      {visibleAvatars.map((avatarProps, index) => (
        <div
          key={index}
          style={avatarWrapperStyles(index)}
          onMouseEnter={(e) => {
            e.currentTarget.style.zIndex = String(visibleAvatars.length + 1);
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.zIndex = String(visibleAvatars.length - index);
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Avatar
            {...avatarProps}
            size={size}
            style={{
              border: '2px solid #FFFFFF',
              boxSizing: 'border-box',
            }}
          />
        </div>
      ))}

      {/* Overflow Indicator */}
      {hasOverflow && (
        <div
          style={overflowStyles}
          onClick={onOverflowClick}
          onMouseEnter={(e) => {
            if (onOverflowClick) {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.backgroundColor = 'var(--color-gray-400)';
            }
          }}
          onMouseLeave={(e) => {
            if (onOverflowClick) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.backgroundColor = 'var(--color-gray-300)';
            }
          }}
        >
          +{remainingCount}
        </div>
      )}

      {/* Total Count */}
      {showTotal && (
        <span
          style={{
            marginLeft: 'var(--space-3)',
            fontSize: 'var(--text-caption-size)',
            color: 'var(--color-gray-600)',
          }}
        >
          {avatars.length} {avatars.length === 1 ? 'person' : 'people'}
        </span>
      )}
    </div>
  );
}

export default AvatarGroup;
