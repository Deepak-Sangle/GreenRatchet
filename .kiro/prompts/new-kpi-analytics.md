# New KPI Analytics Component

Create analytics visualization for an existing KPI.

## Types of Analytics

### Pie Chart (Category Distribution)

Use for low/medium/high categorization:

- `classifyByThresholds(value, lowThreshold, highThreshold)`
- `buildPieData(categoryTotals, categories, { valueFieldName })`
- `buildCategoryStats(pieData)`

### Timeline Chart

Use for trends over time:

- Group data by month using `formatToMonth`
- Use `GenericTimelineChart` component

### Stats Display

Use for simple metrics:

- Create a stats component showing key values
- Use `MetricCard` for individual metrics

## File Location

`components/kpis/{kpi-name}-{chart-type}.tsx`

## Pattern

```tsx
"use client";

import { type {KpiName}Data } from "@/app/actions/kpis/{kpi-name}";

interface Props {
  data: {KpiName}Data;
}

export function {KpiName}Stats({ data }: Props) {
  // Render visualization
}
```

## Integration

Pass to `renderAnalytics` in the KPI's BaseKpiCard:

```tsx
renderAnalytics={(data) => <{KpiName}Stats data={data} />}
```
