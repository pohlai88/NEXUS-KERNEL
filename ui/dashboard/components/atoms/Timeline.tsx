import React from 'react';

// Timeline Item Interface
export interface TimelineItemProps {
  children: React.ReactNode;
  timestamp?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default';
  className?: string;
}

export function TimelineItem({
  children,
  timestamp,
  icon,
  color = 'default',
  className = '',
}: TimelineItemProps) {
  const colorMap = {
    primary: {
      dot: 'var(--color-primary)',
      dotBorder: 'var(--color-primary-200)',
      line: 'var(--color-primary-100)',
    },
    success: {
      dot: 'var(--color-success)',
      dotBorder: 'var(--color-success-200)',
      line: 'var(--color-success-100)',
    },
    warning: {
      dot: 'var(--color-warning)',
      dotBorder: 'var(--color-warning-200)',
      line: 'var(--color-warning-100)',
    },
    error: {
      dot: 'var(--color-error)',
      dotBorder: 'var(--color-error-200)',
      line: 'var(--color-error-100)',
    },
    default: {
      dot: 'var(--color-gray-400)',
      dotBorder: 'var(--color-gray-200)',
      line: 'var(--color-gray-200)',
    },
  };

  const colors = colorMap[color];

  const itemStyles: React.CSSProperties = {
    position: 'relative',
    paddingBottom: 'var(--space-6)',
    paddingLeft: 'var(--space-10)',
  };

  const dotContainerStyles: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 'var(--space-1)',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    border: `2px solid ${colors.dotBorder}`,
    borderRadius: '50%',
    zIndex: 2,
  };

  const dotStyles: React.CSSProperties = {
    width: icon ? '24px' : '12px',
    height: icon ? '24px' : '12px',
    backgroundColor: icon ? 'transparent' : colors.dot,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.dot,
  };

  const lineStyles: React.CSSProperties = {
    position: 'absolute',
    left: '15px',
    top: '40px',
    bottom: 0,
    width: '2px',
    backgroundColor: colors.line,
    zIndex: 1,
  };

  const contentStyles: React.CSSProperties = {
    position: 'relative',
  };

  const timestampStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-500)',
    marginBottom: 'var(--space-1)',
    fontWeight: 500,
  };

  const textStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-900)',
    lineHeight: 1.6,
  };

  return (
    <div className={className} style={itemStyles}>
      <div style={dotContainerStyles}>
        <div style={dotStyles}>{icon}</div>
      </div>
      <div style={lineStyles} />
      <div style={contentStyles}>
        {timestamp && <div style={timestampStyles}>{timestamp}</div>}
        <div style={textStyles}>{children}</div>
      </div>
    </div>
  );
}

// Timeline Container Interface
export interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className = '' }: TimelineProps) {
  const timelineStyles: React.CSSProperties = {
    position: 'relative',
    padding: 'var(--space-4)',
    backgroundColor: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
  };

  return (
    <div className={className} style={timelineStyles}>
      {children}
    </div>
  );
}

export default Timeline;
