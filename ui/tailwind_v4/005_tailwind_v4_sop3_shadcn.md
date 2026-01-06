This is the **Integration Standard (SOP 003)** for adapting the Shadcn/UI design system to the Tailwind v4 "CSS-First" architecture.

Since Shadcn/UI historically relies on the prohibited `tailwind.config.js`, this document mandates the precise translation of those JavaScript tokens into native CSS `@theme` variables.

---

# SOP 003: Shadcn/UI + Tailwind v4 Integration Standard

| Metadata | Details |
| --- | --- |
| **Status** | **MANDATORY** (for UI Library Integration) |
| **Target System** | Shadcn/UI (Radix Primitives) |
| **Architecture** | CSS-Native Tokens (Zero-Config) |
| **Compatibility** | Next.js App Router |

## 1. Abstract

Shadcn/UI components expect specific utility classes (e.g., `bg-primary`, `rounded-xl`, `animate-accordion-down`) to exist. In Tailwind v3, these were generated via JavaScript configuration. In **Tailwind v4**, we **MUST** define these tokens directly in the CSS entry point using the `@theme` directive.

This strategy decouples the UI library from the build tool, resulting in faster compilation and standard CSS variable usage.

---

## 2. The Semantic Token Strategy

We do not simply dump code; we structure the tokens into three semantic layers: **Base**, **Component**, and **Motion**.

### 2.1. Layer 1: Base Color Tokens (HSL Preservation)

*Reasoning:* Shadcn uses HSL values to enable dynamic runtime theming (e.g., changing themes without rebuilding). We preserve this HSL structure but declare the *mapping* in the `@theme` block.

**File:** `src/app/globals.css`

```css
@import "tailwindcss";

/* 1. Define the Raw HSL Variables (The "Source") */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  
  /* ... (Standard Shadcn variables continue here) */
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... (Dark mode overrides) */
}

/* 2. Map Variables to Tailwind v4 Theme (The "Bridge") */
@theme {
  /* * RFC REQUIREMENT: 
   * We map the utility name (e.g., bg-background) to the CSS variable.
   * Syntax: --color-<utility-name>: <css-value>;
   */
  
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
}

```

### 2.2. Layer 2: Shape & Typography

*Reasoning:* Shadcn components often use `rounded-md` or `rounded-xl`. We map the generic `--radius` variable to Tailwind's specific radius utilities to ensure global consistency.

**File:** `src/app/globals.css` (continued)

```css
@theme {
  /* ... colors from above ... */

  /* RADIUS MAPPING */
  /* 'rounded-lg' will now use the variable, allowing runtime changes */
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  /* TYPOGRAPHY */
  --font-sans: "Inter", "sans-serif";
}

```

### 2.3. Layer 3: Motion (Animations)

*Reasoning:* Shadcn's Accordion and Dialog components rely on specific keyframes. In v3, these were in JS objects. In v4, we use standard CSS `@keyframes`.

**File:** `src/app/globals.css` (continued)

```css
/* Define Keyframes natively */
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

@theme {
  /* ... colors & radius from above ... */

  /* ANIMATION MAPPING */
  /* Syntax: --animate-<name>: <animation-shorthand>; */
  
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}

```

---

## 3. Usage Verification

To ensure the system works as expected, verify the mapping using a standard Shadcn Button component.

**Component:** `src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// RFC CHECK:
// 1. "bg-primary" maps to @theme --color-primary -> hsl(var(--primary))
// 2. "rounded-md" maps to @theme --radius-md -> calc(var(--radius) - 2px)

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
// ... component export logic

```

---

## 4. Troubleshooting & Conflict Resolution

### 4.1. The "Border" Conflict

Tailwind v4 has a default `border-gray-200` color. Shadcn expects `border-border` (the variable).

* **Resolution:** By defining `--color-border` in the `@theme` block, v4 automatically generates the `border-border` utility class which overrides the default gray when applied.

### 4.2. Opacity Modifiers (The `/90` syntax)

Shadcn relies heavily on `bg-primary/90`.

* **Best Practice Check:** This **only works** if the colors are defined using `hsl(...)` or `oklch(...)` functions properly. The configuration in Section 2.1 strictly adheres to this syntax (`hsl(var(--primary))`), ensuring opacity modifiers work natively without extra config.

---

## 5. Next Action

Your styling infrastructure is now compliant with **RFC 003 (Tailwind v4)** and **SOP 003 (Shadcn Integration)**.

**Would you like me to generate the `cn` (className) utility helper file?** This is the final piece of the Shadcn architecture, and there is a specific optimization available for Tailwind v4 that removes the need for `tailwind-merge` in some strict contexts.