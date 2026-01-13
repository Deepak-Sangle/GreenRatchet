"use client";

import type { DetailedKPIAnalytics } from "@/app/actions/kpi-analytics";
import { Card } from "@/components/ui/card";
import { Server, Zap } from "lucide-react";
import {
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

interface EnergyConsumptionAnalyticsProps {
  analytics: DetailedKPIAnalytics;
  className?: string;
}

export function EnergyConsumptionAnalytics({
  analytics,
  className,
}: EnergyConsumptionAnalyticsProps) {
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

  // Prepare service breakdown data
  const serviceData = calculationDetails?.breakdown?.byService
    ? Object.entries(calculationDetails.breakdown.byService)
        .map(([service, value]) => ({
          service,
          energy: value,
        }))
        .sort((a, b) => b.energy - a.energy)
        .slice(0, 10) // Top 10 services
    : [];

  // Calculate efficiency metrics (kWh per compute hour)
  // This would require compute hours data from the calculation details
  const totalEnergy = latestResult?.actualValue ?? 0;
  const computeHours =
    typeof calculationDetails?.inputs?.computeHours === "number"
      ? calculationDetails.inputs.computeHours
      : null;
  const efficiencyMetric =
    computeHours && computeHours > 0 ? totalEnergy / computeHours : null;

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
              Energy Consumption
            </h2>
            <p className="text-sm text-muted-foreground">
              Total energy usage from cloud operations
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
                Current Energy Usage
              </p>
              <p className="text-2xl font-semibold text-primary">
                {latestResult.actualValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-sm font-normal">kWh</span>
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
                <span className="text-sm font-normal">kWh</span>
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
                <span className="text-sm font-normal">kWh</span>
              </p>
            </div>
          </div>

          {/* Efficiency Metrics */}
          {efficiencyMetric !== null && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Energy Efficiency
                </p>
                <p className="text-xl font-semibold">
                  {efficiencyMetric.toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                  })}{" "}
                  <span className="text-sm font-normal">
                    kWh per compute hour
                  </span>
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
          title="Historical Energy Consumption Trend"
          yAxisLabel="Energy (kWh)"
        />
      )}

      {/* Service Breakdown */}
      {serviceData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">Energy by Service</h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={serviceData}
              layout="vertical"
              margin={{ left: 120, right: 20, top: 10, bottom: 10 }}
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
                dataKey="service"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                width={110}
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
