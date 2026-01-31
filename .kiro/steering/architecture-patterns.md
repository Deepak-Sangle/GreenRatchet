# Architecture Patterns

## Server Actions

All server actions use `withServerAction` wrapper:

- Handles authentication automatically
- Caches results for 5 minutes
- Returns `{ success: true, data }` or `{ error: string }`

## Database Query Patterns

### Aggregations

Use Prisma `groupBy` with `_sum`, `_count` instead of fetching all records:

```ts
prisma.cloudFootprint.groupBy({
  by: ["region"],
  _sum: { co2e: true, kilowattHours: true },
});
```

### Parallel Queries

Fetch independent data in parallel:

```ts
const [energyData, co2eData] = await Promise.all([
  prisma.cloudFootprint.groupBy({ ... }),
  prisma.cloudFootprint.aggregate({ ... }),
]);
```

### Batch Fetching (N+1 Prevention)

When you need related data for multiple items, fetch all at once:

1. Extract unique keys from main query
2. Fetch all related data in parallel with `Promise.all`
3. Build a lookup Map for O(1) access
4. Iterate main data using the Map

## Component Patterns

### KPI Cards

Use `BaseKpiCard` component with:

- `fetchAction` - server action to call
- `renderAnalytics` - render function for expanded view
- `kpiType` - enum value for the KPI

### Analytics Helpers

- `getDateRange(days)` - returns { startDate, endDate }
- `calculateAverage(numbers)` - safe average calculation
- `getTopN(items, selector, n)` - get top N items by value
- `getPercentageStatus(value)` - returns "good" | "warning" | "critical"

### Category Analytics (Pie Charts)

- `classifyByThresholds(value, lowThreshold, highThreshold)` - returns "low" | "medium" | "high"
- `buildPieData(categoryTotals, categories, options)` - builds pie chart data
- `buildCategoryStats(pieData)` - builds category statistics
