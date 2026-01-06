import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface VirtualListProps<T = any> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

export function VirtualList<T = any>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 3,
  onScroll,
  className = '',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  const containerStyles: React.CSSProperties = {
    height: `${containerHeight}px`,
    overflowY: 'auto',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    position: 'relative',
  };

  const innerStyles: React.CSSProperties = {
    height: `${totalHeight}px`,
    position: 'relative',
  };

  const itemStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    top: `${(startIndex + index) * itemHeight}px`,
    left: 0,
    right: 0,
    height: `${itemHeight}px`,
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--space-3) var(--space-4)',
    borderBottom: '1px solid var(--color-gray-200)',
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyles}
      onScroll={handleScroll}
    >
      <div style={innerStyles}>
        {visibleItems.map((item, index) => (
          <div key={keyExtractor(item, startIndex + index)} style={itemStyles(index)}>
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;
