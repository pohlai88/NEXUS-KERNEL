import React, { useState } from 'react';
import { IconChevronDown, IconChevronUp } from '../atoms/icons';

export interface TimelineMediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  thumbnail?: string;
}

export interface TimelineAdvancedItem {
  id: string;
  timestamp: string | Date;
  title: string;
  description: string;
  content?: string;
  media?: TimelineMediaItem[];
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  expandable?: boolean;
}

export interface TimelineAdvancedProps {
  items: TimelineAdvancedItem[];
  orientation?: 'vertical' | 'horizontal';
  showIcons?: boolean;
  className?: string;
}

export function TimelineAdvanced({
  items,
  orientation = 'vertical',
  showIcons = true,
  className = '',
}: TimelineAdvancedProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatTimestamp = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVariantColor = (variant?: string): string => {
    switch (variant) {
      case 'primary': return 'var(--color-primary)';
      case 'success': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'error': return 'var(--color-error)';
      default: return 'var(--color-gray-400)';
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: orientation === 'vertical' ? 0 : 'var(--space-6)',
    position: 'relative',
  };

  const itemContainerStyles = (isLast: boolean): React.CSSProperties => ({
    position: 'relative',
    display: 'flex',
    gap: 'var(--space-4)',
    paddingBottom: !isLast && orientation === 'vertical' ? 'var(--space-6)' : 0,
  });

  const lineContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  };

  const iconContainerStyles = (variant?: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    minWidth: '48px',
    backgroundColor: '#FFFFFF',
    border: `3px solid ${getVariantColor(variant)}`,
    borderRadius: '50%',
    zIndex: 2,
  });

  const lineStyles = (variant?: string): React.CSSProperties => ({
    width: '3px',
    flex: 1,
    backgroundColor: getVariantColor(variant),
    marginTop: 'var(--space-2)',
  });

  const contentContainerStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  };

  const timestampStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-600)',
    fontWeight: 500,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: 'var(--text-title-size)',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-700)',
    lineHeight: 1.6,
  };

  const mediaGridStyles = (count: number): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: count === 1 ? '1fr' : count === 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-2)',
  });

  const mediaItemStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-md)',
    objectFit: 'cover',
    backgroundColor: 'var(--color-gray-100)',
  };

  const expandableContentStyles: React.CSSProperties = {
    marginTop: 'var(--space-3)',
    padding: 'var(--space-4)',
    backgroundColor: 'var(--color-gray-50)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-700)',
    lineHeight: 1.6,
  };

  const expandButtonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginTop: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    color: 'var(--color-primary)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div className={className} style={containerStyles}>
      {items.map((item, index) => {
        const isExpanded = expandedItems.has(item.id);
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} style={itemContainerStyles(isLast)}>
            {/* Icon & Line */}
            <div style={lineContainerStyles}>
              {showIcons && (
                <div style={iconContainerStyles(item.variant)}>
                  {item.icon || (
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: getVariantColor(item.variant),
                      }}
                    />
                  )}
                </div>
              )}
              {!isLast && orientation === 'vertical' && (
                <div style={lineStyles(item.variant)} />
              )}
            </div>

            {/* Content */}
            <div style={contentContainerStyles}>
              <div style={headerStyles}>
                <div style={timestampStyles}>{formatTimestamp(item.timestamp)}</div>
                <div style={titleStyles}>{item.title}</div>
              </div>

              <div style={descriptionStyles}>{item.description}</div>

              {/* Media */}
              {item.media && item.media.length > 0 && (
                <div style={mediaGridStyles(item.media.length)}>
                  {item.media.map((media, mediaIndex) => (
                    <div key={mediaIndex}>
                      {media.type === 'image' ? (
                        <img
                          src={media.thumbnail || media.src}
                          alt={media.alt || ''}
                          style={mediaItemStyles}
                        />
                      ) : (
                        <video
                          src={media.src}
                          controls
                          style={mediaItemStyles}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Expandable Content */}
              {item.expandable && item.content && (
                <>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    style={expandButtonStyles}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {isExpanded ? (
                      <>
                        Show Less
                        <IconChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Read More
                        <IconChevronDown size={16} />
                      </>
                    )}
                  </button>
                  {isExpanded && (
                    <div style={expandableContentStyles}>{item.content}</div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TimelineAdvanced;
