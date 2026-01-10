# Architecture & File Structure

## Directory Organization

```
app/
  actions/          # Server Actions (mutations)
  [route]/          # Route folders with page.tsx and layout.tsx
  api/              # API routes (use sparingly, prefer Server Actions)
  generated/        # Prisma Client & Zod schemas (auto-generated)
components/
  [feature]/        # Feature-specific components
  ui/               # shadcn/ui components (base layer)
  dashboard/        # Layout components (header, nav)
lib/
  services/         # Business logic, external integrations
  validations/      # Zod schemas for forms and server actions
  prisma.ts         # Prisma client singleton
  utils.ts          # Utility functions
prisma/
  schema.prisma     # Database schema
  migrations/       # Migration history
```

## Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`, `kpi-calculator.ts`)
- **Components**: PascalCase (`UserProfile`, `KPICalculator`)
- **Functions**: camelCase (`createLoan`, `calculateKPI`)
- **Server Actions**: Suffix with `Action` (`createLoanAction`, `updateAvatarAction`)
- **Types**: PascalCase (`CreateLoanForm`, `KPIResult`)
- **Zod Schemas**: PascalCase with `Schema` suffix (`CreateLoanSchema`)

## TypeScript & Imports

```tsx
// Avoid `any`, use proper types, explicit when needed
const form = useForm<FormType>({ ... });
const name = user?.name ?? "Unknown"; // Optional chaining + nullish coalescing

// Import order: React -> Third-party -> Internal -> Types
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { CreateLoanForm } from "@/lib/validations/loan";
```

## Performance Guidelines

- Use Server Components by default, "use client" only when needed
- Memoize expensive computations: useMemo, useCallback
- Lazy load: `dynamic(() => import("./chart"), { ssr: false })`
