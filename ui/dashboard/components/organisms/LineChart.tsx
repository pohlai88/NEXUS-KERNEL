import React, { useMemo, useState } from 'react';

export interface LineChartDataset {
  label: string;
  data: number[];
  color?: string;
  fill?: boolean;
}

export interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

export interface LineChartDataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
}

export interface LineChartSeries {
  id: string;
  name: string;
  data: LineChartDataPoint[];
  color?: string;
  strokeWidth?: number;
  showPoints?: boolean;
}

export interface LineChartProps {
  // Legacy data format (used by page.tsx)
  data?: LineChartData;
  title?: string;
  subtitle?: string;
  
  // New series format
  series?: LineChartSeries[];
  
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  curve?: 'linear' | 'smooth';
  className?: string;
  animate?: boolean;
}

export function LineChart({
  data,
  title,
  subtitle,
  series: seriesProp,
  width = 800,
  height = 400,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  curve = 'linear',
  className = '',
}: LineChartProps) {
  // Convert legacy data format to series format if needed
  const series = useMemo(() => {
    if (seriesProp) return seriesProp;
    if (!data) return [];
    
    return data.datasets.map((dataset, index) => ({
      id: `series-${index}`,
      name: dataset.label,
      data: dataset.data.map((value, i) => ({
        x: data.labels[i] || i,
        y: value,
        label: data.labels[i],
      })),
      color: dataset.color,
      strokeWidth: 2,
      showPoints: true,
    }));
  }, [data, seriesProp]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    seriesId: string;
    pointIndex: number;
    x: number;
    y: number;
    value: number;
  } | null>(null);

  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const { xScale, yScale, yTicks } = useMemo(() => {
    const allDataPoints = series.flatMap(s => s.data);
    
    // Handle empty dataset
    if (allDataPoints.length === 0) {
      return {
        xScale: () => 0,
        yScale: () => chartHeight / 2,
        yTicks: [0],
      };
    }
    
    // X scale
    const xValues = allDataPoints.map(d => {
      if (d.x instanceof Date) return d.x.getTime();
      if (typeof d.x === 'string') return parseFloat(d.x) || 0;
      return d.x;
    });
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    // Ensure minimum range to prevent division by zero
    const xRange = Math.max(xMax - xMin, 1);
    
    // Y scale
    const yValues = allDataPoints.map(d => d.y);
    const yMin = Math.min(0, Math.min(...yValues));
    const yMax = Math.max(Math.max(...yValues), 1); // Minimum yMax of 1 for zero-only data
    // Ensure minimum range to prevent division by zero
    const yRange = Math.max(yMax - yMin, 1);
    const yPadding = yRange * 0.1;
    
    const xScale = (value: number) => {
      const scaled = ((value - xMin) / xRange) * chartWidth;
      return isFinite(scaled) ? scaled : 0;
    };
    const yScale = (value: number) => {
      const scaled = chartHeight - ((value - (yMin - yPadding)) / (yRange + 2 * yPadding)) * chartHeight;
      return isFinite(scaled) ? scaled : chartHeight;
    };
    
    // Generate labels
    const xLabels = allDataPoints.map(d => {
      if (d.label) return d.label;
      if (d.x instanceof Date) return d.x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return String(d.x);
    });
    
    const yTicks = Array.from({ length: 6 }, (_, i) => {
      const value = yMin + (yRange * i) / 5;
      return Math.round(value * 100) / 100;
    });
    
    return { xScale, yScale, xLabels, yTicks };
  }, [series, chartWidth, chartHeight]);

  // Generate SVG path for line
  const generatePath = (data: LineChartDataPoint[]): string => {
    if (data.length === 0) return '';
    
    const points = data.map((d) => {
      const xValue = d.x instanceof Date ? d.x.getTime() : (typeof d.x === 'string' ? parseFloat(d.x) || 0 : d.x);
      const x = xScale(xValue);
      const y = yScale(d.y);
      
      // Validate coordinates are finite numbers
      if (!isFinite(x) || !isFinite(y)) {
        console.warn('[LineChart] Invalid point coordinates:', { d, x, y, xValue });
        return { x: 0, y: chartHeight };
      }
      
      return { x, y };
    });
    
    // Filter out any invalid points
    const validPoints = points.filter(p => isFinite(p.x) && isFinite(p.y));
    
    if (validPoints.length === 0) {
      console.warn('[LineChart] No valid points to render');
      return '';
    }
    
    if (curve === 'smooth' && validPoints.length > 1) {
      // Catmull-Rom spline for smooth curves
      let path = `M ${validPoints[0].x},${validPoints[0].y}`;
      
      for (let i = 0; i < validPoints.length - 1; i++) {
        const p0 = validPoints[Math.max(0, i - 1)];
        const p1 = validPoints[i];
        const p2 = validPoints[i + 1];
        const p3 = validPoints[Math.min(validPoints.length - 1, i + 2)];
        
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      
      return path;
    } else {
      // Linear path
      return validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    }
  };

  const defaultColors = [
    'var(--color-primary)',
    'var(--color-secondary)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-error)',
    '#6366f1',
    '#8b5cf6',
  ];

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: `${width}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  };

  const svgStyles: React.CSSProperties = {
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#FFFFFF',
  };

  const legendStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-4)',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 'var(--space-2)',
  };

  const legendItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-700)',
  };

  const tooltipStyles: React.CSSProperties = {
    position: 'absolute',
    padding: 'var(--space-2) var(--space-3)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-caption-size)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    zIndex: 1000,
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Title and Subtitle */}
      {(title || subtitle) && (
        <div style={{ marginBottom: 'var(--space-2)' }}>
          {title && <h3 style={{ fontSize: 'var(--text-section-size)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>{subtitle}</p>}
        </div>
      )}
      <svg width={width} height={height} style={svgStyles}>
        {/* Grid lines */}
        {showGrid && (
          <g>
            {yTicks.map((tick, i) => (
              <line
                key={`y-grid-${i}`}
                x1={padding.left}
                y1={padding.top + yScale(tick)}
                x2={padding.left + chartWidth}
                y2={padding.top + yScale(tick)}
                stroke="var(--color-gray-200)"
                strokeWidth="1"
              />
            ))}
          </g>
        )}

        {/* Y Axis */}
        <g>
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="var(--color-gray-400)"
            strokeWidth="2"
          />
          {yTicks.map((tick, i) => (
            <g key={`y-tick-${i}`}>
              <line
                x1={padding.left - 5}
                y1={padding.top + yScale(tick)}
                x2={padding.left}
                y2={padding.top + yScale(tick)}
                stroke="var(--color-gray-400)"
                strokeWidth="2"
              />
              <text
                x={padding.left - 10}
                y={padding.top + yScale(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize="12"
                fill="var(--color-gray-600)"
              >
                {tick}
              </text>
            </g>
          ))}
          {yAxisLabel && (
            <text
              x={padding.left - 45}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill="var(--color-gray-700)"
              transform={`rotate(-90, ${padding.left - 45}, ${padding.top + chartHeight / 2})`}
            >
              {yAxisLabel}
            </text>
          )}
        </g>

        {/* X Axis */}
        <g>
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="var(--color-gray-400)"
            strokeWidth="2"
          />
          {xAxisLabel && (
            <text
              x={padding.left + chartWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill="var(--color-gray-700)"
            >
              {xAxisLabel}
            </text>
          )}
        </g>

        {/* Series lines */}
        {series.map((s, index) => {
          const color = s.color || defaultColors[index % defaultColors.length];
          const path = generatePath(s.data);
          
          return (
            <g key={s.id} transform={`translate(${padding.left}, ${padding.top})`}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={s.strokeWidth || 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {(s.showPoints !== false) && s.data.map((d, i) => {
                const xValue = d.x instanceof Date ? d.x.getTime() : (typeof d.x === 'string' ? parseFloat(d.x) || 0 : d.x);
                const x = xScale(xValue);
                const y = yScale(d.y);
                
                // Skip rendering if coordinates are invalid
                if (!isFinite(x) || !isFinite(y)) {
                  console.warn(`[LineChart] Skipping invalid circle at index ${i}:`, { x, y, xValue, yValue: d.y });
                  return null;
                }
                
                return (
                  <circle
                    key={`${s.id}-point-${i}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => showTooltip && setHoveredPoint({
                      seriesId: s.id,
                      pointIndex: i,
                      x: padding.left + x,
                      y: padding.top + y,
                      value: d.y,
                    })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div style={legendStyles}>
          {series.map((s, index) => {
            const color = s.color || defaultColors[index % defaultColors.length];
            return (
              <div key={s.id} style={legendItemStyles}>
                <div style={{
                  width: '16px',
                  height: '3px',
                  backgroundColor: color,
                  borderRadius: '2px',
                }} />
                <span>{s.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredPoint && (
        <div
          style={{
            ...tooltipStyles,
            left: `${hoveredPoint.x + 10}px`,
            top: `${hoveredPoint.y - 10}px`,
          }}
        >
          {series.find(s => s.id === hoveredPoint.seriesId)?.name}: {hoveredPoint.value}
        </div>
      )}
    </div>
  );
}

export default LineChart;
