/**
 * BarChart - Material Design bar chart
 * Rounded corners, smooth animations, hover states
 */

'use client';

import { useEffect, useState } from 'react';
import type { BarChartData, ChartCommonProps } from './types';

interface BarChartProps extends ChartCommonProps {
  data: BarChartData;
  horizontal?: boolean;
}

export function BarChart({
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  showGrid = true,
  animate = true,
  horizontal = false,
}: BarChartProps) {
  const [animated, setAnimated] = useState(!animate);
  const [hoveredBar, setHoveredBar] = useState<{ dataset: number; index: number } | null>(null);

  useEffect(() => {
    if (animate) {
      setTimeout(() => setAnimated(true), 100);
    }
  }, [animate]);

  const width = 600;
  const padding = { top: 20, right: 20, bottom: 60, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.datasets.flatMap(ds => ds.data), 0);
  const scale = horizontal ? chartWidth / (maxValue * 1.1) : chartHeight / (maxValue * 1.1);

  const barWidth = horizontal
    ? chartHeight / data.labels.length / data.datasets.length * 0.8
    : chartWidth / data.labels.length / data.datasets.length * 0.8;
  const groupWidth = horizontal
    ? chartHeight / data.labels.length
    : chartWidth / data.labels.length;

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
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {showGrid && !horizontal && (
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

        {showGrid && horizontal && (
          <g className="grid">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const x = padding.left + chartWidth * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={padding.top + chartHeight + 20}
                    textAnchor="middle"
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

        {/* Bars */}
        {data.datasets.map((dataset, datasetIdx) => (
          <g key={datasetIdx}>
            {dataset.data.map((value, i) => {
              const isHovered =
                hoveredBar?.dataset === datasetIdx && hoveredBar?.index === i;

              if (horizontal) {
                const y =
                  padding.top +
                  i * groupWidth +
                  datasetIdx * barWidth +
                  (groupWidth - data.datasets.length * barWidth) / 2;
                const barHeight = barWidth;
                const barLength = value * scale;

                return (
                  <g key={i}>
                    <rect
                      x={padding.left}
                      y={y}
                      width={animated ? barLength : 0}
                      height={barHeight}
                      fill={dataset.color}
                      rx="4"
                      style={{
                        transition: animate
                          ? `width 0.8s ease-out ${i * 0.1}s, opacity 0.3s`
                          : 'opacity 0.3s',
                        opacity: isHovered ? 0.8 : 1,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => setHoveredBar({ dataset: datasetIdx, index: i })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    {isHovered && (
                      <text
                        x={padding.left + barLength + 10}
                        y={y + barHeight / 2 + 4}
                        className="text-caption font-medium"
                        fill={dataset.color}
                      >
                        {value}
                      </text>
                    )}
                  </g>
                );
              } else {
                const x =
                  padding.left +
                  i * groupWidth +
                  datasetIdx * barWidth +
                  (groupWidth - data.datasets.length * barWidth) / 2;
                const barHeight = value * scale;
                const y = padding.top + chartHeight - barHeight;

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={animated ? y : padding.top + chartHeight}
                      width={barWidth}
                      height={animated ? barHeight : 0}
                      fill={dataset.color}
                      rx="4"
                      style={{
                        transition: animate
                          ? `height 0.8s ease-out ${i * 0.1}s, y 0.8s ease-out ${i * 0.1}s, opacity 0.3s`
                          : 'opacity 0.3s',
                        opacity: isHovered ? 0.8 : 1,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => setHoveredBar({ dataset: datasetIdx, index: i })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    {isHovered && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        className="text-caption font-medium"
                        fill={dataset.color}
                      >
                        {value}
                      </text>
                    )}
                  </g>
                );
              }
            })}
          </g>
        ))}

        {/* Labels */}
        {data.labels.map((label, i) => {
          if (horizontal) {
            return (
              <text
                key={i}
                x={padding.left - 10}
                y={padding.top + i * groupWidth + groupWidth / 2 + 4}
                textAnchor="end"
                className="text-caption"
                fill="#6b7280"
              >
                {label}
              </text>
            );
          } else {
            return (
              <text
                key={i}
                x={padding.left + i * groupWidth + groupWidth / 2}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                className="text-caption"
                fill="#6b7280"
              >
                {label}
              </text>
            );
          }
        })}
      </svg>

      {showLegend && (
        <div className="flex justify-center gap-6 mt-4">
          {data.datasets.map((dataset, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
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
