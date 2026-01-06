/**
 * AreaChart - Material Design area chart
 * Stacked or overlapping areas with gradient fills
 */

'use client';

import { useEffect, useState } from 'react';
import type { AreaChartData, ChartCommonProps } from './types';

interface AreaChartProps extends ChartCommonProps {
  data: AreaChartData;
  stacked?: boolean;
}

export function AreaChart({
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  showGrid = true,
  animate = true,
  stacked = false,
}: AreaChartProps) {
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
  const maxValue = stacked
    ? Math.max(
        ...data.labels.map((_, i) =>
          data.datasets.reduce((sum, ds) => sum + ds.data[i], 0)
        )
      )
    : Math.max(...data.datasets.flatMap(ds => ds.data), 0);

  const yScale = chartHeight / (maxValue * 1.1);
  const xScale = chartWidth / (data.labels.length - 1);

  // Generate area path
  const generateAreaPath = (dataset: typeof data.datasets[0], baseData?: number[]) => {
    const points = dataset.data.map((value, i) => {
      const base = baseData ? baseData[i] : 0;
      return {
        x: padding.left + i * xScale,
        y: padding.top + chartHeight - (value + base) * yScale,
        baseY: padding.top + chartHeight - base * yScale,
      };
    });

    // Top line (smooth curve)
    let topLine = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cp1x = p1.x + (p2.x - p1.x) / 3;
      const cp1y = p1.y;
      const cp2x = p1.x + (p2.x - p1.x) * 2 / 3;
      const cp2y = p2.y;
      topLine += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    // Bottom line (reverse order)
    let bottomLine = '';
    for (let i = points.length - 1; i > 0; i--) {
      const p1 = points[i];
      const p2 = points[i - 1];
      if (i === points.length - 1) {
        bottomLine = `L ${p1.x} ${p1.baseY}`;
      }
      const cp1x = p1.x - (p1.x - p2.x) / 3;
      const cp1y = p1.baseY;
      const cp2x = p1.x - (p1.x - p2.x) * 2 / 3;
      const cp2y = p2.baseY;
      bottomLine += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.baseY}`;
    }

    return `${topLine} ${bottomLine} Z`;
  };

  // Calculate cumulative data for stacked areas
  const cumulativeData: number[][] = [];
  if (stacked) {
    data.datasets.forEach((dataset, idx) => {
      if (idx === 0) {
        cumulativeData.push(new Array(data.labels.length).fill(0));
      } else {
        cumulativeData.push(
          dataset.data.map((_, i) =>
            data.datasets
              .slice(0, idx)
              .reduce((sum, ds) => sum + ds.data[i], 0)
          )
        );
      }
    });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
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

        {/* Gradients */}
        <defs>
          {data.datasets.map((dataset, idx) => {
            const [topOpacity, bottomOpacity] = dataset.gradientOpacity || [0.6, 0.1];
            return (
              <linearGradient
                key={idx}
                id={`area-gradient-${idx}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={dataset.color} stopOpacity={topOpacity} />
                <stop offset="100%" stopColor={dataset.color} stopOpacity={bottomOpacity} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Areas (reverse order for proper stacking) */}
        {[...data.datasets].reverse().map((dataset, reverseIdx) => {
          const idx = data.datasets.length - 1 - reverseIdx;
          const baseData = stacked ? cumulativeData[idx] : undefined;

          return (
            <path
              key={idx}
              d={generateAreaPath(dataset, baseData)}
              fill={`url(#area-gradient-${idx})`}
              style={{
                clipPath: animated ? 'none' : 'inset(0 100% 0 0)',
                transition: animate ? 'clip-path 1.2s ease-out' : 'none',
                transitionDelay: animate ? `${reverseIdx * 0.15}s` : '0s',
              }}
            />
          );
        })}
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
