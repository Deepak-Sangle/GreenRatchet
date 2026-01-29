# Prisma & Database Patterns

## Schema Design

- Use SCREAMING_SNAKE_CASE for enum values and PascalCase for model names
- Include `id`, `createdAt` and `updatedAt` on all models
- Use cascade deletes for dependent data (`onDelete: Cascade`)
- Use nullable fields (`?`) for optional data

## Query Optimization

- Only fetch fields you actually need
- Use aggregations for calculations (`_sum`, `_count`, `_avg`, `_max`, `_min`) instead of fetching all the data in memory and doing aggregation in backend
- Use transactions for related operations

## Indexing

- If you implement a query, check if the relevant fields are indexed or not and index them appropriately

## **IMPORTANT** Generated Types & Schemas

- Always import types and schemas from `@/app/generated/prisma` or `@/app/generated/schemas/schemas`
- There are complex types like `ModelNameCreateManyInput` which you can use if you want to have a schemas with optional fields. Always follow DRY principles and never create a type that somehow relates to database schemas.
- Use `Prisma.ModelGetPayload<{ include: {...} }>` for complex types
- Extend generated schemas for forms (omit id, timestamps, add string dates)

## Migrations

- Never do actual migration, but only generate the schemas using `npm run db:generate`. Migration will be handled by user.