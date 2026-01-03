# GreenRatchet - Sustainability-Linked Loans Platform

A production-credible platform for managing Sustainability-Linked Loans (SLLs) with automated, continuous, cloud-native ESG assurance focused on AI workloads.

## Overview

GreenRatchet enables borrowers and lenders to:
- Define and agree on ESG KPIs related to AI environmental impact
- Automatically track KPIs using real-time cloud data (AWS/GCP)
- View KPI progress and loan margin impact with full auditability
- Export KPI schedules for legal documentation

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Authentication**: Auth.js (NextAuth v5)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use Prisma's local dev database)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd GreenRatchet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env file is already created with Prisma Postgres URL
# Update NEXTAUTH_SECRET for production:
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

4. Start Prisma Postgres locally:
```bash
npx prisma dev
```

5. Push the database schema:
```bash
npx prisma db push
```

6. Generate Prisma Client:
```bash
npx prisma generate
```

7. Seed the database:
```bash
npx tsx prisma/seed.ts
```

8. Run the development server:
```bash
npm run dev
```

9. Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

After seeding, you can log in with:

**Borrower Account:**
- Email: `borrower@techcorp.ai`
- Password: `password123`

**Lender Account:**
- Email: `lender@greencapital.com`
- Password: `password123`

## Key Features

### For Borrowers
- ✅ Create SLL deals
- ✅ Define AI-focused ESG KPIs
- ✅ Invite lenders to review deals
- ✅ Connect AWS and GCP accounts
- ✅ Trigger automated KPI calculations
- ✅ View KPI progress and analytics
- ✅ Export KPI schedules

### For Lenders
- ✅ Review proposed KPIs
- ✅ Accept or reject KPIs (no counter-proposals)
- ✅ View borrower's KPI progress
- ✅ Access complete audit trail
- ✅ Download KPI schedules

### Automated ESG Assurance
- ✅ Cloud-native data collection (AWS & GCP)
- ✅ Automatic identification of AI workloads (GPU instances)
- ✅ Carbon emissions calculation using regional grid intensity
- ✅ Immutable monthly snapshots with full metadata
- ✅ Versioned calculation logic for reproducibility
- ✅ Complete audit trail of all actions

## Application Flow

1. **Sign Up**: User selects role (Borrower/Lender) and creates organization
2. **Create Deal** (Borrower): Define loan terms and margin ratchet
3. **Define KPIs** (Borrower): Add AI-focused environmental KPIs
4. **Invite Lender** (Borrower): Send invitation to lender's email
5. **Review KPIs** (Lender): Accept or reject proposed KPIs
6. **Connect Cloud** (Borrower): Link AWS/GCP accounts
7. **Calculate KPIs**: Trigger automated calculations
8. **View Analytics**: Track progress and margin impact
9. **Export**: Download KPI schedule for legal docs

## Architecture

### Database Models
- `User`: Authentication and roles
- `Organization`: Borrower or Lender entities
- `Loan`: SLL deals
- `KPI`: ESG key performance indicators
- `KPIResult`: Calculated results with full metadata
- `CloudConnection`: AWS/GCP integrations
- `AuditLog`: Complete activity history

### Key Services
- `cloud-data.ts`: Cloud usage data collection (mocked for demo)
- `kpi-calculator.ts`: KPI calculation logic
- Server Actions for all mutations

## Cloud Integration

### AWS Setup (Production)
1. Deploy CloudFormation stack to create IAM role
2. Grant read-only access to:
   - Cost Explorer
   - EC2 metadata
   - EKS metadata
3. Copy Role ARN and paste in app

### GCP Setup (Production)
1. Create service account with roles:
   - Billing Account Viewer
   - Compute Viewer
   - Cloud Asset Viewer
2. Generate and download JSON key
3. Upload key in app

**Note**: For hackathon demo, cloud data is mocked with realistic values.

## Important Notes

- **Legal Documentation**: Happens outside the platform
- **KPI Negotiation**: No counter-proposals (accept/reject only)
- **Verification**: Automated and data-native, not manual PDFs
- **Language**: "Automated, continuous, cloud-native ESG assurance with full auditability"

## Project Structure

```
GreenRatchet/
├── app/
│   ├── actions/          # Server actions
│   ├── api/              # API routes
│   ├── auth/             # Auth pages
│   ├── dashboard/        # Main dashboard
│   ├── loans/            # SLL deal management
│   ├── cloud/            # Cloud connections
│   ├── analytics/        # KPI analytics
│   └── audit/            # Audit trail
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Layout components
│   ├── loans/            # Deal-specific components
│   └── cloud/            # Cloud connection components
├── lib/
│   ├── services/         # Business logic
│   ├── validations/      # Zod schemas
│   └── utils.ts          # Utilities
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Seed data
```

## Future Enhancements (Production)

- [ ] Real AWS/GCP API integrations
- [ ] Scheduled cron jobs for automatic KPI calculations
- [ ] PDF export generation
- [ ] Email notifications
- [ ] Multi-period KPI trend charts
- [ ] Role-based access control refinements
- [ ] Webhook integrations for legal systems
- [ ] Azure cloud support

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for sustainable AI infrastructure
