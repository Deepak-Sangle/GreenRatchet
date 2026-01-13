# UI/UX Standards & Design System

## Design System

- **Colors**: Use emerald/sage palette, HSL variables (`bg-primary`, `text-primary-foreground`)
- **Dark Mode**: Fully supported with automatic theme switching - use semantic color classes
- **Shadows**: `shadow-soft`, `shadow-soft-lg` (no hard shadows)
- **Transitions**: All interactive elements use `transition-all duration-200`
- **Spacing**: Cards=`p-6`, Default gap=`gap-4`, Sections=`gap-6`
- **Icons**: lucide-react only, `h-4 w-4` (buttons), `h-6 w-6` (large)
- **Typography**: `font-heading` for headings, `text-muted-foreground` for secondary text

## Dark Mode Support

The application has comprehensive dark mode support that works automatically. **Never use hardcoded colors** - always use semantic CSS variables and Tailwind classes.

### Theme System

- **Automatic**: Components automatically adapt to light/dark themes
- **CSS Variables**: All colors are defined as CSS custom properties that change based on theme
- **Tailwind Integration**: Use standard Tailwind classes - they automatically work in both themes
- **Theme Toggle**: Available in the header for users to switch themes manually

### Color Guidelines

**✅ DO - Use semantic color classes:**

```tsx
// These automatically work in both light and dark themes
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-primary text-primary-foreground">
<div className="text-muted-foreground">
<div className="border-border">
```

**❌ DON'T - Use hardcoded colors:**

```tsx
// These break in dark mode
<div className="bg-white text-black">
<div className="bg-gray-100 text-gray-900">
<div className="border-gray-200">
```

### Dark Mode Specific Classes

When you need theme-specific styling, use Tailwind's `dark:` prefix:

```tsx
<div className="bg-emerald-100 dark:bg-emerald-900/20">
<Icon className="text-emerald-600 dark:text-emerald-400" />
<div className="shadow-sm dark:shadow-none">
```

### Available Semantic Colors

- `background` / `foreground` - Main page colors
- `card` / `card-foreground` - Card backgrounds and text
- `primary` / `primary-foreground` - Brand colors (emerald/sage)
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Subtle backgrounds and text
- `accent` / `accent-foreground` - Accent elements
- `destructive` / `destructive-foreground` - Error states
- `border` - Border colors
- `input` - Form input backgrounds
- `ring` - Focus ring colors

### Charts and Data Visualization

For charts, use theme-aware colors that maintain contrast and accessibility:

```tsx
// Chart colors that work in both themes
const chartColors = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted-foreground))",
};

// Recharts example with theme support
<ResponsiveContainer>
  <PieChart>
    <Pie
      dataKey="value"
      fill="hsl(var(--primary))"
      stroke="hsl(var(--border))"
    />
  </PieChart>
</ResponsiveContainer>;
```

### Theme Toggle Integration

The theme toggle is available in the header. To add it to other locations:

```tsx
import { ThemeToggle } from "@/components/theme/theme-toggle";

// Different variants available
<ThemeToggle variant="default" />  // Button with text
<ThemeToggle variant="icon" />     // Icon only
<ThemeToggle variant="dropdown" /> // Dropdown with options
```

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

## Accessibility & Dark Mode

### Contrast Requirements

All color combinations automatically meet WCAG AA standards in both themes:

- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3.0:1 contrast ratio minimum
- Interactive elements have proper focus states

### Testing Dark Mode

- Always test components in both light and dark themes
- Use the theme toggle in the header to switch between modes
- Verify that all text remains readable and interactive elements are clearly visible
- Check that custom colors (if any) work in both themes

### Common Dark Mode Issues to Avoid

❌ **Hardcoded white/black colors**
❌ **Fixed opacity values that don't work in dark mode**
❌ **Images or icons that don't adapt to theme**
❌ **Custom CSS that overrides theme variables**

✅ **Use semantic color classes**
✅ **Test in both themes**
✅ **Use theme-aware opacity values**
✅ **Ensure proper contrast ratios**
