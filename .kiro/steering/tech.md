# Technical Architecture

## Stack
- Next.js 15 with App Router
- TypeScript (strict mode)
- Prisma ORM + PostgreSQL
- NextAuth.js v5
- shadcn/ui + Tailwind CSS
- Recharts for data visualization

## Architecture
- Server Components by default, "use client" only when needed
- Server Actions for all mutations and data fetching
- `withServerAction` wrapper handles auth + caching automatically
- Organization-based multi-tenancy

## Code Standards
- kebab-case files, PascalCase components
- No `any` types
- ts-pattern for complex conditionals
- Immutable patterns (no mutations)
- DRY - extract helper functions

## Performance
- `unstable_cache` with 5-minute revalidation on all server actions
- Prisma aggregations (`_sum`, `_count`) instead of in-memory calculations
- Parallel queries with `Promise.all`
- Batch fetching to prevent N+1 queries
