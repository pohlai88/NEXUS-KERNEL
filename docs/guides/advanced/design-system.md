# Design System

Complete guide to the AIBOS Design System concept.

## Overview

The AIBOS Design System is registered as the Single Source of Truth (SSOT) for all UI/UX design tokens, components, and utilities. This is a Kernel-level concept (L0) - immutable, versioned, and canonical.

*See Code:* [`src/design_system.ts`](../../../src/design_system.ts)

## Purpose

The design system concept establishes AIBOS Design System as the exclusive authority for:

- ✅ Design tokens (colors, spacing, typography, shadows, etc.)
- ✅ Semantic CSS classes (`.na-*`)
- ✅ Component patterns and behaviors
- ✅ Theme configuration
- ✅ Layout utilities

**No other UI/UX frameworks or design systems are permitted.**

## Usage

```typescript
import { AIBOS_DESIGN_SYSTEM, DESIGN_SYSTEM_SSOT } from "@aibos/kernel";

// Get design system concept
const designSystem = AIBOS_DESIGN_SYSTEM;
console.log(designSystem.id); // "concept_design_system_aibos"
console.log(designSystem.name); // "AIBOS Design System"
console.log(designSystem.version); // "1.1.0"

// Use SSOT constant
const ssot = DESIGN_SYSTEM_SSOT;
```

## Design System Authority

All design decisions must reference this concept. This ensures:

- ✅ Consistent design language across all applications
- ✅ Single source of truth for design tokens
- ✅ No conflicting design systems
- ✅ Versioned design system evolution

## Related Documentation

- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Kernel Doctrine](../../NEXUS_CANON_V5_KERNEL_DOCTRINE.md)** - Core doctrine

---

**Last Updated:** 2026-01-01  
**Source:** [`src/design_system.ts`](../../../src/design_system.ts)

