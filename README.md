# The problem - Cloud Sustainability

AI and cloud usage is growing rapidly. Every day, new applications are built and shipped without much thought about how this invisible infrastructure impacts the environment. And the reason is because sustainability in the cloud is rarely treated as a first-class concern and many people don’t even realize it’s a real, measurable problem.

Most large tech companies publish sustainability reports as part of their compliance, but creating these reports is a painful, manual process. The required data is scattered across invoices, monitoring tools, and internal dashboards, often stitched together using spreadsheets. On top of that, the calculations depend on CO₂e and greenhouse gas emission formulas that the average engineer isn’t familiar with, which means producing these reports usually requires dedicated experts rather than the teams actually running the infrastructure.

Even worse, these reports arrive too late to be useful. They’re published at the end of the year, long after architectural decisions have been made and inefficient workloads have already run at scale. During the actual evaluation period, when changes could still be made, developers have no clear visibility into whether their key performance indicators (KPIs) are improving or worsening from a sustainability perspective.

## 🌱 What is GreenRatchet?

GreenRatchet automates cloud sustainability monitoring by integrating directly with cloud providers to track environmental metrics. It provides real-time KPI tracking, analytics, and reporting for organizations committed to reducing their cloud infrastructure's environmental footprint.

### Key Value Propositions

- **Automated Monitoring**: Direct cloud integration eliminates manual reporting
- **Real-Time Insights**: Live environmental metrics and KPI tracking
- **Multi-Cloud Support**: AWS, GCP, and Azure integration
- **Complete Transparency**: Full calculation methodology and audit trails
- **Production-Ready**: Enterprise-grade security and scalability

## 🎯 Core Features

### Environmental Tracking

- **Cloud Integration**: Direct connections to AWS, GCP, and Azure
- **Carbon Footprint**: Real-time CO2e emissions tracking with regional grid data
- **Energy Monitoring**: Comprehensive energy consumption analytics
- **Water Usage**: Water consumption metrics for data centers
- **AI Workload Detection**: Automatic identification of GPU instances and AI services

### KPI Dashboard

- **CO2 Emissions**: Total greenhouse gas emissions
- **GHG Intensity**: Emissions per employee and per revenue
- **Energy Consumption**: Total and renewable energy usage
- **Water Withdrawal**: Usage in water-stressed regions
- **AI Compute Hours**: AI/ML workload tracking
- **Renewable Energy %**: Clean energy consumption
- **Carbon-Free Energy %**: Zero-carbon electricity usage
- **Low-Carbon Regions %**: Workloads in low-carbon areas
- **Electricity Mix**: Grid composition analysis

### Analytics & Reporting

- **Interactive Dashboards**: Real-time KPI visualization
- **Trend Analysis**: Historical performance and forecasting
- **Regional Breakdown**: Geographic environmental impact
- **Export Capabilities**: Generate compliance reports

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Server Actions with Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js v5
- **UI**: shadcn/ui components with lucide-react icons
- **Charts**: Recharts with dark mode support
- **Validation**: Zod schemas (auto-generated from Prisma)

### Key Components

**Server Actions** (`app/actions/`)

- All data fetching wrapped with `withServerAction`
- Automatic authentication and 5-minute caching
- Returns `{ success: true, data }` or `{ error: string }`

**Services** (`lib/services/`)

- `cloud-data-service.ts` - Shared query builders
- `electricity-maps.ts` - Grid data integration
- `electricity-mix-service.ts` - Energy mix calculations

**Components** (`components/`)

- `kpis/base/` - KPI card components using `BaseKpiCard`
- `analytics/` - Chart and visualization components
- `ui/` - Reusable UI components

### Database Schema

**Core Tables**

- `User` - User accounts with organization association
- `Organization` - Multi-tenant organization data
- `CloudConnection` - AWS/GCP/Azure connection credentials
- `CloudFootprint` - Cloud usage and emissions data
- `KPI` - KPI definitions and targets
- `KPIResult` - Calculated KPI results

**Grid Data Tables** (from Electricity Maps)

- `GridCarbonIntensity` - Regional carbon intensity
- `GridCarbonFreeEnergy` - Carbon-free energy percentages
- `GridRenewableEnergy` - Renewable energy percentages
- `GridElectricityMix` - Energy source breakdown

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Electricity Maps API key (for grid data)
- Cloud provider accounts (optional, for production use)

### Setup

1. **Clone and Install**

```bash
git clone <repository-url>
cd GreenRatchet
npm install
```

2. **Environment Configuration**

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Electricity Maps
ELECTRICITY_MAPS_API_KEY="your-api-key"

# Cloud Providers (optional)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

3. **Database Setup**

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (handled by user)
# npx prisma migrate dev

# Seed demo data
npx tsx prisma/seed.ts
```

4. **Launch**

```bash
npm run dev
# Open http://localhost:3000
```

### Demo Credentials

After seeding, use these credentials:

- Email: `admin@greenratchet.com`
- Password: `password123`

## 📊 Usage Examples

### Connecting Cloud Providers

1. Navigate to Cloud Connections page
2. Click "Connect AWS/GCP/Azure"
3. Follow provider-specific setup instructions
4. Verify connection and start data sync

### Viewing KPIs

1. Dashboard shows all KPIs at a glance
2. Click any KPI card to expand analytics
3. View trends, regional breakdowns, and recommendations
4. Export data for reporting

### Creating Custom KPIs

1. Go to KPIs page
2. Click "Create KPI"
3. Select KPI type and set target values
4. Define thresholds for performance evaluation
5. Save and monitor on dashboard

## 🔧 Development

### Project Structure

```
app/
  actions/kpis/      # KPI server actions
  (dashboard)/       # Dashboard routes
  generated/         # Auto-generated Prisma types
components/
  kpis/base/         # KPI card components
  analytics/         # Chart components
lib/
  services/          # Business logic
  utils/             # Helper functions
prisma/
  schema.prisma      # Database schema
```

### Key Patterns

**Server Actions**

```ts
export async function getKpiDataAction() {
  return withServerAction(async (user) => {
    // Query data using Prisma aggregations
    // Batch fetch related data
    // Return calculated results
  }, "action description");
}
```

**Database Queries**

- Use `groupBy` with `_sum`, `_count` for aggregations
- Parallel queries with `Promise.all`
- Batch fetch to prevent N+1 queries

**Components**

```tsx
<BaseKpiCard
  title="KPI Title"
  fetchAction={getKpiDataAction}
  renderAnalytics={(data) => <Analytics data={data} />}
  kpiType="KPI_TYPE"
/>
```

### Code Quality

Run before committing:

```bash
# Type check
npx tsc --noEmit

# Build check
npm run build
```

## 🔍 Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database
**Solution**:

- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check network connectivity

### Cloud Provider Connection Fails

**Problem**: Unable to connect AWS/GCP/Azure
**Solution**:

- Verify API credentials are correct
- Check IAM permissions (read-only access required)
- Ensure required APIs are enabled

### KPI Calculations Show Zero

**Problem**: KPIs display 0 or no data
**Solution**:

- Verify cloud connections are active
- Check if CloudFootprint table has data
- Run data sync manually from Cloud page
- Verify date range in queries

### Electricity Maps API Errors

**Problem**: Grid data not loading
**Solution**:

- Verify `ELECTRICITY_MAPS_API_KEY` is set
- Check API quota limits
- Ensure regions are supported by Electricity Maps

### Build Errors

**Problem**: TypeScript or build errors
**Solution**:

```bash
# Regenerate Prisma client
npm run db:generate

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues

**Problem**: Slow dashboard loading
**Solution**:

- Check database query performance
- Verify caching is working (5-minute cache on server actions)
- Add database indexes if needed
- Consider pagination for large datasets

## 📈 Production Deployment

### Infrastructure

- **App Server**: Node.js 18+ with PM2
- **Database**: PostgreSQL 14+ with connection pooling
- **Caching**: Built-in Next.js caching (unstable_cache)
- **Monitoring**: Application and database monitoring

### Environment Variables

Ensure all required variables are set:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for auth
- `NEXTAUTH_URL` - Production URL
- `ELECTRICITY_MAPS_API_KEY` - API key for grid data

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Test cloud provider connections
- [ ] Verify Electricity Maps API access

## 📚 Additional Resources

- **Steering Docs**: `.kiro/steering/` - Architecture and patterns
- **Prompts**: `.kiro/prompts/` - Development templates
- **Prisma Schema**: `prisma/schema.prisma` - Database structure
- **API Docs**: Electricity Maps API documentation

## 🤝 Contributing

1. Follow existing code patterns (see `.kiro/steering/`)
2. Use TypeScript strict mode (no `any`)
3. Write immutable code (no mutations)
4. Extract repeated logic to helpers
5. Test in both light and dark mode

---

**Built for sustainable cloud infrastructure monitoring**
