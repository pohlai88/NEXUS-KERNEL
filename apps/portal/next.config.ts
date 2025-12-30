import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile monorepo packages and external packages with TypeScript/React components
  transpilePackages: [
    "@nexus/kernel", 
    "@nexus/cruds", 
    "@nexus/ui-actions",
    "aibos-design-system", // Required for React components (TypeScript files)
  ],

  // Image optimization (Next.js 16 best practices)
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // React Strict Mode (Next.js 16 default, explicit for clarity)
  reactStrictMode: true,

  // Output standalone for Docker deployments
  output: 'standalone',

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Enforce type checking in production
  },

  // Rewrites for serving AIBOS CSS (development fallback)
  async rewrites() {
    return [
      {
        source: '/node_modules/aibos-design-system/:path*',
        destination: '/aibos-design-system.css', // Fallback to public folder
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
};

export default nextConfig;
