# Project Structure

## Directory Layout
```
GreenRatchet/
├── app/
│   ├── actions/          # Server Actions (mutations)
│   ├── [route]/          # Route folders with page.tsx and layout.tsx
│   ├── api/              # API routes (use sparingly, prefer Server Actions)
│   └── generated/        # Prisma Client & Zod schemas (auto-generated)
├── components/
│   ├── [feature]/        # Feature-specific components
│   ├── ui/               # shadcn/ui components (base layer)
│   └── dashboard/        # Layout components (header, nav)
├── lib/
│   ├── services/         # Business logic, external integrations
│   ├── validations/      # Zod schemas for forms and server actions
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── .kiro/
│   ├── steering/         # Project documentation and standards
│   └── prompts/          # Custom development prompts
└── public/               # Static assets
```

## File Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`, `kpi-calculator.ts`)
- **Components**: PascalCase (`UserProfile`, `KPICalculator`)
- **Functions**: camelCase (`createLoan`, `calculateKPI`)
- **Server Actions**: Suffix with `Action` (`createLoanAction`, `updateAvatarAction`)
- **Types**: PascalCase (`CreateLoanForm`, `KPIResult`)
- **Zod Schemas**: PascalCase with `Schema` suffix (`CreateLoanSchema`)

## Module Organization
- **Feature-based organization**: Components grouped by business domain
- **Shared utilities**: Common functions in `lib/` directory
- **Generated code**: Auto-generated types and schemas in `app/generated/`
- **Business logic**: External integrations and services in `lib/services/`
- **Database layer**: Prisma schema and migrations centralized

## Configuration Files
- **`.env`**: Environment variables and API keys
- **`prisma/schema.prisma`**: Database schema and relationships
- **`tailwind.config.js`**: UI styling configuration
- **`next.config.js`**: Next.js build and runtime configuration
- **`tsconfig.json`**: TypeScript compiler configuration
- **`.kiro/steering/`**: Project documentation and development standards

## Documentation Structure
- **`.kiro/steering/`**: Comprehensive project documentation
  - `product.md`: Product overview and user requirements
  - `tech.md`: Technical architecture and standards
  - `architecture-patterns.md`: Code organization patterns
  - `ui-design-system.md`: Design system and UI standards
  - `feature-checklist.md`: Development workflow checklist
- **`README.md`**: Project overview and setup instructions
- **Inline documentation**: JSDoc comments for complex functions

## Asset Organization
- **`public/`**: Static assets (images, icons, fonts)
- **`components/ui/`**: Reusable UI components
- **Tailwind classes**: Utility-first styling approach
- **Dark mode assets**: Theme-aware components and styling

## Build Artifacts
- **`.next/`**: Next.js build output (gitignored)
- **`node_modules/`**: Package dependencies (gitignored)
- **`app/generated/`**: Auto-generated Prisma and Zod files
- **Build process**: `npm run build` for production optimization

## Environment-Specific Files
- **`.env`**: Local development environment
- **`.env.example`**: Template for required environment variables
- **Deployment configs**: Platform-specific configuration files
- **Database URLs**: Environment-specific database connections
- **API keys**: Secure credential management per environment
