# Design Document

## Overview

This design document outlines the architecture and implementation approach for the KPI calculation and analytics system. The system will replace the current dummy implementation with real calculations based on cloud footprint data stored in the database, provide detailed analytics for each KPI type with visualizations, and enable users to track sustainability performance over time.

The system consists of three main components:

1. **Calculation Engine**: Backend service that computes KPI values from CloudFootprint and grid data
2. **Analytics API**: Server actions that fetch and aggregate KPI results for display
3. **Analytics UI**: Type-specific components that visualize KPI performance with charts and recommendations

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Analytics Page                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CO2 Analytics│  │Energy Analytics│ │Water Analytics│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server Actions Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  getKPIAnalyticsAction()                             │   │
│  │  refreshKPICalculationsAction()                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Calculation Engine                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  KPI Calculator Service                              │   │
│  │  - calculateCO2Emission()                            │   │
│  │  - calculateEnergyConsumption()                      │   │
│  │  - calculateWaterWithdrawal()                        │   │
│  │  - calculateLowCarbonRegionPercentage()             │   │
│  │  - calculateCarbonFreeEnergyPercentage()            │   │
│  │  - calculateRenewableEnergyPercentage()             │   │
│  │  - calculateElectricityMixBreakdown()               │   │
│  │  - calculateAIComputeHours()                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │CloudFootprint│  │  KPIResult   │  │  Grid Data   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Calculation Trigger**: User clicks refresh button or scheduled job runs
2. **Data Fetching**: System queries CloudFootprint and grid data tables
3. **Calculation**: KPI calculator service computes values using type-specific formulas
4. **Storage**: Results saved to KPIResult table with calculation details
5. **Display**: Analytics page fetches results and renders type-specific visualizations

## Components and Interfaces

### 1. KPI Calculator Service (`lib/services/kpi-calculator.ts`)

This is the core calculation engine that will be completely refactored.

```typescript
// Enhanced calculation result interface
export interface KPICalculationResult {
  actualValue: number;
  targetValue: number;
  status: KPIResultStatus;
  calculationDetails: {
    formula: string;
    inputs: Record<string, number | string>;
    steps: string[];
    breakdown?: {
      byRegion?: Record<string, number>;
      byService?: Record<string, number>;
      byEnergySource?: Record<string, number>;
    };
  };
  dataSource: {
    provider: string[];
    timestamp: string;
    regions: string[];
    periodStart: Date;
    periodEnd: Date;
  };
}

// Main calculation function
export async function calculateKPI(
  kpi: KPI,
  organizationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<KPICalculationResult>;

// Type-specific calculation functions
async function calculateCO2Emission(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection
): Promise<KPICalculationResult>;

async function calculateEnergyConsumption(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection
): Promise<KPICalculationResult>;

async function calculateWaterWithdrawal(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection
): Promise<KPICalculationResult>;

async function calculateLowCarbonRegionPercentage(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection
): Promise<KPICalculationResult>;

async function calculateCarbonFreeEnergyPercentage(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection
): Promise<KPICalculationResult>;

async function calculateRenewableEnergyPercentage(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection
): Promise<KPICalculationResult>;

async function calculateElectricityMixBreakdown(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection
): Promise<KPICalculationResult>;

async function calculateAIComputeHours(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection
): Promise<KPICalculationResult>;
```

### 2. Server Actions (`app/actions/kpi-analytics.ts`)

New server actions for analytics functionality.

```typescript
// Get all KPI analytics for the user's organization
export async function getKPIAnalyticsAction(): Promise<
  { data: KPIAnalytics[] } | { error: string }
>;

// Refresh all KPI calculations
export async function refreshKPICalculationsAction(): Promise<
  { success: true; resultsCreated: number } | { error: string }
>;

// Get detailed analytics for a specific KPI
export async function getKPIDetailedAnalyticsAction(
  kpiId: string
): Promise<{ data: DetailedKPIAnalytics } | { error: string }>;

interface KPIAnalytics {
  kpiId: string;
  kpiName: string;
  kpiType: KpiType;
  loanId: string;
  loanName: string;
  targetValue: number;
  direction: KpiDirection;
  latestResult: {
    actualValue: number;
    status: KPIResultStatus;
    periodStart: Date;
    periodEnd: Date;
  } | null;
  trend: {
    direction: "increasing" | "decreasing" | "stable";
    percentageChange: number;
  } | null;
  marginRatchet: {
    stepUpBps: number;
    stepDownBps: number;
    maxAdjustmentBps: number;
  } | null;
  historicalResults: Array<{
    actualValue: number;
    targetValue: number;
    status: KPIResultStatus;
    periodStart: Date;
    periodEnd: Date;
  }>;
}

interface DetailedKPIAnalytics extends KPIAnalytics {
  calculationDetails: {
    formula: string;
    inputs: Record<string, number | string>;
    steps: string[];
    breakdown?: {
      byRegion?: Record<string, number>;
      byService?: Record<string, number>;
      byEnergySource?: Record<string, number>;
    };
  };
  recommendations: string[];
}
```

### 3. Analytics Components

Each KPI type will have its own analytics component in a new directory structure:

```
components/analytics/
  ├── co2-emission-analytics.tsx
  ├── energy-consumption-analytics.tsx
  ├── water-withdrawal-analytics.tsx
  ├── low-carbon-region-analytics.tsx
  ├── carbon-free-energy-analytics.tsx
  ├── renewable-energy-analytics.tsx
  ├── electricity-mix-analytics.tsx
  ├── ai-compute-hours-analytics.tsx
  └── shared/
      ├── kpi-trend-indicator.tsx
      ├── kpi-status-badge.tsx
      ├── recommendation-card.tsx
      └── time-series-chart.tsx
```

### 4. Analytics Page (`app/(dashboard)/analytics/page.tsx`)

Refactored to display KPI-specific analytics grouped by type.

```typescript
export default async function AnalyticsPage() {
  // Fetch all KPI analytics
  // Group by KPI type
  // Render type-specific analytics components
  // Include refresh button at top
}
```

## Data Models

### CloudFootprint Table (Existing)

Used as the primary data source for calculations.

```prisma
model CloudFootprint {
  id                String
  cloudConnectionId String
  cloudProvider     String
  kilowattHours     Float?
  co2e              Float
  cost              Float?
  serviceName       String
  region            String
  tags              String?
  timestamp         DateTime
  periodStartDate   DateTime
  periodEndDate     DateTime
  type              CloudFootprintType
  serviceType       String?
}
```

### Grid Data Tables (Existing)

Used for grid-based KPI calculations.

```prisma
model GridCarbonFreeEnergy {
  dataCenterRegion   String
  dataCenterProvider ElectricityMapsProvider
  datetime           DateTime
  value              Float
  isEstimated        Boolean
}

model GridRenewableEnergy {
  dataCenterRegion   String
  dataCenterProvider ElectricityMapsProvider
  datetime           DateTime
  value              Float
  isEstimated        Boolean
}

model GridElectricityMix {
  dataCenterRegion   String
  dataCenterProvider ElectricityMapsProvider
  datetime           DateTime
  nuclear            Float
  geothermal         Float
  biomass            Float
  coal               Float
  wind               Float
  solar              Float
  hydro              Float
  gas                Float
  oil                Float
  unknown            Float
}

model GridCarbonIntensity {
  dataCenterRegion   String
  dataCenterProvider ElectricityMapsProvider
  datetime           DateTime
  value              Float
  isEstimated        Boolean
}
```

### KPIResult Table (Existing)

Enhanced to store calculation details.

The existing schema already supports our needs. We'll use the existing fields and can store detailed calculation information in a future enhancement if needed.

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

Before defining the final properties, let's identify and eliminate redundancy:

**Redundancies Identified:**

- Properties 1.2, 1.3 are similar summation operations - can be generalized
- Properties 1.7, 1.8 are both weighted average calculations - can be combined
- Properties 2.8, 2.9, 2.10 are all about type-specific breakdowns - can be generalized
- Properties 5.2-5.9 are all about displaying required information for different KPI types - can be generalized
- Properties 8.2, 8.3 are both about UI element rendering based on data - can be combined

**Consolidated Approach:**

- Create general properties for calculation patterns (summation, weighted average, percentage)
- Create general properties for display patterns (required fields, breakdowns, charts)
- Keep specific properties only where the logic is truly unique

### Correctness Properties

Property 1: CloudFootprint data filtering
_For any_ organization and time period, when fetching CloudFootprint records for KPI calculation, the returned records should only include those belonging to the organization's active cloud connections and falling within the specified time period
**Validates: Requirements 1.1, 7.2**

Property 2: Summation-based KPI calculations
_For any_ set of CloudFootprint records, when calculating a summation-based KPI (CO2_EMISSION, ENERGY_CONSUMPTION), the actualValue should equal the sum of the corresponding field (co2e, kilowattHours) from all records
**Validates: Requirements 1.2, 1.3**

Property 3: Water withdrawal calculation
_For any_ set of CloudFootprint records with energy data, when calculating WATER_WITHDRAWAL, the actualValue should equal the sum of (kilowattHours × WUE factor) for each region
**Validates: Requirements 1.4**

Property 4: Low carbon region percentage calculation
_For any_ set of CloudFootprint records with regional data, when calculating LOW_CARBON_REGION_PERCENTAGE, the actualValue should equal (compute hours in regions with carbon intensity < 300 gCO2/kWh) / (total compute hours) × 100
**Validates: Requirements 1.6**

Property 5: Weighted average grid KPI calculations
_For any_ set of grid data records (GridCarbonFreeEnergy, GridRenewableEnergy), when calculating grid-based percentage KPIs, the actualValue should equal the weighted average of grid values weighted by energy consumption in each region
**Validates: Requirements 1.7, 1.8**

Property 6: KPIResult creation completeness
_For any_ completed KPI calculation, a KPIResult record should be created containing actualValue, targetValue, status, periodStart, and periodEnd fields
**Validates: Requirements 1.10**

Property 7: KPI status determination
_For any_ KPI calculation, if direction is LOWER_IS_BETTER then status should be PASSED when actualValue ≤ targetValue, otherwise FAILED; if direction is HIGHER_IS_BETTER then status should be PASSED when actualValue ≥ targetValue, otherwise FAILED
**Validates: Requirements 1.11**

Property 8: Audit log creation
_For any_ completed KPI calculation, an AuditLog record should be created documenting the calculation action, entity, and details
**Validates: Requirements 1.12**

Property 9: User KPI visibility
_For any_ user, when viewing the analytics page, all KPIs associated with loans where the user's organization is either borrowerOrg or lenderOrg should be displayed
**Validates: Requirements 2.1, 6.1**

Property 10: KPI display completeness
_For any_ displayed KPI, the UI should include loan name, KPI name, KPI type, target value, and current status
**Validates: Requirements 2.2**

Property 11: Trend calculation
_For any_ KPI with at least two historical results, the trend direction should be "increasing" if the latest actualValue > previous actualValue, "decreasing" if latest < previous, otherwise "stable"
**Validates: Requirements 2.3**

Property 12: Margin ratchet conditional display
_For any_ KPI, if a MarginRatchet exists for that KPI, then the margin ratchet details (stepUpBps, stepDownBps, maxAdjustmentBps) should be displayed
**Validates: Requirements 2.6**

Property 13: Type-specific breakdown display
_For any_ KPI of type CO2_EMISSION, ENERGY_CONSUMPTION, or WATER_WITHDRAWAL, the analytics should include a breakdown by region or service
**Validates: Requirements 2.8, 2.9, 2.10, 5.2, 5.3, 5.4**

Property 14: Refresh triggers all calculations
_For any_ user, when the refresh button is clicked, KPI calculations should be triggered for all KPIs with status ACCEPTED across all loans associated with the user's organization
**Validates: Requirements 3.1**

Property 15: Calculation period determination
_For any_ KPI calculation triggered by refresh, the periodEnd should be the current date and periodStart should be calculated based on the KPI's frequency (MONTHLY: 1 month back, QUARTERLY: 3 months back, ANNUAL: 12 months back)
**Validates: Requirements 3.2**

Property 16: Calculation result structure
_For any_ KPI calculation, the returned result should include actualValue, targetValue, status, and calculationDetails containing inputs, steps, and dataSource
**Validates: Requirements 4.4**

Property 17: Missing data error handling
_For any_ KPI calculation, if required CloudFootprint or grid data is missing or incomplete, the calculation should return an error with a descriptive message rather than throwing an exception
**Validates: Requirements 4.5**

Property 18: Lender context display
_For any_ lender viewing KPI analytics, each displayed KPI should include the borrower organization name
**Validates: Requirements 6.3**

Property 19: Status color coding
_For any_ displayed KPI status, the UI should apply green styling for PASSED, red styling for FAILED, and yellow styling for PENDING
**Validates: Requirements 8.2**

Property 20: Trend icon display
_For any_ displayed KPI trend, the UI should show an up arrow icon for "increasing", down arrow for "decreasing", and no arrow or horizontal line for "stable"
**Validates: Requirements 8.3**

Property 21: Chart component rendering
_For any_ KPI with historical results, a time series chart component should be rendered with proper labels and legends
**Validates: Requirements 2.7, 8.5**

Property 22: Error message display
_For any_ failed operation (calculation, data fetch), an error message should be displayed to the user
**Validates: Requirements 3.5, 8.7**

## Error Handling

### Calculation Errors

1. **Missing Cloud Data**: If no CloudFootprint records exist for the period, return error: "No cloud usage data available for the specified period"
2. **Missing Grid Data**: If grid data is required but unavailable, use fallback values or return error with specific missing data type
3. **Invalid KPI Type**: If KPI type is not recognized, return error: "Unsupported KPI type"
4. **Division by Zero**: If calculations involve division and denominator is zero, return error: "Insufficient data for calculation"

### Data Fetching Errors

1. **Database Errors**: Catch Prisma errors and return user-friendly messages
2. **Authorization Errors**: Return 401/403 with appropriate message
3. **Not Found Errors**: Return 404 with specific entity not found message

### UI Error Handling

1. **Loading States**: Show skeleton loaders while data is being fetched
2. **Error States**: Display error messages in red alert boxes with retry options
3. **Empty States**: Show helpful messages when no data is available with guidance on next steps

## Testing Strategy

### Unit Testing

We will write unit tests for:

- Individual KPI calculation functions with known inputs and expected outputs
- Trend calculation logic with various historical data scenarios
- Status determination logic with different direction and value combinations
- Data filtering and aggregation logic
- Error handling paths

### Property-Based Testing

We will use **fast-check** (JavaScript/TypeScript property-based testing library) for property-based tests. Each property-based test will run a minimum of 100 iterations.

Property-based tests will be written for:

- All correctness properties defined above
- Each test will be tagged with a comment: `// Feature: kpi-calculation-analytics, Property X: [property text]`
- Tests will generate random but valid inputs (organizations, time periods, CloudFootprint data, KPI configurations)
- Tests will verify the properties hold across all generated inputs

Example property test structure:

```typescript
// Feature: kpi-calculation-analytics, Property 2: Summation-based KPI calculations
test("CO2 emission calculation sums all co2e values", () => {
  fc.assert(
    fc.property(fc.array(cloudFootprintRecordArbitrary), async (records) => {
      const result = await calculateCO2Emission(/* ... */);
      const expectedSum = records.reduce((sum, r) => sum + r.co2e, 0);
      expect(result.actualValue).toBeCloseTo(expectedSum, 2);
    }),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify:

- End-to-end KPI calculation flow from trigger to database storage
- Analytics page data fetching and rendering
- Server action authorization and data access patterns

## Performance Considerations

### Database Optimization

1. **Aggregation Queries**: Use Prisma's `_sum`, `_count`, `_avg` for calculations instead of fetching all records
2. **Indexed Queries**: Ensure queries on CloudFootprint use indexes on `cloudConnectionId`, `periodStartDate`, `periodEndDate`
3. **Batch Operations**: When calculating multiple KPIs, batch database operations using transactions
4. **Caching**: Use Next.js `unstable_cache` for analytics data with appropriate revalidation tags

### Query Examples

```typescript
// Efficient CO2 calculation using aggregation
const result = await prisma.cloudFootprint.aggregate({
  where: {
    cloudConnection: {
      organizationId: orgId,
    },
    periodStartDate: { gte: periodStart },
    periodEndDate: { lte: periodEnd },
  },
  _sum: {
    co2e: true,
  },
});

// Efficient regional breakdown using groupBy
const regionalData = await prisma.cloudFootprint.groupBy({
  by: ["region"],
  where: {
    /* filters */
  },
  _sum: {
    co2e: true,
    kilowattHours: true,
  },
});
```

### Caching Strategy

```typescript
// Cache analytics data for 60 seconds
export const revalidate = 60;

// Use tagged caching for selective revalidation
const data = await unstable_cache(
  async () => fetchAnalyticsData(userId),
  [`analytics-${userId}`],
  {
    revalidate: 60,
    tags: [`analytics-${userId}`, `org-${organizationId}`],
  }
)();

// Revalidate after calculations
revalidatePath("/analytics");
revalidateTag(`analytics-${userId}`);
```

## Security Considerations

### Authorization

1. **User Authentication**: All server actions must verify user session
2. **Organization Access**: Users can only view KPIs for loans where their organization is borrower or lender
3. **Role-Based Access**: Borrowers can trigger calculations, lenders can only view
4. **Data Isolation**: Queries must filter by organization to prevent data leakage

### Input Validation

1. **KPI ID Validation**: Validate KPI exists and user has access before calculations
2. **Date Range Validation**: Ensure date ranges are reasonable (not in future, not too far in past)
3. **Zod Schemas**: Use Zod for all input validation in server actions

## Deployment Considerations

### Database Migrations

No schema changes required - existing tables support all functionality.

### Environment Variables

No new environment variables required.

### Monitoring

1. **Calculation Failures**: Log all calculation errors with context
2. **Performance Metrics**: Monitor calculation duration for optimization
3. **Audit Trail**: All calculations are logged in AuditLog table

## Future Enhancements

1. **Scheduled Calculations**: Implement cron jobs for automatic KPI calculations
2. **Calculation Details Storage**: Store full calculation details in KPIResult for reproducibility
3. **Comparison Views**: Allow users to compare KPIs across different loans
4. **Export Functionality**: Enable CSV/PDF export of analytics data
5. **Real-time Updates**: Use WebSockets for live calculation progress updates
6. **Advanced Visualizations**: Add more chart types (heatmaps, sankey diagrams)
7. **Predictive Analytics**: Use historical data to predict future KPI values
8. **Benchmarking**: Compare organization's KPIs against industry averages
