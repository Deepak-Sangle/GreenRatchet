# The problem - Cloud Sustainability

AI and cloud usage is growing rapidly. Every day, new applications are built and shipped without much thought about how this invisible infrastructure impacts the environment. And the reason is because sustainability in the cloud is rarely treated as a first-class concern and many people don’t even realize it’s a real, measurable problem.

Most large tech companies publish sustainability reports as part of their compliance, but creating these reports is a painful, manual process. The required data is scattered across invoices, monitoring tools, and internal dashboards, often stitched together using spreadsheets. On top of that, the calculations depend on CO₂e and greenhouse gas emission formulas that the average engineer isn’t familiar with, which means producing these reports usually requires dedicated experts rather than the teams actually running the infrastructure.

Even worse, these reports arrive too late to be useful. They’re published at the end of the year, long after architectural decisions have been made and inefficient workloads have already run at scale. During the actual evaluation period, when changes could still be made, developers have no clear visibility into whether their key performance indicators (KPIs) are improving or worsening from a sustainability perspective.

## 🌱 What is GreenRatchet?

GreenRatchet automates cloud sustainability monitoring by integrating directly with cloud providers to track environmental metrics. It provides real-time KPI tracking, analytics, and reporting for organizations committed to reducing their cloud infrastructure's environmental footprint.

### Key Value Propositions

- **Automated Monitoring**: Direct cloud integration eliminates manual reporting
- **Real-Time Insights**: Live environmental metrics and KPI tracking
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

## 💪 Challenges We Ran Into

### Cloud Provider Integration Complexity

Implementing one-click AWS connection was unexpectedly challenging. The frontend and backend were straightforward, but making the actual connection work required deep understanding of IAM roles, trust policies, and External IDs. After multiple approaches, we solved it using AWS CloudFormation stacks with pre-filled parameters. We had to make the difficult decision to temporarily skip GCP and Azure integration due to infrastructure complexity and time constraints.

### Carbon Calculation Accuracy

The most challenging part was building services to fetch and calculate cloud usage data accurately. We explored multiple solutions including Cloud Carbon Footprint (open source), OxygenIT, Electricity Maps, Climatiq, and CO2 API. Each had limitations - some lacked free tiers, others had incomplete data. We spent significant time customizing the Cloud Carbon Footprint repository, but eventually hit walls. The challenge was that cloud usage extraction needs to be 100% correct, and we had to handle the unique characteristics of each AWS service.

### Data Sourcing and Rate Limiting

Finding reliable data for AWS's Power Usage Effectiveness (PUE) and Water Usage Effectiveness (WUE) was time-consuming. For metrics like Carbon-Free Energy %, Renewable Energy %, and Electricity Mix % at regional levels, we couldn't find reliable free sources. Integrating Electricity Maps solved this but introduced heavy rate limiting. We solved it by pre-fetching data, storing it in the database, and querying locally instead of hitting the API repeatedly.

### AI Code Quality

Kiro CLI generated solid initial code for pages like dashboard, settings, and audit logs, but it created significant duplication across the 10 KPIs - nearly identical code with minute differences. We also encountered unit mismatches (gCO2e instead of mtCO2e, mL instead of L). The solution was creating reusable prompts and using the Postgres MCP server to verify database units before calculations. We also created an optimize-db-queries prompt that reduced response times from ~2s to ~200ms by eliminating redundant database calls.

---

## 🏆 Accomplishments That We're Proud Of

### Complete End-to-End Solution

We built a production-ready platform that solves a real problem. From secure cloud provider connections to accurate carbon calculations to comprehensive audit trails - every piece works together seamlessly. Organizations can go from zero to full sustainability monitoring in minutes.

### Industry-Standard Methodology

We implemented Etsy's Cloud Jewels approach - the gold standard for cloud carbon accounting. Our calculations include both operational emissions (energy consumption) and embodied emissions (hardware manufacturing), using real-time regional grid carbon intensity data. This level of rigor is rare in sustainability tools.

### 10 Comprehensive KPIs

We defined and implemented 10 sustainability KPIs that matter to real organizations: CO2 emissions, GHG intensity, energy consumption, water withdrawal, AI compute hours, renewable energy percentage, carbon-free energy percentage, low-carbon region distribution, electricity mix breakdown, and water-stressed region analysis. Each KPI has deep analytics with charts, breakdowns, and actionable recommendations.

### Enterprise-Grade Auditability

Every action in the system is logged with complete transparency. KPI calculations include the formula, data sources, input values, and step-by-step execution. This level of auditability is essential for ESG compliance and stakeholder reporting - and it's built into the core of the platform.

### Performance Optimization

We optimized database queries using Prisma aggregations, parallel queries with Promise.all, and batch fetching to prevent N+1 queries. Response times went from ~2 seconds to ~200ms. The platform handles large datasets efficiently with proper caching and query optimization.

### Clean, Maintainable Codebase

Despite starting with AI-generated code, we reduced the total lines of code by ~30% through refactoring and removing duplication. We created generic, reusable components and helpers that make the codebase maintainable and extensible. The architecture follows Next.js 15 best practices with Server Components, Server Actions, and proper separation of concerns.

---

## 📖 What We Learned

### Cloud Carbon Accounting is Complex

We learned that accurate cloud carbon accounting requires deep understanding of multiple domains: cloud infrastructure, energy systems, grid carbon intensity, hardware manufacturing emissions, and regional variations. There's no simple formula - it requires combining data from multiple sources and applying sophisticated methodologies.

### Data Quality is Critical

The accuracy of sustainability metrics depends entirely on data quality. We learned to validate data sources, handle missing data gracefully, and provide transparency about calculation methods. Users need to trust the numbers, which means showing exactly how they were calculated.

### AI-Assisted Development Requires Human Oversight

Kiro CLI was incredibly helpful for generating initial code, but human oversight was essential. AI tends to create duplication, miss edge cases, and make assumptions about units and data types. The key was using AI for scaffolding and boilerplate, then applying human expertise for optimization and correctness.

### Security and Compliance are Non-Negotiable

For enterprise adoption, security and auditability aren't optional features - they're requirements. We learned to implement proper IAM role-based authentication, use External IDs for security, provide read-only access, and log every action with complete transparency.

---

## 🚀 What's Next for GreenRatchet

### Multi-Cloud Expansion

Complete GCP and Azure integration to provide true multi-cloud sustainability monitoring. Organizations often use multiple cloud providers, and they need unified visibility across all of them.

### Advanced Optimization Recommendations

Build an AI-powered recommendation engine that analyzes usage patterns and suggests specific optimizations: instance type changes, region migrations, workload scheduling, and architectural improvements. Move from "here's your data" to "here's exactly what to do."

### Automated Reporting

Generate compliance-ready sustainability reports automatically - PDF exports, stakeholder presentations, ESG disclosures. Include year-over-year comparisons, progress tracking, and benchmark data against industry standards.

### Real-Time Alerts

Implement alerting for sustainability thresholds: notify teams when emissions spike, when KPIs fail to meet targets, or when opportunities for optimization are detected. Make sustainability monitoring proactive instead of reactive.

### Carbon Budget Management

Add carbon budgeting features where organizations can set emission budgets for teams, projects, or time periods, and track spending against those budgets in real-time. Treat carbon like a resource to be managed.

### Integration with CI/CD

Integrate with development workflows to show the carbon impact of code changes before deployment. Developers can see "this change will increase emissions by 5%" and make informed decisions.

### Benchmarking and Industry Comparisons

Provide anonymized benchmarking data so organizations can compare their sustainability metrics against industry peers. Show percentile rankings and best-in-class examples.

### Scope 3 Emissions

Expand beyond cloud infrastructure to track Scope 3 emissions: employee travel, supply chain, customer usage. Provide a complete picture of organizational environmental impact.

### API and Webhooks

Build a public API and webhook system so organizations can integrate GreenRatchet data into their existing tools, dashboards, and workflows. Make sustainability data accessible everywhere it's needed.

### Machine Learning for Forecasting

Use historical data to forecast future emissions, predict when KPIs will fail, and identify seasonal patterns. Help organizations plan proactively instead of reacting to past data.

---

## 🤝 Contributing

1. Follow existing code patterns (see `.kiro/steering/`)
2. Use TypeScript strict mode (no `any`)
3. Write immutable code (no mutations)
4. Extract repeated logic to helpers
5. Test in both light and dark mode

---

**Built for sustainable cloud infrastructure monitoring**
