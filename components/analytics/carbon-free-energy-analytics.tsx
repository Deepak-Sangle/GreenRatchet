"use client";

import type { DetailedKPIAnalytics } from "@/app/actions/kpi-analytics";
import { Card } from "@/components/ui/card";
import { Leaf, MapPin, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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

interface CarbonFreeEnergyAnalyticsProps {
  analytics: DetailedKPIAnalytics;
  className?: string;
}

export function CarbonFreeEnergyAnalytics({
  analytics,
  className,
}: CarbonFreeEnergyAnalyticsProps) {
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

  // Prepare regional breakdown data
  const regionalData = calculationDetails?.breakdown?.byRegion
    ? Object.entries(calculationDetails.breakdown.byRegion)
        .map(([region, cfePercentage]) => ({
          region,
          cfePercentage,
        }))
        .sort((a, b) => b.cfePercentage - a.cfePercentage)
        .slice(0, 10) // Top 10 regions
    : [];

  // Parse temporal trends from calculation steps if available
  const temporalTrends: Array<{ time: string; cfe: number }> = [];
  if (calculationDetails?.steps) {
    calculationDetails.steps.forEach((step) => {
      // Parse steps like "  2024-01-15 12:00: 75.5% CFE"
      const match = step.match(/^\s+([\d-]+\s+[\d:]+):\s+([\d.]+)%\s+CFE/);
      if (match) {
        const time = new Date(match[1]).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
        });
        const cfe = parseFloat(match[2]);
        temporalTrends.push({ time, cfe });
      }
    });
  }

  // Generate scheduling recommendations based on temporal trends
  const schedulingRecommendations: string[] = [];
  if (latestResult?.status === "FAILED" && temporalTrends.length > 0) {
    // Find peak CFE periods
    const sortedByCFE = [...temporalTrends].sort((a, b) => b.cfe - a.cfe);
    const peakPeriods = sortedByCFE.slice(0, 3);

    if (peakPeriods.length > 0) {
      const peakTimes = peakPeriods.map(
        (p) => `${p.time} (${p.cfe.toFixed(1)}% CFE)`
      );
      schedulingRecommendations.push(
        `Schedule flexible workloads during high CFE periods: ${peakTimes.join(", ")}`
      );
    }

    schedulingRecommendations.push(
      "Implement time-shifting for batch workloads to align with peak carbon-free energy availability"
    );
    schedulingRecommendations.push(
      "Monitor hourly CFE data to identify optimal execution windows for non-urgent tasks"
    );
  }

  // Combine with general recommendations
  const allRecommendations = [...schedulingRecommendations, ...recommendations];

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Carbon-Free Energy Percentage
            </h2>
            <p className="text-sm text-muted-foreground">
              Weighted average percentage of carbon-free energy in the grid
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
                Current CFE Percentage
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
                  latestResult.actualValue >= analytics.targetValue
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
              Carbon-free energy includes nuclear, renewable, and other
              zero-emission sources
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
          title="Historical Carbon-Free Energy Trend"
          yAxisLabel="CFE Percentage (%)"
        />
      )}

      {/* Regional Breakdown */}
      {regionalData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Carbon-Free Energy by Region
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Weighted average CFE percentage for each region based on energy
            consumption
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
                domain={[0, 100]}
                label={{
                  value: "CFE %",
                  position: "insideBottom",
                  offset: -5,
                  style: {
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                  },
                }}
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
                formatter={(value: number | undefined) => [
                  `${(value ?? 0).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}%`,
                  "CFE Percentage",
                ]}
              />
              <Bar
                dataKey="cfePercentage"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Temporal Trends Chart */}
      {temporalTrends.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">Temporal CFE Trends</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Carbon-free energy availability over time. Use this data to schedule
            flexible workloads during peak CFE periods.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={temporalTrends}
              margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="cfeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
                label={{
                  value: "CFE %",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                  },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
                formatter={(value: number | undefined) => [
                  `${(value ?? 0).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}%`,
                  "CFE",
                ]}
              />
              <Area
                type="monotone"
                dataKey="cfe"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#cfeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recommendations */}
      {latestResult?.status === "FAILED" && allRecommendations.length > 0 && (
        <RecommendationCard recommendations={allRecommendations} />
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
                Grid carbon-free energy data from Electricity Maps API
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Weighted by regional energy consumption
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
