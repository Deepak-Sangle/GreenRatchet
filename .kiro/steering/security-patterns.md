# Security & Authorization Patterns

## Authentication & Authorization

Always check auth + authorization in Server Actions:

```tsx
// Always check auth + authorization
const session = await auth();
if (!session?.user) return { error: "Unauthorized" };

const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  include: { organization: true },
});
if (user.role !== "BORROWER") return { error: "Insufficient permissions" };
if (loan.borrowerOrgId !== user.organizationId)
  return { error: "Access denied" };

// ALWAYS validate with Zod before DB operations
const validated = await Schema.parseAsync(input);
```

## Security Checklist

1. ✅ **Authentication**: Check session exists
2. ✅ **User lookup**: Get user with required relations
3. ✅ **Role-based authorization**: Verify user role
4. ✅ **Resource-level authorization**: Check ownership/access
5. ✅ **Input validation**: Use Zod schemas
6. ✅ **Audit logging**: Log important actions
7. ✅ **Error handling**: Don't leak sensitive info

## Common Authorization Patterns

### Role-based Access

```tsx
if (user.role !== "BORROWER") return { error: "Insufficient permissions" };
```

### Organization-based Access

```tsx
if (loan.borrowerOrgId !== user.organizationId)
  return { error: "Access denied" };
```

### Multi-level Authorization

```tsx
// Check role AND ownership
if (user.role !== "LENDER" && loan.lenderOrgId !== user.organizationId) {
  return { error: "Access denied" };
}
```
