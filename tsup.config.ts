// @aibos/kernel - tsup Build Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Optimized build configuration for Next.js and modern bundlers
// Based on Next.js best practices: ship least JavaScript, tree-shaking, dual formats
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points for all exports (Next.js best practice: build all subpaths)
  entry: [
    'src/index.ts',
    'src/values.lazy.ts',
    'src/kernel.validation.ts',
    'src/kernel.validation.cache.ts',
    'src/kernel.validation.cache.supabase.ts',
    'src/supabase/index.ts',
    'src/monitoring/performance.ts',
  ],
  
  // Dual format support (ESM + CJS) for maximum compatibility
  format: ['esm', 'cjs'],
  
  // Generate separate .d.cts and .d.mts files for dual format support
  // This provides better CJS/ESM compatibility (Next.js best practice)
  dts: {
    resolve: true,
  },
  
  // Source maps for debugging
  sourcemap: true,
  
  // Clean output directory before build
  clean: true,
  
  // Tree-shaking (Next.js best practice: ship least JavaScript)
  treeshake: true,
  
  // Minification for production (reduces bundle size)
  // Next.js best practice: minify in production builds
  minify: process.env.NODE_ENV === 'production',
  
  // Metafile for bundle analysis (Next.js best practice)
  metafile: process.env.ANALYZE === 'true',
  
  // Splitting disabled for library (single bundle)
  splitting: false,
  
  // Target modern JavaScript (ES2022)
  target: 'es2022',
  
  // Platform: node (for Node.js built-ins like perf_hooks)
  // Next.js can consume Node.js modules, so this is fine
  platform: 'node',
  
  // External dependencies (don't bundle)
  external: ['zod'],
  
  // No banner (clean output)
  banner: undefined,
  
  // Output directory
  outDir: 'dist',
  
  // File extensions for dual format
  // ESM: .js, CJS: .cjs (Next.js best practice for clear module resolution)
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  
  // Keep names for better debugging
  keepNames: true,
  
  // Optimize for Next.js consumption
  esbuildOptions(options) {
    options.conditions = ['import', 'require', 'default'];
    // Next.js best practice: drop console/debugger in production
    if (process.env.NODE_ENV === 'production') {
      options.drop = ['console', 'debugger'];
    }
    // Next.js best practice: optimize for tree-shaking
    options.treeShaking = true;
    return options;
  },
});

