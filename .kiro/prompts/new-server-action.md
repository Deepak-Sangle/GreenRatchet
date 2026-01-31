# New Server Action

Create a server action for data fetching or mutations.

## Location

`app/actions/` or `app/actions/kpis/`

## Pattern

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";

export interface {ActionName}Data {
  // Return type
}

export async function {actionName}Action() {
  return withServerAction(async (user) => {
    const organizationId = user.organizationId;

    // Query data
    const result = await prisma.model.aggregate({
      where: { cloudConnection: { organizationId } },
      _sum: { field: true },
    });

    return {
      // Transformed data
    };
  }, "action description");
}
```

## Key Points

- Always use `withServerAction` wrapper
- Access `user.organizationId` for tenant isolation
- Use Prisma aggregations over in-memory calculations
- Parallel queries with `Promise.all` for independent data
- Batch fetch to prevent N+1 queries

## For Mutations

```ts
export async function create{Entity}Action(input: CreateInput) {
  return withServerAction(async (user) => {
    const validated = CreateSchema.parse(input);

    const result = await prisma.entity.create({
      data: {
        ...validated,
        organizationId: user.organizationId,
      },
    });

    return result;
  }, "create entity");
}
```
