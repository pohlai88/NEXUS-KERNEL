This is **RFC 004-B: Enterprise Addendum**, formally incorporating the critical missing pieces identified in your review.

This document upgrades the 9-Pillar System from a "Color Theory" to a complete **Production-Grade Design System**. It mandates specific mapping strategies for Dark Mode, Extended Semantics, and Governance.

---

# RFC 004-B: Enterprise Token Strategy (Addendum)

| Metadata | Details |
| --- | --- |
| **Status** | **MANDATORY / PRODUCTION** |
| **Parent** | RFC 004 (9-Pillar Architecture) |
| **Scope** | Dark Mode, Extended Semantics, Typography, Governance |
| **Compliance** | WCAG 2.1 AA (Strict) |

## 1. Dark Mode Mapping Matrix (The "Shift" Strategy)

We do not simply invert values (e.g., replacing 900 with 100). We apply a **Contrast Shift** to account for light bleeding on dark screens.

* **Principle:** Dark surfaces require *desaturated* and *lighter* text/accents to maintain readability without causing eye strain (halation).

**The Mandatory Mapping Table:**

| Semantic Role | Light Mode Pillar | Dark Mode Pillar | Reasoning |
| --- | --- | --- | --- |
| **App Background** | Neutral-50 | Neutral-950 | Deepest contrast, avoids pure black (OLED smear). |
| **Card Surface** | White (0) | Neutral-900 | Elevates content from the background. |
| **Modal/Overlay** | White (0) | Neutral-800 | Highest elevation requires lighter gray. |
| **Primary Text** | Neutral-900 | Neutral-50 | Maximum legibility. |
| **Secondary Text** | Neutral-600 | Neutral-400 | **Shift:** Light mode uses 600, Dark uses 400 (brighter). |
| **Muted Text** | Neutral-400 | Neutral-500 | Recedes into background. |
| **Border** | Neutral-200 | Neutral-800 | Subtle separation. |
| **Brand Main** | Brand-600 | Brand-500 | **Shift:** Dark mode uses a brighter brand hue for visibility. |
| **Brand Surface** | Brand-50 | Brand-950 | Tinted backgrounds must be very dark. |

**Implementation (CSS):**

```css
@theme {
  /* DARK MODE OVERRIDES (Applied via .dark class) */
  /* Note: In v4, we use the @custom-variant or simple CSS cascade */
}

/* Native CSS Cascade for Dark Mode */
.dark {
  --color-background: hsl(var(--neutral-950)); 
  --color-foreground: hsl(var(--neutral-50));
  
  --color-card: hsl(var(--neutral-900));
  --color-popover: hsl(var(--neutral-800));

  --color-primary: hsl(var(--brand-500)); /* Brighter in dark mode */
  --color-primary-foreground: hsl(var(--brand-950));
  
  --color-muted: hsl(var(--neutral-800));
  --color-muted-foreground: hsl(var(--neutral-400));
  
  --color-border: hsl(var(--neutral-800));
}

```

---

## 2. Extended Semantic Tokens (Status & Hierarchy)

A professional system requires more than just "Brand" color. We mandate 9-Pillar scales for **Functional Colors** (Success, Warning, Error, Info).

**Requirement:** Do not use `red-500` directly. Map it to specific Semantics.

### 2.1. The Functional Pillars

Define these in `:root` alongside Brand and Neutral.

```css
:root {
  /* ERROR (Destructive) - Red */
  --error-50: 0 100% 98%;
  /* ... steps ... */
  --error-500: 0 84% 60%; /* Main Error */
  --error-600: 0 72% 51%; /* Hover */
  --error-900: 0 63% 31%; /* Text on soft background */

  /* SUCCESS - Green */
  --success-500: 142 71% 45%;
  
  /* WARNING - Amber */
  --warning-500: 45 93% 47%;
}

```

### 2.2. The Semantic Aliases

Map these pillars to user-facing utilities.

```css
@theme {
  /* STATUS TOKENS */
  --color-success: hsl(var(--success-500));
  --color-success-foreground: hsl(var(--success-50));
  
  --color-destructive: hsl(var(--error-500));
  --color-destructive-foreground: hsl(var(--error-50));
  
  /* SURFACE VARIANTS (Alerts/Toasts) */
  --color-success-subtle: hsl(var(--success-50));
  --color-success-text: hsl(var(--success-900)); /* For text on subtle bg */
}

```

---

## 3. Typography Pillar Strategy

We move beyond "Black text" to **Optical Hierarchy**.

**Rule:** Text color communicates importance. Never use `opacity` for text color (it breaks accessibility on patterns). Use the Neutral Scale.

| Hierarchy | Tailwind Utility | Semantic Map | Pillar (Light) | Pillar (Dark) |
| --- | --- | --- | --- | --- |
| **Heading 1-3** | `text-foreground` | Main Content | Neutral-900 | Neutral-50 |
| **Body Copy** | `text-secondary` | Long form | Neutral-700 | Neutral-300 |
| **Caption/Label** | `text-muted` | Meta data | Neutral-500 | Neutral-400 |
| **Placeholder** | `placeholder-muted` | Empty State | Neutral-400 | Neutral-500 |
| **Disabled** | `text-disabled` | Non-interactive | Neutral-300 | Neutral-700 |

---

## 4. Accessibility & Testing Workflow

We define the "Definition of Done" for any new UI component.

### 4.1. The Automated Gate (CI/CD)

**Tool:** `axe-core` via Playwright or Cypress.
**Requirement:** All PRs must pass `a11y-check`.

```typescript
// tests/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page should not have a11y violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]); // Zero tolerance policy
});

```

### 4.2. The Manual "Squint Test"

**Protocol:** Designers must verify `hover` states manually.

* **Check:** Does the button clearly change state without relying solely on color? (e.g., slight elevation lift or ring).
* **Check:** Is the `focus-visible` ring (Brand-500) clearly visible against the background?

---

## 5. Governance & Enforcement

How do we stop a developer from hardcoding `#EF4444` (Tailwind Red-500)?

### 5.1. The "No-Arbitrary-Values" Linter

We configure `stylelint` or `eslint` to forbid raw colors.

**File:** `eslint.config.mjs` (Addendum)

```javascript
rules: {
  "tailwindcss/no-custom-classname": "error",
  "no-restricted-syntax": [
    "error",
    {
      "selector": "JSXAttribute[name.name='className'] Literal[value=/bg-\\[#.*\\]/]",
      "message": "RFC 004 VIOLATION: Arbitrary hex values are forbidden. Use a Semantic Token (e.g., bg-destructive)."
    }
  ]
}

```

### 5.2. Token Ownership

* **The Owner:** The "Design Systems Team" (or Lead Frontend).
* **The Process:**
1. New Token Request ticket created.
2. Token added to `globals.css` (Primitives).
3. Token aliased in `@theme` (Semantics).
4. Version bump.



---

## 6. Performance & DX (Tree Shaking)

**Critique:** "Does adding 900 variables bloat the CSS?"
**Answer:** No, because of Tailwind v4's **JIT (Just-in-Time) Nature**.

* **Mechanism:** Tailwind v4 (Oxide) only generates the CSS variables that are *actually used* in your HTML/JSX.
* **Fact:** Even if you define 50 colors in `:root`, if you only use `bg-primary`, the final CSS bundle will be tiny.
* **Optimization:** We keep the definitions in `globals.css` because CSS Variables are cheap, but the *Utility Classes* are tree-shaken.

**DX Guideline for Developers:**

> "If you need a color, type `bg-` and look for semantic names (primary, destructive). If you absolutely need a specific shade, look for `brand-` or `neutral-`. NEVER use generic `blue-` or `gray-`."

---

## Summary of Addendum

This completes the **Enterprise Design System Architecture**.

1. **RFC 001:** Enforced Documentation (Husky/ESLint).
2. **RFC 003:** Tailwind v4 Architecture (CSS-First).
3. **RFC 004:** 9-Pillar Color System (Primitives).
4. **RFC 004-B:** Enterprise Governance (Dark Mode, A11y, Safety).

**Would you like me to generate the final `globals.css` file that combines ALL these RFCs (Shadcn + 9-Pillars + Dark Mode + Extended Semantics) into a single copy-paste production artifact?**