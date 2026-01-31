# Prisma & Database Patterns

## Schema Design

- SCREAMING_SNAKE_CASE for enum values
- PascalCase for model names
- Include `id`, `createdAt`, `updatedAt` on all models
- Use `onDelete: Cascade` for dependent data

## Generated Types

Always import from `@/app/generated/prisma` or `@/app/generated/schemas/schemas`

For complex types with includes:

```ts
type FootprintWithConnection = Prisma.CloudFootprintGetPayload<{
  include: { cloudConnection: true };
}>;
```

## Query Patterns

### Use aggregations

```ts
prisma.cloudFootprint.aggregate({
  where: { ... },
  _sum: { co2e: true },
})
```

### Use groupBy for breakdowns

```ts
prisma.cloudFootprint.groupBy({
  by: ["region", "cloudProvider"],
  where: { ... },
  _sum: { kilowattHours: true },
})
```

## Migrations

Only run `npm run db:generate` to regenerate types. User handles actual migrations.
