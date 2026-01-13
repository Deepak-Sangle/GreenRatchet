"use client";

import type { DetailedKPIAnalytics } from "@/app/actions/kpi-analytics";
import { Card } from "@/components/ui/card";
import { MapPin, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

interface LowCarbonRegionAnalyticsProps {
  analytics: DetailedKPIAnalytics;
  className?: string;
}

export function LowCarbonRegionAnalytics({
  analytics,
  className,
}: LowCarbonRegionAnalyticsProps) {
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

  // Prepare regional breakdown data (regions in low-carbon category)
  const lowCarbonRegions = calculationDetails?.breakdown?.byRegion
    ? Object.entries(calculationDetails.breakdown.byRegion)
        .map(([region, energy]) => ({
          region,
          energy,
        }))
        .sort((a, b) => b.energy - a.energy)
    : [];

  // Calculate carbon intensity for each region from calculation steps
  const regionalCarbonIntensity: Array<{
    region: string;
    intensity: number;
    isLowCarbon: boolean;
  }> = [];

  if (calculationDetails?.steps) {
    const lowCarbonThreshold = 300;
    calculationDetails.steps.forEach((step) => {
      // Parse steps like "  us-east-1: 450.23 gCO2/kWh - 1234.56 kWh"
      const match = step.match(
        /^\s+([^:]+):\s+([\d.]+)\s+gCO2\/kWh(?:\s+\(LOW CARBON\))?\s+-\s+([\d.]+)\s+kWh/
      );
      if (match) {
        const region = match[1];
        const intensity = parseFloat(match[2]);
        const isLowCarbon = step.includes("(LOW CARBON)");
        regionalCarbonIntensity.push({ region, intensity, isLowCarbon });
      }
    });
  }

  // Sort by intensity for the map
  regionalCarbonIntensity.sort((a, b) => a.intensity - b.intensity);

  // Get low carbon threshold from inputs
  const lowCarbonThreshold =
    typeof calculationDetails?.inputs?.lowCarbonThreshold === "number"
      ? calculationDetails.inputs.lowCarbonThreshold
      : 150;

  // Generate migration recommendations based on carbon intensity data
  const migrationRecommendations: string[] = [];
  if (latestResult?.status === "FAILED" && regionalCarbonIntensity.length > 0) {
    const lowCarbonRegionsList = regionalCarbonIntensity
      .filter((r) => r.isLowCarbon)
      .slice(0, 5)
      .map((r) => `${r.region} (${r.intensity.toFixed(0)} gCO2/kWh)`);

    if (lowCarbonRegionsList.length > 0) {
      migrationRecommendations.push(
        `Consider migrating workloads to these low-carbon regions: ${lowCarbonRegionsList.join(", ")}`
      );
    }

    const highCarbonRegions = regionalCarbonIntensity
      .filter((r) => !r.isLowCarbon)
      .slice(-3)
      .map((r) => r.region);

    if (highCarbonRegions.length > 0) {
      migrationRecommendations.push(
        `Prioritize migrating workloads from high-carbon regions: ${highCarbonRegions.join(", ")}`
      );
    }

    migrationRecommendations.push(
      "Review regional carbon intensity data regularly as grid mix changes over time"
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
            <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Low Carbon Region Percentage
            </h2>
            <p className="text-sm text-muted-foreground">
              Percentage of compute hours in regions with low carbon intensity
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
                Current Percentage
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

          {/* Low Carbon Threshold Info */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Low Carbon Threshold
              </p>
              <p className="text-lg font-semibold">
                {lowCarbonThreshold}{" "}
                <span className="text-sm font-normal">gCO₂/kWh</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Regions below this threshold are considered low-carbon
              </p>
            </div>
          </div>

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
          title="Historical Low Carbon Region Percentage"
          yAxisLabel="Percentage (%)"
        />
      )}

      {/* Regional Carbon Intensity Map */}
      {regionalCarbonIntensity.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Regional Carbon Intensity
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Carbon intensity by region. Green bars indicate low-carbon regions
            (&lt; {lowCarbonThreshold} gCO₂/kWh).
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={regionalCarbonIntensity}
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
                label={{
                  value: "gCO₂/kWh",
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
                  })} gCO₂/kWh`,
                  "Carbon Intensity",
                ]}
              />
              <Bar dataKey="intensity" radius={[0, 4, 4, 0]}>
                {regionalCarbonIntensity.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isLowCarbon
                        ? "hsl(var(--primary))"
                        : "hsl(var(--destructive))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary" />
              <span className="text-muted-foreground">
                Low Carbon (&lt; {lowCarbonThreshold} gCO₂/kWh)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-destructive" />
              <span className="text-muted-foreground">
                High Carbon (≥ {lowCarbonThreshold} gCO₂/kWh)
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Low Carbon Regions Breakdown */}
      {lowCarbonRegions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">
              Energy in Low-Carbon Regions
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={lowCarbonRegions}
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
                  })} kWh`
                }
              />
              <Bar
                dataKey="energy"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Migration Recommendations */}
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
          </div>
        </Card>
      )}
    </div>
  );
}
