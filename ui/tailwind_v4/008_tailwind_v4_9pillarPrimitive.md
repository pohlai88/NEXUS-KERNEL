This is a formal **Critique and Upgrade Proposal (RFC 004)**.

You are applying the **"9-Pillar Design System"** (standard 9-step chromatic scales: 100–900) to the Shadcn/Tailwind v4 architecture.

### The Critique of SOP 003 (The Shadcn Limitation)

While SOP 003 (Shadcn Standard) is functional, it is **typographically flat** and **design-immature** for enterprise applications.

* **The Flaw:** Shadcn defines a single bucket: `--primary`.
* **The Problem:** Professional design requires **hierarchy**. You need a lighter shade for hover states, a darker shade for active states, and a subtle shade for backgrounds. A single `--primary` variable forces you to use opacity hacks (`bg-primary/90`), which causes color bleeding issues on non-white backgrounds.
* **The Solution:** We must implement the **9-Pillar Primitive Layer** underneath the Semantic Layer.

---

# RFC 004: The 9-Pillar Token Architecture

| Metadata | Details |
| --- | --- |
| **Status** | **MANDATORY** (for Pro Design) |
| **Strategy** | Primitives (100-900)  Semantics |
| **Pillars** | 50, 100, 200, 300, 400, 500 (Default), 600, 700, 800, 900, 950 |
| **Compliance** | WCAG 2.1 Contrast Ratios |

## 1. Abstract

We are moving from a "Flat" system to a "Reference" system.
Instead of arbitrarily defining `--primary`, we first define a **9-Step Palette** (The Pillars). We then **alias** the Shadcn semantic variables to these pillars. This ensures that `bg-primary` is mathematically related to `bg-primary-hover` (derived from Pillar 600 or 700).

---

## 2. Implementation Specification

### 2.1. Layer 1: The 9-Pillar Primitives (CSS Variables)

We define the raw HSL/OKLCH values for the entire scale. This allows the design team to tweak the "Brand Blue" in one place, and the entire 100-900 scale updates automatically.

**File:** `src/app/globals.css` (Updated)

```css
@import "tailwindcss";

:root {
  /* --- PILLAR 1: NEUTRALS (Slate/Gray) --- */
  /* Used for text, borders, and subtle backgrounds */
  --neutral-50:  210 40% 98%;
  --neutral-100: 210 40% 96.1%;
  --neutral-200: 214.3 31.8% 91.4%;
  --neutral-300: 212.7 26.8% 83.9%;
  --neutral-400: 215 20.2% 65.1%;
  --neutral-500: 215.4 16.3% 46.9%;
  --neutral-600: 215.3 19.3% 34.5%;
  --neutral-700: 215.3 25% 26.7%;
  --neutral-800: 217.2 32.6% 17.5%;
  --neutral-900: 222.2 47.4% 11.2%; /* Often used as Foreground */
  --neutral-950: 222.2 84% 4.9%;

  /* --- PILLAR 2: BRAND PRIMARY (The Core Hue) --- */
  /* Professional Tip: Pillar 500 or 600 is usually the "Main" brand color */
  --brand-50:  220 100% 97%;
  --brand-100: 220 100% 94%;
  --brand-200: 220 100% 88%;
  --brand-300: 220 100% 78%;
  --brand-400: 220 100% 64%;
  --brand-500: 220 100% 50%; /* The Standard Brand Color */
  --brand-600: 220 100% 40%; /* Hover State */
  --brand-700: 220 100% 30%; /* Active State */
  --brand-800: 220 100% 20%;
  --brand-900: 220 100% 10%;
}

.dark {
  /* In Dark Mode, we invert the mapping, NOT the values. 
     Professional design systems often map Neutral-900 to Background */
}

```

### 2.2. Layer 2: The Semantic Mapping (The "Bridge")

This is where we satisfy **SOP 003** (Shadcn compatibility) while utilizing the **9 Pillars**.

**File:** `src/app/globals.css` (continued)

```css
@theme {
  /* 1. Expose the Pillars as Utilities (Optional but recommended) */
  --color-brand-50: hsl(var(--brand-50));
  --color-brand-100: hsl(var(--brand-100));
  /* ... all steps ... */
  --color-brand-500: hsl(var(--brand-500));
  --color-brand-600: hsl(var(--brand-600));

  /* 2. Map Shadcn Semantics to Pillars */
  /* Instead of arbitrary values, we LOCK them to the scale */
  
  /* Backgrounds */
  --color-background: hsl(var(--neutral-50)); /* Pillar 50 */
  --color-foreground: hsl(var(--neutral-900)); /* Pillar 900 */

  /* Primary Action */
  --color-primary: hsl(var(--brand-500));        /* The Main Pillar */
  --color-primary-foreground: hsl(var(--brand-50)); /* High Contrast Text */

  /* UI Elements */
  --color-border: hsl(var(--neutral-200));       /* Pillar 200 */
  --color-input: hsl(var(--neutral-200));
  --color-ring: hsl(var(--brand-500));           /* Focus Ring matches Brand */
  
  /* Muted/Subtle */
  --color-muted: hsl(var(--neutral-100));        /* Pillar 100 */
  --color-muted-foreground: hsl(var(--neutral-500)); /* Pillar 500 */
}

```

---

## 3. The Professional "Hover" Strategy

The biggest complaint with Shadcn's default setup is that `hover:bg-primary/90` is lazy. With the 9 Pillars, we can define precise interaction states.

**Usage Example:**

```tsx
// BAD (Standard Shadcn):
// Relies on opacity, looks washed out on dark backgrounds.
<button className="bg-primary hover:bg-primary/90">Click Me</button>

// GOOD (9-Pillar Best Practice):
// Moves up the scale to Pillar 600. Solid color. Better contrast.
<button className="bg-brand-500 hover:bg-brand-600 text-brand-50">
  Click Me
</button>

```

To automate this for Shadcn components, you update the `button.tsx` variants:

**File:** `src/components/ui/button.tsx` (Update)

```tsx
const buttonVariants = cva(..., {
  variants: {
    variant: {
      // We override the default Shadcn mapping to use our Pillars
      // Note: We use the utilities created in @theme
      default: "bg-brand-500 text-brand-50 hover:bg-brand-600 active:bg-brand-700",
      outline: "border border-neutral-200 bg-transparent hover:bg-neutral-50 text-neutral-900",
    }
  }
})

```

---

## 4. The "9 Pillar" Verification Checklist

To certify this system is "Professional Grade":

1. **Contrast Safety:** Does `brand-500` text on `brand-50` background meet WCAG AA (4.5:1)?
2. **Scale Continuity:** Is `brand-600` perceptually darker than `brand-500` by the same amount `brand-500` is darker than `brand-400`? (Use OKLCH for this if starting from scratch, but HSL is fine for Shadcn compat).
3. **Semantic Locking:** Are there **zero** hardcoded colors in your app? Everything must point to a Pillar.

**Final Next Step:**
You have the Architecture (RFC 003), the Integration (SOP 003), and now the **Design System Depth (RFC 004)**.

**Would you like me to generate the "Dark Mode Mapping" for these 9 Pillars?** (Professional design systems do not just "invert" colors; they shift the spectrum—e.g., `neutral-900` becomes the background, but `brand-500` often shifts to `brand-400` for better visibility on dark surfaces).