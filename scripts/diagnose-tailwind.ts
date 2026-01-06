/* =============================================================================
  AI-BOS — TAILWIND CSS DIAGNOSTIC TOOL
  PURPOSE:
    - Validate Tailwind CSS configuration and usage
    - Check @apply directives follow P10 patterns
    - Verify all classes in CLASS_CONTRACT.md are valid
    - Detect illegal utility classes
    - Validate CSS compilation

  USAGE:
    pnpm diagnose:tailwind
============================================================================= */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "child_process";

type DiagnosticIssue = {
  severity: "error" | "warning" | "info";
  category: string;
  message: string;
  file?: string;
  line?: number;
  detail?: string;
};

const ROOT = process.cwd();
const UI_DIR = path.join(ROOT, "ui");
const INPUT_CSS = path.join(UI_DIR, "input.css");
const STYLE_CSS = path.join(UI_DIR, "style.css");
const CONTRACT_PATH = path.join(UI_DIR, "CLASS_CONTRACT.md");
const CONFIG_PATH = path.join(ROOT, "tailwind.config.js");

const issues: DiagnosticIssue[] = [];

// 1. Validate Tailwind config exists and is valid
function validateConfig(): void {
  if (!fs.existsSync(CONFIG_PATH)) {
    issues.push({
      severity: "error",
      category: "Configuration",
      message: "tailwind.config.js not found",
      file: "tailwind.config.js",
    });
    return;
  }

  try {
    const configContent = fs.readFileSync(CONFIG_PATH, "utf8");
    // Check for RIGID MODE comments
    if (!configContent.includes("RIGID MODE") && !configContent.includes("corePlugins")) {
      issues.push({
        severity: "warning",
        category: "Configuration",
        message: "tailwind.config.js may not have RIGID MODE enabled",
        file: "tailwind.config.js",
        detail: "Expected corePlugins to disable most utilities",
      });
    }
  } catch (error) {
    issues.push({
      severity: "error",
      category: "Configuration",
      message: `Failed to read tailwind.config.js: ${error}`,
      file: "tailwind.config.js",
    });
  }
}

// 2. Validate input.css exists and has required structure
function validateInputCss(): void {
  if (!fs.existsSync(INPUT_CSS)) {
    issues.push({
      severity: "error",
      category: "CSS Source",
      message: "ui/input.css not found",
      file: "ui/input.css",
    });
    return;
  }

  const content = fs.readFileSync(INPUT_CSS, "utf8");
  const lines = content.split("\n");

  // Check for P10 enforcers
  const hasP10 = /P10\.|PILLAR 10|ENFORCER/i.test(content);
  if (!hasP10) {
    issues.push({
      severity: "warning",
      category: "CSS Source",
      message: "No P10 (Enforcers) section found in input.css",
      file: "ui/input.css",
    });
  }

  // Check @apply usage follows patterns
  const applyMatches = Array.from(content.matchAll(/@apply\s+([^;]+);/g));
  for (const match of applyMatches) {
    const applyClasses = match[1].trim();
    const lineNum = content.substring(0, match.index).split("\n").length;

    // Check for forbidden utilities in @apply
    const forbiddenPatterns = [
      /\b(bg-(?:blue|green|red|yellow|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d+)/,
      /\b(z-\d+|z-sticky|z-dropdown)\b/,
      /\b\[[^\]]+\]/, // Arbitrary values
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(applyClasses)) {
        issues.push({
          severity: "error",
          category: "@apply Validation",
          message: `Forbidden utility in @apply directive`,
          file: "ui/input.css",
          line: lineNum,
          detail: `Found: ${applyClasses.match(pattern)?.[0]}`,
        });
      }
    }

    // Check for semantic utilities (should be allowed)
    const hasSemantic = /bg-(?:surface|canvas|primary|secondary|ghost|overlay|raised)|text-(?:text-main|text-sub|text-muted|primary-foreground|secondary-foreground|success|danger|info)|border-(?:border|border-strong|ring|success|danger|info)/.test(
      applyClasses
    );
    if (!hasSemantic && applyClasses.split(/\s+/).length > 3) {
      issues.push({
        severity: "info",
        category: "@apply Validation",
        message: "Consider using semantic utilities in @apply",
        file: "ui/input.css",
        line: lineNum,
        detail: `Current: ${applyClasses.substring(0, 50)}...`,
      });
    }
  }

  // Check for @theme directives (Tailwind v4)
  const hasTheme = /@theme\s*\{/.test(content);
  if (!hasTheme) {
    issues.push({
      severity: "warning",
      category: "CSS Source",
      message: "No @theme directive found (expected for Tailwind v4)",
      file: "ui/input.css",
    });
  }
}

// 3. Validate CLASS_CONTRACT.md and extract all classes
function validateClassContract(): void {
  if (!fs.existsSync(CONTRACT_PATH)) {
    issues.push({
      severity: "error",
      category: "Class Contract",
      message: "ui/CLASS_CONTRACT.md not found",
      file: "ui/CLASS_CONTRACT.md",
    });
    return;
  }

  const content = fs.readFileSync(CONTRACT_PATH, "utf8");
  const classMatches = Array.from(content.matchAll(/^\s*-\s+([a-z0-9][a-z0-9-:]*)\s*$/gim));
  const classes = new Set(classMatches.map((m) => m[1].trim()));

  if (classes.size === 0) {
    issues.push({
      severity: "warning",
      category: "Class Contract",
      message: "No classes found in CLASS_CONTRACT.md",
      file: "ui/CLASS_CONTRACT.md",
    });
  } else {
    issues.push({
      severity: "info",
      category: "Class Contract",
      message: `Found ${classes.size} legal classes in CLASS_CONTRACT.md`,
    });

    // Check if all P10 enforcer classes are documented
    const inputCss = fs.existsSync(INPUT_CSS) ? fs.readFileSync(INPUT_CSS, "utf8") : "";
    const p10ClassMatches = Array.from(inputCss.matchAll(/\.([a-z0-9][a-z0-9-]+)\s*\{/g));
    const p10Classes = new Set(
      p10ClassMatches
        .map((m) => m[1])
        .filter((cls) => !cls.startsWith("layer-") && !cls.startsWith("elev-"))
    );

    const missingClasses: string[] = [];
    for (const cls of p10Classes) {
      if (!classes.has(cls) && !cls.includes(":")) {
        // Check if it's a variant (hover:, focus:, etc.)
        missingClasses.push(cls);
      }
    }

    if (missingClasses.length > 0) {
      issues.push({
        severity: "warning",
        category: "Class Contract",
        message: `${missingClasses.length} P10 classes not documented in CLASS_CONTRACT.md`,
        file: "ui/CLASS_CONTRACT.md",
        detail: `Missing: ${missingClasses.slice(0, 10).join(", ")}${missingClasses.length > 10 ? "..." : ""}`,
      });
    }
  }
}

// 4. Test CSS compilation
function validateCompilation(): void {
  if (!fs.existsSync(INPUT_CSS)) {
    return; // Already reported
  }

  try {
    // Try to compile CSS
    execSync("pnpm dashboard:build-css", { cwd: ROOT, stdio: "pipe" });
    
    if (!fs.existsSync(STYLE_CSS)) {
      issues.push({
        severity: "error",
        category: "Compilation",
        message: "CSS compilation failed - ui/style.css not generated",
        file: "ui/style.css",
      });
      return;
    }

    const styleContent = fs.readFileSync(STYLE_CSS, "utf8");
    if (styleContent.trim().length === 0) {
      issues.push({
        severity: "error",
        category: "Compilation",
        message: "CSS compilation produced empty output",
        file: "ui/style.css",
      });
    } else {
      issues.push({
        severity: "info",
        category: "Compilation",
        message: `CSS compiled successfully (${(styleContent.length / 1024).toFixed(2)} KB)`,
      });
    }
  } catch (error: any) {
    issues.push({
      severity: "error",
      category: "Compilation",
      message: `CSS compilation failed: ${error.message}`,
      file: "ui/input.css",
      detail: "Run 'pnpm dashboard:build-css' to see full error",
    });
  }
}

// 5. Check for Tailwind IntelliSense extension recommendation
function checkIntelliSense(): void {
  issues.push({
    severity: "info",
    category: "IDE Setup",
    message: "Install Tailwind CSS IntelliSense extension in VS Code for linting",
    detail: "Extension ID: bradlc.vscode-tailwindcss",
  });
}

// 6. Validate package.json scripts
function validateScripts(): void {
  const packageJsonPath = path.join(ROOT, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const scripts = packageJson.scripts || {};

  const requiredScripts = ["dashboard:build-css", "dashboard:watch-css"];
  for (const script of requiredScripts) {
    if (!scripts[script]) {
      issues.push({
        severity: "warning",
        category: "Scripts",
        message: `Missing script: ${script}`,
        file: "package.json",
      });
    }
  }
}

// Main execution
function main() {
  console.log("🔍 AI-BOS Tailwind CSS Diagnostic\n");

  validateConfig();
  validateInputCss();
  validateClassContract();
  validateCompilation();
  validateScripts();
  checkIntelliSense();

  // Group issues by severity
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  // Report
  if (errors.length > 0) {
    console.log("❌ ERRORS:\n");
    for (const issue of errors) {
      console.log(`  ${issue.message}`);
      if (issue.file) console.log(`    File: ${issue.file}${issue.line ? `:${issue.line}` : ""}`);
      if (issue.detail) console.log(`    ${issue.detail}`);
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log("⚠️  WARNINGS:\n");
    for (const issue of warnings) {
      console.log(`  ${issue.message}`);
      if (issue.file) console.log(`    File: ${issue.file}${issue.line ? `:${issue.line}` : ""}`);
      if (issue.detail) console.log(`    ${issue.detail}`);
      console.log();
    }
  }

  if (infos.length > 0) {
    console.log("ℹ️  INFO:\n");
    for (const issue of infos) {
      console.log(`  ${issue.message}`);
      if (issue.detail) console.log(`    ${issue.detail}`);
      console.log();
    }
  }

  // Summary
  console.log("─".repeat(50));
  console.log(`Total: ${issues.length} issues (${errors.length} errors, ${warnings.length} warnings, ${infos.length} info)`);

  if (errors.length > 0) {
    console.log("\n❌ Diagnostic failed - fix errors and re-run");
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log("\n⚠️  Diagnostic passed with warnings");
    process.exit(0);
  } else {
    console.log("\n✅ Diagnostic passed - all checks OK");
    process.exit(0);
  }
}

main();

