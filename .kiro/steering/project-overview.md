# GreenRatchet - Project Overview

A production-credible Sustainability-Linked Loans (SLL) platform with automated ESG assurance for AI workloads. Built with Next.js 15, TypeScript, Prisma, and shadcn/ui.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Server Actions, Prisma ORM
- **Database**: PostgreSQL (via Prisma + Supabase)
- **Authentication**: NextAuth.js v5
- **Validation**: Zod schemas (auto-generated from Prisma)
- **Pattern Matching**: ts-pattern library
- **Icons**: lucide-react
- **Charts**: Recharts
- **Scraping**: Cheerio + user-agents
- **Proxy**: https-proxy-agent

## Key Features

- Sustainability-Linked Loans management
- Automated ESG assurance for AI workloads
- Real-time KPI tracking and calculations
- Cloud usage monitoring and optimization (AWS, GCP, Azure)
- Comprehensive audit logging
- LinkedIn integration for social KPIs
- GHG intensity tracking (per employee & per revenue)
- Electricity grid data integration (Electricity Maps API)
- Carbon Cloud Framework (CCF) integration

## Architecture Principles

1. **Server Actions over API Routes** - All data mutations and fetching use server actions
2. **Service Layer** - Complex business logic in `lib/services/`
3. **Type Safety** - Generated Prisma types + Zod schemas
4. **Optimistic UI** - Loading states and error handling in all components
5. **Security First** - Auth checks, role-based access, resource-level authorization
6. **Performance** - Prisma select queries, aggregations, proper indexing
7. **Expandable Components** - Lazy-load data on user interaction
