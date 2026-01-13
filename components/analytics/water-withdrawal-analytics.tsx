"use client";

import type { DetailedKPIAnalytics } from "@/app/actions/kpi-analytics";
import { Card } from "@/components/ui/card";
import { getWUEForRegion } from "@/lib/constants/wue-data";
import { Droplets, MapPin } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  KPIStatusBadge,
  KPITrendIndicator,
  RecommendationCard,
  TimeSeriesChart,
} from "./shared";

interface WaterWithdrawalAnalyticsProps {
  analytics: DetailedKPIAnalytics;
  className?: string;
}

// Water-stressed regions based on WRI Aqueduct data
// Regions with WUE > 0.5 are considered water-stressed
const WATER_STRESSED_THRESHOLD = 0.5;

export function WaterWithdrawalAnalytics({
  analytics,
  className,
}: WaterWithdrawalAnalyticsProps) {
  const { latestResult, trend, calculationDetails, recommendations } =
    analytics;

  // Prepare time series data
  const timeSeriesData = analytics.historicalResults.map((result) => ({
    date: new Date(result.periodEnd).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    actualValue: result.actualValue,
    targetValue: result.targetValue,
  }));

  // Prepare regional breakdown data with WUE factors
  const regionalData = calculationDetails?.breakdown?.byRegion
    ? Object.entries(calculationDetails.breakdown.byRegion)
        .map(([region, value]) => {
          const wue = getWUEForRegion(region);
          return {
            region,
            waterUsage: value,
            wue,
            isWaterStressed: wue > WATER_STRESSED_THRESHOLD,
          };
        })
        .sort((a, b) => b.waterUsage - a.waterUsage)
        .slice(0, 10) // Top 10 regions
    : [];

  // Calculate water-stressed region analysis
  const totalWaterUsage = regionalData.reduce(
    (sum, item) => sum + item.waterUsage,
    0
  );
  const waterStressedUsage = regionalData
    .filter((item) => item.isWaterStressed)
    .reduce((sum, item) => sum + item.waterUsage, 0);
  const waterStressedPercentage =
    totalWaterUsage > 0 ? (waterStressedUsage / totalWaterUsage) * 100 : 0;

  // Prepare water-stressed region pie chart data
  const waterStressedData = [
    {
      name: "Water-Stressed Regions",
      value: waterStressedUsage,
      color: "hsl(var(--destructive))",
    },
    {
      name: "Non-Stressed Regions",
      value: totalWaterUsage - waterStressedUsage,
      color: "hsl(var(--primary))",
    },
  ];

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <Droplets className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Water Withdrawal
            </h2>
            <p className="text-sm text-muted-foreground">
              Total water usage from cloud data center operations
            </p>
          </div>
        </div>
        {latestResult && (
          <div className="flex items-center gap-3">
            <KPIStatusBadge status={latestResult.status as any} />
            {trend && (
              <KPITrendIndicator
                trend={trend.direction}
                percentageChange={trend.percentageChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Current Value Card */}
      {latestResult ? (
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Current Water Usage
              </p>
              <p className="text-2xl font-semibold text-primary">
                {latestResult.actualValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-sm font-normal">liters</span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Target</p>
              <p className="text-2xl font-semibold">
                <span className="text-base font-normal text-muted-foreground mr-1">
                  {analytics.direction === "LOWER_IS_BETTER" ? "≤" : "≥"}
                </span>
                {analytics.targetValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-sm font-normal">liters</span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Difference from Target
              </p>
              <p
                className={`text-2xl font-semibold ${
                  latestResult.actualValue <= analytics.targetValue
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {latestResult.actualValue > analytics.targetValue ? "+" : ""}
                {(
                  latestResult.actualValue - analytics.targetValue
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-sm font-normal">liters</span>
              </p>
            </div>
          </div>

          {/* Water-Stressed Region Summary */}
          {regionalData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Water Usage in Water-Stressed Regions
                </p>
                <p className="text-xl font-semibold">
                  {waterStressedPercentage.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                  %{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    (
                    {waterStressedUsage.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    liters)
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Regions with WUE &gt; {WATER_STRESSED_THRESHOLD} L/kWh are
                  considered water-stressed
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Period: {new Date(latestResult.periodStart).toLocaleDateString()}{" "}
              - {new Date(latestResult.periodEnd).toLocaleDateString()}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No calculation results available yet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Click the refresh button to calculate this KPI
            </p>
          </div>
        </Card>
      )}

      {/* Historical Trend */}
      {timeSeriesData.length > 0 && (
        <TimeSeriesChart
          data={timeSeriesData}
          title="Historical Water Withdrawal Trend"
          yAxisLabel="Water Usage (liters)"
        />
      )}

      {/* Water-Stressed Region Analysis */}
      {regionalData.length > 0 && waterStressedData[0].value > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Water-Stressed Region Analysis
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={waterStressedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  stroke="hsl(var(--border))"
                  strokeWidth={2}
                >
                  {waterStressedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                  formatter={(value: number | undefined) =>
                    `${(value ?? 0).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })} liters`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-3">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Water Usage
                </p>
                <p className="text-xl font-semibold">
                  {totalWaterUsage.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  liters
                </p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Water-Stressed Regions
                </p>
                <p className="text-xl font-semibold text-destructive">
                  {waterStressedUsage.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  liters
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {waterStressedPercentage.toFixed(1)}% of total
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Non-Stressed Regions
                </p>
                <p className="text-xl font-semibold text-primary">
                  {(totalWaterUsage - waterStressedUsage).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}{" "}
                  liters
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(100 - waterStressedPercentage).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Regional Breakdown with WUE Factors */}
      {regionalData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Water Usage by Region
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={regionalData}
              layout="vertical"
              margin={{ left: 100, right: 20, top: 10, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) =>
                  value.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })
                }
              />
              <YAxis
                dataKey="region"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
                formatter={(value: number | undefined) =>
                  `${(value ?? 0).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })} liters`
                }
                labelFormatter={(label, payload) => {
                  const item = payload[0]?.payload;
                  return item
                    ? `${label} (WUE: ${item.wue.toFixed(2)} L/kWh)`
                    : label;
                }}
              />
              <Bar dataKey="waterUsage" radius={[0, 4, 4, 0]}>
                {regionalData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isWaterStressed
                        ? "hsl(var(--destructive))"
                        : "hsl(var(--primary))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary" />
                <span className="text-muted-foreground">
                  Non-Stressed (WUE ≤ {WATER_STRESSED_THRESHOLD})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-destructive" />
                <span className="text-muted-foreground">
                  Water-Stressed (WUE &gt; {WATER_STRESSED_THRESHOLD})
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* WUE Factor Table */}
      {regionalData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold mb-4">
            Regional WUE Factors
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold">Region</th>
                  <th className="text-right py-2 px-3 font-semibold">
                    Water Usage
                  </th>
                  <th className="text-right py-2 px-3 font-semibold">
                    WUE (L/kWh)
                  </th>
                  <th className="text-center py-2 px-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {regionalData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-2 px-3">{item.region}</td>
                    <td className="text-right py-2 px-3">
                      {item.waterUsage.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      L
                    </td>
                    <td className="text-right py-2 px-3">
                      {item.wue.toFixed(2)}
                    </td>
                    <td className="text-center py-2 px-3">
                      {item.isWaterStressed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                          Water-Stressed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              WUE (Water Usage Effectiveness) measures liters of water used per
              kilowatt-hour of IT energy. Lower values indicate more
              water-efficient data centers.
            </p>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {latestResult?.status === "FAILED" && recommendations.length > 0 && (
        <RecommendationCard recommendations={recommendations} />
      )}

      {/* Calculation Details */}
      {calculationDetails && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold mb-4">
            Calculation Details
          </h3>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Formula</p>
              <p className="text-sm font-mono">{calculationDetails.formula}</p>
            </div>
            {Object.keys(calculationDetails.inputs).length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">Inputs</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(calculationDetails.inputs).map(
                    ([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-muted-foreground">{key}:</span>{" "}
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
