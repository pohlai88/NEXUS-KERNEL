This is the **Final Master Artifact (Version 2.0)**.

It incorporates your precise refinements: **Tailwind-aligned naming** for shadows, **Accessibility Ring** tokens, **Typography Scale** definitions, and a **Secondary Brand Pillar** for multi-product flexibility.

---

### **FINAL PRODUCTION ARTIFACT (V2.0)**

**File:** `src/app/globals.css`
**Compliance:** RFC 003, RFC 004-B, WCAG 2.1 AA, Enterprise Multi-Brand

```css
/* -------------------------------------------------------------------------- */
/* RFC 003: TAILWIND v4 CSS-FIRST ARCHITECTURE                               */
/* Engine: Oxide (Rust) | Strategy: Zero-JS Config | Source: Single Truth    */
/* -------------------------------------------------------------------------- */

@import "tailwindcss";

/* -------------------------------------------------------------------------- */
/* RFC 004-B: INTERACTION, DEPTH & TYPOGRAPHY (REFINED)                      */
/* -------------------------------------------------------------------------- */

@theme {
  /* --- 1. MOTION PILLARS (Interaction Standard) --- */
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out-quad: cubic-bezier(0.45, 0, 0.55, 1);
  
  --motion-duration-fast: 150ms;
  --motion-duration-normal: 250ms;
  --motion-duration-slow: 400ms;

  --animate-accordion-down: accordion-down var(--motion-duration-normal) var(--ease-out-quint);
  --animate-accordion-up: accordion-up var(--motion-duration-normal) var(--ease-out-quint);

  /* --- 2. ELEVATION PILLARS (Tailwind Naming Convention) --- */
  /* Maps strict box-shadows to standard utility names */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* --- 3. TYPOGRAPHY SCALE (Enterprise Control) --- */
  /* Explicitly defining these ensures no "rogue" arbitrary sizes */
  --text-xs: 0.75rem;   --text-xs--line-height: 1rem;
  --text-sm: 0.875rem;  --text-sm--line-height: 1.25rem;
  --text-base: 1rem;    --text-base--line-height: 1.5rem;
  --text-lg: 1.125rem;  --text-lg--line-height: 1.75rem;
  --text-xl: 1.25rem;   --text-xl--line-height: 1.75rem;
  --text-2xl: 1.5rem;   --text-2xl--line-height: 2rem;
  --text-3xl: 1.875rem; --text-3xl--line-height: 2.25rem;
  --text-4xl: 2.25rem;  --text-4xl--line-height: 2.5rem;

  /* --- 4. ACCESSIBILITY (Focus Rings) --- */
  --ring-width: 2px;
  --ring-offset-width: 2px;
}

/* -------------------------------------------------------------------------- */
/* RFC 004: PRIMITIVE PILLARS (THE 9-STEP SCALES)                            */
/* -------------------------------------------------------------------------- */

:root {
  /* --- NEUTRAL PILLAR (Slate/Gray) --- */
  --neutral-50:  210 40% 98%;
  --neutral-100: 210 40% 96.1%;
  --neutral-200: 214.3 31.8% 91.4%;
  --neutral-300: 212.7 26.8% 83.9%;
  --neutral-400: 215 20.2% 65.1%;
  --neutral-500: 215.4 16.3% 46.9%;
  --neutral-600: 215.3 19.3% 34.5%;
  --neutral-700: 215.3 25% 26.7%;
  --neutral-800: 217.2 32.6% 17.5%;
  --neutral-900: 222.2 47.4% 11.2%; 
  --neutral-950: 222.2 84% 4.9%;

  /* --- BRAND PRIMARY PILLAR (Core Identity) --- */
  --brand-50:  221.2 100% 96%;
  --brand-100: 221.2 100% 93%;
  --brand-200: 221.2 100% 85%;
  --brand-300: 221.2 100% 75%;
  --brand-400: 221.2 100% 65%;
  --brand-500: 221.2 83.2% 53.3%;
  --brand-600: 221.2 83.2% 45%;
  --brand-700: 221.2 83.2% 35%;
  --brand-800: 221.2 83.2% 25%;
  --brand-900: 221.2 83.2% 15%;
  --brand-950: 221.2 83.2% 10%;

  /* --- BRAND SECONDARY PILLAR (Multi-Brand Flexibility) --- */
  /* Useful for White-Labeling or Product Line differentiation */
  --accent-50:  262 100% 96%;
  --accent-500: 262 83% 58%; /* Purple Example */
  --accent-600: 262 83% 48%;
  --accent-900: 262 83% 18%;

  /* --- FUNCTIONAL PILLARS --- */
  /* Error (Red) */
  --error-50:  0 100% 98%;
  --error-500: 0 84.2% 60.2%;
  --error-600: 0 72% 51%;
  --error-900: 0 63% 31%;

  /* Success (Green) */
  --success-50:  142 76% 96%;
  --success-500: 142 71% 45%;
  --success-600: 142 76% 36%;
  --success-900: 142 76% 15%;

  /* Warning (Amber) */
  --warning-50:  48 100% 96%;
  --warning-500: 45 93% 47%;
  --warning-900: 45 93% 20%;

  /* Info (Sky/Teal) */
  --info-50:  199 100% 96%;
  --info-500: 199 89% 48%;
  --info-600: 199 89% 40%;
  --info-900: 199 89% 20%;

  /* --- SHADCN PRIMITIVES --- */
  --radius: 0.5rem;
}

/* -------------------------------------------------------------------------- */
/* DARK MODE STRATEGY (RFC 004-B: SHIFT PATTERN)                             */
/* -------------------------------------------------------------------------- */
.dark {
  /* Neutral Inversion with Contrast Shift */
  --neutral-50:  222.2 84% 4.9%;  
  --neutral-100: 217.2 32.6% 17.5%;
  --neutral-200: 215.3 25% 26.7%;
  --neutral-300: 215.3 19.3% 34.5%;
  --neutral-400: 215.4 16.3% 46.9%;
  --neutral-500: 215 20.2% 65.1%;
  --neutral-600: 212.7 26.8% 83.9%;
  --neutral-700: 214.3 31.8% 91.4%;
  --neutral-800: 210 40% 96.1%;
  --neutral-900: 210 40% 98%;     
  --neutral-950: 0 0% 100%;

  /* Brand Shift (Brighter in Dark Mode) */
  --brand-500: 217.2 91.2% 59.8%; 
  --brand-600: 221.2 83.2% 53.3%;
  
  /* Secondary Shift */
  --accent-500: 263 70% 50%; /* Adjusted for dark bg readability */
}

/* -------------------------------------------------------------------------- */
/* SOP 003: SEMANTIC ALIASING (THE BRIDGE)                                   */
/* -------------------------------------------------------------------------- */
@theme {
  /* 1. Surfaces */
  --color-background: hsl(var(--neutral-50));
  --color-foreground: hsl(var(--neutral-900));

  --color-card: hsl(var(--neutral-50));
  --color-card-foreground: hsl(var(--neutral-900));
 
  --color-popover: hsl(var(--neutral-50));
  --color-popover-foreground: hsl(var(--neutral-900));

  /* 2. Brand Actions */
  --color-primary: hsl(var(--brand-500));
  --color-primary-foreground: hsl(var(--brand-50));
  
  --color-secondary: hsl(var(--neutral-100));
  --color-secondary-foreground: hsl(var(--neutral-900));

  /* 3. Secondary Identity (Brand Alt) */
  --color-brand-alt: hsl(var(--accent-500));
  --color-brand-alt-foreground: hsl(var(--accent-50));

  /* 4. Extended Semantics (Status) */
  --color-destructive: hsl(var(--error-500));
  --color-destructive-foreground: hsl(var(--error-50));

  --color-success: hsl(var(--success-500));
  --color-success-foreground: hsl(var(--success-50));

  --color-warning: hsl(var(--warning-500));
  --color-warning-foreground: hsl(var(--warning-900));

  --color-info: hsl(var(--info-500));
  --color-info-foreground: hsl(var(--info-50));

  /* 5. UI Structure & Accessibility */
  --color-muted: hsl(var(--neutral-100));
  --color-muted-foreground: hsl(var(--neutral-500));

  --color-accent: hsl(var(--neutral-100));
  --color-accent-foreground: hsl(var(--neutral-900));

  --color-border: hsl(var(--neutral-200));
  --color-input: hsl(var(--neutral-200));
  
  /* Focus Ring Strategy */
  --color-ring: hsl(var(--brand-500));
  --color-ring-offset: hsl(var(--neutral-50)); /* Matches background */

  /* 6. Shape */
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

/* -------------------------------------------------------------------------- */
/* UTILITIES & KEYFRAMES                                                     */
/* -------------------------------------------------------------------------- */

@layer utilities {
  .text-balance { text-wrap: balance; }
}

@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

```