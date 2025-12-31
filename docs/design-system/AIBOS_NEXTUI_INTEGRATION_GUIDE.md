# AIBOS + NextUI Integration Guide

**Version:** 1.0.0  
**Last Updated:** 2025-12-30  
**Status:** Active  
**Purpose:** Practical implementation guide for integrating AIBOS Design System with NextUI/HeroUI in Next.js 16

---

## Installation

```bash
# Install AIBOS Design System
npm install aibos-design-system

# Install NextUI (HeroUI)
npm install @nextui-org/react framer-motion
```

---

## Step 1: Update Layout with Providers

**File:** `apps/portal/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "aibos-design-system/css"; // AIBOS CSS (after Tailwind, before globals)
import "./globals.css"; // VMP Foundation

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Canon Portal",
  description: "Nexus Canon Business Operating System - Vendor Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

## Step 2: Create NextUI Provider

**File:** `apps/portal/app/providers.tsx`

```tsx
'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        {children}
      </NextThemesProvider>
    </NextUIProvider>
  );
}
```

**Note:** Install `next-themes` if using theme switching:
```bash
npm install next-themes
```

---

## Step 3: Usage Patterns

### Foundation Layer (Data Presentation)

**Use:** AIBOS `na-*` classes + NextUI components

```tsx
import { Card, CardBody, Button } from '@nextui-org/react';

export function VendorDashboard() {
  return (
    <div className="na-card na-p-6">
      <h1 className="na-h1">Vendor Dashboard</h1>
      
      <Card className="na-card na-p-6">
        <CardBody>
          <div className="na-data">$12,450.00</div>
          <div className="na-metadata">PO-88219 • Feed Supply</div>
          <Button color="primary" className="na-btn-primary mt-4">
            View Details
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
```

### Design Layer (Creative/Marketing)

**Use:** AIBOS `na-*` classes + inline styles (unified system)

```tsx
export function MarketingHero() {
  return (
    <div className="na-card na-p-6">
      <h1 style={{ fontSize: '4rem', fontWeight: 700, color: '#ff0000' }}>
        Welcome to Nexus Canon
      </h1>
      <p className="na-text-lg na-mt-4">
        Transform your business operations
      </p>
      <button className="na-btn-primary na-mt-6">
        Get Started
      </button>
    </div>
  );
}
```

### Unified Approach (NextUI + AIBOS)

**Use:** NextUI components with AIBOS utility classes (unified system)

```tsx
import { Card, CardBody } from '@nextui-org/react';

export function UnifiedComponent() {
  return (
    <div className="na-container na-mx-auto">
      <Card className="na-card na-p-6">
        <CardBody>
          <h2 className="na-h4">Card Title</h2>
          <div className="na-data">$12,450.00</div>
          <div className="na-metadata">PO-88219 • Feed Supply</div>
        </CardBody>
      </Card>
    </div>
  );
}
```

---

## Step 4: Update package.json

**File:** `apps/portal/package.json`

```json
{
  "dependencies": {
    "@nexus/kernel": "workspace:*",
    "@nexus/cruds": "workspace:*",
    "@nexus/ui-actions": "workspace:*",
    "@nextui-org/react": "^2.4.0",
    "aibos-design-system": "^1.0.0",
    "framer-motion": "^11.0.0",
    "next": "16.1.1",
    "next-themes": "^0.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.1"
  }
}
```

---

## Step 5: CSS Loading Order (Critical)

**Correct Order:**
1. Tailwind CSS (via `@import "tailwindcss"` in globals.css)
2. AIBOS CSS (`import 'aibos-design-system/css'`)
3. VMP Foundation (`import './globals.css'`)

**Why:** AIBOS utilities can override Tailwind, but VMP Foundation should have final say for data presentation.

---

## Best Practices

### ✅ DO

1. **Foundation Layer:**
   - Use AIBOS `na-*` classes for typography (`.na-h1`, `.na-h2`, `.na-data`, `.na-metadata`)
   - Use NextUI components for interactive elements
   - Keep semantic meaning clear

2. **Design Layer:**
   - Use AIBOS `na-*` classes (unified system)
   - Inline styles allowed for creative content
   - No markers needed (unified system)

3. **Component Composition:**
   - Combine NextUI components with AIBOS utilities
   - Use AIBOS for typography and components
   - Use NextUI for accessibility and interactivity

### ❌ DON'T

1. **Don't use deprecated `vmp-` classes:**
   ```tsx
   // ❌ WRONG (deprecated)
   <div className="vmp-container">
   
   // ✅ CORRECT
   <div className="na-card na-p-6">
   ```

2. **Don't bypass NextUI for accessible components:**
   ```tsx
   // ❌ WRONG (if you need accessibility)
   <button className="na-btn">Click</button>
   
   // ✅ CORRECT
   <Button className="na-btn-primary">Click</Button>
   ```

3. **Don't mix old and new prefixes:**
   ```tsx
   // ❌ WRONG
   <div className="vmp-panel na-card">
   
   // ✅ CORRECT
   <div className="na-card na-p-6">
   ```

---

## Troubleshooting

### Issue: CSS Conflicts

**Symptom:** Styles not applying correctly

**Solution:**
1. Check CSS import order in `layout.tsx`
2. Verify Tailwind config doesn't purge AIBOS classes
3. Use browser DevTools to inspect specificity

### Issue: NextUI Theme Not Working

**Symptom:** Dark theme not applying

**Solution:**
1. Ensure `suppressHydrationWarning` on `<html>`
2. Check `next-themes` is installed
3. Verify Provider wraps all content

### Issue: Bundle Size Too Large

**Symptom:** Build size increased significantly

**Solution:**
1. Use tree-shaking for NextUI (import specific components)
2. Check if AIBOS CSS can be purged
3. Monitor with `@next/bundle-analyzer`

---

## Example: Complete Component

```tsx
'use client';

import { Card, CardBody, CardHeader, Button } from '@nextui-org/react';
import { useAction } from '@nexus/ui-actions';

export function VendorCard({ vendor }) {
  const { execute, loading, error } = useAction(
    vendorActions.approve,
    { userId: 'user-123', tenantId: 'tenant-456' },
    async (ctx) => {
      // Action handler
      return await approveVendor(vendor.id);
    }
  );

  return (
    <Card className="na-card na-p-6">
      <CardHeader>
        <h2 className="na-h4">{vendor.name}</h2>
      </CardHeader>
      <CardBody>
        <div className="na-data">{vendor.amount}</div>
        <div className="na-metadata">{vendor.description}</div>
        <Button 
          color="primary" 
          onPress={execute}
          isLoading={loading}
          className="na-btn-primary mt-4"
        >
          Approve Vendor
        </Button>
        {error && (
          <div className="na-status na-status-error mt-2">{error.message}</div>
        )}
      </CardBody>
    </Card>
  );
}
```

---

**Ready to integrate!** Follow these steps and you'll have AIBOS + NextUI working together seamlessly.

