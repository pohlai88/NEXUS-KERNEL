Perfect — let’s lock this in with **reference implementation snippets** so your team can see exactly how to consume the Master Artifact tokens inside Shadcn/Tailwind v4 components. These are copy‑paste ready and demonstrate the semantic mapping in action.

---

## 🔘 Button Component (`Button.tsx`)

```tsx
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-color-primary-hover active:bg-color-primary-active shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-color-secondary-hover shadow-sm",
        alt:
          "bg-brand-alt text-brand-alt-foreground hover:bg-color-accent-hover shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-color-destructive-hover shadow-sm",
        success:
          "bg-success text-success-foreground hover:bg-color-success-hover shadow-sm",
        warning:
          "bg-warning text-warning-foreground hover:bg-color-warning-hover shadow-sm",
        info:
          "bg-info text-info-foreground hover:bg-color-info-hover shadow-sm",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted shadow-sm",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

---

## ⚠️ Alert Component (`Alert.tsx`)

```tsx
import { cn } from "@/lib/utils";

export function Alert({ status = "info", title, children }) {
  const map = {
    info: {
      subtle: "bg-info-50 text-info-900 border border-info",
    },
    success: {
      subtle: "bg-success-50 text-success-900 border border-success",
    },
    warning: {
      subtle: "bg-warning-50 text-warning-900 border border-warning",
    },
    destructive: {
      subtle: "bg-error-50 text-error-900 border border-destructive",
    },
  }[status];

  return (
    <div className={cn("rounded-md p-4 shadow-sm", map.subtle)}>
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
```

---

## ✨ Focus Ring Example

```tsx
<button className="ring-brand focus-visible:ring-brand">
  Focus me
</button>
```

---

## 🧩 Developer Takeaways
- **Never use raw Tailwind colors** (`bg-blue-500`). Always consume semantic tokens (`bg-primary`, `bg-success`, etc.).
- **Hover/Active states** are mapped to explicit tokens (`--color-primary-hover`, `--color-success-hover`), ensuring consistent contrast.
- **Alerts** demonstrate subtle background + strong text pairings, aligned with WCAG AA.
- **Focus rings** are standardized via `.ring-brand`, so accessibility is guaranteed across components.

---
