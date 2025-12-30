# AIBOS Design System - SSOT Registration (L0 Kernel)

**Status:** ✅ Registered at L0 Kernel  
**Authority:** Single Source of Truth (SSOT) for all UI/UX  
**Version:** 1.1.0  
**Last Updated:** 2025-12-30

---

## 🏛️ L0 Kernel Registration

AIBOS Design System is registered as a **Kernel-level concept (L0)** in the Nexus Canon system:

```typescript
// packages/kernel/src/design_system.ts
export const AIBOS_DESIGN_SYSTEM: ConceptDefinition = {
  id: 'concept_design_system_aibos',
  name: 'AIBOS Design System',
  description: 'Single Source of Truth (SSOT) for all UI/UX design tokens, semantic classes, components, and utilities.',
  version: '1.1.0',
};
```

**Concept ID:** `concept_design_system_aibos`  
**Layer:** L0 (Kernel)  
**Authority:** Absolute - All UI/UX must derive from this system

---

## 📋 SSOT Authority

AIBOS Design System is the **exclusive authority** for:

### ✅ Design Tokens
- Colors (`--color-*`)
- Spacing (`--spacing-*`)
- Typography (`--font-*`, `--text-*`)
- Shadows (`--shadow-*`)
- Border radius (`--radius-*`)
- Transitions (`--ease-*`, `--default-transition-*`)

### ✅ Semantic CSS Classes
- Typography: `.na-h1`, `.na-h2`, `.na-h4`, `.na-data`, `.na-metadata`
- Components: `.na-card`, `.na-btn`, `.na-status`
- Layout: `.na-flex`, `.na-grid`, `.na-container`
- Spacing: `.na-p-*`, `.na-m-*`, `.na-gap-*`

### ✅ Component Patterns
- Card components
- Button variants
- Status indicators
- Form controls
- Navigation patterns

### ✅ Theme Configuration
- Dark theme (default)
- Color system
- Typography scale
- Spacing scale

### ✅ Layout Utilities
- Flexbox utilities (`.na-flex`, `.na-items-center`, etc.)
- Grid utilities (`.na-grid`, `.na-gap-*`)
- Spacing utilities (`.na-p-*`, `.na-m-*`)
- Responsive utilities (using AIBOS tokens)

---

## 🚫 Prohibited Systems

The following UI/UX systems are **FORBIDDEN**:

- ❌ Tailwind CSS (standalone)
- ❌ NextUI (standalone)
- ❌ Material-UI / MUI
- ❌ Ant Design
- ❌ Bootstrap
- ❌ Shadcn/ui
- ❌ Radix UI (standalone)
- ❌ Headless UI (standalone)
- ❌ Any other design system or UI framework

**Exception:** AIBOS Design System includes Tailwind v4 utilities as part of its complete system. These utilities are part of AIBOS, not a separate system.

---

## 📦 Package Information

**Package:** `aibos-design-system`  
**Version:** `^1.1.0`  
**Location:** `node_modules/aibos-design-system/`  
**CSS File:** `node_modules/aibos-design-system/style.css`

---

## 🔧 Implementation

### Loading AIBOS Design System

```tsx
// app/layout.tsx
import { AIBOSStyles } from './aibos-styles';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AIBOSStyles /> {/* Loads AIBOS CSS */}
        {children}
      </body>
    </html>
  );
}
```

### Using AIBOS Classes

```tsx
// ✅ CORRECT: Use only AIBOS classes
<div className="na-card na-p-6">
  <h1 className="na-h1">Title</h1>
  <div className="na-data">$12,450.00</div>
  <button className="na-btn na-btn-primary">Action</button>
</div>

// ❌ FORBIDDEN: Using other systems
<div className="card p-6"> {/* No - not AIBOS */}
<div className="bg-blue-500"> {/* No - not AIBOS */}
```

### Using AIBOS Utilities

```tsx
// ✅ CORRECT: Use AIBOS utilities
<div className="na-flex na-items-center na-gap-4 na-p-6">
  <div className="na-grid na-gap-6">
    Content
  </div>
</div>

// ❌ FORBIDDEN: Using non-AIBOS utilities
<div className="flex items-center gap-4 p-6"> {/* No - not AIBOS */}
```

---

## 📚 Documentation

- **AIBOS External Usage:** `node_modules/aibos-design-system/docs/EXTERNAL_USAGE.md`
- **AIBOS API Reference:** `node_modules/aibos-design-system/docs/API_REFERENCE.md`
- **Kernel Concept Registry:** `packages/kernel/src/design_system.ts`

---

## ✅ Compliance Checklist

Before implementing any UI/UX feature:

- [ ] Does it use only AIBOS Design System classes?
- [ ] Are all design tokens from AIBOS?
- [ ] Are all utilities from AIBOS?
- [ ] Is the concept registered at L0?
- [ ] Are there any references to other UI systems?

---

**Authority:** This document is derived from L0 Kernel registration.  
**Enforcement:** All UI/UX implementations must comply with this SSOT.

