"use client";

import type { DetailedKPIAnalytics } from "@/app/actions/kpi-analytics";
import { Card } from "@/components/ui/card";
import { AWS_WATER_STRESS_BY_REGION } from "@/lib/constants";
import { Droplets, MapPin } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

interface WaterStressedRegionAnalyticsProps {
  analytics: DetailedKPIAnalytics;
  className?: string;
}

export function WaterStressedRegionAnalytics({
  analytics,
  className,
}: WaterStressedRegionAnalyticsProps) {
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

  // Prepare regional breakdown data with water stress levels
  const regionalData = calculationDetails?.breakdown?.byRegion
    ? Object.entries(calculationDetails.breakdown.byRegion)
        .map(([region, waterUsage]) => {
          const waterStressLevel =
            AWS_WATER_STRESS_BY_REGION[
              region as keyof typeof AWS_WATER_STRESS_BY_REGION
            ] ?? 3;

          let category: "Low" | "Medium" | "High";
          if (waterStressLevel <= 1) {
            category = "Low";
          } else if (waterStressLevel <= 3) {
            category = "Medium";
          } else {
            category = "High";
          }

          return {
            region,
            waterUsage,
            waterStressLevel,
            category,
          };
        })
        .sort((a, b) => b.waterUsage - a.waterUsage)
        .slice(0, 10) // Top 10 regions
    : [];

  // Calculate category totals for pie chart
  const categoryTotals = regionalData.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.waterUsage;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalWaterUsage = Object.values(categoryTotals).reduce(
    (sum, val) => sum + val,
    0
  );

  const pieData = Object.entries(categoryTotals).map(([category, value]) => ({
    category,
    value,
    percentage: totalWaterUsage > 0 ? (value / totalWaterUsage) * 100 : 0,
  }));

  // Colors for water stress categories
  const categoryColors: Record<string, string> = {
    Low: "hsl(var(--primary))",
    Medium: "hsl(45, 100%, 50%)",
    High: "hsl(var(--destructive))",
  };

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
              Water Stressed Region Percentage
            </h2>
            <p className="text-sm text-muted-foreground">
              Percentage of water usage in water-stressed regions
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
                Water Stressed Percentage
              </p>
              <p className="text-2xl font-semibold text-primary">
                {latestResult.actualValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
                <span className="text-sm font-normal">%</span>
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
                })}
                <span className="text-sm font-normal">%</span>
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
                })}
                <span className="text-sm font-normal">%</span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Period: {new Date(latestResult.periodStart).toLocaleDateString()}{" "}
              - {new Date(latestResult.periodEnd).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Water stress levels based on WRI Aqueduct data: Low (0-1), Medium
              (1-3), High (3-5)
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
          title="Historical Water Stressed Region Percentage"
          yAxisLabel="Percentage (%)"
        />
      )}

      {/* Water Stress Category Breakdown */}
      {pieData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Water Usage by Stress Category
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.category}: ${entry.percentage.toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  stroke="hsl(var(--border))"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[entry.category]}
                    />
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-3">
              {pieData.map((item) => (
                <div key={item.category} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: categoryColors[item.category] }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {item.category} Water Stress
                    </p>
                  </div>
                  <p className="text-xl font-semibold">
                    {item.value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    liters
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.percentage.toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Regional Breakdown with Water Stress Levels */}
      {regionalData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Water Usage by Region
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Regions colored by water stress level (Low, Medium, High)
          </p>
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
                    ? `${label} (Stress Level: ${item.waterStressLevel})`
                    : label;
                }}
              />
              <Bar dataKey="waterUsage" radius={[0, 4, 4, 0]}>
                {regionalData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categoryColors[entry.category]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary" />
              <span className="text-muted-foreground">Low Stress (0-1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: categoryColors.Medium }}
              />
              <span className="text-muted-foreground">Medium Stress (1-3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-destructive" />
              <span className="text-muted-foreground">High Stress (3-5)</span>
            </div>
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
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Data Source</p>
              <p className="text-sm">
                Water stress levels from WRI Aqueduct database, combined with
                regional water usage data
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
