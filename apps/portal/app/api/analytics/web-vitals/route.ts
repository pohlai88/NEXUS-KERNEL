/**
 * Web Vitals Analytics API Route
 *
 * Receives Core Web Vitals metrics from the client and stores them
 * for performance monitoring and analysis.
 *
 * @see https://web.dev/vitals/
 */

import { NextRequest, NextResponse } from "next/server";

interface WebVitalsPayload {
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
 * In-memory metrics store for development
 * In production, this would be sent to a proper analytics service
 */
const metricsBuffer: WebVitalsPayload[] = [];
const BUFFER_MAX_SIZE = 1000;

/**
 * POST /api/analytics/web-vitals
 *
 * Receives Web Vitals metrics from the client
 */
export async function POST(request: NextRequest) {
  try {
    const metric = (await request.json()) as WebVitalsPayload;

    // Validate required fields
    if (!metric.name || typeof metric.value !== "number") {
      return NextResponse.json(
        { error: "Invalid metric payload" },
        { status: 400 }
      );
    }

    // Add to buffer (circular buffer in development)
    metricsBuffer.push({
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    });

    // Keep buffer size manageable
    if (metricsBuffer.length > BUFFER_MAX_SIZE) {
      metricsBuffer.shift();
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      const color =
        metric.rating === "good"
          ? "🟢"
          : metric.rating === "needs-improvement"
          ? "🟡"
          : "🔴";

      console.log(
        `${color} [Web Vitals API] ${metric.name}: ${metric.value.toFixed(
          2
        )}ms on ${metric.pathname}`
      );
    }

    // In production, you would:
    // 1. Send to a proper analytics service (Vercel Analytics, DataDog, etc.)
    // 2. Store in a time-series database
    // 3. Aggregate and create dashboards

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Web Vitals API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process metric" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/web-vitals
 *
 * Returns collected Web Vitals metrics (development only)
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);

  let filtered = metricsBuffer;

  // Filter by metric name if provided
  if (name) {
    filtered = metricsBuffer.filter((m) => m.name === name);
  }

  // Return most recent metrics
  const metrics = filtered.slice(-limit);

  // Calculate summary statistics
  const summary = {
    total: metrics.length,
    byMetric: {} as Record<
      string,
      {
        count: number;
        avg: number;
        min: number;
        max: number;
        good: number;
        needsImprovement: number;
        poor: number;
      }
    >,
  };

  for (const metric of metrics) {
    if (!summary.byMetric[metric.name]) {
      summary.byMetric[metric.name] = {
        count: 0,
        avg: 0,
        min: Infinity,
        max: -Infinity,
        good: 0,
        needsImprovement: 0,
        poor: 0,
      };
    }

    const stats = summary.byMetric[metric.name];
    stats.count++;
    stats.avg += metric.value;
    stats.min = Math.min(stats.min, metric.value);
    stats.max = Math.max(stats.max, metric.value);

    if (metric.rating === "good") stats.good++;
    else if (metric.rating === "needs-improvement") stats.needsImprovement++;
    else stats.poor++;
  }

  // Calculate averages
  for (const name of Object.keys(summary.byMetric)) {
    const stats = summary.byMetric[name];
    stats.avg = stats.avg / stats.count;
    if (stats.min === Infinity) stats.min = 0;
    if (stats.max === -Infinity) stats.max = 0;
  }

  return NextResponse.json({
    metrics,
    summary,
    bufferSize: metricsBuffer.length,
  });
}
