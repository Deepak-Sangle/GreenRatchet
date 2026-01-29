# Feature Implementation Checklist

## When Creating New Features

1. ✅ **Extract helper functions** for any repeated logic (DRY principle)
2. ✅ **Use immutable patterns** - never mutate variables
3. ✅ **Strong typing** - explicit types for all functions, local and global variables and constants
4. ✅ **Use ts-pattern** instead of switch and if else statement.
5. ✅ Start with Server Components, add "use client" only if needed
6. ✅ Create Zod schema in `lib/validations/`
7. ✅ Create Server Action in `app/actions/`
8. ✅ Revalidate affected paths
9. ❌ **DO NOT create `.md` documentation files**

## Code Review Checklist

- [ ] **No Syntax issues** - First run `npx tsc` command to see all type issues and then run `npm run build` to check exhaustively
- [ ] **No repeated code** - extracted to helper functions
- [ ] **No mutations** - immutable patterns used
- [ ] **Strongly typed** - no `any`, explicit types
- [ ] **ts-pattern** used for complex conditionals
- [ ] No custom schemas unless absolutely necessary. Use generated schemas from prisma zod generator
- [ ] Validates all inputs in server action with Zod
- [ ] Checks authentication and authorization
- [ ] Proper error handling (`{ success, data }` or `{ error }`)
- [ ] Follows design system
- [ ] **Dark mode compatible** - uses semantic colors, tested in both themes
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
6. **No Custom Schemas** - Use generated Prisma Zod schemas unless absolutely necessary
