/**
 * Web Vitals Client Component
 *
 * Measures Core Web Vitals (CLS, FCP, INP, LCP, TTFB) and sends metrics
 * to the analytics endpoint for performance monitoring.
 *
 * @module WebVitals
 * @see https://web.dev/vitals/
 */

"use client";

import { useEffect, useRef } from "react";
import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals/attribution";

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
  attribution?: Record<string, unknown>;
  timestamp: number;
  pathname: string;
}

/**
 * Sends Web Vitals metrics to the analytics endpoint
 */
function sendToAnalytics(metric: Metric, pathname: string): void {
  const body: WebVitalsMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    attribution:
      "attribution" in metric
        ? (metric.attribution as Record<string, unknown>)
        : undefined,
    timestamp: Date.now(),
    pathname,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    const color =
      metric.rating === "good"
        ? "#22c55e"
        : metric.rating === "needs-improvement"
        ? "#f59e0b"
        : "#ef4444";

    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${
        metric.rating
      })`,
      `color: ${color}; font-weight: bold;`
    );
  }

  // Send to analytics endpoint using sendBeacon for reliable delivery
  try {
    const endpoint = "/api/analytics/web-vitals";
    const data = JSON.stringify(body);

    // Use sendBeacon for reliability during page unload
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(endpoint, data);
    } else {
      // Fallback to fetch with keepalive
      fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {
        // Silently fail - metrics are best-effort
      });
    }
  } catch {
    // Silently fail - metrics are best-effort
  }
}

/**
 * Web Vitals Component
 *
 * Add this component to your root layout to automatically track
 * Core Web Vitals across all pages.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { WebVitals } from '@/components/analytics/WebVitals';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitals />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function WebVitals(): null {
  const pathnameRef = useRef<string>("/");

  useEffect(() => {
    // Get current pathname
    pathnameRef.current =
      typeof window !== "undefined" ? window.location.pathname : "/";

    // Create callback that captures current pathname
    const createCallback = () => (metric: Metric) => {
      sendToAnalytics(metric, pathnameRef.current);
    };

    // Register all Web Vitals metrics
    // CLS - Cumulative Layout Shift (visual stability)
    onCLS(createCallback(), { reportAllChanges: true });

    // FCP - First Contentful Paint (loading)
    onFCP(createCallback());

    // INP - Interaction to Next Paint (responsiveness)
    onINP(createCallback(), { reportAllChanges: true });

    // LCP - Largest Contentful Paint (loading)
    onLCP(createCallback(), { reportAllChanges: true });

    // TTFB - Time to First Byte (server response)
    onTTFB(createCallback());
  }, []);

  return null;
}

/**
 * Type definitions for thresholds
 */
export const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * Get rating for a metric value
 */
export function getMetricRating(
  name: keyof typeof THRESHOLDS,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}
