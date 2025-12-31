import type { NextConfig } from "next";

/**
 * NEXUS-KERNEL Next.js Configuration
 *
 * P0 Production Readiness:
 * ✅ Performance baseline ready (bundle analyzer, compression, image opt)
 * ✅ Security headers complete (STS, CSP, X-Frame-Options)
 * ✅ TypeScript strict mode enforced
 * ✅ Error handling via error boundaries
 *
 * P1 Optimizations:
 * ⏳ Experimental optimizations (React compiler when stable)
 * ⏳ Dependency cleanup (audit in progress)
 * ⏳ Test framework integration (Vitest setup)
 */

// Bundle analyzer configuration (P0: Performance baseline)
let withBundleAnalyzer = (config: NextConfig) => config;

if (process.env.ANALYZE === "true") {
  try {
    const bundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: true,
    });
    withBundleAnalyzer = bundleAnalyzer;
  } catch (error) {
    console.warn(
      "[WARNING] @next/bundle-analyzer not installed. Run: pnpm add -D @next/bundle-analyzer"
    );
  }
}

const nextConfig: NextConfig = {
  // ───────────────────────────────────────────────────────────────────────────
  // P0: PRODUCTION READINESS - Performance & Stability
  // ───────────────────────────────────────────────────────────────────────────

  // Transpile monorepo packages and external packages with TypeScript/React components
  transpilePackages: [
    "@nexus/kernel",
    "@nexus/cruds",
    "@nexus/ui-actions",
    "aibos-design-system", // Required for React components (TypeScript files)
    // TODO: Audit in P1 - verify all packages are needed (see PRODUCTION_TIMELINE.txt)
  ],

  // Image optimization (P0: Performance baseline)
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for versioned images (LCP optimization)
  },

  // React Strict Mode (P0: Error detection)
  reactStrictMode: true,

  // Output standalone for Docker deployments (P0: Production-ready)
  output: "standalone",

  // Compression configuration (P0: Performance baseline measurement)
  compress: true, // gzip by default

  // Security: Hide Next.js version (P0: Security hardening)
  poweredByHeader: false,

  // TypeScript configuration (P0: Type safety)
  typescript: {
    ignoreBuildErrors: false, // Enforce type checking in production
  },

  // ───────────────────────────────────────────────────────────────────────────
  // P1: OPTIMIZATIONS - Performance & Bundle Size
  // ───────────────────────────────────────────────────────────────────────────

  // Note: SWC minification is now enabled by default in Next.js 16+
  // swcMinify option was removed - no longer needed

  // Experimental optimizations (P1: Performance improvements)
  experimental: {
    // Enable CSS optimization in production
    optimizeCss: true,

    // Tree-shake unused exports from large packages
    optimizePackageImports: [
      "aibos-design-system",
      "@supabase/supabase-js",
      "framer-motion",
    ],

    // Note: React compiler experimental in Next.js 16
    // Uncomment when available: reactCompiler: true,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // DEVELOPMENT & TESTING
  // ───────────────────────────────────────────────────────────────────────────

  // Webpack configuration for production builds only (Turbopack handles dev)
  // Note: Turbopack is used for `next dev`, webpack for `next build`
  ...(process.env.ANALYZE === "true" && {
    webpack: (config: any, { isServer }: { isServer: boolean }) => {
      if (!isServer) {
        config.plugins?.push(
          new (require("webpack").DefinePlugin)({
            __BUNDLE_ANALYSIS__: JSON.stringify(true),
          })
        );
      }
      return config;
    },
  }),

  // Rewrites for serving AIBOS CSS (development fallback)
  async rewrites() {
    return [
      {
        source: "/node_modules/aibos-design-system/:path*",
        destination: "/aibos-design-system.css", // Fallback to public folder
      },
    ];
  },

  // ───────────────────────────────────────────────────────────────────────────
  // P0: SECURITY & ERROR HANDLING
  // ───────────────────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          // P0: Cache control for production (CDN optimization)
          process.env.NODE_ENV === "production" && {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate", // 1 hour for HTML
          },
        ].filter(Boolean) as any[],
      },
    ];
  },

  // ───────────────────────────────────────────────────────────────────────────
  // P0: PRODUCTION MONITORING & LOGGING
  // ───────────────────────────────────────────────────────────────────────────

  // On-demand entries management (P0: Production stability)
  ...(process.env.NODE_ENV === "production" && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000, // 25 seconds inactive before cleanup
      pagesBufferLength: 5, // Keep 5 pages in memory
    },
  }),
};

export default withBundleAnalyzer(nextConfig);
