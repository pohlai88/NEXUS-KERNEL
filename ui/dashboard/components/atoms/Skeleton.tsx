'use client';

import React from 'react';

// Skeleton Props Interface
export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  style: customStyle,
}: SkeletonProps) {
  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: '100%', height: '1em' };
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'rectangular':
        return { width: '100%', height: '200px' };
      case 'rounded':
        return { width: '100%', height: '200px' };
      default:
        return { width: '100%', height: '1em' };
    }
  };

  const defaults = getDefaultDimensions();
  const finalWidth = width || defaults.width;
  const finalHeight = height || defaults.height;

  // Border radius based on variant
  const getBorderRadius = () => {
    switch (variant) {
      case 'circular':
        return '50%';
      case 'rounded':
        return 'var(--radius-lg)';
      case 'text':
        return 'var(--radius-sm)';
      case 'rectangular':
        return 'var(--radius-md)';
      default:
        return 'var(--radius-sm)';
    }
  };

  // Animation styles
  const getAnimation = () => {
    switch (animation) {
      case 'pulse':
        return 'skeletonPulse 1.5s ease-in-out infinite';
      case 'wave':
        return 'skeletonWave 1.5s linear infinite';
      case 'none':
        return 'none';
      default:
        return 'skeletonPulse 1.5s ease-in-out infinite';
    }
  };

  const skeletonStyles: React.CSSProperties = {
    display: 'inline-block',
    width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
    height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
    backgroundColor: 'var(--color-gray-200)',
    borderRadius: getBorderRadius(),
    animation: getAnimation(),
    position: 'relative',
    overflow: 'hidden',
    ...customStyle,
  };

  const waveStyles: React.CSSProperties =
    animation === 'wave'
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(90deg, transparent, var(--color-gray-300), transparent)',
          animation: 'skeletonWaveMove 1.5s linear infinite',
        }
      : {};

  return (
    <>
      <div className={className} style={skeletonStyles}>
        {animation === 'wave' && <div style={waveStyles} />}
      </div>
      <style jsx>{`
        @keyframes skeletonPulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes skeletonWaveMove {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
}

// Preset Skeleton Components
export function SkeletonText({ lines = 3, ...props }: SkeletonProps & { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          {...props}
        />
      ))}
    </div>
  );
}

export function SkeletonCard(props: SkeletonProps) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-gray-200)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Skeleton variant="rectangular" height="200px" style={{ marginBottom: 'var(--space-3)' }} {...props} />
      <Skeleton variant="text" width="80%" style={{ marginBottom: 'var(--space-2)' }} {...props} />
      <Skeleton variant="text" width="60%" {...props} />
    </div>
  );
}

export function SkeletonAvatar({ size = '40px', ...props }: SkeletonProps & { size?: string }) {
  return <Skeleton variant="circular" width={size} height={size} {...props} />;
}

export function SkeletonTable({ rows = 5, ...props }: SkeletonProps & { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Skeleton variant="text" width="30%" {...props} />
        <Skeleton variant="text" width="25%" {...props} />
        <Skeleton variant="text" width="25%" {...props} />
        <Skeleton variant="text" width="20%" {...props} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Skeleton variant="text" width="30%" {...props} />
          <Skeleton variant="text" width="25%" {...props} />
          <Skeleton variant="text" width="25%" {...props} />
          <Skeleton variant="text" width="20%" {...props} />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
