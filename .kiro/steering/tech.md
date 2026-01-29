# Technical Architecture

## Technology Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Server Actions, Prisma ORM, NextAuth.js v5
- **Database**: PostgreSQL (via Prisma + Supabase)
- **Validation**: Zod schemas (auto-generated from Prisma)
- **Pattern Matching**: ts-pattern library
- **UI Components**: shadcn/ui with lucide-react icons
- **Charts**: Recharts with custom dark mode support
- **Cloud Integrations**: AWS, GCP, Azure APIs

## Architecture Overview
- **Full-Stack Next.js**: Server Components with Server Actions for mutations
- **Database-First Design**: Prisma schema drives type generation and validation
- **Role-Based Access**: Borrower and Lender organization separation
- **Real-Time Data Pipeline**: Cloud provider APIs → Database → Dashboard
- **Automated Calculations**: Background jobs for KPI computation and margin adjustments
- **Multi-Tenant**: Organization-based data isolation with shared infrastructure

## Development Environment
- **Node.js**: 18+ with npm package management
- **Database**: PostgreSQL 14+ with Prisma migrations
- **Development**: Next.js dev server with hot reload
- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Generation**: Prisma Client + Zod schemas auto-generated
- **Environment**: `.env` configuration with secure credential management

## Code Standards
- **File Naming**: kebab-case for files, PascalCase for components
- **TypeScript**: Strict mode, explicit types, no `any` usage
- **Pattern Matching**: ts-pattern for complex conditionals instead of switch/if-else
- **Immutability**: No variable mutations, immutable patterns throughout
- **DRY Principle**: Extract helper functions for repeated logic
- **Server Actions**: Zod validation, authentication checks, proper error handling

## Testing Strategy
- **Type Safety**: TypeScript compiler as first line of defense
- **Build Validation**: `npm run build` for comprehensive error checking
- **Manual Testing**: Comprehensive user workflow testing
- **Database Testing**: Prisma schema validation and migration testing
- **Integration Testing**: Cloud provider API integration validation

## Deployment Process
- **Build Process**: Next.js static optimization with server-side rendering
- **Database Migrations**: Prisma migrate for schema changes
- **Environment Management**: Separate staging and production configurations
- **Cloud Deployment**: Vercel/AWS/GCP with PostgreSQL database
- **Monitoring**: Application performance and error tracking

## Performance Requirements
- **Response Time**: < 200ms for dashboard loads, < 2s for complex calculations
- **Scalability**: Handle 1000+ concurrent users, enterprise-scale data
- **Database**: Optimized queries with proper indexing for large datasets
- **Caching**: Strategic caching for frequently accessed data
- **Real-Time Updates**: Efficient data synchronization without performance impact

## Security Considerations
- **Authentication**: NextAuth.js v5 with secure session management
- **Authorization**: Role-based access control with organization isolation
- **Data Protection**: Encryption at rest and in transit
- **API Security**: Rate limiting, input validation, secure credential storage
- **Audit Trail**: Complete activity logging for compliance and security
- **Cloud Security**: Secure API key management and least-privilege access
