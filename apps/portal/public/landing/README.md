# NEXUS Landing Page Rotation System

> **Location**: `apps/portal/public/landing/` > **Middleware**: `apps/portal/middleware.ts` > **Last Updated**: December 2024

## Overview

This directory contains static HTML landing pages that are randomly served when users visit the root URL (`/`). The rotation is handled by Next.js middleware, providing a dynamic first impression without the overhead of React hydration.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  User visits /                                                       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  middleware.ts                                                       │
│  ├─ Check if ROTATION_ENABLED = true                                │
│  ├─ Randomly select from LANDING_PAGES[]                            │
│  └─ NextResponse.rewrite() → /landing/{selected}.html               │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  /public/landing/{selected}.html                                     │
│  Served as static file (no React, no hydration, pure performance)   │
└─────────────────────────────────────────────────────────────────────┘
```

## Available Landing Pages

| Filename          | Description                     |
| ----------------- | ------------------------------- |
| `alpha.html`      | Alpha version landing           |
| `audit.html`      | Forensic audit theme            |
| `god-view.html`   | God view / overview perspective |
| `gpt.html`        | AI/GPT integration showcase     |
| `king-class.html` | Premium/kingclass theme         |
| `physics.html`    | Physics/mechanics visualization |
| `pressure.html`   | Pressure/intensity theme        |
| `saas.html`       | SaaS product landing            |
| `solaris.html`    | Solaris/cosmic theme            |
| `story.html`      | Narrative/story-driven landing  |

## Configuration Options

Edit `apps/portal/middleware.ts` to configure:

### 1. Default Fallback Landing

```typescript
const DEFAULT_LANDING = "audit.html"; // Always used when rotation disabled or as fallback
```

### 2. Enable/Disable Rotation

```typescript
const ROTATION_ENABLED = true; // Set to false to serve only DEFAULT_LANDING
```

### 3. Landing Pages Array

```typescript
const LANDING_PAGES = [
  "alpha.html",
  "audit.html",
  // ... add or remove pages
];
// Set to [] (empty array) to use only DEFAULT_LANDING
```

### 4. Persistence (Same landing per session)

```typescript
const PERSIST_LANDING = false; // Set to true to keep same landing for 1 hour
const ROTATION_COOKIE_MAX_AGE = 60 * 60; // Cookie duration in seconds
```

## Behavior Matrix

| ROTATION_ENABLED | LANDING_PAGES | Result                          |
| ---------------- | ------------- | ------------------------------- |
| `true`           | `[...]`       | Random rotation among all pages |
| `true`           | `[]`          | Uses DEFAULT_LANDING only       |
| `false`          | `[...]`       | Uses DEFAULT_LANDING only       |
| `false`          | `[]`          | Uses DEFAULT_LANDING only       |

## Adding New Landing Pages

1. Create your HTML file following the naming convention:

   ```
   my-new-landing.html  ← kebab-case, lowercase
   ```

2. Place it in `/apps/portal/public/landing/`

3. Add the filename to the `LANDING_PAGES` array in `middleware.ts`:

   ```typescript
   const LANDING_PAGES = [
     // ... existing pages
     "my-new-landing.html", // ← Add here
   ];
   ```

4. Restart dev server or deploy

## Direct Access

Each landing page can be accessed directly for testing:

- `http://localhost:3000/landing/story.html`
- `http://localhost:3000/landing/solaris.html`
- `http://localhost:3000/landing/audit.html`
- etc.

## Performance Benefits

| Metric             | Static HTML | React SSR          |
| ------------------ | ----------- | ------------------ |
| Time to First Byte | ~5-10ms     | ~50-100ms          |
| JavaScript Bundle  | 0 KB        | 200+ KB            |
| Hydration Time     | 0ms         | 100-300ms          |
| SEO Ready          | ✅ Instant  | ✅ After hydration |

## Customization Tips

### Adding Navigation to React App

In your HTML landing pages, link to the Next.js app:

```html
<a href="/dashboard">Enter App →</a> <a href="/login">Sign In</a>
```

### Shared Assets

Place shared assets (CSS, JS, images) in `/public/landing/assets/`:

```html
<link rel="stylesheet" href="/landing/assets/shared.css" />
<script src="/landing/assets/animations.js"></script>
```

### Analytics Integration

Add tracking to each landing page:

```html
<script>
  // Track which landing was shown
  window.nexusLanding = "story.html";
  // Your analytics code here
</script>
```

## Troubleshooting

### Landing not rotating?

1. Check `ROTATION_ENABLED = true` in middleware.ts
2. Clear browser cache (static files are cached)
3. Check the filename is in `LANDING_PAGES` array
4. Ensure middleware.ts is in `apps/portal/` root (not in `app/` or `src/`)

### Getting 404?

1. Verify file exists in `/public/landing/`
2. Check filename case matches exactly (case-sensitive)
3. Ensure file has `.html` extension

### Want to disable temporarily?

Set `ROTATION_ENABLED = false` in middleware.ts to fall back to the default `app/page.tsx`.

## File Structure

```
apps/portal/
├── middleware.ts           # Rotation logic
├── app/
│   └── page.tsx           # Default React landing (used when rotation disabled)
└── public/
    └── landing/
        ├── README.md       # This file
        ├── alpha.html
        ├── audit.html
        ├── god-view.html
        ├── gpt.html
        ├── king-class.html
        ├── physics.html
        ├── pressure.html
        ├── saas.html
        ├── solaris.html
        └── story.html
```

---

**NEXUS-KERNEL** · Landing Page Rotation System · v1.0
