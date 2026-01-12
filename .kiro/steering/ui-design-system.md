# UI/UX Standards & Design System

## Design System

- **Colors**: Use emerald/sage palette, HSL variables (`bg-primary`, `text-primary-foreground`)
- **Shadows**: `shadow-soft`, `shadow-soft-lg` (no hard shadows)
- **Transitions**: All interactive elements use `transition-all duration-200`
- **Spacing**: Cards=`p-6`, Default gap=`gap-4`, Sections=`gap-6`
- **Icons**: lucide-react only, `h-4 w-4` (buttons), `h-6 w-6` (large)
- **Typography**: `font-heading` for headings, `text-muted-foreground` for secondary text

## Component Patterns

### Forms

Always use react-hook-form + Zod:

```tsx
const form = useForm<T>({ resolver: zodResolver(Schema) });
```

### Dialogs

Use shadcn Dialog with consistent error display:

```tsx
{
  error && (
    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      {error}
    </div>
  );
}
```

### Success Messages

Use primary color for success states:

```tsx
{
  success && (
    <div className="rounded-md bg-primary/10 p-3 text-sm">
      <p className="font-medium text-primary">{successMessage}</p>
      <p className="text-xs text-muted-foreground mt-1">{details}</p>
    </div>
  );
}
```

### Buttons

Include loading states and icons:

```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

### Icon Buttons

Use size="icon" for icon-only buttons:

```tsx
<Button type="button" size="icon" variant="outline" disabled={loading}>
  {loading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <ArrowRight className="h-4 w-4" />
  )}
</Button>
```

### Responsive Design

Mobile-first with sm: md: lg: breakpoints:

```tsx
className = "flex flex-col sm:flex-row";
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4";
```

### Read-Only Inputs

Use disabled state with muted background:

```tsx
<Input
  value={value || "Not set"}
  disabled
  className="bg-muted"
/>
<p className="text-xs text-muted-foreground">
  Explanation of why it's read-only
</p>
```

### Expandable Cards

Use consistent expand/collapse pattern:

```tsx
<Card className="p-6 shadow-soft transition-all duration-200">
  <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="w-full flex items-center justify-between text-left"
  >
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h2 className="font-heading text-xl font-semibold">Title</h2>
        <p className="text-sm text-muted-foreground">Description</p>
      </div>
    </div>
    {isExpanded ? (
      <ChevronUp className="h-5 w-5 text-muted-foreground" />
    ) : (
      <ChevronDown className="h-5 w-5 text-muted-foreground" />
    )}
  </button>

  {isExpanded && (
    <div className="mt-6 space-y-6 animate-in fade-in duration-200">
      {/* Content */}
    </div>
  )}
</Card>
```

### Metric Display Cards

Use consistent styling for data display:

```tsx
// Regular metric
<div className="bg-muted/50 rounded-lg p-4">
  <p className="text-xs text-muted-foreground mb-1">Label</p>
  <p className="text-2xl font-semibold">{value}</p>
</div>

// Highlighted metric (primary KPI)
<div className="bg-primary/10 rounded-lg p-4">
  <p className="text-xs text-muted-foreground mb-1">Label</p>
  <p className="text-2xl font-semibold text-primary">{value}</p>
</div>
```

### Loading States

Use Loader2 from lucide-react:

```tsx
{
  loading && (
    <div className="bg-muted/50 rounded-lg p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">Loading data...</p>
    </div>
  );
}
```
