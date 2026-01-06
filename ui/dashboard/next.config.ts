import type { NextConfig } from "next";
import path from "path";

/**
 * NEXUS-KERNEL DASHBOARD — NEXT.JS CONFIGURATION
 * 
 * ARCHITECTURE PRINCIPLE:
 * This dashboard is a CSS CONSUMER, not a CSS PRODUCER.
 * 
 * CSS Build Process (at ROOT level):
 *   1. Source:  D:\NEXUS-KERNEL\ui\input.css (1,214 lines - design constitution)
 *   2. Build:   pnpm dashboard:build-css (postcss ui/input.css -o ui/style.css)
 *   3. Output:  D:\NEXUS-KERNEL\ui\style.css (3,052 lines - pre-compiled)
 *   4. Purpose: IDE autocomplete with 2,742+ utility classes
 * 
 * Dashboard Consumption:
 *   - globals.css imports ../../style.css
 *   - NO local Tailwind config
 *   - NO JIT compilation
 *   - NO @tailwindcss/postcss plugin
 * 
 * Benefits:
 *   ✅ Zero drift (single source of truth)
 *   ✅ Perfect IDE autocomplete
 *   ✅ No build-time Tailwind processing in Next.js
 *   ✅ Faster dev server startup
 *   ✅ Consistent classes across all environments
 */
const nextConfig: NextConfig = {
  // Point to monorepo root (silences Turbopack warning about multiple lockfiles)
  turbopack: {
    root: path.resolve(__dirname, "../.."), // D:\NEXUS-KERNEL
  },
  
  // No experimental features needed - we use standard CSS imports
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ SECURITY HEADERS (Backup layer - middleware is primary)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Based on: security.pack.json HTTP_HEADER_PROFILE
  // OWASP A05:2021 Security Misconfiguration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔒 PRODUCTION HARDENING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header (information disclosure)
  compress: true, // Enable gzip compression
};

export default nextConfig;
