# Implementation Plan

- [x] 1. Refactor KPI Calculator Service with real calculation logic
  - Remove dummy implementation from `lib/services/kpi-calculator.ts`
  - Implement `calculateCO2Emission()` function that aggregates co2e from CloudFootprint records
  - Implement `calculateEnergyConsumption()` function that aggregates kilowattHours from CloudFootprint records
  - Implement `calculateWaterWithdrawal()` function using WUE factors and energy data
  - Implement `calculateAIComputeHours()` function that identifies AI/ML services and sums compute hours
  - Implement `calculateLowCarbonRegionPercentage()` function using 300 gCO2/kWh threshold
  - Implement `calculateCarbonFreeEnergyPercentage()` function using GridCarbonFreeEnergy data
  - Implement `calculateRenewableEnergyPercentage()` function using GridRenewableEnergy data
  - Implement `calculateElectricityMixBreakdown()` function using GridElectricityMix data
  - Update main `calculateKPI()` function to route to type-specific calculators
  - Add comprehensive error handling for missing/incomplete data
  - Return structured calculation details with inputs, steps, and breakdowns
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 4.4, 4.5, 7.1, 7.2_

- [ ]\* 1.1 Write property test for CloudFootprint data filtering
  - **Property 1: CloudFootprint data filtering**
  - **Validates: Requirements 1.1, 7.2**

- [ ]\* 1.2 Write property test for summation-based calculations
  - **Property 2: Summation-based KPI calculations**
  - **Validates: Requirements 1.2, 1.3**

- [ ]\* 1.3 Write property test for water withdrawal calculation
  - **Property 3: Water withdrawal calculation**
  - **Validates: Requirements 1.4**

- [ ]\* 1.4 Write property test for low carbon region percentage
  - **Property 4: Low carbon region percentage calculation**
  - **Validates: Requirements 1.6**

- [ ]\* 1.5 Write property test for weighted average grid calculations
  - **Property 5: Weighted average grid KPI calculations**
  - **Validates: Requirements 1.7, 1.8**

- [ ]\* 1.6 Write property test for KPI status determination
  - **Property 7: KPI status determination**
  - **Validates: Requirements 1.11**

- [ ]\* 1.7 Write property test for missing data error handling
  - **Property 17: Missing data error handling**
  - **Validates: Requirements 4.5**

- [x] 2. Update KPI calculation action to use refactored service
  - Modify `triggerKPICalculation()` in `app/actions/kpi-calculation.ts` to use new calculator service
  - Update to pass organizationId and date range to calculator
  - Ensure KPIResult creation includes all required fields
  - Ensure AuditLog creation documents calculation details
  - Add proper error handling and user-friendly error messages
  - _Requirements: 1.10, 1.11, 1.12, 4.1, 4.2_

- [ ]\* 2.1 Write property test for KPIResult creation completeness
  - **Property 6: KPIResult creation completeness**
  - **Validates: Requirements 1.10**

- [ ]\* 2.2 Write property test for audit log creation
  - **Property 8: Audit log creation**
  - **Validates: Requirements 1.12**

- [x] 3. Create new KPI analytics server actions
  - Create `app/actions/kpi-analytics.ts` file
  - Implement `getKPIAnalyticsAction()` to fetch all KPIs with results for user's organization
  - Implement `refreshKPICalculationsAction()` to trigger calculations for all accepted KPIs
  - Implement `getKPIDetailedAnalyticsAction()` to fetch detailed analytics for a specific KPI
  - Include authorization checks (borrower or lender access)
  - Calculate trend direction from historical results
  - Include margin ratchet details if they exist
  - Add proper error handling
  - _Requirements: 2.1, 2.3, 2.6, 3.1, 3.2, 3.4, 3.5, 6.1, 6.2, 6.3_

- [ ]\* 3.1 Write property test for user KPI visibility
  - **Property 9: User KPI visibility**
  - **Validates: Requirements 2.1, 6.1**

- [ ]\* 3.2 Write property test for trend calculation
  - **Property 11: Trend calculation**
  - **Validates: Requirements 2.3**

- [ ]\* 3.3 Write property test for refresh triggers all calculations
  - **Property 14: Refresh triggers all calculations**
  - **Validates: Requirements 3.1**

- [ ]\* 3.4 Write property test for calculation period determination
  - **Property 15: Calculation period determination**
  - **Validates: Requirements 3.2**

- [x] 4. Create shared analytics UI components
  - Create `components/analytics/shared/` directory
  - Implement `kpi-status-badge.tsx` with color coding (green/red/yellow)
  - Implement `kpi-trend-indicator.tsx` with arrow icons
  - Implement `recommendation-card.tsx` for displaying improvement suggestions
  - Implement `time-series-chart.tsx` for historical KPI results
  - Implement `kpi-metadata-card.tsx` for displaying loan, margin ratchet info
  - Use semantic colors from design system
  - Ensure dark mode compatibility
  - _Requirements: 2.2, 2.6, 2.7, 8.1, 8.2, 8.3, 8.5_

- [ ]\* 4.1 Write property test for status color coding
  - **Property 19: Status color coding**
  - **Validates: Requirements 8.2**

- [ ]\* 4.2 Write property test for trend icon display
  - **Property 20: Trend icon display**
  - **Validates: Requirements 8.3**

- [x] 5. Create CO2 emission analytics component
  - Create `components/analytics/co2-emission-analytics.tsx`
  - Display total emissions metric
  - Show regional breakdown chart
  - Show service-level contributions
  - Include recommendations for failed KPIs (migrate to low-carbon regions, optimize workloads)
  - Use shared components for status, trend, and metadata
  - _Requirements: 2.2, 2.3, 2.4, 2.8, 5.2, 8.1_

- [ ]\* 5.1 Write property test for type-specific breakdown display
  - **Property 13: Type-specific breakdown display**
  - **Validates: Requirements 2.8, 2.9, 2.10, 5.2, 5.3, 5.4**

- [x] 6. Create energy consumption analytics component
  - Create `components/analytics/energy-consumption-analytics.tsx`
  - Display total energy metric
  - Show service breakdown chart
  - Show efficiency metrics (kWh per compute hour)
  - Include recommendations for failed KPIs (use more efficient instance types, reduce idle time)
  - Use shared components for status, trend, and metadata
  - _Requirements: 2.2, 2.3, 2.4, 2.9, 5.3, 8.1_

- [x] 7. Create water withdrawal analytics component
  - Create `components/analytics/water-withdrawal-analytics.tsx`
  - Display total water usage metric
  - Show regional breakdown with WUE factors
  - Show water-stressed region analysis
  - Include recommendations for failed KPIs (migrate to regions with lower WUE)
  - Use shared components for status, trend, and metadata
  - _Requirements: 2.2, 2.3, 2.4, 2.10, 5.4, 8.1_

- [x] 8. Create low carbon region analytics component
  - Create `components/analytics/low-carbon-region-analytics.tsx`
  - Display percentage in low-carbon regions
  - Show regional carbon intensity map
  - Show migration recommendations
  - Include recommendations for failed KPIs (specific regions to migrate to)
  - Use shared components for status, trend, and metadata
  - _Requirements: 2.2, 2.3, 2.5, 5.5, 8.1_

- [x] 9. Create carbon free energy analytics component
  - Create `components/analytics/carbon-free-energy-analytics.tsx`
  - Display weighted average CFE percentage
  - Show regional breakdown
  - Show temporal trends chart
  - Include recommendations for failed KPIs (schedule workloads during high CFE periods)
  - Use shared components for status, trend, and metadata
  - _Requirements: 2.2, 2.3, 2.5, 2.11, 5.6, 8.1_

- [x] 10. Create renewable energy analytics component
  - Create `components/analytics/renewable-energy-analytics.tsx`
  - Display weighted average renewable percentage
  - Show energy source breakdown
  - Show regional comparison
  - Include recommendations for failed KPIs (migrate to regions with higher renewable energy)
  - Use shared components for status, trend, and metadata
  - _Requirements: 2.2, 2.3, 2.5, 2.11, 5.7, 8.1_

- [x] 11. Create electricity mix analytics component
  - Create `components/analytics/electricity-mix-analytics.tsx`
  - Display stacked area chart of energy sources over time
  - Show current mix breakdown
  - Show temporal trends
  - Include data source and temporal granularity information
  - Use shared components for status, trend, and metadata
  - _Requirements: 2.2, 2.3, 2.11, 5.8, 8.1_

- [x] 12. Create AI compute hours analytics component
  - Create `components/analytics/ai-compute-hours-analytics.tsx`
  - Display total compute hours metric
  - Show service breakdown
  - Show carbon intensity per compute hour
  - Include recommendations for failed KPIs (optimize training runs, use spot instances)
  - Use shared components for status, trend, and metadata
  - _Requirements: 2.2, 2.3, 2.5, 5.9, 8.1_

- [x] 13. Refactor analytics page to use new components
  - Update `app/(dashboard)/analytics/page.tsx`
  - Add refresh button at top that calls `refreshKPICalculationsAction()`
  - Fetch KPI analytics using `getKPIAnalyticsAction()`
  - Group KPIs by type
  - Render type-specific analytics components based on KPI type
  - Show loading states while fetching data
  - Show error states if fetching fails
  - Show empty state if no KPIs exist
  - Include lender context (borrower org name) when user is lender
  - _Requirements: 2.1, 2.2, 3.1, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 8.6, 8.7_

- [ ]\* 13.1 Write property test for KPI display completeness
  - **Property 10: KPI display completeness**
  - **Validates: Requirements 2.2**

- [ ]\* 13.2 Write property test for margin ratchet conditional display
  - **Property 12: Margin ratchet conditional display**
  - **Validates: Requirements 2.6**

- [ ]\* 13.3 Write property test for lender context display
  - **Property 18: Lender context display**
  - **Validates: Requirements 6.3**

- [ ]\* 13.4 Write property test for chart component rendering
  - **Property 21: Chart component rendering**
  - **Validates: Requirements 2.7, 8.5**

- [ ]\* 13.5 Write property test for error message display
  - **Property 22: Error message display**
  - **Validates: Requirements 3.5, 8.7**

- [x] 14. Remove or update existing KPI components in /kpis page
  - Review existing components in `components/kpis/` directory
  - Update components to use new calculation service if they have their own calculations
  - Ensure consistency between /kpis page and /analytics page
  - Remove any duplicate calculation logic
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Update existing analytics actions to use new service
  - Review `app/actions/co2e-analytics-actions.ts`
  - Review `app/actions/energy-analytics-actions.ts`
  - Review other analytics actions
  - Refactor to use centralized KPI calculator service
  - Remove duplicate calculation logic
  - _Requirements: 4.1, 4.2_

- [x] 17. Add loading and error states to all components
  - Ensure all analytics components show loading spinners while fetching data
  - Ensure all components display error messages on failure
  - Add retry functionality for failed operations
  - Use consistent loading and error UI patterns
  - _Requirements: 3.3, 3.5, 8.6, 8.7_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
