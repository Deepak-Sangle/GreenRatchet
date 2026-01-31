# UI Design System

## Colors

Use semantic classes only - never hardcode colors:

- `bg-background`, `text-foreground` - main colors
- `bg-card`, `text-card-foreground` - cards
- `bg-primary`, `text-primary-foreground` - brand
- `text-muted-foreground` - secondary text
- `border-border` - borders

For theme-specific: `bg-emerald-100 dark:bg-emerald-900/20`

## Components

- Icons: lucide-react, `h-4 w-4` (small), `h-6 w-6` (large)
- Spacing: Cards `p-6`, gaps `gap-4`
- Transitions: `transition-all duration-200`

## Charts

Use CSS variables for colors:

- `hsl(var(--chart-1))` through `hsl(var(--chart-5))`
- `hsl(var(--pie-chart-1))` through `hsl(var(--pie-chart-5))`

## Loading States

Always show loading spinner:

```tsx
<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
```

## Responsive

Use breakpoints: `sm:`, `md:`, `lg:`

```tsx
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
```
