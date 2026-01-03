# Next.js Optimization Guide

**Status:** ✅ Optimized for Next.js  
**Purpose:** Optimize `@aibos/kernel` package for Next.js applications

---

## Overview

This package is optimized for Next.js applications with:
- ✅ Proper ESM exports
- ✅ Tree-shaking support
- ✅ Subpath exports for granular imports
- ✅ React Server Components compatible (no React dependencies)
- ✅ Optimized bundle size
- ✅ Lazy loading support

---

## Next.js Compatibility

### ✅ Server Components (Default)

The package is **fully compatible** with Next.js Server Components:

```typescript
// app/page.tsx (Server Component)
import { CONCEPT, VALUE } from "@aibos/kernel";

export default function Page() {
  return (
    <div>
      <p>Concept: {CONCEPT.INVOICE}</p>
      <p>Value: {VALUE.ACCOUNT_TYPE.ASSET}</p>
    </div>
  );
}
```

### ✅ Client Components

Works in Client Components too:

```typescript
// app/components/ClientComponent.tsx
"use client";

import { CONCEPT } from "@aibos/kernel";

export function ClientComponent() {
  return <div>{CONCEPT.INVOICE}</div>;
}
```

### ✅ Route Handlers

Perfect for API routes:

```typescript
// app/api/concepts/route.ts
import { CONCEPT, validateConcept } from "@aibos/kernel";

export async function GET() {
  return Response.json({ concepts: Object.keys(CONCEPT) });
}
```

---

## Optimization Features

### 1. Tree-Shaking Support

**Configuration:**
- `sideEffects: false` - Enables tree-shaking
- Named exports only - Better tree-shaking
- ESM modules - Optimal for bundlers

**Usage:**
```typescript
// Only imports what you use
import { CONCEPT, VALUE } from "@aibos/kernel";
// Bundler will tree-shake unused exports
```

### 2. Subpath Exports

**Granular Imports:**
```typescript
// Main export (everything)
import { CONCEPT, VALUE } from "@aibos/kernel";

// Lazy loading only
import { getCountries } from "@aibos/kernel/values/lazy";

// Validation only
import { validateConcept } from "@aibos/kernel/validation";

// Cache utilities only
import { validationCache } from "@aibos/kernel/cache";
```

**Benefits:**
- Smaller bundle sizes
- Better code-splitting
- Faster builds

### 3. Lazy Loading for Large Value Sets

**Optimize for Next.js:**
```typescript
// app/components/CountrySelector.tsx
"use client";

import { useState, useEffect } from "react";
import { getCountries } from "@aibos/kernel/values/lazy";

export function CountrySelector() {
  const [countries, setCountries] = useState<Record<string, string>>({});

  useEffect(() => {
    // Lazy load only when component mounts
    getCountries().then(setCountries);
  }, []);

  return (
    <select>
      {Object.entries(countries).map(([key, value]) => (
        <option key={key} value={value}>{key}</option>
      ))}
    </select>
  );
}
```

**Server Component:**
```typescript
// app/countries/page.tsx
import { getCountries } from "@aibos/kernel/values/lazy";

export default async function CountriesPage() {
  // Load on server
  const countries = await getCountries();
  
  return (
    <div>
      {Object.entries(countries).map(([key, value]) => (
        <div key={key}>{key}: {value}</div>
      ))}
    </div>
  );
}
```

### 4. Validation Caching

**Optimize validation performance:**
```typescript
// app/api/validate/route.ts
import { validateConcept, validationCache } from "@aibos/kernel";

export async function POST(request: Request) {
  const data = await request.json();
  
  // Validation is automatically cached
  const concept = validateConcept(data);
  
  // Get cache statistics
  const stats = validationCache.getStats();
  console.log(`Cache hit rate: ${stats.total.hitRate}`);
  
  return Response.json({ concept });
}
```

---

## Next.js Build Optimization

### Bundle Size

The package is optimized for Next.js bundlers:

- **Tree-shaking:** Only imports what you use
- **Code-splitting:** Large value sets can be lazy loaded
- **ESM:** Native ESM support for better optimization
- **No side effects:** Safe for tree-shaking

### Import Optimization

**Best Practices:**

1. **Use named imports:**
```typescript
// ✅ Good - tree-shakeable
import { CONCEPT, VALUE } from "@aibos/kernel";

// ❌ Avoid - imports everything
import * as Kernel from "@aibos/kernel";
```

2. **Use subpath imports:**
```typescript
// ✅ Good - only imports what you need
import { getCountries } from "@aibos/kernel/values/lazy";
import { validateConcept } from "@aibos/kernel/validation";

// ❌ Avoid - imports everything
import { getCountries, validateConcept } from "@aibos/kernel";
```

3. **Lazy load large value sets:**
```typescript
// ✅ Good - lazy load when needed
const countries = await getCountries();

// ❌ Avoid - loads everything immediately
import { VALUE } from "@aibos/kernel";
const countries = VALUE.COUNTRIES;
```

---

## Next.js Configuration

### next.config.js

No special configuration needed! The package works out of the box.

**Optional optimizations:**
```javascript
// next.config.js
module.exports = {
  // Package is already optimized
  // No transpilation needed
  transpilePackages: [], // Not needed
  
  // Tree-shaking works automatically
  // Code-splitting works automatically
};
```

### TypeScript Configuration

The package includes TypeScript definitions:

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler" // or "node16"/"nodenext"
  }
}
```

---

## Performance Tips

### 1. Preload Large Value Sets

```typescript
// app/layout.tsx
import { preloadLargeValueSets } from "@aibos/kernel/values/lazy";

// Preload during app initialization
preloadLargeValueSets();

export default function RootLayout({ children }) {
  return <html>{children}</html>;
}
```

### 2. Use Server Components When Possible

```typescript
// ✅ Server Component (faster)
// app/page.tsx
import { CONCEPT } from "@aibos/kernel";

export default function Page() {
  return <div>{CONCEPT.INVOICE}</div>;
}

// ❌ Client Component (slower, larger bundle)
// app/page.tsx
"use client";
import { CONCEPT } from "@aibos/kernel";
// ...
```

### 3. Cache Validation Results

```typescript
// Validation cache is automatic
// But you can monitor it:
import { validationCache } from "@aibos/kernel/cache";

const stats = validationCache.getStats();
console.log(`Hit rate: ${stats.total.hitRate}`);
```

---

## Bundle Size Analysis

### Expected Bundle Sizes

| Import | Size (approx) | Notes |
|--------|---------------|-------|
| `CONCEPT` only | ~10KB | Small, tree-shakeable |
| `VALUE` (core) | ~50KB | Medium, tree-shakeable |
| `VALUE.COUNTRIES` | ~15KB | Large value set |
| `VALUE.CURRENCIES` | ~12KB | Large value set |
| Full package | ~100KB | All exports |

### Optimization Strategies

1. **Import only what you need:**
```typescript
// ✅ Small bundle
import { CONCEPT } from "@aibos/kernel";

// ❌ Large bundle
import * as Kernel from "@aibos/kernel";
```

2. **Use lazy loading:**
```typescript
// ✅ Smaller initial bundle
import { getCountries } from "@aibos/kernel/values/lazy";

// ❌ Larger initial bundle
import { VALUE } from "@aibos/kernel";
```

3. **Use subpath imports:**
```typescript
// ✅ Only imports validation
import { validateConcept } from "@aibos/kernel/validation";

// ❌ Imports everything
import { validateConcept } from "@aibos/kernel";
```

---

## Troubleshooting

### Tree-Shaking Not Working

**Check:**
1. `sideEffects: false` in package.json ✅ (already set)
2. Use named imports (not `import *`)
3. Use ESM (not CommonJS)
4. Check Next.js bundler configuration

### Bundle Size Too Large

**Solutions:**
1. Use subpath imports
2. Lazy load large value sets
3. Import only what you need
4. Check for duplicate imports

### Import Errors

**Common Issues:**
1. TypeScript module resolution - use `"moduleResolution": "bundler"`
2. ESM vs CommonJS - package is ESM only
3. Subpath imports - check export paths in package.json

---

## Examples

### Server Component Example

```typescript
// app/invoices/page.tsx
import { CONCEPT, VALUE } from "@aibos/kernel";

export default function InvoicesPage() {
  return (
    <div>
      <h1>Invoice Concept: {CONCEPT.INVOICE}</h1>
      <p>Status: {VALUE.INVOICE_STATUS.DRAFT}</p>
    </div>
  );
}
```

### Client Component Example

```typescript
// app/components/StatusSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { getCountries } from "@aibos/kernel/values/lazy";

export function StatusSelector() {
  const [countries, setCountries] = useState<Record<string, string>>({});

  useEffect(() => {
    getCountries().then(setCountries);
  }, []);

  return (
    <select>
      {Object.entries(countries).map(([key, value]) => (
        <option key={key} value={value}>{key}</option>
      ))}
    </select>
  );
}
```

### API Route Example

```typescript
// app/api/concepts/route.ts
import { CONCEPT, validateConcept } from "@aibos/kernel";

export async function GET() {
  return Response.json({
    concepts: Object.keys(CONCEPT),
    count: Object.keys(CONCEPT).length,
  });
}

export async function POST(request: Request) {
  const data = await request.json();
  const concept = validateConcept(data);
  return Response.json({ concept });
}
```

---

## Best Practices Summary

1. ✅ **Use Server Components** when possible (faster, smaller bundle)
2. ✅ **Use named imports** for better tree-shaking
3. ✅ **Use subpath imports** for granular control
4. ✅ **Lazy load large value sets** when not immediately needed
5. ✅ **Preload** during app initialization if needed
6. ✅ **Monitor cache statistics** for optimization insights

---

**Last Updated:** 2026-01-03  
**Status:** ✅ Optimized for Next.js

