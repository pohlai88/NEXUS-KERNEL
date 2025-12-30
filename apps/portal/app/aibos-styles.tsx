'use client';

import { useEffect } from 'react';

/**
 * AIBOS Design System CSS Loader
 * 
 * Loads AIBOS Design System CSS - the SSOT (Single Source of Truth) for all UI/UX.
 * 
 * AIBOS Design System is registered at L0 (Kernel) as concept_design_system_aibos.
 * 
 * This system provides:
 * - Complete design token system (colors, spacing, typography, shadows, etc.)
 * - Semantic CSS classes (.na-*)
 * - Layout utilities (flex, grid, gap, padding, margin)
 * - Component patterns (cards, buttons, status indicators)
 * - Theme configuration (dark theme, color system)
 * 
 * Loading Method:
 * - Workaround for Next.js 16 CSS parser incompatibility
 * - AIBOS CSS uses advanced CSS custom property syntax
 * - Loads CSS dynamically via API route to bypass the parser
 */
export function AIBOSStyles() {
  useEffect(() => {
    // Check if CSS is already loaded
    const existingLink = document.querySelector('link[href*="aibos-design-system"]');
    if (existingLink) {
      return; // Already loaded
    }

    // Load CSS from API route (most reliable method)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/api/aibos-css';
    document.head.appendChild(link);

    return () => {
      // Cleanup on unmount (optional, usually not needed for stylesheets)
      const links = document.querySelectorAll('link[href*="aibos-design-system"]');
      links.forEach((l) => l.remove());
    };
  }, []);

  return null;
}
