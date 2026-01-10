# Feature Implementation Checklist

## When Creating New Features

1. ✅ **Extract helper functions** for any repeated logic (DRY principle)
2. ✅ **Use immutable patterns** - never mutate variables
3. ✅ **Strong typing** - explicit types for all functions
4. ✅ **Use ts-pattern** for complex conditionals
5. ✅ Start with Server Components, add "use client" only if needed
6. ✅ Create Zod schema in `lib/validations/`
7. ✅ Create Server Action in `app/actions/` (7-step pattern)
8. ✅ Add audit logging for important actions
9. ✅ Revalidate affected paths
10. ❌ **DO NOT create `.md` documentation files**

## Code Review Checklist

- [ ] **No repeated code** - extracted to helper functions
- [ ] **No mutations** - immutable patterns used
- [ ] **Strongly typed** - no `any`, explicit types
- [ ] **ts-pattern** used for complex conditionals
- [ ] Validates all inputs with Zod
- [ ] Checks authentication and authorization
- [ ] Proper error handling (`{ success, data }` or `{ error }`)
- [ ] Follows design system
- [ ] Includes loading states
- [ ] Responsive and accessible

## JSDoc Comments

Only add JSDoc for complex functions:

```tsx
/**
 * Calculates KPI results with status validation
 * @param kpiId - The KPI to calculate
 * @returns KPI result with status and validation errors
 */
```

## Remember

Follow established patterns. The most important rules are:

1. **DRY** - Don't repeat yourself
2. **Immutability** - Never mutate
3. **Strong Typing** - No `any`
4. **ts-pattern** - For complex conditionals
5. **Helper Functions** - Extract reusable logic
