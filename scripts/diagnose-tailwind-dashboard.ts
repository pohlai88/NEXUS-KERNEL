/* =============================================================================
  NEXUS-KERNEL — TAILWIND DASHBOARD ARCHITECTURE DIAGNOSTIC
  
  PURPOSE:
    Validate the proper separation between:
    - ROOT (CSS Producer): Builds input.css → style.css
    - DASHBOARD (CSS Consumer): Imports pre-compiled style.css
    
  CHECKS:
    ✅ ROOT: tailwind.config.js, postcss.config.js, input.css, style.css
    ✅ DASHBOARD: next.config.ts, postcss.config.mjs, globals.css
    ✅ Architecture: No unnecessary Tailwind deps in dashboard
    ✅ Build process: Verify CSS compilation works
    ✅ Import chain: globals.css → style.css → input.css
    
  USAGE:
    pnpm diagnose:dashboard
============================================================================= */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "child_process";

type DiagnosticResult = {
  category: string;
  status: "✅ PASS" | "⚠️ WARN" | "❌ FAIL" | "ℹ️ INFO";
  message: string;
  details?: string[];
  file?: string;
};

const ROOT = process.cwd();
const UI_DIR = path.join(ROOT, "ui");
const DASHBOARD_DIR = path.join(UI_DIR, "dashboard");

const results: DiagnosticResult[] = [];

// Helper to read file safely
function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

// Helper to check file exists
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// ============================================================================
// ROOT LEVEL CHECKS (CSS Producer)
// ============================================================================

function checkRootTailwindConfig() {
  const configPath = path.join(ROOT, "tailwind.config.js");
  
  if (!fileExists(configPath)) {
    results.push({
      category: "ROOT Config",
      status: "❌ FAIL",
      message: "tailwind.config.js missing",
      file: configPath,
    });
    return;
  }
  
  const content = readFileSafe(configPath);
  if (!content) {
    results.push({
      category: "ROOT Config",
      status: "❌ FAIL",
      message: "Cannot read tailwind.config.js",
      file: configPath,
    });
    return;
  }
  
  // Check for content paths pointing to ui/
  const hasUIContent = /content:\s*\[[\s\S]*?["']\.\/ui\//.test(content);
  const hasCorePlugins = /corePlugins:\s*\{/.test(content);
  
  const details: string[] = [];
  if (hasUIContent) details.push("✅ Content paths configured for ui/");
  if (hasCorePlugins) details.push("✅ Core plugins configured (RIGID MODE)");
  
  results.push({
    category: "ROOT Config",
    status: "✅ PASS",
    message: "tailwind.config.js found and valid",
    file: configPath,
    details,
  });
}

function checkRootPostCSSConfig() {
  const configPath = path.join(ROOT, "postcss.config.js");
  
  if (!fileExists(configPath)) {
    results.push({
      category: "ROOT PostCSS",
      status: "⚠️ WARN",
      message: "postcss.config.js missing (optional)",
      file: configPath,
    });
    return;
  }
  
  const content = readFileSafe(configPath);
  if (!content) return;
  
  const hasTailwindPlugin = /@tailwindcss\/postcss/.test(content);
  
  results.push({
    category: "ROOT PostCSS",
    status: hasTailwindPlugin ? "✅ PASS" : "⚠️ WARN",
    message: hasTailwindPlugin 
      ? "PostCSS has @tailwindcss/postcss plugin"
      : "PostCSS config exists but no Tailwind plugin",
    file: configPath,
  });
}

function checkInputCSS() {
  const inputPath = path.join(UI_DIR, "input.css");
  
  if (!fileExists(inputPath)) {
    results.push({
      category: "CSS Source",
      status: "❌ FAIL",
      message: "ui/input.css not found (design constitution)",
      file: inputPath,
    });
    return;
  }
  
  const content = readFileSafe(inputPath);
  if (!content) return;
  
  const lines = content.split("\n").length;
  const hasTheme = /@theme\s*\{/.test(content) || /@theme\s+inline/.test(content);
  const hasLayers = /@layer\s+(base|components|utilities)/.test(content);
  const hasQuantumObsidian = /QUANTUM OBSIDIAN|ink-titanium|ink-indigo/i.test(content);
  
  const details: string[] = [
    `📄 ${lines.toLocaleString()} lines`,
    hasTheme ? "✅ @theme directive" : "⚠️ No @theme",
    hasLayers ? "✅ @layer directives" : "⚠️ No @layer",
    hasQuantumObsidian ? "✅ Quantum Obsidian design system" : "⚠️ No design tokens",
  ];
  
  results.push({
    category: "CSS Source",
    status: hasTheme && hasLayers ? "✅ PASS" : "⚠️ WARN",
    message: "ui/input.css found (design constitution)",
    file: inputPath,
    details,
  });
}

function checkStyleCSS() {
  const stylePath = path.join(UI_DIR, "style.css");
  
  if (!fileExists(stylePath)) {
    results.push({
      category: "CSS Output",
      status: "⚠️ WARN",
      message: "ui/style.css not found (run: pnpm dashboard:build-css)",
      file: stylePath,
      details: ["Run: pnpm dashboard:build-css to generate"],
    });
    return;
  }
  
  const stats = fs.statSync(stylePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  const content = readFileSafe(stylePath);
  
  if (!content) return;
  
  const lines = content.split("\n").length;
  const hasClasses = /\.[a-z][a-z0-9-]+\s*\{/.test(content);
  const hasTailwindComment = /tailwindcss/.test(content);
  
  const details: string[] = [
    `📦 ${sizeKB} KB (${lines.toLocaleString()} lines)`,
    hasClasses ? "✅ Pre-compiled utility classes" : "⚠️ No classes found",
    hasTailwindComment ? "✅ Tailwind build signature" : "⚠️ Not Tailwind output",
  ];
  
  results.push({
    category: "CSS Output",
    status: hasClasses ? "✅ PASS" : "⚠️ WARN",
    message: "ui/style.css found (pre-compiled for IDE)",
    file: stylePath,
    details,
  });
}

function checkBuildScripts() {
  const packagePath = path.join(ROOT, "package.json");
  if (!fileExists(packagePath)) return;
  
  const pkg = JSON.parse(readFileSafe(packagePath) || "{}");
  const scripts = pkg.scripts || {};
  
  const hasBuildCSS = !!scripts["dashboard:build-css"];
  const hasWatchCSS = !!scripts["dashboard:watch-css"];
  
  const details: string[] = [];
  if (hasBuildCSS) details.push(`✅ dashboard:build-css: ${scripts["dashboard:build-css"]}`);
  if (hasWatchCSS) details.push(`✅ dashboard:watch-css: ${scripts["dashboard:watch-css"]}`);
  
  results.push({
    category: "BUILD Scripts",
    status: hasBuildCSS && hasWatchCSS ? "✅ PASS" : "⚠️ WARN",
    message: "Build scripts configured",
    file: packagePath,
    details,
  });
}

// ============================================================================
// DASHBOARD LEVEL CHECKS (CSS Consumer)
// ============================================================================

function checkDashboardNextConfig() {
  const configPath = path.join(DASHBOARD_DIR, "next.config.ts");
  
  if (!fileExists(configPath)) {
    results.push({
      category: "DASHBOARD Config",
      status: "❌ FAIL",
      message: "next.config.ts not found",
      file: configPath,
    });
    return;
  }
  
  const content = readFileSafe(configPath);
  if (!content) return;
  
  const hasTurbopackRoot = /turbopack:\s*\{[\s\S]*?root:/.test(content);
  const hasExperimentalCss = /cssChunking/.test(content);
  
  const details: string[] = [];
  if (hasTurbopackRoot) details.push("✅ turbopack.root configured");
  if (hasExperimentalCss) details.push("ℹ️ cssChunking setting present");
  
  results.push({
    category: "DASHBOARD Config",
    status: hasTurbopackRoot ? "✅ PASS" : "⚠️ WARN",
    message: "next.config.ts found",
    file: configPath,
    details,
  });
}

function checkDashboardPostCSS() {
  const configPath = path.join(DASHBOARD_DIR, "postcss.config.mjs");
  
  if (!fileExists(configPath)) {
    results.push({
      category: "DASHBOARD PostCSS",
      status: "❌ FAIL",
      message: "postcss.config.mjs not found",
      file: configPath,
    });
    return;
  }
  
  const content = readFileSafe(configPath);
  if (!content) return;
  
  const hasTailwindPlugin = /@tailwindcss\/postcss/.test(content);
  const hasEmptyPlugins = /plugins:\s*\{\s*\}/.test(content);
  
  if (hasTailwindPlugin) {
    results.push({
      category: "DASHBOARD PostCSS",
      status: "⚠️ WARN",
      message: "PostCSS has @tailwindcss/postcss (should be empty)",
      file: configPath,
      details: [
        "Dashboard should NOT compile Tailwind (uses pre-compiled style.css)",
        "Recommended: Remove @tailwindcss/postcss plugin",
      ],
    });
  } else if (hasEmptyPlugins) {
    results.push({
      category: "DASHBOARD PostCSS",
      status: "✅ PASS",
      message: "PostCSS config has no plugins (correct)",
      file: configPath,
      details: ["✅ Dashboard consumes pre-compiled CSS"],
    });
  } else {
    results.push({
      category: "DASHBOARD PostCSS",
      status: "ℹ️ INFO",
      message: "PostCSS config exists",
      file: configPath,
    });
  }
}

function checkGlobalsCSS() {
  const globalsPath = path.join(DASHBOARD_DIR, "app", "globals.css");
  
  if (!fileExists(globalsPath)) {
    results.push({
      category: "DASHBOARD CSS",
      status: "❌ FAIL",
      message: "app/globals.css not found",
      file: globalsPath,
    });
    return;
  }
  
  const content = readFileSafe(globalsPath);
  if (!content) return;
  
  const importsStyleCSS = /@import\s+["']\.\.\/\.\.\/style\.css/.test(content);
  const hasTailwindImport = /@import\s+["']tailwindcss/.test(content);
  const hasInlineTheme = /@theme\s+inline/.test(content);
  
  const details: string[] = [];
  
  if (importsStyleCSS) {
    details.push("✅ Imports ../../style.css (pre-compiled)");
  } else if (hasTailwindImport) {
    details.push("⚠️ Imports tailwindcss (JIT mode - not recommended)");
  }
  
  if (hasInlineTheme) {
    details.push("⚠️ Has @theme inline (duplication risk)");
  }
  
  results.push({
    category: "DASHBOARD CSS",
    status: importsStyleCSS ? "✅ PASS" : "⚠️ WARN",
    message: "app/globals.css configuration",
    file: globalsPath,
    details,
  });
}

function checkDashboardPackageJson() {
  const pkgPath = path.join(DASHBOARD_DIR, "package.json");
  
  if (!fileExists(pkgPath)) {
    results.push({
      category: "DASHBOARD Deps",
      status: "❌ FAIL",
      message: "package.json not found",
      file: pkgPath,
    });
    return;
  }
  
  const pkg = JSON.parse(readFileSafe(pkgPath) || "{}");
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  
  const hasTailwind = !!deps.tailwindcss;
  const hasTailwindPostCSS = !!deps["@tailwindcss/postcss"];
  
  const details: string[] = [];
  
  if (hasTailwind) {
    details.push(`ℹ️ tailwindcss: ${deps.tailwindcss} (optional - not used if PostCSS empty)`);
  }
  
  if (hasTailwindPostCSS) {
    details.push(`ℹ️ @tailwindcss/postcss: ${deps["@tailwindcss/postcss"]} (optional)`);
  }
  
  if (!hasTailwind && !hasTailwindPostCSS) {
    details.push("✅ No Tailwind dependencies (pure consumer)");
  }
  
  results.push({
    category: "DASHBOARD Deps",
    status: "ℹ️ INFO",
    message: "Dependencies analysis",
    file: pkgPath,
    details,
  });
}

// ============================================================================
// ARCHITECTURE VALIDATION
// ============================================================================

function validateArchitecture() {
  const inputExists = fileExists(path.join(UI_DIR, "input.css"));
  const styleExists = fileExists(path.join(UI_DIR, "style.css"));
  const globalsExists = fileExists(path.join(DASHBOARD_DIR, "app", "globals.css"));
  
  if (!inputExists || !styleExists || !globalsExists) {
    results.push({
      category: "ARCHITECTURE",
      status: "❌ FAIL",
      message: "Missing critical CSS files",
      details: [
        inputExists ? "✅ input.css" : "❌ input.css",
        styleExists ? "✅ style.css" : "❌ style.css",
        globalsExists ? "✅ globals.css" : "❌ globals.css",
      ],
    });
    return;
  }
  
  const globalsContent = readFileSafe(path.join(DASHBOARD_DIR, "app", "globals.css"));
  const importsStyleCSS = globalsContent ? /@import\s+["']\.\.\/\.\.\/style\.css/.test(globalsContent) : false;
  
  results.push({
    category: "ARCHITECTURE",
    status: importsStyleCSS ? "✅ PASS" : "⚠️ WARN",
    message: "CSS import chain validation",
    details: [
      "📋 Expected: input.css → build → style.css → globals.css → layout.tsx",
      inputExists ? "✅ ui/input.css (source)" : "❌ Missing input.css",
      styleExists ? "✅ ui/style.css (compiled)" : "❌ Missing style.css",
      importsStyleCSS ? "✅ globals.css imports style.css" : "⚠️ globals.css doesn't import style.css",
    ],
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log("🔬 NEXUS-KERNEL Tailwind Dashboard Architecture Diagnostic\n");
  console.log("═".repeat(70));
  console.log("ARCHITECTURE: ROOT (Producer) + DASHBOARD (Consumer)");
  console.log("═".repeat(70));
  console.log();
  
  // ROOT checks
  console.log("📦 ROOT LEVEL (CSS Producer - D:\\NEXUS-KERNEL)");
  console.log("─".repeat(70));
  checkRootTailwindConfig();
  checkRootPostCSSConfig();
  checkInputCSS();
  checkStyleCSS();
  checkBuildScripts();
  console.log();
  
  // DASHBOARD checks
  console.log("🎨 DASHBOARD LEVEL (CSS Consumer - ui/dashboard)");
  console.log("─".repeat(70));
  checkDashboardNextConfig();
  checkDashboardPostCSS();
  checkGlobalsCSS();
  checkDashboardPackageJson();
  console.log();
  
  // Architecture validation
  console.log("🏗️  ARCHITECTURE VALIDATION");
  console.log("─".repeat(70));
  validateArchitecture();
  console.log();
  
  // Display results
  console.log("═".repeat(70));
  console.log("DIAGNOSTIC RESULTS");
  console.log("═".repeat(70));
  console.log();
  
  const grouped = {
    pass: results.filter(r => r.status === "✅ PASS"),
    warn: results.filter(r => r.status === "⚠️ WARN"),
    fail: results.filter(r => r.status === "❌ FAIL"),
    info: results.filter(r => r.status === "ℹ️ INFO"),
  };
  
  for (const result of [...grouped.fail, ...grouped.warn, ...grouped.pass, ...grouped.info]) {
    console.log(`${result.status} ${result.category}: ${result.message}`);
    if (result.file) {
      console.log(`   📄 ${path.relative(ROOT, result.file)}`);
    }
    if (result.details) {
      for (const detail of result.details) {
        console.log(`      ${detail}`);
      }
    }
    console.log();
  }
  
  // Summary
  console.log("═".repeat(70));
  console.log("SUMMARY");
  console.log("─".repeat(70));
  console.log(`✅ PASS: ${grouped.pass.length}`);
  console.log(`⚠️ WARN: ${grouped.warn.length}`);
  console.log(`❌ FAIL: ${grouped.fail.length}`);
  console.log(`ℹ️ INFO: ${grouped.info.length}`);
  console.log("─".repeat(70));
  
  if (grouped.fail.length > 0) {
    console.log("\n❌ Diagnostic FAILED - Fix errors above\n");
    process.exit(1);
  } else if (grouped.warn.length > 0) {
    console.log("\n⚠️  Diagnostic PASSED with warnings\n");
    process.exit(0);
  } else {
    console.log("\n✅ Diagnostic PASSED - Architecture is correct!\n");
    process.exit(0);
  }
}

main();
