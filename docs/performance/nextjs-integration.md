# Next.js Integration Guide

**Status:** ✅ Optimized  
**Package:** `@aibos/kernel`

---

## Quick Start

### Installation

```bash
npm install @aibos/kernel
# or
pnpm add @aibos/kernel
# or
yarn add @aibos/kernel
```

### Basic Usage

```typescript
// Server Component (recommended)
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

---

## Optimization Features

### 1. Tree-Shaking ✅

The package is fully tree-shakeable:

```typescript
// ✅ Only imports CONCEPT (tree-shaken)
import { CONCEPT } from "@aibos/kernel";

// ✅ Only imports VALUE (tree-shaken)
import { VALUE } from "@aibos/kernel";

// ❌ Avoid - imports everything
import * as Kernel from "@aibos/kernel";
```

### 2. Subpath Imports ✅

Use granular imports for smaller bundles:

```typescript
// Main export
import { CONCEPT } from "@aibos/kernel";

// Lazy loading
import { getCountries } from "@aibos/kernel/values/lazy";

// Validation only
import { validateConcept } from "@aibos/kernel/validation";

// Cache utilities
import { validationCache } from "@aibos/kernel/cache";
```

### 3. Lazy Loading ✅

Optimize large value sets:

```typescript
// Client Component
"use client";
import { getCountries } from "@aibos/kernel/values/lazy";
import { useEffect, useState } from "react";

export function CountrySelector() {
  const [countries, setCountries] = useState({});
  
  useEffect(() => {
    getCountries().then(setCountries);
  }, []);
  
  return <select>{/* ... */}</select>;
}
```

### 4. Server Components ✅

Perfect for Server Components (no React dependencies):

```typescript
// app/page.tsx (Server Component)
import { CONCEPT, VALUE } from "@aibos/kernel";

export default function Page() {
  // Works perfectly in Server Components
  return <div>{CONCEPT.INVOICE}</div>;
}
```

---

## Performance Tips

1. **Use Server Components** when possible
2. **Use named imports** for tree-shaking
3. **Use subpath imports** for granular control
4. **Lazy load** large value sets
5. **Preload** during app initialization if needed

---

## Bundle Size

- **Core exports:** ~10-50KB (tree-shakeable)
- **Full package:** ~100KB
- **Lazy loaded:** Only loads when needed

---

**See:** `docs/performance/nextjs-optimization.md` for complete guide

