# RFC 003: Tailwind CSS v4 Architecture & Usage Standards

| Metadata | Details |
| --- | --- |
| **Status** | **MANDATORY / ADOPTED** |
| **Target Layer** | Frontend Architecture (CSS) |
| **Engine** | Oxide (Rust-based) |
| **Strategy** | "CSS-First" Configuration |

## 1. Abstract

This standard mandates the adoption of **Tailwind CSS v4** using the "CSS-First" configuration strategy. It explicitly prohibits the legacy "JS-First" configuration (`tailwind.config.js`) for new definitions and restricts the use of the `@apply` directive. The goal is to leverage the new **Oxide engine** for sub-millisecond build times and to treat design tokens as native CSS variables, aligning with modern web standards.

## 2. The Paradigm Shift: Standard vs. Best Practice

| Feature | **Standard Practice** (Legacy v3) | **Best Practice** (RFC 003 / v4) |
| --- | --- | --- |
| **Configuration** | `tailwind.config.js` (JavaScript) | **CSS-Native** (`@theme` blocks in CSS) |
| **Engine** | JavaScript (Node.js) | **Oxide** (Rust, 10x faster) |
| **Design Tokens** | JS Objects in config | **Native CSS Variables** |
| **Variant Logic** | Complex plugin API | **Native Cascade Layers** |
| **Usage** | `@apply` to hide utilities | **Utility-First + Component Composition** |

---

## 3. Specification

### 3.1. Layer 1: The "CSS-First" Configuration

**Objective:** Eliminate the context switch between JavaScript and CSS files for styling logic.

* **Requirement:** We **SHALL NOT** use `tailwind.config.js` for defining themes, colors, or fonts.
* **Mechanism:** All design tokens **MUST** be defined inside the CSS entry point using the `@theme` directive.
* **Best Practice Syntax:**

```css
@import "tailwindcss";

@theme {
  /* Best Practice: Define tokens directly in CSS */
  --font-display: "Satoshi", "sans-serif";
  --color-primary: oklch(55% 0.2 240);
  
  /* Overrides */
  --breakpoint-3xl: 1920px;
}

```

* **Why?** This allows the browser to understand variables natively and simplifies the build chain (removing the need for complex JIT parsing of JS files).

### 3.2. Layer 2: The Oxide Engine (Performance)

**Objective:** Zero-latency development server.

* **Requirement:** The project **MUST** utilize the Tailwind v4 PostCSS plugin or the dedicated Vite plugin which utilizes the **Oxide** (Rust) engine.
* **Standard:**
* We do not run `npx tailwindcss -w`.
* We rely on the build tool (Vite/Next.js) integration which now detects classes instantly.



### 3.3. Layer 3: The "No-@apply" Policy (Architecture)

**Objective:** Prevent "Re-inventing BEM in Tailwind."

* **The Anti-Pattern (Standard Practice):**
Developers often use `@apply` to create "clean classes."
```css
/* FORBIDDEN */
.btn-primary {
  @apply bg-blue-500 text-white py-2 px-4 rounded;
}

```


*Reasoning:* This bloats the CSS bundle and breaks the "utility-first" benefits (cacheability, predictability).
* **The Best Practice (RFC 003):**
Use **Component Composition** (React/Vue/Svelte) or **CVA (Class Variance Authority)**.
```typescript
// ALLOWED: Using CVA for variant management
import { cva } from "class-variance-authority";

const button = cva("rounded py-2 px-4", {
  variants: {
    intent: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-900"
    }
  }
});

```



---

## 4. Mandatory Enforcement

To ensure this strategy is not just a "suggestion," we apply the following automated constraints.

### 4.1. The Class Sorter (Prettier)

**Requirement:** Arbitrary class ordering is forbidden.
**Tool:** `prettier-plugin-tailwindcss`.
**Config:**

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cva", "clsx"]
}

```

* **Outcome:** If a developer types `class="p-4 flex"`, the linter auto-fixes it to `class="flex p-4"` on save. This ensures zero diff noise in Git.

### 4.2. The CSS Linter

**Requirement:** Detect and warn against excessive `@apply`.
**Tool:** `stylelint` with `stylelint-config-tailwindcss`.
**Rule:** Limit `@apply` usage. Ideally, forbid it entirely except for 3rd-party library overrides.

---

## 5. Strategic Justification (For Stakeholders)

**Why v4? Why now?**

1. **Unified Toolchain:** Tailwind v4 aligns with the modern "Rust-ification" of web tooling (like TurboPack and Rolldown). By adopting Oxide, we future-proof our build pipeline.
2. **Native CSS Evolution:** Modern CSS (Container Queries, Cascade Layers, OKLCH colors) is moving faster than JS frameworks. Tailwind v4's "CSS-First" approach ensures we are using browser-native features, not JS abstractions.

## 6. Execution Plan

1. **Install:** `npm install tailwindcss@next @tailwindcss/vite`
2. **Migrate:** Move all tokens from `tailwind.config.js` to `src/app.css` inside `@theme`.
3. **Delete:** Remove `tailwind.config.js` entirely.
4. **Enforce:** Add `prettier-plugin-tailwindcss` to the repo's devDependencies.
