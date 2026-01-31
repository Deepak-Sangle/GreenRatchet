# Feature Checklist

## Before Coding

1. Check if similar feature exists - reuse patterns
2. Identify which tables/data you need
3. Plan the data flow: DB → Server Action → Component

## Implementation

1. Create server action in `app/actions/kpis/` using `withServerAction`
2. Use Prisma aggregations, not in-memory calculations
3. Batch fetch related data to prevent N+1
4. Create component in `components/kpis/base/` using `BaseKpiCard`
5. Add to dashboard grid

## Code Quality

- No `any` types
- No variable mutations
- Extract repeated logic to helpers
- Use ts-pattern for conditionals
- Use generated Prisma types/schemas

## Validation

1. Run `npx tsc --noEmit` for type errors
2. Run `npm run build` for full check
3. Test in both light and dark mode
