# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive KPI calculation and analytics system for the GreenRatchet platform. The system will replace the current dummy implementation with real calculations based on cloud usage data, provide detailed analytics for each KPI type, and enable users to track their sustainability performance over time.

## Glossary

- **KPI**: Key Performance Indicator - A measurable value that demonstrates how effectively an organization is achieving key sustainability objectives
- **System**: The GreenRatchet KPI calculation and analytics platform
- **User**: A borrower or lender using the platform
- **Borrower**: An organization that has taken a sustainability-linked loan
- **Lender**: An organization that has provided a sustainability-linked loan
- **Cloud Footprint Data**: Operational and embodied metrics from cloud providers (AWS, GCP, Azure) stored in the CloudFootprint table
- **KPI Result**: A calculated value for a specific KPI during a specific time period
- **Margin Ratchet**: A loan interest rate adjustment mechanism tied to KPI performance
- **Analytics Page**: The /analytics route that displays KPI performance data
- **Calculation Engine**: The backend service that computes KPI values from cloud footprint data
- **Time Series Data**: Historical KPI values tracked over multiple observation periods

## Requirements

### Requirement 1

**User Story:** As a borrower, I want the system to calculate my KPIs based on real cloud usage data, so that I can accurately track my sustainability performance.

#### Acceptance Criteria

1. WHEN a borrower triggers KPI calculation THEN the System SHALL fetch all CloudFootprint records for the organization's active cloud connections within the specified time period
2. WHEN calculating a CO2_EMISSION KPI THEN the System SHALL sum all co2e values from CloudFootprint records and return the total in metric tons
3. WHEN calculating an ENERGY_CONSUMPTION KPI THEN the System SHALL sum all kilowattHours values from CloudFootprint records and return the total in kWh
4. WHEN calculating a WATER_WITHDRAWAL KPI THEN the System SHALL compute water usage based on region-specific Water Usage Effectiveness (WUE) factors and energy consumption
5. WHEN calculating an AI_COMPUTE_HOURS KPI THEN the System SHALL identify AI/ML service types and sum their compute hours
6. WHEN calculating a LOW_CARBON_REGION_PERCENTAGE KPI THEN the System SHALL compute the percentage of compute hours in regions with carbon intensity below 300 gCO2/kWh
7. WHEN calculating a CARBON_FREE_ENERGY_PERCENTAGE KPI THEN the System SHALL use GridCarbonFreeEnergy data to compute the weighted average carbon-free energy percentage
8. WHEN calculating a RENEWABLE_ENERGY_PERCENTAGE KPI THEN the System SHALL use GridRenewableEnergy data to compute the weighted average renewable energy percentage
9. WHEN calculating an ELECTRICITY_MIX_BREAKDOWN KPI THEN the System SHALL use GridElectricityMix data to compute the weighted average breakdown of energy sources
10. WHEN a KPI calculation completes THEN the System SHALL create a KPIResult record with actualValue, targetValue, status, periodStart, and periodEnd
11. WHEN a KPI calculation completes THEN the System SHALL determine status as PASSED if the actualValue meets the target based on the KPI direction, otherwise FAILED
12. WHEN a KPI calculation completes THEN the System SHALL create an AuditLog record documenting the calculation

### Requirement 2

**User Story:** As a borrower, I want to see detailed analytics for each KPI type, so that I can understand my performance and identify areas for improvement.

#### Acceptance Criteria

1. WHEN a user navigates to the analytics page THEN the System SHALL display all KPIs associated with the user's organization's loans
2. WHEN displaying a KPI THEN the System SHALL show the loan name, KPI name, KPI type, target value, and current status
3. WHEN displaying a KPI THEN the System SHALL show the most recent actualValue and the trend direction (increasing or decreasing)
4. WHEN displaying a KPI with a FAILED status and LOWER_IS_BETTER direction THEN the System SHALL provide recommendations for reducing the metric
5. WHEN displaying a KPI with a FAILED status and HIGHER_IS_BETTER direction THEN the System SHALL provide recommendations for increasing the metric
6. WHEN displaying a KPI THEN the System SHALL show the associated MarginRatchet details if one exists
7. WHEN displaying a KPI THEN the System SHALL show a time series chart of historical KPI results
8. WHEN displaying a CO2_EMISSION KPI THEN the System SHALL show regional breakdown of emissions
9. WHEN displaying an ENERGY_CONSUMPTION KPI THEN the System SHALL show service-level breakdown of energy usage
10. WHEN displaying a WATER_WITHDRAWAL KPI THEN the System SHALL show regional breakdown with WUE factors
11. WHEN displaying grid-based KPIs THEN the System SHALL show the data sources and temporal granularity

### Requirement 3

**User Story:** As a borrower, I want to refresh my KPI calculations on demand, so that I can see my latest sustainability performance.

#### Acceptance Criteria

1. WHEN a user clicks the refresh button on the analytics page THEN the System SHALL trigger KPI calculations for all accepted KPIs across all loans
2. WHEN triggering calculations THEN the System SHALL use the current date as the period end and calculate based on the KPI frequency
3. WHEN calculations are in progress THEN the System SHALL display a loading indicator
4. WHEN calculations complete successfully THEN the System SHALL revalidate the analytics page and display updated results
5. WHEN calculations fail THEN the System SHALL display an error message with details

### Requirement 4

**User Story:** As a developer, I want KPI calculation logic to be centralized and reusable, so that the same formulas are used consistently across the application.

#### Acceptance Criteria

1. WHEN implementing KPI calculations THEN the System SHALL define all calculation logic in a single service module
2. WHEN the /kpis page needs to display analytics THEN the System SHALL use the same calculation service as the KPI calculation action
3. WHEN a new KPI type is added THEN the System SHALL require only updating the central calculation service
4. WHEN calculating a KPI THEN the System SHALL return structured calculation details including inputs, steps, and data sources
5. WHEN calculating a KPI THEN the System SHALL handle missing or incomplete data gracefully with appropriate error messages

### Requirement 5

**User Story:** As a borrower, I want each KPI type to have its own dedicated analytics view, so that I can easily understand the specific metrics relevant to each sustainability goal.

#### Acceptance Criteria

1. WHEN organizing KPI analytics THEN the System SHALL create separate components for each KPI type
2. WHEN displaying CO2_EMISSION analytics THEN the System SHALL show total emissions, regional breakdown, and service-level contributions
3. WHEN displaying ENERGY_CONSUMPTION analytics THEN the System SHALL show total energy, service breakdown, and efficiency metrics
4. WHEN displaying WATER_WITHDRAWAL analytics THEN the System SHALL show total water usage, regional WUE factors, and water-stressed region analysis
5. WHEN displaying LOW_CARBON_REGION_PERCENTAGE analytics THEN the System SHALL show percentage in low-carbon regions, regional carbon intensity map, and migration recommendations
6. WHEN displaying CARBON_FREE_ENERGY_PERCENTAGE analytics THEN the System SHALL show weighted average CFE percentage, regional breakdown, and temporal trends
7. WHEN displaying RENEWABLE_ENERGY_PERCENTAGE analytics THEN the System SHALL show weighted average renewable percentage, energy source breakdown, and regional comparison
8. WHEN displaying ELECTRICITY_MIX_BREAKDOWN analytics THEN the System SHALL show stacked area chart of energy sources over time
9. WHEN displaying AI_COMPUTE_HOURS analytics THEN the System SHALL show total compute hours, service breakdown, and carbon intensity per compute hour

### Requirement 6

**User Story:** As a lender, I want to view the same KPI analytics as borrowers, so that I can monitor loan performance and assess sustainability compliance.

#### Acceptance Criteria

1. WHEN a lender navigates to the analytics page THEN the System SHALL display KPIs for all loans where the lender's organization is the lenderOrg
2. WHEN displaying KPIs to a lender THEN the System SHALL show the same analytics and visualizations as shown to borrowers
3. WHEN a lender views KPI analytics THEN the System SHALL include the borrower organization name for context

### Requirement 7

**User Story:** As a user, I want KPI calculations to be performant and efficient, so that I can get results quickly even with large amounts of cloud data.

#### Acceptance Criteria

1. WHEN calculating KPIs THEN the System SHALL use Prisma aggregations for summing values rather than fetching all records
2. WHEN fetching cloud footprint data THEN the System SHALL filter by date range and organization before aggregating
3. WHEN fetching grid data THEN the System SHALL use indexed queries on dataCenterRegion, dataCenterProvider, and datetime
4. WHEN displaying analytics THEN the System SHALL use server-side data fetching with caching
5. WHEN multiple KPIs are calculated THEN the System SHALL batch database operations where possible

### Requirement 8

**User Story:** As a user, I want the analytics page to be visually clear and easy to understand, so that I can quickly assess my sustainability performance.

#### Acceptance Criteria

1. WHEN displaying KPI analytics THEN the System SHALL use the established design system with semantic colors
2. WHEN showing KPI status THEN the System SHALL use color coding (green for PASSED, red for FAILED, yellow for PENDING)
3. WHEN displaying trends THEN the System SHALL use arrow icons to indicate increasing or decreasing values
4. WHEN showing recommendations THEN the System SHALL use clear, actionable language
5. WHEN displaying charts THEN the System SHALL use responsive Recharts components with proper labels and legends
6. WHEN the page loads THEN the System SHALL show loading states for async data
7. WHEN errors occur THEN the System SHALL display user-friendly error messages
