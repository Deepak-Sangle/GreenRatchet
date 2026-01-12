# Prisma & Database Patterns

## Schema Design

- Use SCREAMING_SNAKE_CASE for enum values
- Use explicit relation names for clarity (e.g., `@relation("BorrowerOrganization")`)
- Include `createdAt` and `updatedAt` timestamps on all models
- Use cascade deletes for dependent data (`onDelete: Cascade`)
- Use nullable fields (`?`) for optional data
- Add comments for fields that are fetched externally or calculated

## Query Optimization

- Always prefer `select` over `include` for performance
- Only fetch fields you actually need
- Use aggregations for calculations (`_sum`, `_count`, `_avg`, `_max`, `_min`)
- Use `groupBy` for grouped aggregations
- Use transactions for related operations
- Use batch operations (`createMany`, `updateMany`, `deleteMany`)

## Indexing

- Add indexes for frequently queried fields
- Add composite indexes for multi-field queries
- Use `@@index([field1, field2])` syntax

## Unique Constraints

- Use `@@unique([field1, field2])` to prevent duplicates
- Useful for time-series data with region + provider + datetime

## Generated Types & Schemas

- Import types from `@/app/generated/prisma`
- Import Zod schemas from `@/app/generated/schemas/schemas`
- Use `Prisma.ModelGetPayload<{ include: {...} }>` for complex types
- Extend generated schemas for forms (omit id, timestamps, add string dates)

## Migrations

1. Review migrations before applying
2. Test on development database first
3. Backup production before running migrations
4. Use descriptive migration names
5. Add nullable fields first, make required in separate migration
6. Run `npx prisma generate` after migrations to update types
