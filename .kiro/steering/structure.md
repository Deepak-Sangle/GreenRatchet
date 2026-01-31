# Project Structure

## Directory Layout

```
app/
  actions/           # Server Actions
  actions/kpis/      # KPI-specific actions
  (dashboard)/       # Dashboard routes
  generated/         # Auto-generated Prisma + Zod
components/
  kpis/              # KPI components
  kpis/base/         # Base KPI card components
  analytics/         # Analytics components
  ui/                # shadcn/ui components
  dashboard/         # Layout components
lib/
  services/          # Business logic
  utils/             # Helper functions
  validations/       # Zod schemas
prisma/
  schema.prisma      # Database schema
```

## Naming

- Files: `kebab-case.ts`
- Components: `PascalCase`
- Functions: `camelCase`
- Server Actions: `getXxxDataAction`, `createXxxAction`
- Types: `PascalCase`

## Key Files

- `lib/server-action-utils.ts` - withServerAction wrapper
- `lib/services/cloud-data-service.ts` - shared query builders
- `lib/utils/analytics-helpers.ts` - calculation helpers
- `lib/utils/category-analytics-helpers.ts` - pie chart helpers
