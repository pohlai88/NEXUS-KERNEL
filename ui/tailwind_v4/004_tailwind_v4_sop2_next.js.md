This is the **Critical Integration Standard** for using Tailwind v4 within the Next.js ecosystem.

You are correct to raise this flag. The "Vite" strategy defined in the previous step **WILL FAIL** inside a standard Next.js application because Next.js does not use Vite; it uses **Webpack** or **Turbopack**.

To resolve this architectural conflict while maintaining the "CSS-First" Best Practice (RFC 003), we must apply the **PostCSS Bridge Pattern**.

---

# SOP 002: Next.js + Tailwind v4 Integration Standard

| Metadata | Details |
| --- | --- |
| **Status** | **MANDATORY** (for Next.js projects) |
| **Conflict** | Next.js Build System  Vite |
| **Solution** | The PostCSS Adapter Strategy |
| **Performance** | Turbopack (`--turbo`) |

## 1. The Conflict Resolution (Visualized)

The conflict arises because the "Best Practice" generic implementation uses `@tailwindcss/vite`. Next.js cannot run this plugin.

**The Workaround:** We strip the "Oxide Engine" direct integration and instead inject Tailwind v4 into Next.js's internal PostCSS processing pipeline. This allows us to keep the **Zero-JS Config** (CSS-First) strategy while respecting Next.js's architecture.

---

## 2. Configuration Specifications

### 2.1. Dependency Adjustment

You **MUST NOT** install `@tailwindcss/vite`.
You **MUST** install `@tailwindcss/postcss`.

```bash
# Correct Industry Standard for Next.js + TWv4
npm install tailwindcss@next @tailwindcss/postcss postcss

```

### 2.2. The Bridge Configuration (`postcss.config.mjs`)

This file is the "Adapter" that connects the new Tailwind engine to Next.js.

* **Requirement:** Use `.mjs` (ES Modules) to align with modern Next.js defaults.
* **Code:**

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // The v4 Plugin Bridge
    "@tailwindcss/postcss": {}, 
  },
};

export default config;

```

### 2.3. The Build Engine (`package.json`)

To match the performance of the "Oxide" engine mentioned in the Vite strategy, you **MUST** run Next.js with **Turbopack**. Tailwind v4 is optimized to feed Turbopack efficiently.

* **Standard Practice:** `"dev": "next dev"` (Slow, Webpack)
* **Best Practice:** `"dev": "next dev --turbo"` (Fast, Rust-based)

```json
"scripts": {
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}

```

---

## 3. The Entry Point Strategy (`src/app/globals.css`)

In Next.js, the "Entry Point" is conventionally `globals.css`. We apply the **RFC 003 CSS-First** standard here.

**File:** `src/app/globals.css`

```css
/* 1. Import Core */
@import "tailwindcss";

/* 2. Next.js Specific Cleanup */
/* Next.js often injects default styles that conflict with TW reset. 
   Verify your layout.tsx does not double-import styles. */

/* 3. The Theme (RFC 003 Compliant) */
@theme {
  --color-brand-primary: oklch(55% 0.2 240);
  --font-sans: "Inter", sans-serif;
  
  /* Next.js often uses geist-sans, link it here if using */
  --font-geist: var(--font-geist-sans); 
}

/* 4. Utilities */
@utility container-fluid {
  margin-inline: auto;
  padding-inline: 2rem;
}

```

---

## 4. Workaround for "Flash of Unstyled Content" (FOUC)

A known conflict with Next.js 14/15 App Router and Tailwind v4 is CSS ordering logic during server-side rendering (SSR).

**The Fix:**
Ensure your Root Layout explicitly imports the CSS **before** any component imports to guarantee the cascade priority.

**File:** `src/app/layout.tsx`

```tsx
// 1. CSS MUST be the first import to establish the Cascade Layer order
import "./globals.css"; 

import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tailwind v4 Next.js App",
  description: "RFC Compliant Architecture",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 2. Hydration Warning is standard Next.js Best Practice for extensions */}
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

```

---

## 5. Summary of Divergence

To prevent misinterpretation, here is how the strategy changes specifically for Next.js:

| Component | **Generic / Vite (RFC 003)** | **Next.js (SOP 002)** |
| --- | --- | --- |
| **Connector** | `@tailwindcss/vite` | `@tailwindcss/postcss` |
| **Config File** | `vite.config.ts` | `postcss.config.mjs` |
| **Accelerator** | Internal Oxide Engine | Turbopack (`--turbo`) |
| **Entry Point** | `src/app.css` | `src/app/globals.css` |

**Final Verification Step:**
Does this resolve the conflict? **Yes.** By swapping the Vite plugin for the PostCSS plugin, we allow Next.js to control the build process while Tailwind v4 simply acts as a ultra-fast CSS processor within that pipeline.

**Would you like the `globals.css` file pre-filled with the "Best Practice" Shadcn/UI compatible theme tokens, as that is the most common component library paired with Next.js?**