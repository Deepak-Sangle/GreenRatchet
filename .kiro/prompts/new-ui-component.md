# New UI Component

Create a reusable UI component following the design system.

## Location

- Shared UI: `components/ui/`
- Feature-specific: `components/{feature}/`

## Pattern

```tsx
"use client"; // Only if needed (state, effects, event handlers)

import { cn } from "@/lib/utils";

interface {ComponentName}Props {
  // Props with explicit types
  className?: string;
}

export function {ComponentName}({ className, ...props }: {ComponentName}Props) {
  return (
    <div className={cn("base-classes", className)}>
      {/* Content */}
    </div>
  );
}
```

## Design System Rules

- Use semantic colors: `bg-card`, `text-foreground`, `border-border`
- For theme-specific: `bg-emerald-100 dark:bg-emerald-900/20`
- Icons from lucide-react: `h-4 w-4` (small), `h-6 w-6` (large)
- Transitions: `transition-all duration-200`
- Spacing: `p-6` for cards, `gap-4` default

## Loading State

```tsx
<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
```

## Responsive

```tsx
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
```
