#!/usr/bin/env tsx
/**
 * Performance Dashboard Generator
 * 
 * Generates a performance dashboard HTML report from kernel performance metrics.
 * Collects performance data and creates a visual dashboard.
 * 
 * Usage: pnpm tsx scripts/performance-dashboard.ts [options]
 * 
 * Options:
 *   --output <path>   Output HTML file path (default: performance-dashboard.html)
 *   --duration <ms>   Collection duration in milliseconds (default: 10000)
 *   --port <port>     HTTP server port for live dashboard (optional)
 */

import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import {
  enablePerformanceMonitoring,
  disablePerformanceMonitoring,
  globalPerformanceCollector,
  type PerformanceMetrics,
} from "../src/monitoring/performance.js";
import {
  enableErrorTracking,
  disableErrorTracking,
  globalErrorCollector,
  type ErrorContext,
} from "../src/monitoring/errors.js";
import { validationCache } from "../src/kernel.validation.cache.js";
import { CONCEPT, VALUE } from "../src/concepts.js";
import { validateConcept } from "../src/kernel.validation.js";

interface DashboardData {
  performance: {
    metrics: PerformanceMetrics[];
    summary: {
      totalOperations: number;
      averageDuration: number;
      minDuration: number;
      maxDuration: number;
      operationsByType: Record<string, number>;
    };
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    recent: Array<{ error: string; context: ErrorContext }>;
  };
  cache: {
    stats: ReturnType<typeof validationCache.getStats>;
  };
  kernel: {
    concepts: number;
    values: number;
  };
  generatedAt: string;
}

function formatDuration(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function collectPerformanceData(duration: number): Promise<PerformanceMetrics[]> {
  return new Promise((resolve) => {
    const metrics: PerformanceMetrics[] = [];

    const unsubscribe = enablePerformanceMonitoring((metric) => {
      metrics.push(metric);
    });

    // Generate some test operations
    setTimeout(() => {
      // Test concept validation
      for (let i = 0; i < 100; i++) {
        validateConcept({
          code: `TEST_CONCEPT_${i}`,
          category: "ENTITY",
          domain: "CORE",
          description: "Test concept",
          tags: [],
        });
      }

      // Test cache operations
      validationCache.getStats();

      // Test concept access
      Object.keys(CONCEPT).slice(0, 50).forEach((key) => {
        const _ = CONCEPT[key as keyof typeof CONCEPT];
      });
    }, 100);

    setTimeout(() => {
      unsubscribe();
      disablePerformanceMonitoring();
      resolve(metrics);
    }, duration);
  });
}

function collectErrorData(): {
  total: number;
  byType: Record<string, number>;
  recent: Array<{ error: string; context: ErrorContext }>;
} {
  const errors: Array<{ error: string; context: ErrorContext }> = [];
  const byType: Record<string, number> = {};

  const unsubscribe = enableErrorTracking((error, context) => {
    const errorType = error.constructor.name;
    byType[errorType] = (byType[errorType] || 0) + 1;
    errors.push({ error: error.message, context });
  });

  // Generate some test errors
  try {
    validateConcept({ code: "INVALID" } as any);
  } catch (e) {
    // Error tracked
  }

  unsubscribe();
  disableErrorTracking();

  return {
    total: errors.length,
    byType,
    recent: errors.slice(-10),
  };
}

function generateDashboardHTML(data: DashboardData): string {
  const { performance, errors, cache, kernel } = data;
  
  // Load design system CSS (The Constitution)
  const cssPath = join(process.cwd(), "ui", "style.css");
  let css = "";
  try {
    css = readFileSync(cssPath, "utf-8");
  } catch (error) {
    css = `/* CRITICAL: No CSS found at ${cssPath} */`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kernel Performance Dashboard</title>
  
  <!-- Design System CSS (The Constitution) -->
  <style>
${css}
  </style>
</head>
<body class="shell">
  <div class="container-page">
    <h1 class="title">🚀 Kernel Performance Dashboard</h1>
    <p class="caption text-text-sub mb-6">Generated: ${data.generatedAt}</p>

    <div class="grid-cards">
      <!-- Performance Summary -->
      <div class="stat-card">
        <h2 class="section mb-4">Performance Summary</h2>
        <div class="flex-col">
          <div class="flex-row justify-between mb-2">
            <span class="stat-label">Total Operations</span>
            <span class="stat-value">${performance.summary.totalOperations}</span>
          </div>
          <div class="flex-row justify-between mb-2">
            <span class="stat-label">Average Duration</span>
            <span class="stat-value">${formatDuration(performance.summary.averageDuration)}</span>
          </div>
          <div class="flex-row justify-between mb-2">
            <span class="stat-label">Min Duration</span>
            <span class="stat-value">${formatDuration(performance.summary.minDuration)}</span>
          </div>
          <div class="flex-row justify-between">
            <span class="stat-label">Max Duration</span>
            <span class="stat-value">${formatDuration(performance.summary.maxDuration)}</span>
          </div>
        </div>
      </div>

      <!-- Cache Statistics -->
      <div class="stat-card">
        <h2 class="section mb-4">Cache Statistics</h2>
        <div class="flex-col">
          <div class="flex-row justify-between mb-2">
            <span class="stat-label">Total Size</span>
            <span class="stat-value">${cache.stats.total.size}</span>
          </div>
          <div class="flex-row justify-between mb-2">
            <span class="stat-label">Hit Rate</span>
            <span class="stat-value">${(cache.stats.total.hitRate * 100).toFixed(2)}%</span>
          </div>
          <div class="flex-row justify-between mb-2">
            <span class="stat-label">Total Hits</span>
            <span class="stat-value">${cache.stats.total.hits}</span>
          </div>
          <div class="flex-row justify-between">
            <span class="stat-label">Total Misses</span>
            <span class="stat-value">${cache.stats.total.misses}</span>
          </div>
        </div>
      </div>

      <!-- Kernel Stats -->
      <div class="stat-card">
        <h2 class="section mb-4">Kernel Statistics</h2>
        <div class="flex-col">
          <div class="flex-row justify-between mb-2">
            <span class="stat-label">Concepts</span>
            <span class="stat-value">${kernel.concepts}</span>
          </div>
          <div class="flex-row justify-between">
            <span class="stat-label">Values</span>
            <span class="stat-value">${kernel.values}</span>
          </div>
        </div>
      </div>

      <!-- Error Summary -->
      <div class="stat-card">
        <h2 class="section mb-4">Error Summary</h2>
        <div class="flex-row justify-between">
          <span class="stat-label">Total Errors</span>
          <span class="stat-value">${errors.total}</span>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="card mb-6">
      <h2 class="section mb-4">Recent Performance Metrics</h2>
      <div class="flex-col">
        ${performance.metrics.slice(-20).map((m) => `
          <div class="card-well mb-2">
            <div class="flex-row justify-between mb-1">
              <span class="text-text-main font-semibold">${m.operation}</span>
              <span class="text-text-main font-semibold">${formatDuration(m.duration)}</span>
            </div>
            <div class="caption text-text-sub">
              ${new Date(m.timestamp).toLocaleString()}
              ${m.metadata ? ` • ${JSON.stringify(m.metadata)}` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Operations by Type -->
    <div class="table-container">
      <div class="table-header">
        <h2 class="section">Operations by Type</h2>
      </div>
      <div class="table-body">
        <table class="w-full">
          <thead>
            <tr>
              <th class="cell">Operation</th>
              <th class="cell">Count</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(performance.summary.operationsByType)
              .sort(([, a], [, b]) => b - a)
              .map(([op, count]) => `
              <tr>
                <td class="cell">${op}</td>
                <td class="cell">${count}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <footer class="border-t border-border mt-8 py-6 text-center">
    <p class="caption text-text-sub">@aibos/kernel Performance Dashboard</p>
    <p class="caption text-text-sub mt-1">Generated by performance-dashboard.ts</p>
  </footer>
</body>
</html>`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let outputPath = join(process.cwd(), "performance-dashboard.html");
  let duration = 10000;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--output" && args[i + 1]) {
      outputPath = args[++i];
    } else if (arg === "--duration" && args[i + 1]) {
      duration = parseInt(args[++i], 10);
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Performance Dashboard Generator

Usage: pnpm tsx scripts/performance-dashboard.ts [options]

Options:
  --output <path>    Output HTML file path (default: performance-dashboard.html)
  --duration <ms>    Collection duration in milliseconds (default: 10000)
  --help, -h         Show this help message

Examples:
  # Generate dashboard with default settings
  pnpm tsx scripts/performance-dashboard.ts

  # Generate with custom output and duration
  pnpm tsx scripts/performance-dashboard.ts --output reports/performance.html --duration 30000
`);
      process.exit(0);
    }
  }

  try {
    console.log("📊 Collecting performance data...");
    console.log(`   Duration: ${duration}ms\n`);

    const performanceMetrics = await collectPerformanceData(duration);
    const errorData = collectErrorData();
    const cacheStats = validationCache.getStats();

    // Calculate performance summary
    const durations = performanceMetrics.map((m) => m.duration);
    const operationsByType: Record<string, number> = {};
    performanceMetrics.forEach((m) => {
      operationsByType[m.operation] = (operationsByType[m.operation] || 0) + 1;
    });

    const data: DashboardData = {
      performance: {
        metrics: performanceMetrics,
        summary: {
          totalOperations: performanceMetrics.length,
          averageDuration:
            durations.length > 0
              ? durations.reduce((a, b) => a + b, 0) / durations.length
              : 0,
          minDuration: durations.length > 0 ? Math.min(...durations) : 0,
          maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
          operationsByType,
        },
      },
      errors: errorData,
      cache: {
        stats: cacheStats,
      },
      kernel: {
        concepts: Object.keys(CONCEPT).length,
        values: Object.keys(VALUE).length,
      },
      generatedAt: new Date().toISOString(),
    };

    const html = generateDashboardHTML(data);
    writeFileSync(outputPath, html, "utf-8");

    console.log("✅ Performance dashboard generated!");
    console.log(`   Output: ${outputPath}`);
    console.log(`   Metrics: ${performanceMetrics.length}`);
    console.log(`   Cache hit rate: ${(cacheStats.total.hitRate * 100).toFixed(2)}%`);
    console.log(`\n💡 Open ${outputPath} in your browser to view the dashboard.`);
  } catch (error) {
    console.error("❌ Error generating dashboard:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

if (
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` ||
  process.argv[1]?.includes("performance-dashboard")
) {
  main();
}

export { generateDashboardHTML, type DashboardData };

