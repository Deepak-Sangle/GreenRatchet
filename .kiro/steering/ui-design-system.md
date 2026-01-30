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
// For timeline charts
"hsl(var(--chart-1))"
"hsl(var(--chart-2))"
// for pie charts
"hsl(var(--pie-chart-1))"
"hsl(var(--pie-chart-2))"

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

## UI Patterns to take care of

### Forms

Always use react-hook-form + Zod: Use schemas auto generated from prisma zod generator and do not try to recreate schemas again

```tsx
const form = useForm<T>({ resolver: zodResolver(Schema) });
```

### Responsive Design

Design should be compatible with all sizes. Use sm: md: lg: breakpoints:

```tsx
className = "flex flex-col sm:flex-row";
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4";
```

### Loading States

Use spinning loader when the data is being fetched always. Use Loader2 from lucide-react:

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

### Common Dark Mode Issues to Avoid

❌ **Hardcoded white/black colors**
❌ **Fixed opacity values that don't work in dark mode**
❌ **Images or icons that don't adapt to theme**
❌ **Custom CSS that overrides theme variables**

✅ **Use semantic color classes**
✅ **Test in both themes**
✅ **Use theme-aware opacity values**
✅ **Ensure proper contrast ratios**
