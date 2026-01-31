# New KPI Implementation

Create a new KPI following the established pattern.

## Required Information

- KPI name and type (add to KpiType enum if needed)
- Data source (which tables/fields)
- Calculation logic
- Display format (percentage, number, etc.)

## Steps

### 1. Server Action (`app/actions/kpis/{kpi-name}.ts`)

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import { getOrganizationConnectionIds, buildCloudFootprintWhereClause } from "@/lib/services/cloud-data-service";
import { getDateRange } from "@/lib/utils/analytics-helpers";

export interface {KpiName}Data {
  // Define return type
}

export async function get{KpiName}DataAction() {
  return withServerAction(async (user) => {
    const { startDate, endDate } = getDateRange(30);
    const connectionIds = await getOrganizationConnectionIds(user.organizationId);

    // Use Prisma aggregations
    // Batch fetch related data
    // Return calculated data
  }, "get {kpi-name} data");
}
```

### 2. Component (`components/kpis/base/{kpi-name}-kpi.tsx`)

```tsx
"use client";

import { get{KpiName}DataAction } from "@/app/actions/kpis/{kpi-name}";
import { BaseKpiCard } from "../base-kpi-card";

export function {KpiName}Kpi() {
  return (
    <BaseKpiCard
      title="KPI Title"
      subtitle="Brief description"
      icon={IconComponent}
      fetchAction={get{KpiName}DataAction}
      renderAnalytics={(data) => <>{/* Analytics UI */}</>}
      kpiType="KPI_TYPE_ENUM"
    />
  );
}
```

### 3. Add to Dashboard

Import and add to the KPIs grid in the dashboard page.

## Checklist

- [ ] Server action uses `withServerAction`
- [ ] Uses Prisma aggregations (not in-memory)
- [ ] Batch fetches related data
- [ ] Component uses `BaseKpiCard`
- [ ] Types are explicit (no `any`)
- [ ] Works in dark mode
