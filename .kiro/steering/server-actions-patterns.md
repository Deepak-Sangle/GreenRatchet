# Server Actions & Backend Patterns

## Server Actions (7-Step Pattern)

```tsx
"use server";

export async function createResourceAction(data: FormData) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    // 3. Authorization
    if (!user || user.role !== "REQUIRED_ROLE") return { error: "Insufficient permissions" };

    // 4. Validate with Zod
    const validated = await ValidationSchema.parseAsync(data);

    // 5. Database operation
    const resource = await prisma.resource.create({ data: { ...validated, userId: user.id } });

    // 6. Audit log
    await prisma.auditLog.create({ data: { action: "RESOURCE_CREATED", ... } });

    // 7. Revalidate paths
    revalidatePath("/dashboard");

    return { success: true, data: resource };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Operation failed" };
  }
}
```

## Zod Schemas

```tsx
// Use generated schemas from Prisma
import { LoanSchema } from "@/app/generated/schemas/schemas";

// Form schema (dates as strings)
export const CreateLoanFormSchema = LoanSchema.omit({ id: true, ...timestamps }).extend({
  startDate: z.string().min(1),
  maturityDate: z.string().min(1),
}).refine(data => new Date(data.maturityDate) > new Date(data.startDate), {
  message: "Maturity must be after start",
  path: ["maturityDate"],
});

// Server schema (dates as Date objects)
export const CreateLoanSchema = LoanFormFields.extend({
  startDate: z.coerce.date(),
  maturityDate: z.coerce.date(),
}).refine(...);
```

## Prisma Patterns

### Schema

```prisma
// SCREAMING_SNAKE_CASE enums, explicit relations, timestamps, cascade deletes
enum UserRole { BORROWER LENDER }
model Loan {
  borrowerOrg Organization @relation("BorrowerOrganization", fields: [borrowerOrgId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  kpis        KPI[]        @relation(onDelete: Cascade)
}
```

### Queries

```tsx
// Select only needed fields, use include for relations, use transactions
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true },
});

await prisma.$transaction([
  prisma.loan.update({ where: { id }, data: { ... } }),
  prisma.auditLog.create({ data: { ... } }),
]);
```

## Error Handling

```tsx
// Always return structured { success, data } or { error }
try {
  return { success: true, data: result };
} catch (error) {
  return { error: error instanceof Error ? error.message : "Operation failed" };
}
```
