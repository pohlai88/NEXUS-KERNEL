This is the **Implementation Standard** for the Tailwind CSS v4 "Industry Best Practice" architecture.

It is structured as a technical SOP (Standard Operating Procedure) to ensure compliance with the "CSS-First" strategy mandated in the previous steps.

---

# SOP 001: Tailwind CSS v4 Implementation Guidelines

| **Component** | **Standard** |
| --- | --- |
| **Engine** | Oxide (Rust-based, via Vite/PostCSS) |
| **Config Strategy** | **Zero-JS** (CSS Native) |
| **Entry Point** | `src/app.css` |
| **Plugin Management** | `@plugin` directive |

---

## 1. The Architecture (Visualized)

The fundamental shift is removing the "Config Context Switch." In v3, you jumped between JS (config) and CSS (styles). In v4, the architecture is linear.

---

## 2. Implementation Steps

### 2.1. The Entry Point (`src/app.css`)

This is the single source of truth. You **SHALL NOT** use `tailwind.config.js`.

**File:** `src/app.css`

```css
/* 1. Import the Core */
@import "tailwindcss";

/* 2. Plugin Registration (Directly in CSS) */
/* Best Practice: Use the package name directly */
@plugin "@tailwindcss/typography";
@plugin "tailwindcss-animate";

/* 3. The Theme Schema (The "Config" Replacement) */
@theme {
  /* * RFC Compliance: 
   * - Use --color-* for colors
   * - Use --font-* for typography
   * - Use --spacing-* for layout 
   */
  
  /* Primary Brand Colors (OKLCH is the v4 Standard) */
  --color-brand-primary: oklch(55% 0.2 240);
  --color-brand-surface: oklch(98% 0.02 240);

  /* Typography */
  --font-display: "Satoshi", "sans-serif";
  --font-body: "Inter", "sans-serif";

  /* Layout Tokens */
  --radius-card: 0.75rem;
  --breakpoint-3xl: 1920px;
}

/* 4. Layer Architecture */
/* * Instead of @layer base/components/utilities, 
 * v4 encourages native CSS Cascade Layers implicitly.
 * But explicit layers are still supported for clarity.
 */

@utility container-fluid {
  margin-inline: auto;
  padding-inline: 2rem;
  max-width: 100%;
}

```

### 2.2. The Build Pipeline (Vite Config)

You **MUST** use the `@tailwindcss/vite` plugin to engage the Oxide engine. Do not use the PostCSS compatibility mode unless integrating with legacy frameworks (like standard Next.js without Turbo).

**File:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'; // The Oxide Engine

export default defineConfig({
  plugins: [
    tailwindcss(), // Must be initialized here
    // ... framework plugins (React, Vue, etc.)
  ],
});

```

### 2.3. Dark Mode Strategy (Native Variant)

In v4, Dark Mode is often automatic based on system preference. To force a "Class-Based" toggle (for a UI switch), you must define a custom variant in CSS, not JS.

**File:** `src/app.css` (Add this section)

```css
/* Custom Variant: "dark" applies when .dark class is on HTML root */
@custom-variant dark (&:where(.dark, .dark *));

```

---

## 3. Application Guide (How to Use)

### 3.1. Using Variables in HTML

Because v4 treats variables as native CSS, you can use them in two ways: as **Utilities** or as **Raw Variables**.

**Usage:**

```tsx
export function Card() {
  return (
    // Method 1: Utility Class (Best Practice)
    // The --color-brand-primary token automatically generates 'bg-brand-primary'
    <div className="bg-brand-primary rounded-card p-6">
      
      {/* Method 2: Arbitrary Values (Allowed for one-offs) */}
      <h1 className="font-display text-[2rem]">
        Hello World
      </h1>

      {/* Method 3: Composition (Using RFC 003 CVA) */}
      <button className="bg-brand-surface text-brand-primary hover:opacity-90">
        Action
      </button>
    </div>
  )
}

```

### 3.2. Troubleshooting "Unknown At-Rule"

Since `@theme`, `@plugin`, and `@utility` are new v4 directives, your IDE (VS Code) will flag them as errors by default.

**Remediation:**
Ensure the `.vscode/settings.json` (from the previous step) is active.

```json
"css.lint.unknownAtRules": "ignore"

```

---

## 4. Migration Checklist (From v3 to v4 Best Practice)

If you are upgrading an existing project, follow this "Destructive" path to enforce best practices:

1. **Delete** `tailwind.config.js`.
2. **Delete** `postcss.config.js` (unless you have other non-Tailwind PostCSS plugins).
3. **Move** `content: []` paths? **No.**
* *Reasoning:* The new v4 Oxide engine automatically detects `index.html` and imports. You usually do not need to configure content paths manually unless your project structure is non-standard.


4. **Rename** `tailwind.css` to `app.css` (Standard naming convention).

---

