/**
 * DonutChart - Material Design donut/pie chart
 * Smooth arcs, hover interactions, center label
 */

'use client';

import { useEffect, useState } from 'react';
import type { PieChartData, ChartCommonProps } from './types';

interface DonutChartProps extends ChartCommonProps {
  data: PieChartData;
  innerRadius?: number; // 0 = pie chart, 0.6 = donut
}

export function DonutChart({
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  animate = true,
  innerRadius = 0.6,
}: DonutChartProps) {
  const [animated, setAnimated] = useState(!animate);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  useEffect(() => {
    if (animate) {
      setTimeout(() => setAnimated(true), 100);
    }
  }, [animate]);

  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 20;
  const innerR = radius * innerRadius;

  const total = data.data.reduce((sum, d) => sum + d.value, 0);

  // Generate arc path
  const getArcPath = (
    startAngle: number,
    endAngle: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    const startX = center + outerRadius * Math.cos(startAngle);
    const startY = center + outerRadius * Math.sin(startAngle);
    const endX = center + outerRadius * Math.cos(endAngle);
    const endY = center + outerRadius * Math.sin(endAngle);

    const innerStartX = center + innerRadius * Math.cos(endAngle);
    const innerStartY = center + innerRadius * Math.sin(endAngle);
    const innerEndX = center + innerRadius * Math.cos(startAngle);
    const innerEndY = center + innerRadius * Math.sin(startAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${startX} ${startY}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endX} ${endY}
      L ${innerStartX} ${innerStartY}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEndX} ${innerEndY}
      Z
    `;
  };

  // Calculate angles for all slices
  const angles = data.data.reduce<{ start: number; end: number; mid: number }[]>((acc, item) => {
    const lastAngle = acc.length > 0 ? acc[acc.length - 1].end : -Math.PI / 2;
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const start = lastAngle;
    const end = lastAngle + sliceAngle;
    const mid = (start + end) / 2;
    acc.push({ start, end, mid });
    return acc;
  }, []);

  return (
    <div className="bg-nx-surface rounded-lg border border-nx-border p-6" style={{ height: height ? `${height}px` : 'auto' }}>
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

      <div className="flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Slices */}
          {data.data.map((item, i) => {
            const { start: startAngle, end: endAngle, mid: midAngle } = angles[i];

            const isHovered = hoveredSlice === i;
            const hoverRadius = isHovered ? radius + 8 : radius;

            // Default colors from Quantum Obsidian palette
            const colors = [
              'var(--color-primary)',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#06B6D4',
            ];
            const color = item.color || colors[i % colors.length];

            return (
              <g key={i}>
                <path
                  d={getArcPath(
                    angles[i].start,
                    animated ? angles[i].end : angles[i].start,
                    hoverRadius,
                    innerR
                  )}
                  fill={color}
                  style={{
                    transition: animate
                      ? `d 0.8s ease-out ${i * 0.1}s, transform 0.3s`
                      : 'transform 0.3s',
                    transformOrigin: `${center}px ${center}px`,
                    cursor: 'pointer',
                    opacity: isHovered ? 0.9 : 1,
                  }}
                  onMouseEnter={() => setHoveredSlice(i)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* Percentage label */}
                {animated && (
                  <text
                    x={center + (radius * 0.7) * Math.cos(midAngle)}
                    y={center + (radius * 0.7) * Math.sin(midAngle) + 4}
                    textAnchor="middle"
                    className="text-caption font-medium"
                    fill="white"
                    style={{
                      pointerEvents: 'none',
                      opacity: animated ? 1 : 0,
                      transition: 'opacity 0.6s ease-out',
                      transitionDelay: `${i * 0.1 + 0.5}s`,
                    }}
                  >
                    {((item.value / total) * 100).toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Center text */}
          {data.centerText && (
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-title font-semibold"
              style={{ color: 'var(--color-text-main)' }}
            >
              {data.centerText}
            </text>
          )}
        </svg>
      </div>

      {showLegend && (
        <div className="grid grid-cols-2 gap-3 mt-6">
          {data.data.map((item, i) => {
            const colors = [
              'var(--color-primary)',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#06B6D4',
            ];
            const color = item.color || colors[i % colors.length];
            const percentage = ((item.value / total) * 100).toFixed(1);

            return (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded hover:bg-nx-surface-well transition-colors cursor-pointer"
                onMouseEnter={() => setHoveredSlice(i)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div
                  className="w-4 h-4 rounded-sm shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-caption font-medium truncate">{item.label}</div>
                  <div className="text-micro" style={{ color: 'var(--color-text-sub)' }}>
                    {item.value.toLocaleString()} ({percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
