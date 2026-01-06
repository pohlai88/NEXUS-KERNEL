/**
 * LineChart - Material Design line chart
 * Smooth curves, subtle grid, animated paths
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { LineChartData, ChartCommonProps } from './types';

interface LineChartProps extends ChartCommonProps {
  data: LineChartData;
}

export function LineChart({
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  showGrid = true,
  animate = true,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animated, setAnimated] = useState(!animate);

  useEffect(() => {
    if (animate) {
      setTimeout(() => setAnimated(true), 100);
    }
  }, [animate]);

  const width = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxValue = Math.max(
    ...data.datasets.flatMap(ds => ds.data),
    1 // Minimum value of 1 to prevent division by zero
  );
  // Ensure yScale doesn't produce NaN or Infinity
  const yScale = maxValue > 0 ? chartHeight / (maxValue * 1.1) : chartHeight; // 10% padding
  const xScale = data.labels.length > 1 ? chartWidth / (data.labels.length - 1) : chartWidth / 2;

  // Generate path for line
  const generatePath = (dataset: typeof data.datasets[0]) => {
    const points = dataset.data.map((value, i) => {
      const x = padding.left + i * xScale;
      const y = padding.top + chartHeight - value * yScale;
      // Validate coordinates
      return {
        x: isFinite(x) ? x : padding.left,
        y: isFinite(y) ? y : padding.top + chartHeight,
      };
    });

    // Smooth curve using bezier
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cp1x = p1.x + (p2.x - p1.x) / 3;
      const cp1y = p1.y;
      const cp2x = p1.x + (p2.x - p1.x) * 2 / 3;
      const cp2y = p2.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  // Generate area path (for filled charts)
  const generateAreaPath = (dataset: typeof data.datasets[0]) => {
    const linePath = generatePath(dataset);
    const lastPoint = padding.left + (data.labels.length - 1) * xScale;
    const baseline = padding.top + chartHeight;
    return `${linePath} L ${lastPoint} ${baseline} L ${padding.left} ${baseline} Z`;
  };

  return (
    <div className="bg-nx-surface rounded-lg border border-nx-border p-6">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-title font-medium">{title}</h3>}
          {subtitle && (
            <p className="text-caption" style={{ color: 'var(--color-text-sub)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="grid">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + chartHeight - chartHeight * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-micro"
                    fill="#9ca3af"
                  >
                    {Math.round(maxValue * ratio * 1.1)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* X-axis labels */}
        {data.labels.map((label, i) => (
          <text
            key={i}
            x={padding.left + i * xScale}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            className="text-micro"
            fill="#9ca3af"
          >
            {label}
          </text>
        ))}

        {/* Data lines */}
        {data.datasets.map((dataset, idx) => (
          <g key={idx}>
            {dataset.fill && (
              <path
                d={generateAreaPath(dataset)}
                fill={`url(#gradient-${idx})`}
                opacity="0.2"
                style={{
                  transition: animated ? 'opacity 0.6s ease-out' : 'none',
                  opacity: animated ? 0.2 : 0,
                }}
              />
            )}
            <path
              d={generatePath(dataset)}
              fill="none"
              stroke={dataset.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: animated ? '0' : chartWidth * 2,
                strokeDashoffset: animated ? '0' : chartWidth * 2,
                transition: animate ? 'stroke-dashoffset 1.5s ease-out' : 'none',
              }}
            />
            {/* Data points */}
            {dataset.data.map((value, i) => {
              const cx = padding.left + i * xScale;
              const cy = padding.top + chartHeight - value * yScale;
              
              // Skip rendering invalid coordinates
              if (!isFinite(cx) || !isFinite(cy)) {
                return null;
              }
              
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="white"
                  stroke={dataset.color}
                  strokeWidth="2"
                  style={{
                    transition: animated ? 'opacity 0.3s ease-out' : 'none',
                    transitionDelay: animated ? `${i * 0.1}s` : '0s',
                    opacity: animated ? 1 : 0,
                  }}
                />
              );
            })}
          </g>
        ))}

        {/* Gradients for fills */}
        <defs>
          {data.datasets.map((dataset, idx) => (
            <linearGradient
              key={idx}
              id={`gradient-${idx}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={dataset.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={dataset.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>

      {showLegend && (
        <div className="flex justify-center gap-6 mt-4">
          {data.datasets.map((dataset, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-caption">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
