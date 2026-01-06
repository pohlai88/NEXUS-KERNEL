import React, { useMemo, useState } from 'react';

export interface PieChartDataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  width?: number;
  height?: number;
  donut?: boolean;
  donutWidth?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showPercentages?: boolean;
  className?: string;
}

export function PieChart({
  data,
  width = 500,
  height = 500,
  donut = false,
  donutWidth = 60,
  showLabels = true,
  showLegend = true,
  showPercentages = true,
  className = '',
}: PieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 60;
  const innerRadius = donut ? radius - donutWidth : 0;

  const { slices, total } = useMemo(() => {
    const defaultColors = [
      'var(--color-primary)',
      'var(--color-secondary)',
      'var(--color-success)',
      'var(--color-warning)',
      'var(--color-error)',
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
    ];
    
    const total = data.reduce((sum, d) => sum + d.value, 0);

    const slices = data.reduce((acc, d, index) => {
      const currentAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : -90; // Start at top
      const percentage = (d.value / total) * 100;
      const angle = (d.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const color = d.color || defaultColors[index % defaultColors.length];

      acc.push({
        ...d,
        percentage,
        startAngle,
        endAngle,
        color,
      });
      
      return acc;
    }, [] as Array<typeof data[0] & { percentage: number; startAngle: number; endAngle: number; color: string }>);

    return { slices, total };
  }, [data]);

  const polarToCartesian = (angle: number, r: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(radians),
      y: centerY + r * Math.sin(radians),
    };
  };

  const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const start = polarToCartesian(startAngle, outerR);
    const end = polarToCartesian(endAngle, outerR);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    if (innerR === 0) {
      // Pie slice
      return `M ${centerX},${centerY} L ${start.x},${start.y} A ${outerR},${outerR} 0 ${largeArc} 1 ${end.x},${end.y} Z`;
    } else {
      // Donut slice
      const innerStart = polarToCartesian(startAngle, innerR);
      const innerEnd = polarToCartesian(endAngle, innerR);
      
      return `
        M ${start.x},${start.y}
        A ${outerR},${outerR} 0 ${largeArc} 1 ${end.x},${end.y}
        L ${innerEnd.x},${innerEnd.y}
        A ${innerR},${innerR} 0 ${largeArc} 0 ${innerStart.x},${innerStart.y}
        Z
      `;
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    alignItems: 'center',
    width: `${width}px`,
  };

  const svgStyles: React.CSSProperties = {
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#FFFFFF',
  };

  const legendStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    padding: 'var(--space-3)',
    backgroundColor: 'var(--color-gray-50)',
    borderRadius: 'var(--radius-md)',
    width: '100%',
  };

  const legendItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-700)',
    justifyContent: 'space-between',
  };

  return (
    <div className={className} style={containerStyles}>
      <svg width={width} height={height} style={svgStyles}>
        {/* Slices */}
        {slices.map((slice) => {
          const path = createArcPath(slice.startAngle, slice.endAngle, radius, innerRadius);
          const isHovered = hoveredSlice === slice.id;
          const scale = isHovered ? 1.05 : 1;
          
          // Label position (middle of slice, outer edge)
          const labelAngle = (slice.startAngle + slice.endAngle) / 2;
          const labelRadius = radius + 20;
          const labelPos = polarToCartesian(labelAngle, labelRadius);

          return (
            <g key={slice.id}>
              <path
                d={path}
                fill={slice.color}
                opacity={hoveredSlice === null || isHovered ? 1 : 0.6}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: isHovered ? `scale(${scale})` : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`,
                }}
                onMouseEnter={() => setHoveredSlice(slice.id)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              
              {/* Labels */}
              {showLabels && slice.percentage > 5 && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="var(--color-gray-700)"
                  pointerEvents="none"
                >
                  {showPercentages ? `${slice.percentage.toFixed(1)}%` : slice.value}
                </text>
              )}
            </g>
          );
        })}

        {/* Center label for donut */}
        {donut && (
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="24"
            fontWeight="700"
            fill="var(--color-gray-900)"
          >
            {total}
          </text>
        )}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div style={legendStyles}>
          {slices.map((slice) => (
            <div
              key={slice.id}
              style={{
                ...legendItemStyles,
                opacity: hoveredSlice === null || hoveredSlice === slice.id ? 1 : 0.6,
              }}
              onMouseEnter={() => setHoveredSlice(slice.id)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: slice.color,
                  borderRadius: 'var(--radius-sm)',
                }} />
                <span>{slice.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{slice.value}</span>
                <span style={{ color: 'var(--color-gray-500)', fontSize: '11px' }}>
                  ({slice.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PieChart;
