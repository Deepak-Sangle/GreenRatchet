"use client";

import type { DetailedKPIAnalytics } from "@/app/actions/kpi-analytics";
import { Card } from "@/components/ui/card";
import { Factory, TrendingDown, Users } from "lucide-react";
import {
  KPIStatusBadge,
  KPITrendIndicator,
  RecommendationCard,
  TimeSeriesChart,
} from "./shared";

interface GhgIntensityAnalyticsProps {
  analytics: DetailedKPIAnalytics;
  className?: string;
}

export function GhgIntensityAnalytics({
  analytics,
  className,
}: GhgIntensityAnalyticsProps) {
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

  // Extract employee count and revenue from calculation details
  const employeeCount =
    typeof calculationDetails?.inputs?.employeeCount === "number"
      ? calculationDetails.inputs.employeeCount
      : null;

  const annualRevenue =
    typeof calculationDetails?.inputs?.annualRevenue === "number"
      ? calculationDetails.inputs.annualRevenue
      : null;

  const totalCo2e =
    typeof calculationDetails?.inputs?.totalCo2eMT === "number"
      ? calculationDetails.inputs.totalCo2eMT
      : null;

  // Calculate intensity metrics
  const intensityPerEmployee =
    employeeCount && employeeCount > 0 && totalCo2e
      ? totalCo2e / employeeCount
      : null;

  const intensityPerRevenue =
    annualRevenue && annualRevenue > 0 && totalCo2e
      ? (totalCo2e / annualRevenue) * 1000000
      : null;

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <Factory className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              GHG Intensity
            </h2>
            <p className="text-sm text-muted-foreground">
              Greenhouse gas emissions per employee and per revenue
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
                Current Intensity
              </p>
              <p className="text-2xl font-semibold text-primary">
                {latestResult.actualValue.toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}{" "}
                <span className="text-sm font-normal">
                  {analytics.direction === "LOWER_IS_BETTER"
                    ? "tCO₂e/employee"
                    : "tCO₂e/$M"}
                </span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Target</p>
              <p className="text-2xl font-semibold">
                <span className="text-base font-normal text-muted-foreground mr-1">
                  {analytics.direction === "LOWER_IS_BETTER" ? "≤" : "≥"}
                </span>
                {analytics.targetValue.toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}{" "}
                <span className="text-sm font-normal">
                  {analytics.direction === "LOWER_IS_BETTER"
                    ? "tCO₂e/employee"
                    : "tCO₂e/$M"}
                </span>
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
                  maximumFractionDigits: 3,
                })}
              </p>
            </div>
          </div>

          {/* Breakdown Metrics */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium mb-4">Intensity Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Per Employee */}
              {intensityPerEmployee !== null && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Per Employee
                    </p>
                  </div>
                  <p className="text-xl font-semibold">
                    {intensityPerEmployee.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    })}{" "}
                    <span className="text-sm font-normal">tCO₂e/employee</span>
                  </p>
                  {employeeCount && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {employeeCount.toLocaleString()} employees
                    </p>
                  )}
                </div>
              )}

              {/* Per Revenue */}
              {intensityPerRevenue !== null && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Per Revenue</p>
                  </div>
                  <p className="text-xl font-semibold">
                    {intensityPerRevenue.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    })}{" "}
                    <span className="text-sm font-normal">tCO₂e/$M</span>
                  </p>
                  {annualRevenue && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on ${(annualRevenue / 1000000).toLocaleString()}M
                      annual revenue
                    </p>
                  )}
                </div>
              )}

              {/* Total Emissions */}
              {totalCo2e !== null && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Total Emissions
                  </p>
                  <p className="text-xl font-semibold">
                    {totalCo2e.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className="text-sm font-normal">
                      metric tons CO₂e
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Period: {new Date(latestResult.periodStart).toLocaleDateString()}{" "}
              - {new Date(latestResult.periodEnd).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              GHG intensity normalizes emissions by company size, enabling fair
              comparisons across organizations
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
          title="Historical GHG Intensity Trend"
          yAxisLabel="Intensity"
        />
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
              <p className="text-xs text-muted-foreground mb-1">
                Normalization
              </p>
              <p className="text-sm">
                GHG intensity is calculated by dividing total emissions by
                either employee count or annual revenue, providing a normalized
                metric for comparison.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
