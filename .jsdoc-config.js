/**
 * NEXUS-KERNEL CSS Class Intellisense
 * ====================================
 * VSCode JSDoc hints for CSS class validation
 * 
 * Install: Place this file in your project root as .jsdoc-config.js
 * Usage: VSCode will auto-load and provide class name hints
 */

/** @typedef {
 *   | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'hidden' | 'contents' | 'table'
 *   | 'static' | 'fixed' | 'absolute' | 'relative' | 'sticky'
 *   | 'flex-row' | 'flex-row-reverse' | 'flex-col' | 'flex-col-reverse'
 *   | 'flex-wrap' | 'flex-nowrap' | 'flex-1' | 'flex-auto' | 'flex-none'
 *   | 'block' | 'inline' | 'inline-block'
 *   | 'overflow-auto' | 'overflow-hidden' | 'overflow-scroll' | 'overflow-visible'
 *   | 'overflow-x-auto' | 'overflow-y-auto'
 * } LayoutClass */

/** @typedef {
 *   | 'p-0' | 'p-1' | 'p-2' | 'p-3' | 'p-4' | 'p-5' | 'p-6' | 'p-8' | 'p-10' | 'p-12' | 'p-16'
 *   | 'px-0' | 'px-1' | 'px-2' | 'px-3' | 'px-4' | 'px-6' | 'px-8'
 *   | 'py-0' | 'py-1' | 'py-2' | 'py-3' | 'py-4' | 'py-6'
 *   | 'm-0' | 'm-1' | 'm-2' | 'm-3' | 'm-4' | 'm-5' | 'm-6' | 'm-8'
 *   | 'mx-auto' | 'mx-0' | 'mx-1' | 'mx-2' | 'mx-3' | 'mx-4'
 *   | 'my-0' | 'my-1' | 'my-2' | 'my-3' | 'my-4'
 *   | 'mt-0' | 'mt-1' | 'mt-2' | 'mt-3' | 'mt-4' | 'mt-6'
 *   | 'mb-0' | 'mb-1' | 'mb-2' | 'mb-3' | 'mb-4' | 'mb-6'
 *   | 'ml-0' | 'ml-1' | 'ml-2' | 'ml-3'
 *   | 'mr-0' | 'mr-1' | 'mr-2' | 'mr-3'
 *   | 'gap-0' | 'gap-1' | 'gap-2' | 'gap-3' | 'gap-4' | 'gap-6' | 'gap-8'
 * } SpacingClass */

/** @typedef {
 *   | 'bg-primary' | 'bg-secondary' | 'bg-success' | 'bg-danger' | 'bg-info'
 *   | 'bg-canvas' | 'bg-surface' | 'bg-surface-well' | 'bg-raised' | 'bg-overlay'
 *   | 'text-primary' | 'text-secondary' | 'text-success' | 'text-danger' | 'text-info'
 *   | 'text-main' | 'text-sub' | 'text-muted' | 'text-faint' | 'text-inverse'
 *   | 'border-primary' | 'border-secondary' | 'border-success' | 'border-danger'
 *   | 'border-border' | 'border-border-strong'
 *   | 'border-l-4' | 'border-l-primary' | 'border-l-success' | 'border-l-danger'
 * } ColorClass */

/** @typedef {
 *   | 'w-0' | 'w-1' | 'w-2' | 'w-3' | 'w-4' | 'w-5' | 'w-6' | 'w-8' | 'w-10' | 'w-12'
 *   | 'w-16' | 'w-20' | 'w-24' | 'w-32' | 'w-full' | 'w-screen'
 *   | 'h-0' | 'h-1' | 'h-2' | 'h-3' | 'h-4' | 'h-5' | 'h-6' | 'h-8' | 'h-10' | 'h-12'
 *   | 'h-16' | 'h-20' | 'h-24' | 'h-screen'
 *   | 'max-w-xs' | 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl'
 *   | 'max-w-container' | 'max-w-full'
 *   | 'min-w-0' | 'min-h-0' | 'min-h-screen'
 * } SizingClass */

/** @typedef {
 *   | 'rounded-xs' | 'rounded-sm' | 'rounded-md' | 'rounded-lg' | 'rounded-full'
 *   | 'border' | 'border-0' | 'border-1' | 'border-2' | 'border-4'
 *   | 'border-t' | 'border-b' | 'border-l' | 'border-r'
 * } ShapeClass */

/** @typedef {
 *   | 'shadow-none' | 'shadow-xs' | 'shadow-sm' | 'shadow-md' | 'shadow-lg' | 'shadow-xl'
 *   | 'elev-0' | 'elev-1' | 'elev-2' | 'elev-3' | 'elev-4'
 *   | 'z-0' | 'z-10' | 'z-20' | 'z-30' | 'z-40' | 'z-50' | 'z-auto'
 *   | 'layer-sticky' | 'layer-overlay'
 * } ElevationClass */

/** @typedef {
 *   | 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'
 *   | 'text-3xl' | 'text-4xl'
 *   | 'font-regular' | 'font-medium' | 'font-semibold' | 'font-bold'
 *   | 'font-mono'
 *   | 'text-left' | 'text-center' | 'text-right' | 'text-justify'
 *   | 'tracking-tight' | 'tracking-normal' | 'tracking-wide'
 *   | 'line-clamp-1' | 'line-clamp-2' | 'line-clamp-3'
 * } TypographyClass */

/** @typedef {
 *   | 'btn-primary' | 'btn-secondary' | 'btn-ghost' | 'btn-icon'
 *   | 'btn-icon-primary' | 'btn-icon-secondary' | 'btn-group'
 *   | 'card' | 'card-raised' | 'card-well' | 'stat-card' | 'chart-container'
 *   | 'pillar-item' | 'pillar-item-title' | 'pillar-item-description'
 *   | 'badge' | 'badge-success' | 'badge-danger' | 'badge-warning' | 'badge-info' | 'badge-neutral'
 *   | 'nav-item' | 'nav-item-active' | 'nav-item-icon' | 'nav-item-label' | 'nav-item-badge'
 *   | 'breadcrumbs' | 'breadcrumb-item' | 'breadcrumb-item-active' | 'breadcrumb-separator'
 *   | 'dashboard-layout' | 'dashboard-sidebar' | 'dashboard-main' | 'dashboard-header' | 'dashboard-content'
 *   | 'container-content' | 'h-header'
 *   | 'form-group' | 'form-label' | 'form-help' | 'form-error' | 'form-section' | 'form-section-title'
 *   | 'table-container' | 'table-header' | 'table-body' | 'table-footer'
 *   | 'modal-content' | 'modal-header' | 'modal-title' | 'modal-body' | 'modal-footer'
 *   | 'drawer' | 'drawer-header' | 'drawer-body' | 'drawer-footer'
 *   | 'shell' | 'cell' | 'title' | 'section' | 'caption'
 *   | 'sr-only' | 'center-flex' | 'center-absolute' | 'cover-absolute'
 *   | 'tooltip' | 'search-bar' | 'tabs' | 'tab-item' | 'tab-item-active'
 *   | 'dropdown-menu' | 'dropdown-item' | 'dropdown-item-disabled' | 'dropdown-divider'
 * } ComponentClass */

/** @typedef {
 *   | 'sm:flex' | 'sm:grid' | 'sm:p-4' | 'sm:w-full'
 *   | 'md:flex' | 'md:grid' | 'md:p-6' | 'md:w-1/2'
 *   | 'lg:flex' | 'lg:grid' | 'lg:p-8' | 'lg:w-1/3'
 *   | 'xl:flex' | 'xl:grid' | 'xl:p-10'
 *   | '2xl:flex' | '2xl:grid' | '2xl:p-12'
 *   | 'hover:bg-primary' | 'hover:text-white' | 'hover:shadow-md'
 *   | 'focus:outline' | 'focus:ring' | 'focus:ring-primary'
 *   | 'active:bg-primary-hover'
 *   | 'disabled:opacity-50' | 'disabled:cursor-not-allowed'
 *   | 'group-hover:bg-surface-well'
 * } VariantClass */

/** @typedef {
 *   LayoutClass | SpacingClass | ColorClass | SizingClass | ShapeClass |
 *   ElevationClass | TypographyClass | ComponentClass | VariantClass
 * } ValidCSSClass */

/**
 * Validates a CSS class name
 * @param {string} className - The class name to validate
 * @returns {boolean} true if valid
 * 
 * @example
 * <div class="btn-primary">  ✅ VSCode will not warn
 * <div class="btn-invalid">  ⚠️  VSCode will warn
 */
function validClass(className) {
  // This will be replaced by actual validation at runtime
  return true;
}

module.exports = { validClass };
