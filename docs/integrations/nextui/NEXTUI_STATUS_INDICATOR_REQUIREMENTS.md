# NextUI Status Indicator Adapter - Requirements

**Version:** 1.0.0  
**Last Updated:** 2025-01-22  
**Status:** Active  
**Purpose:** Clear requirements for creating a NextUI adapter for AIBOS Design System status indicators

---

## Executive Summary

**Problem:** AIBOS status indicators (`na-status`) are not functioning because:
1. Wrong CSS class syntax used in demo (`na-status-ok` instead of `na-status ok`)
2. No React component wrapper for NextUI integration
3. Missing accessibility features from NextUI

**Solution:** Create a NextUI adapter component that:
- Maps AIBOS CSS classes correctly
- Provides React component API
- Maintains NextUI accessibility standards
- Supports all AIBOS status variants

---

## 1. AIBOS Status Indicator CSS Structure

### 1.1 Base Classes

**Base Class:**
```css
.na-status {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  border-radius: var(--radius-control);
  border: 1px solid var(--color-stroke-soft);
  padding-inline: var(--spacing-2_5);
  padding-block: var(--spacing-1);
  font-size: 11px;
  line-height: 1;
  font-weight: var(--font-weight-semibold);
  background: rgba(255, 255, 255, 0.03);
}

.na-status::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(228, 228, 231, 0.25);
}
```

**Key Features:**
- Inline-flex display with center alignment
- 7px circular dot indicator (via `::before` pseudo-element)
- 11px semibold text
- Subtle border and background
- Gap between dot and text

### 1.2 Status Variants

**Available Variants:**

| Variant | CSS Class | Color | Usage |
|---------|-----------|-------|-------|
| **Success** | `.na-status.ok` | Green (#10b981) | Positive outcomes, complete, approved |
| **Error** | `.na-status.bad` | Red (#f43f5e) | Negative outcomes, errors, declined |
| **Warning** | `.na-status.warn` | Yellow (#f59e0b) | Requires attention, missing info |
| **Pending** | `.na-status.pending` | Yellow (#f59e0b) | In progress, under review |

**Important:** Variants use **space-separated classes**, NOT hyphenated:
- ✅ Correct: `className="na-status ok"`
- ❌ Wrong: `className="na-status-ok"`

---

## 2. Component Requirements

### 2.1 Component API

**File:** `apps/portal/components/StatusIndicator.tsx` (or similar location)

**Props Interface:**
```typescript
interface StatusIndicatorProps {
  /**
   * Status variant
   * Maps to AIBOS CSS classes: ok, bad, warn, pending
   */
  variant: 'success' | 'error' | 'warning' | 'pending';
  
  /**
   * Status label text
   * Required - AIBOS guidelines require text labels with icons
   */
  label: string;
  
  /**
   * Optional custom className
   * Will be merged with AIBOS classes
   */
  className?: string;
  
  /**
   * Optional size variant (if needed)
   * Default: 'default'
   */
  size?: 'small' | 'default' | 'large';
  
  /**
   * Optional icon override
   * Default: Uses AIBOS ::before pseudo-element dot
   * Can be set to null to hide dot
   */
  showDot?: boolean;
}
```

### 2.2 Implementation Structure

**Component Structure:**
```tsx
'use client';

import { cn } from '@/lib/utils'; // or similar className utility

export function StatusIndicator({
  variant,
  label,
  className,
  size = 'default',
  showDot = true,
}: StatusIndicatorProps) {
  // Map variant prop to AIBOS CSS class
  const variantClass = {
    success: 'ok',
    error: 'bad',
    warning: 'warn',
    pending: 'pending',
  }[variant];

  // Build className string
  const classes = cn(
    'na-status',           // Base AIBOS class
    variantClass,          // Variant class (ok, bad, warn, pending)
    className              // Custom classes
  );

  return (
    <span className={classes} role="status" aria-label={`Status: ${label}`}>
      {label}
    </span>
  );
}
```

### 2.3 Variant Mapping

**Variant Mapping Table:**

| Prop Value | AIBOS Class | Color | Semantic Meaning |
|------------|------------|-------|------------------|
| `success` | `ok` | Green | Complete, approved, ready |
| `error` | `bad` | Red | Error, declined, failed |
| `warning` | `warn` | Yellow | Requires attention |
| `pending` | `pending` | Yellow | In progress, under review |

---

## 3. NextUI Integration Requirements

### 3.1 Accessibility

**Required ARIA Attributes:**
- `role="status"` - Indicates live region for status updates
- `aria-label` - Descriptive label for screen readers
- `aria-live="polite"` - Optional, for dynamic status updates

**Example:**
```tsx
<span
  className="na-status ok"
  role="status"
  aria-label="Status: Success"
  aria-live="polite"
>
  Success
</span>
```

### 3.2 NextUI Badge Alternative (Optional)

**If using NextUI Badge as base:**
```tsx
import { Badge } from '@nextui-org/react';

export function StatusIndicator({ variant, label, ...props }) {
  const colorMap = {
    success: 'success',
    error: 'danger',
    warning: 'warning',
    pending: 'warning',
  };

  return (
    <Badge
      color={colorMap[variant]}
      variant="flat"
      className="na-status" // Apply AIBOS base class
      {...props}
    >
      {label}
    </Badge>
  );
}
```

**Note:** This approach may conflict with AIBOS styling. Recommended to use pure AIBOS classes.

---

## 4. Usage Examples

### 4.1 Basic Usage

```tsx
import { StatusIndicator } from '@/components/StatusIndicator';

// Success status
<StatusIndicator variant="success" label="Complete" />

// Error status
<StatusIndicator variant="error" label="Failed" />

// Warning status
<StatusIndicator variant="warning" label="Attention Required" />

// Pending status
<StatusIndicator variant="pending" label="In Progress" />
```

### 4.2 With Custom Classes

```tsx
<StatusIndicator
  variant="success"
  label="Approved"
  className="ml-4"
/>
```

### 4.3 In Cards/Tables

```tsx
<Card>
  <CardBody>
    <div className="flex items-center gap-4">
      <span>Invoice #12345</span>
      <StatusIndicator variant="pending" label="Under Review" />
    </div>
  </CardBody>
</Card>
```

---

## 5. Implementation Checklist

### 5.1 Core Requirements

- [ ] Create `StatusIndicator` component
- [ ] Map `variant` prop to AIBOS CSS classes (`ok`, `bad`, `warn`, `pending`)
- [ ] Use correct class syntax: `"na-status ok"` (space-separated)
- [ ] Include `label` prop (required)
- [ ] Add accessibility attributes (`role="status"`, `aria-label`)
- [ ] Support custom `className` prop
- [ ] Export component from appropriate location

### 5.2 Testing Requirements

- [ ] Test all 4 variants render correctly
- [ ] Verify CSS classes applied correctly
- [ ] Check accessibility with screen reader
- [ ] Test in dark theme
- [ ] Verify dot indicator appears (via `::before`)
- [ ] Test custom className merging

### 5.3 Documentation Requirements

- [ ] Add JSDoc comments
- [ ] Create usage examples
- [ ] Document variant meanings
- [ ] Add to component library docs

---

## 6. File Structure

**Recommended Location:**
```
apps/portal/
  components/
    ui/
      StatusIndicator.tsx
      index.ts (export)
```

**Or:**
```
apps/portal/
  components/
    StatusIndicator.tsx
```

---

## 7. TypeScript Types

**Complete Type Definition:**
```typescript
export type StatusVariant = 'success' | 'error' | 'warning' | 'pending';

export interface StatusIndicatorProps {
  variant: StatusVariant;
  label: string;
  className?: string;
  size?: 'small' | 'default' | 'large';
  showDot?: boolean;
}

export function StatusIndicator(props: StatusIndicatorProps): JSX.Element;
```

---

## 8. CSS Class Reference

**Correct Usage:**
```tsx
// ✅ CORRECT
<span className="na-status ok">Success</span>
<span className="na-status bad">Error</span>
<span className="na-status warn">Warning</span>
<span className="na-status pending">Pending</span>

// ❌ WRONG (current demo page)
<span className="na-status na-status-ok">Success</span>
<span className="na-status na-status-error">Error</span>
<span className="na-status na-status-warning">Warning</span>
```

**Key Point:** AIBOS uses **space-separated modifier classes**, not hyphenated BEM-style classes.

---

## 9. Next Steps

1. **Create Component:** Implement `StatusIndicator.tsx` following requirements
2. **Update Demo:** Fix demo page to use correct classes or new component
3. **Test:** Verify all variants work correctly
4. **Document:** Add to component library documentation

---

## 10. Summary

**Critical Requirements:**
1. ✅ Use space-separated classes: `"na-status ok"` (NOT `"na-status-ok"`)
2. ✅ Map variants: `success` → `ok`, `error` → `bad`, `warning` → `warn`, `pending` → `pending`
3. ✅ Include `label` prop (required by AIBOS guidelines)
4. ✅ Add accessibility attributes
5. ✅ Support custom className merging

**Component API:**
```tsx
<StatusIndicator variant="success" label="Complete" />
```

**Expected Output:**
```html
<span class="na-status ok" role="status" aria-label="Status: Complete">
  Complete
</span>
```

---

**Status:** ✅ Requirements Complete - Ready for Implementation  
**Next Action:** Create `StatusIndicator` component following these specifications

