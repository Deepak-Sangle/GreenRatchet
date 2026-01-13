"use client";

import type { DetailedKPIAnalytics } from "@/app/actions/kpi-analytics";
import { Card } from "@/components/ui/card";
import { Info, TrendingUp, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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

interface ElectricityMixAnalyticsProps {
  analytics: DetailedKPIAnalytics;
  className?: string;
}

export function ElectricityMixAnalytics({
  analytics,
  className,
}: ElectricityMixAnalyticsProps) {
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

  // Prepare current mix breakdown data
  const currentMixData = calculationDetails?.breakdown?.byEnergySource
    ? Object.entries(calculationDetails.breakdown.byEnergySource)
        .map(([source, percentage]) => ({
          source: source.charAt(0).toUpperCase() + source.slice(1),
          percentage,
        }))
        .sort((a, b) => b.percentage - a.percentage)
    : [];

  // Parse temporal trends from calculation steps if available
  const temporalTrends: Array<{
    time: string;
    [key: string]: string | number;
  }> = [];

  if (calculationDetails?.steps) {
    // Group steps by timestamp to build temporal data
    const timeMap = new Map<string, Record<string, number>>();

    calculationDetails.steps.forEach((step) => {
      // Parse steps like "  2024-01-15 12:00: wind=25.5%, solar=15.2%, ..."
      const timeMatch = step.match(/^\s+([\d-]+\s+[\d:]+):/);
      if (timeMatch) {
        const timestamp = timeMatch[1];
        const sourceMatches = step.matchAll(/(\w+)=([\d.]+)%/g);

        if (!timeMap.has(timestamp)) {
          timeMap.set(timestamp, {});
        }

        const dataPoint = timeMap.get(timestamp)!;
        for (const match of sourceMatches) {
          const source = match[1];
          const value = parseFloat(match[2]);
          dataPoint[source] = value;
        }
      }
    });

    // Convert map to array
    timeMap.forEach((sources, timestamp) => {
      const time = new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
      });
      temporalTrends.push({ time, ...sources });
    });
  }

  // Energy source colors for consistent visualization
  const energySourceColors: Record<string, string> = {
    wind: "hsl(200, 70%, 50%)",
    solar: "hsl(45, 100%, 50%)",
    hydro: "hsl(210, 80%, 60%)",
    nuclear: "hsl(280, 60%, 50%)",
    biomass: "hsl(120, 40%, 50%)",
    geothermal: "hsl(30, 70%, 50%)",
    coal: "hsl(0, 0%, 30%)",
    gas: "hsl(30, 50%, 40%)",
    oil: "hsl(20, 40%, 35%)",
    unknown: "hsl(0, 0%, 60%)",
  };

  // Get all unique energy sources from temporal trends
  const energySources = new Set<string>();
  temporalTrends.forEach((trend) => {
    Object.keys(trend).forEach((key) => {
      if (key !== "time") {
        energySources.add(key);
      }
    });
  });

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Electricity Mix Breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              Distribution of energy sources in the electricity grid
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
                Current Value
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
                  analytics.direction === "HIGHER_IS_BETTER"
                    ? latestResult.actualValue >= analytics.targetValue
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                    : latestResult.actualValue <= analytics.targetValue
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
              Weighted average electricity mix across all regions based on
              energy consumption
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
          title="Historical Electricity Mix Trend"
          yAxisLabel="Value (%)"
        />
      )}

      {/* Current Mix Breakdown */}
      {currentMixData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Current Electricity Mix
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Breakdown of energy sources in your current electricity grid mix
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentMixData.map((source) => (
              <div
                key={source.source}
                className="bg-muted/50 rounded-lg p-4 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        energySourceColors[source.source.toLowerCase()] ??
                        "hsl(var(--primary))",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {source.source}
                  </span>
                </div>
                <span className="text-xl font-semibold">
                  {source.percentage.toFixed(1)}
                  <span className="text-sm font-normal">%</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Temporal Trends - Stacked Area Chart */}
      {temporalTrends.length > 0 && energySources.size > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Electricity Mix Over Time
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Stacked area chart showing how energy sources vary over time. Use
            this data to identify optimal periods for different workload types.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={temporalTrends}
              margin={{ left: 10, right: 30, top: 10, bottom: 80 }}
            >
              <defs>
                {Array.from(energySources).map((source) => (
                  <linearGradient
                    key={source}
                    id={`gradient-${source}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={
                        energySourceColors[source] ?? "hsl(var(--primary))"
                      }
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        energySourceColors[source] ?? "hsl(var(--primary))"
                      }
                      stopOpacity={0.2}
                    />
                  </linearGradient>
                ))}
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
                  value: "Percentage (%)",
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
                formatter={(value: number | undefined, name?: string) => [
                  `${(value ?? 0).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}%`,
                  name ? name.charAt(0).toUpperCase() + name.slice(1) : "",
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={60}
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value: string) =>
                  value.charAt(0).toUpperCase() + value.slice(1)
                }
              />
              {Array.from(energySources).map((source) => (
                <Area
                  key={source}
                  type="monotone"
                  dataKey={source}
                  stackId="1"
                  stroke={energySourceColors[source] ?? "hsl(var(--primary))"}
                  fill={`url(#gradient-${source})`}
                  strokeWidth={1}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Data Source Information */}
      <Card className="p-6 bg-primary/5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-heading font-semibold">
              Data Source & Granularity
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">Source:</span>{" "}
                Electricity Maps API - Real-time grid electricity data
              </p>
              <p>
                <span className="font-medium text-foreground">
                  Temporal Granularity:
                </span>{" "}
                Hourly data aggregated across all regions
              </p>
              <p>
                <span className="font-medium text-foreground">
                  Calculation Method:
                </span>{" "}
                Weighted average based on regional energy consumption
              </p>
              <p className="mt-2 text-xs">
                The electricity mix shows the distribution of energy sources
                (renewable, nuclear, fossil fuels) in the grid. This data helps
                identify optimal times and regions for running workloads to
                maximize clean energy usage.
              </p>
            </div>
          </div>
        </div>
      </Card>

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
