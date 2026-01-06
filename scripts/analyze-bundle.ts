#!/usr/bin/env tsx
/**
 * Bundle Analysis Script
 * 
 * Comprehensive bundle analysis for @aibos/kernel package.
 * Analyzes bundle composition, identifies large dependencies, and tracks size regressions.
 * 
 * Usage: pnpm tsx scripts/analyze-bundle.ts
 */

import { readFileSync, statSync, readdirSync } from "fs";
import { join, relative } from "path";
import { gzipSync } from "zlib";

interface BundleFile {
  name: string;
  path: string;
  size: number;
  gzipped: number;
  percentage: number;
}

interface BundleAnalysis {
  total: {
    raw: number;
    gzipped: number;
    target: number;
  };
  files: BundleFile[];
  largestFiles: BundleFile[];
  dependencies: {
    name: string;
    size: number;
    gzipped: number;
  }[];
  recommendations: string[];
}

const BUNDLE_TARGET = 5 * 1024; // 5KB (current is 3.4KB, very good)
const WARNING_THRESHOLD = 4 * 1024; // 4KB warning threshold

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function analyzeBundle(): BundleAnalysis {
  const distPath = join(process.cwd(), "dist");
  const files: BundleFile[] = [];
  let totalRaw = 0;
  let totalGzipped = 0;

  try {
    // Analyze all JS files in dist
    const jsFiles = readdirSync(distPath)
      .filter((f) => f.endsWith(".js") && !f.includes(".test"))
      .sort();

    for (const file of jsFiles) {
      const filePath = join(distPath, file);
      try {
        const stats = statSync(filePath);
        if (stats.isFile()) {
          const rawSize = stats.size;
          const content = readFileSync(filePath);
          const gzipped = gzipSync(content);
          const gzippedSize = gzipped.length;

          totalRaw += rawSize;
          totalGzipped += gzippedSize;

          files.push({
            name: file,
            path: relative(process.cwd(), filePath),
            size: rawSize,
            gzipped: gzippedSize,
            percentage: 0, // Will calculate after total
          });
        }
      } catch (error) {
        console.warn(`⚠️  Could not analyze ${file}: ${error}`);
      }
    }

    // Calculate percentages
    files.forEach((file) => {
      file.percentage = totalGzipped > 0 ? (file.gzipped / totalGzipped) * 100 : 0;
    });

    // Sort by size
    const largestFiles = [...files].sort((a, b) => b.gzipped - a.gzipped).slice(0, 10);

    // Analyze dependencies (check node_modules for zod)
    const dependencies: { name: string; size: number; gzipped: number }[] = [];
    try {
      const zodPath = join(process.cwd(), "node_modules", "zod", "lib", "index.js");
      if (statSync(zodPath).isFile()) {
        const zodContent = readFileSync(zodPath);
        const zodGzipped = gzipSync(zodContent);
        dependencies.push({
          name: "zod",
          size: zodContent.length,
          gzipped: zodGzipped.length,
        });
      }
    } catch {
      // Zod not found or can't be analyzed
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (totalGzipped > WARNING_THRESHOLD) {
      recommendations.push(`Bundle size (${formatBytes(totalGzipped)}) is approaching target (${formatBytes(BUNDLE_TARGET)})`);
    }
    if (totalGzipped > BUNDLE_TARGET) {
      recommendations.push(`⚠️ Bundle size exceeds target! Consider code-splitting or lazy loading.`);
    }
    if (largestFiles[0] && largestFiles[0].gzipped > totalGzipped * 0.5) {
      recommendations.push(`Large file detected: ${largestFiles[0].name} (${largestFiles[0].percentage.toFixed(1)}% of bundle)`);
    }
    if (dependencies.length > 0 && dependencies[0].gzipped > totalGzipped * 0.3) {
      recommendations.push(`Large dependency: ${dependencies[0].name} (${formatBytes(dependencies[0].gzipped)})`);
    }
    if (recommendations.length === 0) {
      recommendations.push("✅ Bundle size is optimal!");
    }

    return {
      total: {
        raw: totalRaw,
        gzipped: totalGzipped,
        target: BUNDLE_TARGET,
      },
      files,
      largestFiles,
      dependencies,
      recommendations,
    };
  } catch (error) {
    console.error("❌ Error analyzing bundle:", error);
    throw error;
  }
}

function printAnalysis(analysis: BundleAnalysis): void {
  console.log("📦 Bundle Analysis Report\n");
  console.log("=".repeat(70));

  // Summary
  console.log("\n📊 Summary:");
  console.log(`  Total Size (raw):     ${formatBytes(analysis.total.raw)}`);
  console.log(`  Total Size (gzipped): ${formatBytes(analysis.total.gzipped)}`);
  console.log(`  Target Size:          ${formatBytes(analysis.total.target)}`);
  const status = analysis.total.gzipped <= analysis.total.target ? "✅ PASS" : "❌ FAIL";
  const percentage = ((analysis.total.gzipped / analysis.total.target) * 100).toFixed(1);
  console.log(`  Status:               ${status} (${percentage}% of target)`);

  // Largest files
  if (analysis.largestFiles.length > 0) {
    console.log("\n📁 Largest Files (Top 10):");
    console.log("  " + "File".padEnd(40) + "Size".padStart(12) + "Gzipped".padStart(12) + "  %".padStart(8));
    console.log("  " + "-".repeat(72));
    analysis.largestFiles.forEach((file) => {
      console.log(
        `  ${file.name.padEnd(40)}${formatBytes(file.size).padStart(12)}${formatBytes(file.gzipped).padStart(12)}  ${file.percentage.toFixed(1)}%`
      );
    });
  }

  // Dependencies
  if (analysis.dependencies.length > 0) {
    console.log("\n📦 Dependencies:");
    analysis.dependencies.forEach((dep) => {
      console.log(`  ${dep.name.padEnd(20)}${formatBytes(dep.size).padStart(12)}${formatBytes(dep.gzipped).padStart(12)}`);
    });
  }

  // Recommendations
  console.log("\n💡 Recommendations:");
  analysis.recommendations.forEach((rec) => {
    console.log(`  ${rec}`);
  });

  console.log("\n" + "=".repeat(70));
}

function main(): void {
  try {
    const analysis = analyzeBundle();
    printAnalysis(analysis);

    // Exit with error code if bundle exceeds target
    if (analysis.total.gzipped > analysis.total.target) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Bundle analysis failed:", error);
    process.exit(1);
  }
}

// Run main if this is the entry point (check if script is being run directly)
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || 
    process.argv[1]?.includes("analyze-bundle.ts")) {
  main();
}

export { analyzeBundle, type BundleAnalysis };

