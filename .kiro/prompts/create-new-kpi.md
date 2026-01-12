# How to Create a New KPI in GreenRatchet

This guide explains the step-by-step process to create a new KPI following the established patterns in the GreenRatchet codebase.

## Overview

A KPI implementation consists of 4 main parts:

1. **Service Layer** - Business logic for calculations
2. **Server Action** - API endpoint for data fetching
3. **Chart Component** - Data visualization (timeline/charts)
4. **KPI Component** - Main expandable UI component

## Step-by-Step Implementation

### 1. Create the Service Layer (`lib/services/`)

Create a service file for your KPI calculations:

```typescript
// lib/services/your-kpi-calculator.ts
import { prisma } from "@/lib/prisma";

/**
 * Calculate your KPI metric for an organization
 */
export async function calculateYourKPI(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  value: number;
  unit: string;
  // Add other relevant metrics
}> {
  // Get cloud connections
  const cloudConnections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { id: true },
  });

  const connectionIds = cloudConnections.map((c) => c.id);

  if (connectionIds.length === 0) {
    return { value: 0, unit: "your-unit" };
  }

  // Your calculation logic using Prisma aggregations
  const result = await prisma.cloudFootprint.aggregate({
    where: {
      cloudConnectionId: { in: connectionIds },
      periodStartDate: { gte: startDate },
      periodEndDate: { lte: endDate },
      // Add your specific filters
    },
    _sum: {
      // Your fields to sum
    },
  });

  // Process and return results
  return {
    value: result._sum.yourField || 0,
    unit: "your-unit",
  };
}

/**
 * Get timeline data for charts
 */
export async function getYourKPITimeline(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<
  Array<{
    date: string;
    value: number;
    cumulative: number;
  }>
> {
  // Similar pattern - get daily/monthly aggregated data
  // Return timeline data for charts
}
```

### 2. Create Server Action (`app/actions/`)

```typescript
// app/actions/your-kpi-analytics.ts
"use server";

import { withServerAction } from "@/lib/server-action-utils";
import {
  calculateYourKPI,
  getYourKPITimeline,
} from "@/lib/services/your-kpi-calculator";

export async function getYourKPIAnalytics() {
  return withServerAction(async (user) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // Last 30 days

    const [currentValue, timeline] = await Promise.all([
      calculateYourKPI(user.organizationId, startDate, endDate),
      getYourKPITimeline(user.organizationId, startDate, endDate),
    ]);

    return {
      currentValue,
      timeline,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }, "get your KPI analytics");
}
```

### 3. Create Chart Component (`components/kpis/`)

```typescript
// components/kpis/your-kpi-timeline-chart.tsx
"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface YourKPITimelineData {
  date: string;
  value: number;
  cumulative: number;
}

interface YourKPITimelineChartProps {
  data: YourKPITimelineData[];
}

export function YourKPITimelineChart({ data }: YourKPITimelineChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      month: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: item.value,
      cumulative: item.cumulative,
    }));
  }, [data]);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          {/* Standard chart configuration - copy from existing KPI charts */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="url(#gradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 4. Create Main KPI Component (`components/kpis/`)

```typescript
// components/kpis/your-kpi.tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, YourIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { YourKPITimelineChart } from "./your-kpi-timeline-chart";
import { getYourKPIAnalytics } from "@/app/actions/your-kpi-analytics";

export function YourKPI() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getYourKPIAnalytics();

      if ("error" in result) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !data && !loading) {
      fetchData();
    }
  }, [isExpanded, data, loading]);

  return (
    <Card className="p-6 shadow-soft transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:bg-muted/50 -m-6 p-6 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <YourIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Your KPI Name</h2>
            <p className="text-sm text-muted-foreground">
              Description of what this KPI measures
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-200">
          {loading && <Loading />}
          {error && <ErrorMessage message={error} onRetry={fetchData} />}
          {data && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                  <p className="text-2xl font-semibold text-primary">
                    {data.currentValue.value} {data.currentValue.unit}
                  </p>
                </div>
                {/* Add more metrics as needed */}
              </div>

              {/* Timeline Chart */}
              <div className="space-y-4">
                <h3 className="font-medium">Timeline</h3>
                <YourKPITimelineChart data={data.timeline} />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
```

### 5. Add to KPI Utils (if needed)

```typescript
// lib/utils.ts - Add to getKPIUnit function
.with("YOUR_KPI_TYPE", () => "your-unit")
```

### 6. Add to KPIs Page

```typescript
// app/(dashboard)/kpis/page.tsx
import { YourKPI } from "@/components/kpis/your-kpi";

// Add to the component list:
<YourKPI />
```

## Key Patterns to Follow

1. **Expandable UI**: All KPIs use the expandable card pattern
2. **Lazy Loading**: Data is only fetched when expanded
3. **Error Handling**: Always include loading states and error messages
4. **Consistent Styling**: Use the established design system
5. **Server Actions**: All data fetching through server actions
6. **Service Layer**: Business logic separated from UI components
7. **Type Safety**: Strong typing throughout the implementation

## Common Prisma Patterns

- Use `aggregate` for sum/count calculations
- Use `groupBy` for timeline data
- Always filter by `cloudConnectionId` and date ranges
- Use `select` over `include` for performance
- Handle empty connection arrays gracefully

## Testing Your KPI

1. Check TypeScript compilation: `npx tsc --noEmit`
2. Test the expandable UI behavior
3. Verify data loading and error states
4. Test with different date ranges
5. Ensure responsive design works

This pattern ensures consistency across all KPIs and makes the codebase maintainable and extensible.
