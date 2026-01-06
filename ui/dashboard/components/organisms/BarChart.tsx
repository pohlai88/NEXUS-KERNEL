import React, { useMemo, useState } from 'react';

export interface BarChartDataPoint {
  category: string;
  value: number;
  color?: string;
  label?: string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  width?: number;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  barWidth?: number;
  className?: string;
}

export function BarChart({
  data,
  width = 800,
  height = 400,
  orientation = 'vertical',
  showValues = true,
  showGrid = true,
  xAxisLabel,
  yAxisLabel,
  barWidth,
  className = '',
}: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const padding = { top: 40, right: 40, bottom: 80, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { maxValue, barSpacing, calculatedBarWidth } = useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.value));
    const barSpacing = chartWidth / data.length;
    const calculatedBarWidth = barWidth || barSpacing * 0.7;
    
    return { maxValue, barSpacing, calculatedBarWidth };
  }, [data, chartWidth, barWidth]);

  const getBarHeight = (value: number) => {
    return (value / maxValue) * chartHeight;
  };

  const getBarY = (value: number) => {
    return chartHeight - getBarHeight(value);
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: `${width}px`,
  };

  const svgStyles: React.CSSProperties = {
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#FFFFFF',
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

  const yTicks = Array.from({ length: 6 }, (_, i) => {
    const value = (maxValue * i) / 5;
    return Math.round(value * 100) / 100;
  });

  if (orientation === 'horizontal') {
    const barSpacing = chartHeight / data.length;
    const calculatedBarHeight = barWidth || barSpacing * 0.7;

    return (
      <div className={className} style={containerStyles}>
        <svg width={width} height={height} style={svgStyles}>
          {/* Grid lines */}
          {showGrid && (
            <g>
              {yTicks.map((tick, i) => {
                const x = padding.left + (tick / maxValue) * chartWidth;
                return (
                  <line
                    key={`grid-${i}`}
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="var(--color-gray-200)"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          )}

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
            {yTicks.map((tick, i) => {
              const x = padding.left + (tick / maxValue) * chartWidth;
              return (
                <g key={`x-tick-${i}`}>
                  <line
                    x1={x}
                    y1={padding.top + chartHeight}
                    x2={x}
                    y2={padding.top + chartHeight + 5}
                    stroke="var(--color-gray-400)"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={padding.top + chartHeight + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="var(--color-gray-600)"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}
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
            {yAxisLabel && (
              <text
                x={padding.left - 60}
                y={padding.top + chartHeight / 2}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="var(--color-gray-700)"
                transform={`rotate(-90, ${padding.left - 60}, ${padding.top + chartHeight / 2})`}
              >
                {yAxisLabel}
              </text>
            )}
          </g>

          {/* Bars */}
          {data.map((d, index) => {
            const y = padding.top + index * barSpacing + (barSpacing - calculatedBarHeight) / 2;
            const barLength = (d.value / maxValue) * chartWidth;
            const color = d.color || 'var(--color-primary)';

            return (
              <g key={`bar-${index}`}>
                <rect
                  x={padding.left}
                  y={y}
                  width={barLength}
                  height={calculatedBarHeight}
                  fill={hoveredBar === index ? color : color}
                  opacity={hoveredBar === null || hoveredBar === index ? 1 : 0.6}
                  rx="4"
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                
                {/* Category label */}
                <text
                  x={padding.left - 10}
                  y={y + calculatedBarHeight / 2}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize="12"
                  fill="var(--color-gray-700)"
                  fontWeight="500"
                >
                  {d.category}
                </text>

                {/* Value label */}
                {showValues && (
                  <text
                    x={padding.left + barLength + 5}
                    y={y + calculatedBarHeight / 2}
                    textAnchor="start"
                    alignmentBaseline="middle"
                    fontSize="12"
                    fill="var(--color-gray-700)"
                    fontWeight="600"
                  >
                    {d.label || d.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Vertical orientation (default)
  return (
    <div className={className} style={containerStyles}>
      <svg width={width} height={height} style={svgStyles}>
        {/* Grid lines */}
        {showGrid && (
          <g>
            {yTicks.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={padding.left}
                y1={padding.top + chartHeight - (tick / maxValue) * chartHeight}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight - (tick / maxValue) * chartHeight}
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
                y1={padding.top + chartHeight - (tick / maxValue) * chartHeight}
                x2={padding.left}
                y2={padding.top + chartHeight - (tick / maxValue) * chartHeight}
                stroke="var(--color-gray-400)"
                strokeWidth="2"
              />
              <text
                x={padding.left - 10}
                y={padding.top + chartHeight - (tick / maxValue) * chartHeight}
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
              x={padding.left - 55}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill="var(--color-gray-700)"
              transform={`rotate(-90, ${padding.left - 55}, ${padding.top + chartHeight / 2})`}
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

        {/* Bars */}
        {data.map((d, index) => {
          const x = padding.left + index * barSpacing + (barSpacing - calculatedBarWidth) / 2;
          const barHeight = getBarHeight(d.value);
          const y = padding.top + getBarY(d.value);
          const color = d.color || 'var(--color-primary)';

          return (
            <g key={`bar-${index}`}>
              <rect
                x={x}
                y={y}
                width={calculatedBarWidth}
                height={barHeight}
                fill={color}
                opacity={hoveredBar === null || hoveredBar === index ? 1 : 0.6}
                rx="4"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              />
              
              {/* Category label */}
              <text
                x={x + calculatedBarWidth / 2}
                y={padding.top + chartHeight + 15}
                textAnchor="middle"
                fontSize="12"
                fill="var(--color-gray-700)"
                fontWeight="500"
              >
                {d.category}
              </text>

              {/* Value label */}
              {showValues && (
                <text
                  x={x + calculatedBarWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--color-gray-700)"
                  fontWeight="600"
                >
                  {d.label || d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredBar !== null && (
        <div
          style={{
            ...tooltipStyles,
            left: `${padding.left + hoveredBar * barSpacing + barSpacing / 2}px`,
            top: `${padding.top + getBarY(data[hoveredBar].value) - 30}px`,
          }}
        >
          {data[hoveredBar].category}: {data[hoveredBar].value}
        </div>
      )}
    </div>
  );
}

export default BarChart;
