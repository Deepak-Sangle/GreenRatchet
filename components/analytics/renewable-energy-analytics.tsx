"use client";

import type { DetailedKPIAnalytics } from "@/app/actions/kpi-analytics";
import { Card } from "@/components/ui/card";
import { MapPin, PieChart as PieChartIcon, Wind } from "lucide-react";
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

interface RenewableEnergyAnalyticsProps {
  analytics: DetailedKPIAnalytics;
  className?: string;
}

export function RenewableEnergyAnalytics({
  analytics,
  className,
}: RenewableEnergyAnalyticsProps) {
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
        .map(([region, renewablePercentage]) => ({
          region,
          renewablePercentage,
        }))
        .sort((a, b) => b.renewablePercentage - a.renewablePercentage)
        .slice(0, 10) // Top 10 regions
    : [];

  // Prepare energy source breakdown data
  const energySourceData = calculationDetails?.breakdown?.byEnergySource
    ? Object.entries(calculationDetails.breakdown.byEnergySource)
        .filter(([source]) =>
          ["wind", "solar", "hydro", "biomass", "geothermal"].includes(
            source.toLowerCase()
          )
        )
        .map(([source, percentage]) => ({
          source: source.charAt(0).toUpperCase() + source.slice(1),
          percentage,
        }))
        .sort((a, b) => b.percentage - a.percentage)
    : [];

  // Colors for energy sources
  const energySourceColors: Record<string, string> = {
    Wind: "hsl(200, 70%, 50%)",
    Solar: "hsl(45, 100%, 50%)",
    Hydro: "hsl(210, 80%, 60%)",
    Biomass: "hsl(120, 40%, 50%)",
    Geothermal: "hsl(30, 70%, 50%)",
  };

  // Generate migration recommendations based on regional data
  const migrationRecommendations: string[] = [];
  if (latestResult?.status === "FAILED" && regionalData.length > 0) {
    // Find top 3 regions with highest renewable energy
    const topRegions = regionalData.slice(0, 3);

    if (topRegions.length > 0) {
      const regionList = topRegions
        .map(
          (r) => `${r.region} (${r.renewablePercentage.toFixed(1)}% renewable)`
        )
        .join(", ");
      migrationRecommendations.push(
        `Consider migrating workloads to regions with higher renewable energy: ${regionList}`
      );
    }

    migrationRecommendations.push(
      "Prioritize regions with strong wind and solar generation capacity"
    );
    migrationRecommendations.push(
      "Review regional renewable energy trends to identify optimal deployment locations"
    );
  }

  // Combine with general recommendations
  const allRecommendations = [...migrationRecommendations, ...recommendations];

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <Wind className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Renewable Energy Percentage
            </h2>
            <p className="text-sm text-muted-foreground">
              Weighted average percentage of renewable energy in the grid
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
                Current Renewable Percentage
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
              Renewable energy includes wind, solar, hydro, biomass, and
              geothermal sources
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
          title="Historical Renewable Energy Trend"
          yAxisLabel="Renewable Percentage (%)"
        />
      )}

      {/* Energy Source Breakdown */}
      {energySourceData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Renewable Energy Source Breakdown
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Distribution of renewable energy sources in your grid mix
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={energySourceData}
                  dataKey="percentage"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  labelLine={true}
                >
                  {energySourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        energySourceColors[entry.source] ??
                        "hsl(var(--primary))"
                      }
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string, entry: any) =>
                    `${value}: ${entry.payload.percentage.toFixed(1)}%`
                  }
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
                    "Percentage",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              <p className="text-sm font-medium">Energy Source Details</p>
              {energySourceData.map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          energySourceColors[source.source] ??
                          "hsl(var(--primary))",
                      }}
                    />
                    <span className="text-sm">{source.source}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {source.percentage.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Regional Comparison */}
      {regionalData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Renewable Energy by Region
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Weighted average renewable energy percentage for each region based
            on energy consumption
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
                  value: "Renewable %",
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
                  "Renewable Percentage",
                ]}
              />
              <Bar
                dataKey="renewablePercentage"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
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
                Grid renewable energy data from Electricity Maps API
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
