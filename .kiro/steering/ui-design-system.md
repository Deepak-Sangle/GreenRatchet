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

### Buttons

Include loading states and icons:

```tsx
<Button disabled={loading}>{loading ? "Loading..." : "Submit"}</Button>
```

### Responsive Design

Mobile-first with sm: md: lg: breakpoints:

```tsx
className = "flex flex-col sm:flex-row";
```
