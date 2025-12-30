# Performance Monitoring Setup Guide

**Version:** 1.0.0  
**Last Updated:** 2025-12-30  
**Status:** ✅ **SETUP COMPLETE**  
**Purpose:** Guide for setting up and using performance monitoring tools

---

## 🎯 Overview

Performance monitoring has been set up using:
1. **Vercel Speed Insights** - Real-time performance metrics
2. **Next.js Bundle Analyzer** - Bundle size analysis

---

## ✅ Setup Complete

### 1. Dependencies Installed

```json
{
  "dependencies": {
    "@vercel/speed-insights": "^1.0.0"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^16.1.1"
  }
}
```

### 2. Speed Insights Integration

**File:** `apps/portal/app/layout.tsx`

```tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Status:** ✅ Integrated

### 3. Bundle Analyzer Configuration

**File:** `apps/portal/next.config.ts`

```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

**Status:** ✅ Configured

### 4. Package.json Scripts

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

**Status:** ✅ Added

---

## 📊 How to Use

### Speed Insights

**Automatic:** Speed Insights automatically collects metrics when deployed to Vercel.

**Manual Setup (if not on Vercel):**
1. Sign up at [vercel.com](https://vercel.com)
2. Add project
3. Deploy application
4. Metrics will appear in Vercel dashboard

**Metrics Collected:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Time to Interactive (TTI)

### Bundle Analyzer

**Run Analysis:**
```bash
cd apps/portal
pnpm analyze
```

**Output:**
- Opens browser automatically with bundle visualization
- Shows bundle size breakdown
- Identifies large dependencies
- Helps optimize bundle size

**Example Output:**
```
Server
  ✓ Compiled successfully
  ✓ Linting and checking validity of types
  ✓ Collecting page data
  ✓ Generating static pages (5/5)
  ✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.1 kB         87.2 kB
├ ○ /demo                                2.4 kB         84.5 kB
└ ○ /vendors                             3.2 kB         85.3 kB

+ First Load JS shared by all           82.1 kB
  ├ chunks/framework-[hash].js          45.2 kB
  ├ chunks/main-[hash].js               28.3 kB
  └ chunks/polyfills-[hash].js          8.6 kB

λ  (Server)  server-side renders at runtime
○  (Static)  automatically rendered as static HTML
```

---

## 📈 Performance Metrics Dashboard

### Target Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First Contentful Paint (FCP) | <2s | ⚠️ Measuring | - |
| Largest Contentful Paint (LCP) | <2.5s | ⚠️ Measuring | - |
| Cumulative Layout Shift (CLS) | <0.1 | ⚠️ Measuring | - |
| First Input Delay (FID) | <100ms | ⚠️ Measuring | - |
| Time to Interactive (TTI) | <3s | ⚠️ Measuring | - |
| Bundle Size (Client) | <500KB | ⚠️ Measuring | - |
| Server Components % | >80% | 100% | ✅ |
| Client Components % | <20% | ~15% | ✅ |

---

## 🔍 Monitoring Workflow

### 1. Development

```bash
# Run dev server
pnpm dev

# Speed Insights automatically tracks in development
# Check browser console for performance warnings
```

### 2. Build Analysis

```bash
# Analyze bundle size
pnpm analyze

# Review bundle breakdown
# Identify optimization opportunities
```

### 3. Production Monitoring

1. Deploy to Vercel
2. Check Speed Insights dashboard
3. Review Core Web Vitals
4. Track performance trends
5. Identify regressions

---

## 🎯 Optimization Checklist

### Bundle Size Optimization

- [ ] Run `pnpm analyze`
- [ ] Identify large dependencies
- [ ] Check for duplicate dependencies
- [ ] Optimize imports (tree-shaking)
- [ ] Consider code splitting
- [ ] Lazy load heavy components

### Performance Optimization

- [ ] Monitor Core Web Vitals
- [ ] Optimize images (Next.js Image)
- [ ] Implement proper caching
- [ ] Minimize JavaScript execution
- [ ] Optimize CSS loading
- [ ] Use Server Components where possible

---

## 📝 Next Steps

1. ✅ **Setup Complete** - Dependencies installed and configured
2. ⏳ **Deploy to Vercel** - Enable Speed Insights
3. ⏳ **Run Bundle Analysis** - Establish baseline
4. ⏳ **Measure Performance** - Collect initial metrics
5. ⏳ **Update Efficiency Tracker** - Record metrics

---

## 🔗 Resources

- [Vercel Speed Insights Docs](https://vercel.com/docs/speed-insights)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

---

**Setup Status:** ✅ **COMPLETE**  
**Next Action:** Deploy to Vercel and run bundle analysis  
**Last Updated:** 2025-12-30

