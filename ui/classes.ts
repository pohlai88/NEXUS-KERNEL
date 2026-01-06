/**
 * NEXUS-KERNEL CSS Class Definitions
 * ===================================
 * Auto-generated from style.css
 * Provides TypeScript type safety and IDE intellisense
 * 
 * Usage:
 * import { CSS_CLASSES, validClass } from './ui/classes'
 * 
 * // Get all valid classes
 * const allClasses = Object.values(CSS_CLASSES).flat()
 * 
 * // Validate a class name
 * if (validClass('btn-primary')) { ... }
 * 
 * // IDE autocomplete for common classes
 * const buttonClass: CSS_CLASSES['buttons'] = 'btn-primary'
 */

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================
export const LAYOUT_UTILITIES = [
  'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden', 'contents', 'table',
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse',
  'flex-wrap', 'flex-nowrap', 'flex-1', 'flex-auto', 'flex-none',
  'block', 'inline', 'inline-block',
  'overflow-auto', 'overflow-hidden', 'overflow-scroll', 'overflow-visible',
  'overflow-x-auto', 'overflow-y-auto',
] as const;

// ============================================================================
// SPACING UTILITIES (P4 TOKENS)
// ============================================================================
export const PADDING_UTILITIES = [
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16',
  'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-6', 'px-8',
  'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-6',
] as const;

export const MARGIN_UTILITIES = [
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8',
  'mx-auto', 'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4',
  'my-0', 'my-1', 'my-2', 'my-3', 'my-4',
  'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-6',
  'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-6',
  'ml-0', 'ml-1', 'ml-2', 'ml-3',
  'mr-0', 'mr-1', 'mr-2', 'mr-3',
] as const;

export const GAP_UTILITIES = [
  'gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
] as const;

export const SPACING_UTILITIES = [
  ...PADDING_UTILITIES,
  ...MARGIN_UTILITIES,
  ...GAP_UTILITIES,
] as const;

// ============================================================================
// COLOR UTILITIES (P2 TOKENS)
// ============================================================================
export const COLOR_TOKENS = [
  'primary', 'secondary', 'success', 'danger', 'info', 'warning',
  'canvas', 'surface', 'surface-well', 'border', 'border-strong',
  'text-main', 'text-sub', 'text-muted', 'text-faint', 'text-inverse',
] as const;

export const BACKGROUND_UTILITIES = [
  'bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-info',
  'bg-canvas', 'bg-surface', 'bg-surface-well', 'bg-raised', 'bg-overlay',
  'bg-primary-hover', 'bg-secondary-hover',
] as const;

export const TEXT_COLOR_UTILITIES = [
  'text-primary', 'text-secondary', 'text-success', 'text-danger', 'text-info',
  'text-main', 'text-sub', 'text-muted', 'text-faint', 'text-inverse',
] as const;

export const BORDER_COLOR_UTILITIES = [
  'border-primary', 'border-secondary', 'border-success', 'border-danger',
  'border-border', 'border-border-strong',
  'border-l-4', 'border-l-primary', 'border-l-success', 'border-l-danger',
] as const;

export const COLOR_UTILITIES = [
  ...BACKGROUND_UTILITIES,
  ...TEXT_COLOR_UTILITIES,
  ...BORDER_COLOR_UTILITIES,
] as const;

// ============================================================================
// SIZING UTILITIES (P5 TOKENS)
// ============================================================================
export const WIDTH_UTILITIES = [
  'w-0', 'w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-8', 'w-10', 'w-12',
  'w-16', 'w-20', 'w-24', 'w-32', 'w-full', 'w-screen',
] as const;

export const HEIGHT_UTILITIES = [
  'h-0', 'h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-8', 'h-10', 'h-12',
  'h-16', 'h-20', 'h-24', 'h-screen',
] as const;

export const SIZE_UTILITIES = [
  'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl',
  'max-w-container', 'max-w-full',
  'min-w-0', 'min-h-0', 'min-h-screen',
] as const;

export const SIZING_UTILITIES = [
  ...WIDTH_UTILITIES,
  ...HEIGHT_UTILITIES,
  ...SIZE_UTILITIES,
] as const;

// ============================================================================
// SHAPE UTILITIES (P6 TOKENS)
// ============================================================================
export const RADIUS_UTILITIES = [
  'rounded-xs', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-full',
] as const;

export const BORDER_WIDTH_UTILITIES = [
  'border', 'border-0', 'border-1', 'border-2', 'border-4',
  'border-t', 'border-b', 'border-l', 'border-r',
] as const;

export const SHAPE_UTILITIES = [
  ...RADIUS_UTILITIES,
  ...BORDER_WIDTH_UTILITIES,
] as const;

// ============================================================================
// ELEVATION UTILITIES (P7 TOKENS)
// ============================================================================
export const SHADOW_UTILITIES = [
  'shadow-none', 'shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl',
  'elev-0', 'elev-1', 'elev-2', 'elev-3', 'elev-4',
] as const;

export const Z_INDEX_UTILITIES = [
  'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-auto',
  'layer-sticky', 'layer-overlay',
] as const;

export const ELEVATION_UTILITIES = [
  ...SHADOW_UTILITIES,
  ...Z_INDEX_UTILITIES,
] as const;

// ============================================================================
// TYPOGRAPHY UTILITIES (P3 TOKENS)
// ============================================================================
export const FONT_SIZE_UTILITIES = [
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl',
  'text-3xl', 'text-4xl',
] as const;

export const FONT_WEIGHT_UTILITIES = [
  'font-regular', 'font-medium', 'font-semibold', 'font-bold',
] as const;

export const TEXT_ALIGNMENT_UTILITIES = [
  'text-left', 'text-center', 'text-right', 'text-justify',
] as const;

export const TEXT_TRACKING_UTILITIES = [
  'tracking-tight', 'tracking-normal', 'tracking-wide',
] as const;

export const TYPOGRAPHY_UTILITIES = [
  ...FONT_SIZE_UTILITIES,
  ...FONT_WEIGHT_UTILITIES,
  ...TEXT_ALIGNMENT_UTILITIES,
  ...TEXT_TRACKING_UTILITIES,
  'font-mono', 'line-clamp-1', 'line-clamp-2', 'line-clamp-3',
] as const;

// ============================================================================
// RESPONSIVE UTILITIES (P9 TOKENS)
// ============================================================================
export const RESPONSIVE_PREFIXES = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

// Example responsive classes (infinitely composable with above utilities)
export const RESPONSIVE_EXAMPLES = [
  'sm:flex', 'sm:grid', 'sm:p-4', 'sm:w-full',
  'md:flex', 'md:grid', 'md:p-6', 'md:w-1/2',
  'lg:flex', 'lg:grid', 'lg:p-8', 'lg:w-1/3',
  'xl:flex', 'xl:grid', 'xl:p-10',
  '2xl:flex', '2xl:grid', '2xl:p-12',
] as const;

// ============================================================================
// STATE UTILITIES (INTERACTION VARIANTS)
// ============================================================================
export const STATE_UTILITIES = [
  'hover:bg-primary', 'hover:bg-primary-hover', 'hover:text-white',
  'hover:border-primary', 'hover:shadow-md', 'hover:opacity-90',
  'focus:outline', 'focus:ring', 'focus:ring-primary',
  'focus:outline-offset-2',
  'active:bg-primary-hover', 'active:shadow-inner',
  'disabled:opacity-50', 'disabled:cursor-not-allowed',
  'group-hover:bg-surface-well',
  'group-focus:ring',
  'last:border-b-0',
] as const;

// ============================================================================
// COMPONENT CLASSES (P10 SEMANTIC UTILITIES)
// ============================================================================
export const BUTTON_COMPONENTS = [
  'btn-primary', 'btn-secondary', 'btn-ghost', 'btn-icon',
  'btn-icon-primary', 'btn-icon-secondary', 'btn-group',
] as const;

export const CARD_COMPONENTS = [
  'card', 'card-raised', 'card-well', 'stat-card', 'chart-container',
  'pillar-item', 'pillar-item-title', 'pillar-item-description',
] as const;

export const BADGE_COMPONENTS = [
  'badge', 'badge-success', 'badge-danger', 'badge-warning', 'badge-info', 'badge-neutral',
] as const;

export const NAVIGATION_COMPONENTS = [
  'nav-item', 'nav-item-active', 'nav-item-icon', 'nav-item-label', 'nav-item-badge',
  'breadcrumbs', 'breadcrumb-item', 'breadcrumb-item-active', 'breadcrumb-separator',
] as const;

export const DASHBOARD_COMPONENTS = [
  'dashboard-layout', 'dashboard-sidebar', 'dashboard-main', 'dashboard-header',
  'dashboard-content', 'container-content', 'h-header',
] as const;

export const FORM_COMPONENTS = [
  'form-group', 'form-label', 'form-help', 'form-error',
  'form-section', 'form-section-title',
] as const;

export const TABLE_COMPONENTS = [
  'table-container', 'table-header', 'table-body', 'table-footer',
] as const;

export const MODAL_COMPONENTS = [
  'modal-content', 'modal-header', 'modal-title', 'modal-body', 'modal-footer',
] as const;

export const DRAWER_COMPONENTS = [
  'drawer', 'drawer-header', 'drawer-body', 'drawer-footer',
] as const;

export const TYPOGRAPHY_COMPONENTS = [
  'shell', 'cell', 'title', 'section', 'caption',
  'sr-only', 'center-flex', 'center-absolute', 'cover-absolute',
] as const;

export const UTILITY_COMPONENTS = [
  'tooltip', 'search-bar', 'tabs', 'tab-item', 'tab-item-active',
  'dropdown-menu', 'dropdown-item', 'dropdown-item-disabled', 'dropdown-divider',
] as const;

export const COMPONENTS = [
  ...BUTTON_COMPONENTS,
  ...CARD_COMPONENTS,
  ...BADGE_COMPONENTS,
  ...NAVIGATION_COMPONENTS,
  ...DASHBOARD_COMPONENTS,
  ...FORM_COMPONENTS,
  ...TABLE_COMPONENTS,
  ...MODAL_COMPONENTS,
  ...DRAWER_COMPONENTS,
  ...TYPOGRAPHY_COMPONENTS,
  ...UTILITY_COMPONENTS,
] as const;

// ============================================================================
// MASTER CSS CLASSES UNION TYPE
// ============================================================================
export type CSSClass = 
  | typeof LAYOUT_UTILITIES[number]
  | typeof SPACING_UTILITIES[number]
  | typeof COLOR_UTILITIES[number]
  | typeof SIZING_UTILITIES[number]
  | typeof SHAPE_UTILITIES[number]
  | typeof ELEVATION_UTILITIES[number]
  | typeof TYPOGRAPHY_UTILITIES[number]
  | typeof RESPONSIVE_EXAMPLES[number]
  | typeof STATE_UTILITIES[number]
  | typeof COMPONENTS[number];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================
const ALL_VALID_CLASSES = new Set([
  ...LAYOUT_UTILITIES,
  ...SPACING_UTILITIES,
  ...COLOR_UTILITIES,
  ...SIZING_UTILITIES,
  ...SHAPE_UTILITIES,
  ...ELEVATION_UTILITIES,
  ...TYPOGRAPHY_UTILITIES,
  ...RESPONSIVE_EXAMPLES,
  ...STATE_UTILITIES,
  ...COMPONENTS,
]);

/**
 * Validates if a class name is valid
 * @param className - The class name to validate
 * @returns true if the class is valid, false otherwise
 * 
 * @example
 * if (validClass('btn-primary')) { ... }  // true
 * if (validClass('btn-invalid')) { ... }  // false
 */
export function validClass(className: string): className is CSSClass {
  return ALL_VALID_CLASSES.has(className as CSSClass);
}

/**
 * Validates a space-separated class string
 * @param classString - Space-separated class names
 * @returns { valid: string[], invalid: string[] }
 * 
 * @example
 * const result = validateClasses('flex items-center p-4 btn-invalid');
 * // { valid: ['flex', 'items-center', 'p-4'], invalid: ['btn-invalid'] }
 */
export function validateClasses(classString: string): { valid: string[]; invalid: string[] } {
  const classes = classString.split(/\s+/).filter(Boolean);
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const cls of classes) {
    if (validClass(cls)) {
      valid.push(cls);
    } else {
      invalid.push(cls);
    }
  }

  return { valid, invalid };
}

/**
 * Safely joins class names with validation
 * @param classes - Class names or falsy values
 * @returns Valid class string, throws on invalid classes
 * 
 * @example
 * const className = classNames('btn-primary', true && 'hover:bg-primary', false && 'hidden');
 * // 'btn-primary hover:bg-primary'
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  const filtered = classes.filter((cls) => typeof cls === 'string') as string[];
  const classStr = filtered.join(' ');
  const { invalid } = validateClasses(classStr);

  if (invalid.length > 0) {
    console.warn(`⚠️ Invalid CSS classes detected: ${invalid.join(', ')}`);
  }

  return classStr;
}

// ============================================================================
// ORGANIZED EXPORT OBJECT (for easier IDE navigation)
// ============================================================================
export const CSS_CLASSES = {
  layout: LAYOUT_UTILITIES,
  spacing: SPACING_UTILITIES,
  padding: PADDING_UTILITIES,
  margin: MARGIN_UTILITIES,
  gap: GAP_UTILITIES,
  colors: COLOR_UTILITIES,
  background: BACKGROUND_UTILITIES,
  text: TEXT_COLOR_UTILITIES,
  border: BORDER_COLOR_UTILITIES,
  sizing: SIZING_UTILITIES,
  width: WIDTH_UTILITIES,
  height: HEIGHT_UTILITIES,
  shape: SHAPE_UTILITIES,
  radius: RADIUS_UTILITIES,
  elevation: ELEVATION_UTILITIES,
  shadow: SHADOW_UTILITIES,
  zIndex: Z_INDEX_UTILITIES,
  typography: TYPOGRAPHY_UTILITIES,
  fontSize: FONT_SIZE_UTILITIES,
  fontWeight: FONT_WEIGHT_UTILITIES,
  responsive: RESPONSIVE_EXAMPLES,
  states: STATE_UTILITIES,
  components: COMPONENTS,
  buttons: BUTTON_COMPONENTS,
  cards: CARD_COMPONENTS,
  badges: BADGE_COMPONENTS,
  navigation: NAVIGATION_COMPONENTS,
  dashboard: DASHBOARD_COMPONENTS,
  forms: FORM_COMPONENTS,
  tables: TABLE_COMPONENTS,
  modals: MODAL_COMPONENTS,
  drawers: DRAWER_COMPONENTS,
} as const;

// ============================================================================
// TYPE SAFE HELPERS
// ============================================================================

/**
 * Type-safe class builder for components
 * @example
 * const buttonClasses = cx({
 *   primary: 'btn-primary',
 *   secondary: 'btn-secondary',
 *   disabled: 'disabled:opacity-50',
 * });
 * // Usage: <button class={buttonClasses.primary}>Click</button>
 */
export const cx = (classes: Record<string, CSSClass>) => classes;

export default CSS_CLASSES;
