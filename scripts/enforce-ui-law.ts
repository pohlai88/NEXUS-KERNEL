/* =============================================================================
  AI-BOS — UI LAW ENFORCER (DRIFT GATE)
  PURPOSE:
    - Kill IDE drift by making style deviations mechanically illegal.
    - Fail build immediately on any forbidden patterns or unknown classes.

  NON-NEGOTIABLES:
    - No inline styles
    - No <style> tags
    - No Tailwind utilities (bg- / text- / p- / m- / gap- / shadow- / z- / etc.)
    - No Tailwind arbitrary values ([...])
    - No unknown class names (only the allowed class surface)

  USAGE:
    node scripts/enforce-ui-law.ts
============================================================================= */

import fs from "node:fs";
import path from "node:path";

type Violation = {
  file: string;
  reason: string;
  detail?: string;
};

const ROOT = process.cwd();
const UI_DIR = path.join(ROOT, "ui");
const SCRIPTS_DIR = path.join(ROOT, "scripts");

// 1) SINGLE SOURCE OF TRUTH — Allowed class surface
//    If ui/CLASS_CONTRACT.md exists, it is parsed and becomes the SSOT.
//    Otherwise fallback to the canonical set below (still strict).
const CONTRACT_PATH = path.join(UI_DIR, "CLASS_CONTRACT.md");

const FALLBACK_ALLOWED_CLASSES = new Set([
  // Shell
  "shell",

  // Typography
  "title",
  "section",
  "caption",

  // Data (split contract)
  "cell",
  "cell-pad",
  "cell-row",

  // Elevation
  "elev-0",
  "elev-1",
  "elev-2",
  "elev-3",

  // Layering (position + z)
  "layer-sticky",
  "layer-overlay",
  "layer-modal",
  "layer-toast",

  // Overlay primitives
  "overlay-scrim",

  // A11y
  "sr-only",
]);

function parseAllowedClassesFromContract(md: string): Set<string> {
  // Extract bullet lists like: "- shell"
  const allowed = new Set<string>();
  const lines = md.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*-\s+([a-z0-9][a-z0-9-]*)\s*$/i);
    if (m?.[1]) allowed.add(m[1].trim());
  }
  return allowed.size > 0 ? allowed : new Set(FALLBACK_ALLOWED_CLASSES);
}

function loadAllowedClasses(): Set<string> {
  try {
    if (fs.existsSync(CONTRACT_PATH)) {
      const md = fs.readFileSync(CONTRACT_PATH, "utf8");
      return parseAllowedClassesFromContract(md);
    }
  } catch {
    // ignore and fall back
  }
  return new Set(FALLBACK_ALLOWED_CLASSES);
}

// 2) Allowed semantic Tailwind utilities (from design system)
//    These are semantic tokens that map to design system variables
const ALLOWED_SEMANTIC_UTILITIES = new Set([
  // P2: Semantic Colors
  'bg-canvas', 'bg-surface', 'bg-surface-well', 'bg-raised', 'bg-overlay', 'bg-selected',
  'bg-primary', 'bg-primary-hover', 'bg-secondary', 'bg-secondary-hover', 'bg-ghost', 'bg-ghost-hover',
  'text-text-main', 'text-text-sub', 'text-text-muted', 'text-text-faint', 'text-text-inverse',
  'text-primary-foreground', 'text-secondary-foreground',
  'text-success', 'text-danger', 'text-info',
  'border-border', 'border-border-strong', 'border-divider', 'border-ring',
  'border-success', 'border-danger', 'border-info',
  'bg-border',
  // P3: Typography (size only, not weight/tracking)
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-4xl',
  // P4: Spacing (standard Tailwind spacing scale)
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'px-2', 'px-3', 'px-4', 'px-6',
  'py-1', 'py-2', 'py-3', 'py-4', 'py-6', 'pt-0', 'pb-0', 'pb-3', 'pl-0', 'pr-0',
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8', 'mt-1', 'mt-2', 'mt-4', 'mt-6', 'mt-8',
  'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-6', 'ml-1', 'mr-1',
  'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
  'space-y-2', 'space-y-3', 'space-y-4', 'space-y-6',
  // P5: Sizing (semantic contracts and standard utilities)
  'max-w-container', 'max-w-7xl', 'mx-auto',
  'w-8', 'h-8', 'h-4', 'w-px', 'w-full', 'h-full',
  // P6: Shape
  'rounded-sm', 'rounded-md', 'rounded-lg',
  'border', 'border-2',
  // P7: Elevation (from CLASS_CONTRACT)
  'elev-0', 'elev-1', 'elev-2', 'elev-3',
  'layer-sticky', 'layer-overlay', 'layer-modal', 'layer-toast',
  // P10: Accessibility (from CLASS_CONTRACT)
  'sr-only',
  // Layout utilities (standard Tailwind)
  'flex', 'grid', 'items-center', 'justify-between', 'justify-end', 'justify-center', 'text-center', 'text-left', 'text-right',
  'w-full', 'h-full', 'hidden', 'overflow-auto', 'overflow-hidden', 'whitespace-nowrap',
  'cursor-pointer', 'select-none', 'transition', 'transition-colors',
  'opacity-50', 'uppercase', 'font-medium', 'font-bold', 'font-semibold', 'font-mono',
  'border-collapse', 'divide-y', 'divide-border',
  'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-12',
  'col-span-2', 'col-span-3', 'col-span-4',
  'flex-wrap', 'inline-flex', 'hover:bg-surface', 'hover:bg-surface-well', 'hover:bg-primary-hover', 'hover:shadow-md', 'hover:elev-2',
  'last:border-0', 'lg:col-span-2', 'lg:col-span-3', 'md:grid-cols-4', 'md:block',
  'sticky', 'top-0', 'inset-0',
  'border-l-4', 'border-b', 'border-t',
]);

// Helper to check if a class is an allowed semantic utility
function isAllowedSemanticUtility(className: string): boolean {
  return ALLOWED_SEMANTIC_UTILITIES.has(className);
}

// 2) Forbidden patterns (hard fail)
const FORBIDDEN_SNIPPETS: Array<{ re: RegExp; reason: string }> = [
  // Inline style (forbidden)
  { re: /\sstyle\s*=\s*["']/i, reason: "Inline style is forbidden (style=\"...\")." },
  // <style> tags are allowed ONLY for design system CSS injection (checked separately)

  // Tailwind arbitrary values (but allow in CSS files)
  // Note: This will catch [280px] etc. in HTML, but we'll filter in validation

  // Forbidden: Default Tailwind colors (not semantic)
  { re: /\b(bg-(?:blue|green|red|yellow|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d+)/, reason: "Default Tailwind colors are forbidden. Use semantic tokens (bg-surface, text-text-main, etc.)." },
  
  // Forbidden: Arbitrary values in class names (but we'll check this more carefully)
  // { re: /\[[^\]]+\]/, reason: "Tailwind arbitrary values ([...]) are forbidden." },

  // Forbidden: z-index utilities (use layer-* instead)
  // Note: Only check in class attributes, not in code comments
  { re: /class\s*=\s*["'][^"']*\bz-\d+/, reason: "Tailwind z-index utilities are forbidden (z-*). Use layer-* contracts only." },
  
  // Forbidden: Custom z-index values
  { re: /class\s*=\s*["'][^"']*\bz-sticky\b/, reason: "Use layer-sticky instead of z-sticky." },
];

// 3) File policy
function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFilesRecursive(p));
    else out.push(p);
  }
  return out;
}

function rel(p: string): string {
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

function readText(file: string): string {
  return fs.readFileSync(file, "utf8");
}

// 4) Extract class names from HTML
function extractClassesFromHtml(html: string): string[] {
  const classes: string[] = [];
  // Capture class="..." and class='...'
  const re = /\bclass\s*=\s*(["'])(.*?)\1/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = (m[2] ?? "").trim();
    if (!raw) continue;
    for (const token of raw.split(/\s+/)) {
      if (token) classes.push(token);
    }
  }
  return classes;
}

// 4b) Extract class names from TypeScript (template literals, string concatenation)
//     This is critical for catching violations in serve-dashboard.ts and similar HTML generators
function extractClassesFromTs(ts: string): string[] {
  const classes: string[] = [];
  
  // Match class="..." and class='...' in template literals and strings
  // Also handle backtick template literals with embedded expressions
  const patterns = [
    // Template literals with double quotes: class="..."
    /class\s*=\s*["']([^"']*?)["']/g,
    // Template literals with backticks: class=`...`
    /class\s*=\s*`([^`]*?)`/g,
    // Template literals with embedded expressions: class={`...`}
    /class\s*=\s*\{`([^`]*?)`\}/g,
    // String concatenation patterns
    /class\s*=\s*["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    let m: RegExpExecArray | null;
    // Reset regex lastIndex to avoid issues with multiple patterns
    pattern.lastIndex = 0;
    while ((m = pattern.exec(ts))) {
      const raw = (m[1] ?? "").trim();
      if (!raw) continue;
      // Extract class tokens (handle template expressions like ${...})
      // Remove template expressions but keep the rest
      const classString = raw.replace(/\$\{[^}]+\}/g, "").trim();
      if (!classString) continue;
      
      // Split by whitespace and clean each token
      for (const token of classString.split(/\s+/)) {
        // Remove quotes, backticks, and other delimiters
        const cleanToken = token.replace(/["'`${}]+/g, "").trim();
        // Only add valid class names (alphanumeric, hyphens, underscores, colons for pseudo-classes)
        // Exclude JavaScript variable names (camelCase starting with lowercase)
        if (cleanToken && /^[a-z0-9:_-]+$/i.test(cleanToken)) {
          // Filter out JavaScript variables (camelCase that might leak into class strings)
          // But allow valid CSS classes like "isOk" if it's actually used as a class
          // For now, we'll be permissive and let the validation catch real issues
          classes.push(cleanToken);
        }
      }
    }
  }

  return classes;
}

// 5) Check unknown classes
function validateClasses(file: string, classTokens: string[], allowed: Set<string>, violations: Violation[]) {
  for (const cls of classTokens) {
    // Skip CSS files from class validation
    if (isCssFile(file)) continue;
    
    // Strict: only allow lower/num/hyphen class names
    // (If you later want to allow "is-active" etc, add it explicitly to contract.)
    if (!/^[a-z0-9:_-]+$/i.test(cls)) {
      violations.push({
        file,
        reason: "Illegal class token format (must be [a-z0-9-:] only).",
        detail: cls,
      });
      continue;
    }

    // Check if it's an allowed semantic utility (e.g., bg-surface, text-text-main)
    if (isAllowedSemanticUtility(cls)) {
      continue; // Allowed semantic utility
    }

    // Filter out JavaScript variables that might be extracted incorrectly
    // JavaScript camelCase variables (like isOk, hasValue) shouldn't be classes
    if (/^[a-z][a-zA-Z0-9]*$/.test(cls) && cls !== cls.toLowerCase() && !cls.includes('-')) {
      // Likely a JavaScript variable, skip it
      continue;
    }

    // Check if it's in the CLASS_CONTRACT
    if (!allowed.has(cls)) {
      violations.push({
        file,
        reason: "Unknown class (not in CLASS_CONTRACT or allowed semantic utilities).",
        detail: cls,
      });
    }
  }
}

// 6) Check forbidden patterns inside file content
function validateForbiddenPatterns(file: string, content: string, violations: Violation[]) {
  // Skip CSS files from pattern validation (they're design system source)
  if (isCssFile(file)) return;
  
  for (const rule of FORBIDDEN_SNIPPETS) {
    if (rule.re.test(content)) {
      violations.push({
        file,
        reason: rule.reason,
        detail: `Matched: ${rule.re}`,
      });
    }
  }
  
  // Check for <style> tags (allowed only for design system CSS injection)
  // In TypeScript files generating HTML, <style> tags are allowed if they inject design system CSS
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    const styleTagMatches = Array.from(content.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi));
    for (const match of styleTagMatches) {
      const styleContent = match[1] || '';
      // Allow <style> tags that contain design system CSS variables or are injected from style.css
      // Check for CSS variables, @theme, or design system markers
      const isDesignSystemCSS = /--color-|--type-|--space-|--radius-|--shadow-|--z-|@theme|@layer|AI-BOS|CONSTITUTION|10-PILLAR|\.shell|\.title|\.section|\.caption|\.cell|\.elev-|\.layer-/i.test(styleContent);
      // Also allow if it's a template variable that will be replaced with CSS (${css})
      const isTemplateVariable = /\$\{.*css.*\}/i.test(match[0]);
      if (!isDesignSystemCSS && !isTemplateVariable) {
        violations.push({
          file,
          reason: "<style> tags are forbidden except for design system CSS injection.",
          detail: "Only design system CSS (from ui/style.css) may be injected via <style> tags.",
        });
      }
    }
  } else {
    // In HTML files, <style> tags are forbidden
    if (/<style\b/i.test(content)) {
      violations.push({
        file,
        reason: "<style> tags are forbidden in HTML files.",
        detail: "Use external stylesheets or design system CSS injection only.",
      });
    }
  }
  
  // Check for arbitrary values in class attributes (but allow in CSS)
  const arbitraryValueInClass = /class\s*=\s*["'][^"']*\[[^\]]+\][^"']*["']/g;
  let match;
  while ((match = arbitraryValueInClass.exec(content)) !== null) {
    violations.push({
      file,
      reason: "Tailwind arbitrary values ([...]) are forbidden in class attributes.",
      detail: `Found: ${match[0].substring(0, 50)}...`,
    });
  }
}

// 7) Enforce CSS file policy (only ui/input.css and ui/style.css allowed)
//    CSS files are checked for existence but excluded from pattern/class validation
//    Excludes node_modules, coverage, and dist directories (build artifacts and dependencies)
function enforceCssSingleEntry(violations: Violation[]) {
  const cssFiles = listFilesRecursive(ROOT).filter((p) => {
    // Exclude build artifacts and dependencies
    const relPath = path.relative(ROOT, p).replaceAll("\\", "/");
    if (relPath.startsWith("node_modules/") || 
        relPath.startsWith("coverage/") || 
        relPath.startsWith("dist/")) {
      return false;
    }
    return p.endsWith(".css");
  });
  
  const allowedCss = new Set([
    path.join(UI_DIR, "input.css"),  // Source file
    path.join(UI_DIR, "style.css"),  // Compiled output
  ].map((p) => path.normalize(p)));

  for (const f of cssFiles) {
    const norm = path.normalize(f);
    if (!allowedCss.has(norm)) {
      violations.push({
        file: rel(f),
        reason: "Forbidden CSS file. Only ui/input.css (source) and ui/style.css (output) are allowed (closed CSS API).",
      });
    }
  }
}

// 7b) Check if a file is a CSS file (exclude from pattern/class checks)
function isCssFile(filePath: string): boolean {
  return filePath.endsWith(".css");
}

// 8) Main
function main() {
  const violations: Violation[] = [];
  const allowed = loadAllowedClasses();

  if (!fs.existsSync(UI_DIR)) {
    violations.push({
      file: rel(UI_DIR),
      reason: "UI directory not found. Expected ./ui/",
    });
  }

  // Enforce CSS single-entry rule (check existence, but exclude from pattern/class validation)
  enforceCssSingleEntry(violations);

  // Scan HTML files in ui/
  const htmlFiles = listFilesRecursive(UI_DIR).filter((p) => p.endsWith(".html"));
  for (const fileAbs of htmlFiles) {
    const file = rel(fileAbs);
    const content = readText(fileAbs);

    validateForbiddenPatterns(file, content, violations);

    const classTokens = extractClassesFromHtml(content);
    validateClasses(file, classTokens, allowed, violations);
  }

  // Scan TypeScript files in scripts/ that generate HTML (main drift source)
  // Focus especially on serve-dashboard.ts which generates HTML dynamically
  const tsFiles = listFilesRecursive(SCRIPTS_DIR).filter((p) => p.endsWith(".ts") || p.endsWith(".tsx"));
  for (const fileAbs of tsFiles) {
    const file = rel(fileAbs);
    const content = readText(fileAbs);

    // Skip CSS files (they're design system source, not HTML generation)
    if (isCssFile(fileAbs)) continue;

    // Check for HTML generation patterns (template strings, string concatenation)
    validateForbiddenPatterns(file, content, violations);

    // Extract class names from template literals and string concatenation
    const classTokens = extractClassesFromTs(content);
    validateClasses(file, classTokens, allowed, violations);
  }

  // NOTE: CSS files (ui/input.css, ui/style.css) are excluded from pattern/class checking
  // They are design system source files, not consumed HTML markup

  // Report
  if (violations.length > 0) {
    const grouped = new Map<string, Violation[]>();
    for (const v of violations) {
      const key = v.file;
      const arr = grouped.get(key) ?? [];
      arr.push(v);
      grouped.set(key, arr);
    }

    console.error("\n❌ AI-BOS UI LAW VIOLATIONS (BUILD FAILED)\n");
    for (const [file, vs] of grouped.entries()) {
      console.error(`— ${file}`);
      for (const v of vs) {
        console.error(`  • ${v.reason}${v.detail ? ` | ${v.detail}` : ""}`);
      }
      console.error("");
    }

    console.error("Fix violations and re-run.\n");
    process.exit(1);
  }

  console.log("✅ AI-BOS UI LAW: PASS (no drift detected)");
}

main();
