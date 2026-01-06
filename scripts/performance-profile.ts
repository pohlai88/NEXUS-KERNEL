#!/usr/bin/env tsx
/**
 * Performance Profiling Script
 * 
 * Measures:
 * - Bundle size
 * - Import time
 * - Memory usage
 * - Validation performance
 * 
 * Usage: pnpm tsx scripts/performance-profile.ts
 */

import { performance } from "perf_hooks";
import { readFileSync, statSync } from "fs";
import { join } from "path";
import { gzipSync } from "zlib";

interface PerformanceMetrics {
  bundleSize: {
    raw: number;
    gzipped: number;
    target: number;
    files?: Array<{ name: string; size: number; gzipped: number }>;
  };
  importTime: {
    cold: number;
    warm: number;
    target: number;
  };
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    target: number;
  };
  validationPerformance: {
    concept: number;
    valueSet: number;
    value: number;
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(2)} μs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

async function measureImportTime(): Promise<{ cold: number; warm: number }> {
  // Cold import
  const coldStart = performance.now();
  await import("../dist/index.js");
  const coldEnd = performance.now();
  const coldTime = coldEnd - coldStart;

  // Warm import (should be faster due to module cache)
  const warmStart = performance.now();
  await import("../dist/index.js");
  const warmEnd = performance.now();
  const warmTime = warmEnd - warmStart;

  return { cold: coldTime, warm: warmTime };
}

function measureBundleSize(): { raw: number; gzipped: number; files: Array<{ name: string; size: number; gzipped: number }> } {
  const distPath = join(process.cwd(), "dist");
  const files: Array<{ name: string; size: number; gzipped: number }> = [];
  let totalRaw = 0;
  let totalGzipped = 0;

  try {
    // Check main entry point
    const mainPath = join(distPath, "index.js");
    if (statSync(mainPath).isFile()) {
      const stats = statSync(mainPath);
      const rawSize = stats.size;
      const content = readFileSync(mainPath);
      const gzipped = gzipSync(content);
      const gzippedSize = gzipped.length;
      
      files.push({ name: "index.js", size: rawSize, gzipped: gzippedSize });
      totalRaw += rawSize;
      totalGzipped += gzippedSize;
    }

    // Check other JS files in dist
    const fs = require("fs");
    const distFiles = fs.readdirSync(distPath).filter((f: string) => f.endsWith(".js"));
    
    for (const file of distFiles) {
      if (file === "index.js") continue; // Already counted
      const filePath = join(distPath, file);
      try {
        const stats = statSync(filePath);
        if (stats.isFile()) {
          const rawSize = stats.size;
          const content = readFileSync(filePath);
          const gzipped = gzipSync(content);
          const gzippedSize = gzipped.length;
          
          files.push({ name: file, size: rawSize, gzipped: gzippedSize });
          totalRaw += rawSize;
          totalGzipped += gzippedSize;
        }
      } catch {
        // Skip files that can't be read
      }
    }

    return { raw: totalRaw, gzipped: totalGzipped, files };
  } catch (error) {
    console.warn("⚠️  dist/index.js not found. Run 'pnpm build' first.");
    return { raw: 0, gzipped: 0, files: [] };
  }
}

function measureMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
} {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
  };
}

async function measureValidationPerformance(): Promise<{
  concept: number;
  valueSet: number;
  value: number;
}> {
  const { validateConcept, validateValueSet, validateValue } = await import("../dist/index.js");

  // Measure concept validation
  const conceptIterations = 1000;
  const conceptStart = performance.now();
  for (let i = 0; i < conceptIterations; i++) {
    try {
      validateConcept({
        code: "TEST_CONCEPT",
        category: "ENTITY",
        domain: "CORE",
        description: "Test concept",
      });
    } catch {
      // Expected to fail validation, but measures performance
    }
  }
  const conceptEnd = performance.now();
  const conceptTime = (conceptEnd - conceptStart) / conceptIterations;

  // Measure value set validation
  const valueSetIterations = 1000;
  const valueSetStart = performance.now();
  for (let i = 0; i < valueSetIterations; i++) {
    try {
      validateValueSet({
        code: "TEST_VALUESET",
        domain: "CORE",
        description: "Test value set",
        jurisdiction: "GLOBAL",
      });
    } catch {
      // Expected to fail validation
    }
  }
  const valueSetEnd = performance.now();
  const valueSetTime = (valueSetEnd - valueSetStart) / valueSetIterations;

  // Measure value validation
  const valueIterations = 1000;
  const valueStart = performance.now();
  for (let i = 0; i < valueIterations; i++) {
    try {
      validateValue({
        code: "TEST_VALUE",
        value_set_code: "TEST_VALUESET",
        label: "Test Value",
        description: "Test value",
        sort_order: 1,
      });
    } catch {
      // Expected to fail validation
    }
  }
  const valueEnd = performance.now();
  const valueTime = (valueEnd - valueStart) / valueIterations;

  return {
    concept: conceptTime,
    valueSet: valueSetTime,
    value: valueTime,
  };
}

async function main() {
  console.log("🔍 Performance Profiling\n");
  console.log("=".repeat(60));

  // Measure bundle size
  console.log("\n📦 Bundle Size:");
  const bundleSize = measureBundleSize();
  const bundleTarget = 500 * 1024; // 500KB
  console.log(`  Raw:        ${formatBytes(bundleSize.raw)}`);
  console.log(`  Gzipped:    ${formatBytes(bundleSize.gzipped)}`);
  console.log(`  Target:     ${formatBytes(bundleTarget)}`);
  console.log(`  Status:     ${bundleSize.gzipped <= bundleTarget ? "✅ PASS" : "❌ FAIL"}`);
  
  if (bundleSize.files.length > 0) {
    console.log(`\n  Files:`);
    bundleSize.files
      .sort((a, b) => b.gzipped - a.gzipped)
      .slice(0, 10)
      .forEach((file) => {
        console.log(`    ${file.name.padEnd(30)} ${formatBytes(file.size).padStart(10)} (${formatBytes(file.gzipped)} gzipped)`);
      });
  }

  // Measure import time
  console.log("\n⏱️  Import Time:");
  const importTime = await measureImportTime();
  const importTarget = 50; // 50ms
  console.log(`  Cold Start: ${formatTime(importTime.cold)}`);
  console.log(`  Warm:       ${formatTime(importTime.warm)}`);
  console.log(`  Target:     ${formatTime(importTarget)}`);
  console.log(`  Status:     ${importTime.cold <= importTarget ? "✅ PASS" : "❌ FAIL"}`);

  // Measure memory usage
  console.log("\n💾 Memory Usage:");
  const memory = measureMemoryUsage();
  const memoryTarget = 10 * 1024 * 1024; // 10MB
  console.log(`  Heap Used:  ${formatBytes(memory.heapUsed)}`);
  console.log(`  Heap Total: ${formatBytes(memory.heapTotal)}`);
  console.log(`  External:   ${formatBytes(memory.external)}`);
  console.log(`  Target:     ${formatBytes(memoryTarget)}`);
  console.log(`  Status:     ${memory.heapUsed <= memoryTarget ? "✅ PASS" : "❌ FAIL"}`);

  // Measure validation performance
  console.log("\n⚡ Validation Performance:");
  const validation = await measureValidationPerformance();
  console.log(`  Concept:    ${formatTime(validation.concept)}`);
  console.log(`  Value Set:  ${formatTime(validation.valueSet)}`);
  console.log(`  Value:      ${formatTime(validation.value)}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Summary:");
  const allPassed =
    bundleSize.gzipped <= bundleTarget &&
    importTime.cold <= importTarget &&
    memory.heapUsed <= memoryTarget;

  console.log(`  Overall: ${allPassed ? "✅ ALL TARGETS MET" : "⚠️  SOME TARGETS NOT MET"}`);
  console.log("\n");

  // Return metrics for programmatic use
  const metrics: PerformanceMetrics = {
    bundleSize: {
      raw: bundleSize.raw,
      gzipped: bundleSize.gzipped,
      target: bundleTarget,
      files: bundleSize.files,
    } as any,
    importTime: {
      cold: importTime.cold,
      warm: importTime.warm,
      target: importTarget,
    },
    memoryUsage: {
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      target: memoryTarget,
    },
    validationPerformance: {
      concept: validation.concept,
      valueSet: validation.valueSet,
      value: validation.value,
    },
  };

  return metrics;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as profilePerformance };

