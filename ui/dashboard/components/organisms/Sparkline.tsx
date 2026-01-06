import React, { useMemo } from 'react';

export interface SparklineDataPoint {
  value: number;
  label?: string;
}

export interface SparklineProps {
  data: SparklineDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  showArea?: boolean;
  showDots?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = 'var(--color-primary)',
  fillColor,
  strokeWidth = 2,
  showArea = true,
  showDots = false,
  trend,
  className = '',
}: SparklineProps) {
  const { path, areaPath, min, max, trendDirection } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', areaPath: '', min: 0, max: 0, trendDirection: 'neutral' };
    }

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((d.value - min) / range) * chartHeight;
      return { x, y };
    });

    // Line path
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    
    // Area path
    const areaPath = showArea
      ? `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`
      : '';

    // Calculate trend
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const trendDirection = trend || (lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'neutral');

    return { path: linePath, areaPath, min, max, trendDirection, points };
  }, [data, width, height, showArea, trend]);

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up': return 'var(--color-success)';
      case 'down': return 'var(--color-error)';
      default: return color;
    }
  };

  const lineColor = getTrendColor();
  const fill = fillColor || `${lineColor}33`; // 20% opacity

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  };

  const svgStyles: React.CSSProperties = {
    overflow: 'visible',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    color: lineColor,
  };

  const trendIndicator = trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '–';

  return (
    <div className={className} style={containerStyles}>
      <svg width={width} height={height} style={svgStyles}>
        {/* Area fill */}
        {showArea && areaPath && (
          <path
            d={areaPath}
            fill={fill}
            opacity="0.3"
          />
        )}

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots && data.map((d, i) => {
          const x = 4 + (i / (data.length - 1 || 1)) * (width - 8);
          const y = 4 + (height - 8) - ((d.value - min) / (max - min || 1)) * (height - 8);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={lineColor}
            />
          );
        })}
      </svg>

      {/* Trend indicator */}
      <span style={valueStyles}>{trendIndicator}</span>
    </div>
  );
}

export default Sparkline;
