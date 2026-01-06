/**
 * Avatar Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * User profile image with fallback initials
 */

'use client';

import React from 'react';

export interface AvatarProps {
  /** User name (for initials fallback) */
  name?: string;
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom size in pixels (overrides size variant) */
  customSize?: number;
  /** Status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  /** Shape variant */
  shape?: 'circle' | 'square';
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

export function Avatar({
  name,
  src,
  alt,
  size = 'md',
  customSize,
  status = 'none',
  shape = 'circle',
  onClick,
  className = '',
  style: customStyle,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  // Size configuration
  const sizeConfig = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const avatarSize = customSize || sizeConfig[size];
  const fontSize = avatarSize * 0.4; // 40% of avatar size for initials
  const statusSize = avatarSize * 0.25; // 25% of avatar size for status dot

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Status color configuration
  const statusColors = {
    online: '#10B981', // Green
    offline: '#6B7280', // Gray
    away: '#F59E0B', // Yellow
    busy: '#EF4444', // Red
    none: 'transparent',
  };

  const avatarStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: avatarSize,
    height: avatarSize,
    borderRadius: shape === 'circle' ? '50%' : 'var(--radius-md)',
    backgroundColor: 'var(--color-gray-200)',
    color: 'var(--color-gray-700)',
    fontSize,
    fontWeight: 600,
    fontFamily: 'var(--font-family-sans)',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease',
    ...customStyle,
    flexShrink: 0,
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const statusDotStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: statusSize,
    height: statusSize,
    borderRadius: '50%',
    backgroundColor: statusColors[status],
    border: '2px solid #FFFFFF',
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const showImage = src && !imageError;
  const showInitials = !showImage && name;

  return (
    <div
      style={avatarStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {/* Image */}
      {showImage && (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          style={imageStyles}
          onError={handleImageError}
        />
      )}

      {/* Initials Fallback */}
      {showInitials && <span>{getInitials(name)}</span>}

      {/* Status Indicator */}
      {status !== 'none' && <div style={statusDotStyles} />}
    </div>
  );
}

export default Avatar;
