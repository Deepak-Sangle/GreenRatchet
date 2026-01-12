# Data Fetching & Analytics Patterns

## Server Actions for Data Fetching

- Use server actions (not API routes) for all data fetching
- Always check auth first: `const session = await auth()`
- Get user with organization using `select` (not `include`)
- Return `{ data: T } | { error: string }` or `{ success: true; data: T } | { error: string }`
- Log errors server-side with `console.error`

## Return Type Patterns

- Use discriminated unions: `Promise<{ data: T } | { error: string }>`
- Never use ambiguous types: `Promise<{ data?: T; error?: string }>`
- Check results with `if ("error" in result)` pattern
- TypeScript will narrow types after error check

## Service Layer

- Extract complex business logic to `lib/services/`
- Keep server actions thin (auth + validation + service call)
- Services should not handle auth or validation
- Services return processed data, not error objects

## Prisma Query Optimization

- Always use `select` over `include` for performance
- Only fetch fields you actually need
- Use aggregations (`_sum`, `_count`, `_avg`) for calculations
- Use `groupBy` for grouped aggregations
- Use transactions for related operations
- Use batch operations (`createMany`, `updateMany`) when possible

## Client-Side Data Loading

### Expandable KPI Pattern

- Use `useState` for expanded state, data, loading, error
- Load data in `useEffect` when expanded and data is null
- Show loading spinner while fetching
- Show error message if fetch fails
- Show data when loaded successfully

## Error Handling

- Always log errors server-side
- Return user-friendly messages to client
- Handle Zod errors separately: `error.errors[0].message`
- Use `error instanceof Error ? error.message : "Operation failed"`
