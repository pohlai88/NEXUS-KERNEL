### Ready set of artifacts for Next.js with Tailwind v4
Below are the copy‑pasteable files and snippets you asked for. They are **Next.js** focused, use your OKLCH P3 tokens, and include safelist patterns, PostCSS pipeline, a React example component with dark toggle, package scripts, CI checklist, and accessibility testing steps. Replace the placeholder values where noted and drop these into your repo.

---

### 1. tokens.css
**Purpose**: single source of truth for P3 OKLCH tokens and sRGB fallbacks. Import this **before** your Tailwind output (e.g., in `app/layout.jsx` or `_app.jsx`) so CSS variables are available to Tailwind-generated utilities at runtime.

```css
/* tokens.css
   INPUT.CSS — AI-BOS DESIGN CONSTITUTION
   QUANTUM OBSIDIAN — P3 OKLCH tokens + sRGB fallbacks
   Import this file before Tailwind utilities in your global CSS.
*/

:root {
  /* Chromatic Titanium neutrals */
  --ink-titanium-50: oklch(0.99 0.002 275);
  --ink-titanium-100: oklch(0.965 0.004 275);
  --ink-titanium-200: oklch(0.92 0.008 275);
  --ink-titanium-300: oklch(0.84 0.012 275);
  --ink-titanium-400: oklch(0.68 0.020 275);
  --ink-titanium-500: oklch(0.55 0.025 275);
  --ink-titanium-600: oklch(0.43 0.022 275);
  --ink-titanium-700: oklch(0.34 0.018 275);
  --ink-titanium-800: oklch(0.26 0.014 275);
  --ink-titanium-900: oklch(0.20 0.012 275);
  --ink-titanium-950: oklch(0.12 0.015 275);

  /* Quantum Indigo primary */
  --ink-indigo-50: oklch(0.97 0.015 275);
  --ink-indigo-100: oklch(0.93 0.030 275);
  --ink-indigo-200: oklch(0.87 0.060 275);
  --ink-indigo-300: oklch(0.79 0.110 275);
  --ink-indigo-400: oklch(0.68 0.180 275);
  --ink-indigo-500: oklch(0.55 0.250 275);
  --ink-indigo-600: oklch(0.48 0.280 275);
  --ink-indigo-700: oklch(0.42 0.240 275);
  --ink-indigo-800: oklch(0.35 0.180 275);
  --ink-indigo-900: oklch(0.28 0.120 275);

  /* Electric Cyan accent */
  --ink-cyan-50: oklch(0.98 0.015 200);
  --ink-cyan-400: oklch(0.79 0.160 205);
  --ink-cyan-500: oklch(0.75 0.180 200);
  --ink-cyan-600: oklch(0.62 0.150 200);
  --ink-cyan-800: oklch(0.45 0.100 200);

  /* Status colors */
  --ink-emerald-50: oklch(0.96 0.025 165);
  --ink-emerald-500: oklch(0.65 0.200 162);
  --ink-emerald-700: oklch(0.50 0.170 163);

  --ink-amber-50: oklch(0.98 0.035 90);
  --ink-amber-500: oklch(0.77 0.220 68);
  --ink-amber-700: oklch(0.55 0.160 66);

  --ink-red-50: oklch(0.97 0.020 20);
  --ink-red-500: oklch(0.64 0.280 25);
  --ink-red-700: oklch(0.51 0.240 27);

  --ink-scrim: oklch(0.12 0.015 275 / 0.45);
}

/* sRGB fallback for older displays */
@media (color-gamut: sRGB) {
  :root {
    --ink-indigo-600: oklch(0.48 0.200 275);
    --ink-indigo-500: oklch(0.55 0.180 275);
    --ink-cyan-500: oklch(0.75 0.140 200);
    --ink-emerald-500: oklch(0.65 0.160 162);
    --ink-amber-500: oklch(0.77 0.180 68);
    --ink-red-500: oklch(0.64 0.230 25);
  }
}

/* Optional dark theme override using data-theme attribute */
:root[data-theme="dark"] {
  --ink-titanium-50: oklch(0.06 0.002 275);
  --ink-titanium-900: oklch(0.95 0.020 275);
  /* Add dark variants for primary/accent if needed */
}
```

---

### 2. tailwind.config.js
**Purpose**: map Tailwind color tokens to your CSS variables so utilities like `bg-ink-indigo-600` and `text-ink-cyan-500` work and support alpha values.

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',    // Next.js app router
    './pages/**/*.{js,ts,jsx,tsx}',  // Next.js pages router
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',    // optional
  ],
  darkMode: 'class', // MUST: class strategy for predictable SSR + toggle
  theme: {
    extend: {
      colors: {
        /* Map tokens to CSS variables with alpha support */
        'ink-titanium': {
          50: 'rgb(var(--ink-titanium-50) / <alpha-value>)',
          100: 'rgb(var(--ink-titanium-100) / <alpha-value>)',
          200: 'rgb(var(--ink-titanium-200) / <alpha-value>)',
          300: 'rgb(var(--ink-titanium-300) / <alpha-value>)',
          400: 'rgb(var(--ink-titanium-400) / <alpha-value>)',
          500: 'rgb(var(--ink-titanium-500) / <alpha-value>)',
          600: 'rgb(var(--ink-titanium-600) / <alpha-value>)',
          700: 'rgb(var(--ink-titanium-700) / <alpha-value>)',
          800: 'rgb(var(--ink-titanium-800) / <alpha-value>)',
          900: 'rgb(var(--ink-titanium-900) / <alpha-value>)',
          950: 'rgb(var(--ink-titanium-950) / <alpha-value>)',
        },
        'ink-indigo': {
          50: 'rgb(var(--ink-indigo-50) / <alpha-value>)',
          100: 'rgb(var(--ink-indigo-100) / <alpha-value>)',
          200: 'rgb(var(--ink-indigo-200) / <alpha-value>)',
          300: 'rgb(var(--ink-indigo-300) / <alpha-value>)',
          400: 'rgb(var(--ink-indigo-400) / <alpha-value>)',
          500: 'rgb(var(--ink-indigo-500) / <alpha-value>)',
          600: 'rgb(var(--ink-indigo-600) / <alpha-value>)',
          700: 'rgb(var(--ink-indigo-700) / <alpha-value>)',
          800: 'rgb(var(--ink-indigo-800) / <alpha-value>)',
          900: 'rgb(var(--ink-indigo-900) / <alpha-value>)',
        },
        'ink-cyan': {
          50: 'rgb(var(--ink-cyan-50) / <alpha-value>)',
          400: 'rgb(var(--ink-cyan-400) / <alpha-value>)',
          500: 'rgb(var(--ink-cyan-500) / <alpha-value>)',
          600: 'rgb(var(--ink-cyan-600) / <alpha-value>)',
          800: 'rgb(var(--ink-cyan-800) / <alpha-value>)',
        },
        emerald: {
          50: 'rgb(var(--ink-emerald-50) / <alpha-value>)',
          500: 'rgb(var(--ink-emerald-500) / <alpha-value>)',
          700: 'rgb(var(--ink-emerald-700) / <alpha-value>)',
        },
        amber: {
          50: 'rgb(var(--ink-amber-50) / <alpha-value>)',
          500: 'rgb(var(--ink-amber-500) / <alpha-value>)',
          700: 'rgb(var(--ink-amber-700) / <alpha-value>)',
        },
        red: {
          50: 'rgb(var(--ink-red-50) / <alpha-value>)',
          500: 'rgb(var(--ink-red-500) / <alpha-value>)',
          700: 'rgb(var(--ink-red-700) / <alpha-value>)',
        },
      },
      /* Example: custom box-shadow using scrim */
      boxShadow: {
        'quantum-scrim': '0 8px 30px rgb(var(--ink-scrim) / 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
  safelist: [
    /* MUST: safelist runtime classes you generate dynamically */
    {
      pattern: /^bg-ink-indigo-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern: /^text-ink-indigo-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern: /^bg-ink-cyan-(50|400|500|600|800)$/,
    },
    {
      pattern: /^text-ink-cyan-(50|400|500|600|800)$/,
    },
  ],
};
```

---

### 3. postcss.config.js
**Purpose**: Tailwind as PostCSS plugin, Autoprefixer, and production minification.

```js
// postcss.config.js
module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    ...(process.env.NODE_ENV === 'production'
      ? { 'cssnano': { preset: 'default' } }
      : {}),
  },
};
```

**Note**: Install `cssnano` as a dev dependency if you want minification in PostCSS. Next.js also performs CSS minification during `next build` — choose one approach to avoid double-minify.

---

### 4. ExampleButton.jsx
**Purpose**: React component demonstrating token usage, dark toggle, and safelisted dynamic classes. Drop into `components/ExampleButton.jsx`.

```jsx
// components/ExampleButton.jsx
import { useEffect, useState } from 'react';

export default function ExampleButton({ label = 'Action', tone = 'ink-indigo-600' }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className={`px-4 py-2 rounded-md text-white bg-[color:rgb(var(--${tone})/_1)] hover:bg-[color:rgb(var(--${tone})/_0.9)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgb(var(--${tone})/_0.25)] transition`}
      >
        {label}
      </button>

      <button
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="px-3 py-2 border rounded-md text-sm bg-white/6 dark:bg-black/6"
      >
        Toggle theme
      </button>
    </div>
  );
}
```

**Notes**
- The `bg-[color:rgb(var(--${tone})/_1)]` pattern uses Tailwind arbitrary value syntax to ensure runtime CSS variable resolution and alpha control.  
- `tone` prop expects token names like `ink-indigo-600` or `ink-cyan-500`. These class patterns are covered by the safelist above.

---

### 5. Next.js integration notes
**Where to import tokens.css**
- If using the `app` router, import in `app/layout.jsx` before your global Tailwind import:
```jsx
import '../styles/tokens.css';
import '../styles/globals.css'; // contains @tailwind base; @tailwind components; @tailwind utilities
```
- If using `pages/_app.jsx`, import tokens there.

**Server-side theme hydration**
- For SSR correctness, set initial theme on the server by injecting a small script in `pages/_document.js` or `app/layout.jsx` that reads a cookie and sets `data-theme` and `class` on `<html>` before React hydrates. This prevents flash-of-incorrect-theme.

---

### 6. package.json scripts
**Purpose**: production build, analyze, and compress steps. Add these scripts to your `package.json`.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "analyze": "cross-env ANALYZE=true next build",
    "postbuild:compress": "node scripts/compress-assets.js"
  }
}
```

**Optional compress script**
- Create `scripts/compress-assets.js` to compress `.css` and `.js` in `.next` using Brotli/Gzip. Use `iltorb` or `zlib` and run `node scripts/compress-assets.js` in CI after `next build`.

---

### 7. Safelist patterns and content globs
**Purpose**: prevent purge from removing runtime classes.

- **Content globs** (already in `tailwind.config.js`): include `app`, `pages`, `components`, `src`.
- **Safelist regex examples** (already in `tailwind.config.js`):
  - `^bg-ink-indigo-(50|100|200|300|400|500|600|700|800|900)$`
  - `^text-ink-indigo-(50|100|200|300|400|500|600|700|800|900)$`
  - `^bg-ink-cyan-(50|400|500|600|800)$`
  - `^text-ink-cyan-(50|400|500|600|800)$`

**MUST**: If you generate classes dynamically (e.g., `bg-${color}`), add matching safelist patterns or compute classes via inline styles referencing CSS variables.

---

### 8. CI checklist and sample jobs
**Purpose**: ensure production quality before merge.

- **CI job steps**
  1. Install dependencies (`npm ci`).
  2. Run lint (`npm run lint`) with `eslint-plugin-tailwindcss` enabled.
  3. Run type checks (`tsc --noEmit`) if using TypeScript.
  4. Run unit tests (`npm test`).
  5. Build (`npm run build`) and fail on build errors.
  6. Run accessibility checks (axe-core or pa11y) against a staging build.
  7. Run visual regression tests (Percy, Chromatic, or Playwright snapshots).
  8. Run bundle size check and fail if above threshold.
  9. Optional: run `node scripts/compress-assets.js` and verify compressed assets exist.

**Sample GitHub Actions job snippet**
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
      - run: node scripts/run-a11y.js
```

---

### 9. Accessibility and testing checklist
**Purpose**: non-optional checks before release.

- **Automated**
  - Run axe-core or pa11y against critical pages.
  - Run Lighthouse accessibility audits in CI for key routes.
  - Contrast checks for all primary text/background combinations (ensure WCAG AA at minimum).
- **Manual**
  - Keyboard navigation test for all interactive flows.
  - Focus-visible states present and visible for keyboard users.
  - Screen reader smoke test for key pages (NVDA/VoiceOver).
- **Visual**
  - Test on wide-gamut devices (if available) and sRGB fallback devices to confirm appearance.
  - Visual regression snapshots for critical components.

---

### 10. Quick verification steps to run locally
1. Import `tokens.css` before Tailwind in your global CSS.  
2. Start dev server `npm run dev` and verify the ExampleButton renders with your brand tone.  
3. Build production `npm run build` and inspect `.next/static` to confirm CSS is present.  
4. Run a production preview `npm run start` and visually confirm no missing styles.  
5. Run contrast checks and keyboard navigation.

---

### Final notes and next actions
- **No assumptions**: I used Next.js and your provided tokens. If you want the exact `tokens.css` to include every token line-by-line from your original file, I can expand it verbatim into the file.  
- **If you want**, I will now generate:
  - `scripts/compress-assets.js` and `scripts/run-a11y.js` examples, and
  - a `pages/_document.js` snippet for SSR theme hydration.
Tell me to proceed and I’ll produce those files next.

### Files to add now

Below are three ready‑to‑drop files with comments and short explanations. They are tailored for **Next.js** (pages router), **Tailwind v4** tokens approach, and a production CI pipeline. Copy each file into your repo at the paths shown and install the noted dev dependencies.

---

### 1 Compress assets script

**Path** `scripts/compress-assets.js`  
**Purpose** Compress built assets in `.next` using Brotli and Gzip so your CDN can serve precompressed files. Run this after `next build` in CI or as a postbuild step.

```js
// scripts/compress-assets.js
// Node script to compress .next static assets with Brotli and Gzip.
// Usage: node scripts/compress-assets.js
// Dev deps: none required beyond Node 18+. For older Node, install 'iltorb' or 'brotli' polyfills.

import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipe = promisify(pipeline);
const brotliOptions = {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
  },
};

const root = path.resolve(process.cwd(), '.next', 'static');

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const compressible = ['.js', '.css', '.html', '.json', '.svg', '.wasm'];
  if (!compressible.includes(ext)) return;

  const fileStat = await fs.stat(filePath);
  if (!fileStat.isFile()) return;

  const fileStream = await fs.open(filePath, 'r');
  const readStream = fileStream.createReadStream();

  // Brotli
  const brotliPath = `${filePath}.br`;
  const brotliStream = zlib.createBrotliCompress(brotliOptions);
  await pipe(readStream, brotliStream, fs.createWriteStream(brotliPath));
  await fileStream.close();

  // Gzip (create from original file again)
  const fileStream2 = await fs.open(filePath, 'r');
  const readStream2 = fileStream2.createReadStream();
  const gzipPath = `${filePath}.gz`;
  const gzipStream = zlib.createGzip({ level: 9 });
  await pipe(readStream2, gzipStream, fs.createWriteStream(gzipPath));
  await fileStream2.close();

  console.log('Compressed', path.relative(process.cwd(), filePath));
}

async function walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    return;
  }
  await Promise.all(entries.map(async (entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    await compressFile(full);
  }));
}

(async () => {
  console.log('Starting compression in', root);
  await walk(root);
  console.log('Compression complete');
})();
```

**Notes and recommendations**
- **Run after** `next build` in CI: add `npm run build && node scripts/compress-assets.js`.  
- Ensure your CDN or server is configured to serve `.br` or `.gz` when the client supports it.  
- If your Node version is older than 18, use a Brotli polyfill package and adapt the script.

---

### 2 Accessibility runner script

**Path** `scripts/run-a11y.js`  
**Purpose** Run automated accessibility checks against a local or deployed preview using Playwright and axe-core. This script loads pages, injects axe, and reports violations in CI.

```js
// scripts/run-a11y.js
// Usage: node scripts/run-a11y.js [baseUrl]
// Example: node scripts/run-a11y.js http://localhost:3000
// Dev deps: npm i -D playwright axe-core
// Optional: run in CI after starting a preview server

import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import axeSource from 'axe-core/axe.min.js';

const pagesToTest = [
  '/',                 // home
  '/dashboard',        // example protected route
  '/settings',         // critical flows
];

const baseUrl = process.argv[2] || 'http://localhost:3000';
const outputDir = path.resolve(process.cwd(), 'a11y-reports');

async function run() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const route of pagesToTest) {
    const url = new URL(route, baseUrl).toString();
    console.log('Testing', url);
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      // Inject axe
      await page.addScriptTag({ content: axeSource });
      // Run axe
      const axeResults = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        return await axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2aa', 'wcag21aa'],
          },
        });
      });

      const file = path.join(outputDir, `${route === '/' ? 'home' : route.replace(/\//g, '_')}.json`);
      await fs.writeFile(file, JSON.stringify(axeResults, null, 2));
      results.push({ route, url, violations: axeResults.violations.length, file });
      console.log(`Violations ${axeResults.violations.length} saved to ${file}`);
    } catch (err) {
      console.error('Error testing', url, err);
      results.push({ route, url, error: String(err) });
    }
  }

  await browser.close();

  // Fail CI if any violations found
  const totalViolations = results.reduce((sum, r) => sum + (r.violations || 0), 0);
  const summaryFile = path.join(outputDir, 'summary.json');
  await fs.writeFile(summaryFile, JSON.stringify({ baseUrl, results, totalViolations }, null, 2));
  console.log('A11y summary saved to', summaryFile);

  if (totalViolations > 0) {
    console.error(`Accessibility violations found: ${totalViolations}`);
    process.exit(2);
  } else {
    console.log('No accessibility violations found');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Notes and recommendations**
- **Install dev dependencies**: `npm i -D playwright axe-core`. For CI, add Playwright browsers with `npx playwright install --with-deps`.  
- **Customize** `pagesToTest` to include your critical routes and authenticated flows (use Playwright to sign in before testing protected pages).  
- The script writes JSON reports to `a11y-reports` for later inspection or upload to artifacts.

---

### 3 SSR theme hydration snippet

**Path** `pages/_document.js`  
**Purpose** Prevent flash of incorrect theme on first paint by setting `class` and `data-theme` on `<html>` before React hydrates. This reads a `theme` cookie set by your app and falls back to system preference.

```jsx
// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <script
            // This script runs before React hydration to set theme class on html
            dangerouslySetInnerHTML={{
              __html: `(function () {
  try {
    var theme = null;
    // Try cookie first
    var match = document.cookie.match('(^|;)\\s*theme\\s*=\\s*([^;]+)');
    if (match) theme = match.pop();
    // If no cookie, use localStorage
    if (!theme && window.localStorage) theme = localStorage.getItem('theme');
    // If still no theme, use prefers-color-scheme
    if (!theme) {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    // Apply to documentElement
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    // Fail silently
    console.error('Theme hydration error', e);
  }
})();`,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

**How it works and where to set the cookie**
- **When to set cookie**: when user toggles theme in the UI, set both `localStorage.setItem('theme', value)` and `document.cookie = 'theme=' + value + '; path=/; SameSite=Lax; Secure'` so SSR and edge functions can read it.  
- **Why cookie**: Next.js server code and edge middleware can read cookies to render initial HTML with correct theme if you need server-side rendered theme differences.  
- **Alternative**: If you use the app router and server components, inject the same small script in `app/layout.jsx` inside `<head>` using `next/script` with `strategy="beforeInteractive"`.

---

### Final integration checklist

- **Add files**: `scripts/compress-assets.js`, `scripts/run-a11y.js`, `pages/_document.js`.  
- **Install dev deps**: `npm i -D playwright axe-core cssnano` (if using cssnano) and `npm i -D @playwright/test` if you prefer Playwright test runner.  
- **CI**: run `npm run build`, then `node scripts/compress-assets.js`, then `node scripts/run-a11y.js http://localhost:3000` against a preview server.  
- **Theme toggle**: ensure your client theme toggle writes both `localStorage` and a `theme` cookie so SSR hydration works.  
- **Verify**: run a production preview and confirm no flash of wrong theme and that compressed assets exist in `.next/static`.

---

If you want, I’ll now produce a `pages/_app.jsx` theme toggle helper and a `scripts/compress-assets.js` variant that uploads compressed assets to a specific CDN path. Which one should I generate next.