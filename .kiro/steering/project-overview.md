# GreenRatchet - Project Overview

Cloud sustainability monitoring platform for tracking environmental metrics and KPIs.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Server Actions, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js v5
- **Validation**: Zod (auto-generated from Prisma)
- **Charts**: Recharts
- **Icons**: lucide-react
- **External APIs**: Electricity Maps, AWS/GCP/Azure

## Key Patterns

- Server Actions with `withServerAction` wrapper (auto-caching)
- Prisma groupBy for aggregations
- Parallel DB queries with `Promise.all`
- Batch fetching with lookup maps for N+1 prevention
