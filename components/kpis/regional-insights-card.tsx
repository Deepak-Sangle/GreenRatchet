"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { match } from "ts-pattern";

interface RegionalInsightsCardProps {
  categoryStats: {
    low: { percentage: number; co2e: number };
    medium: { percentage: number; co2e: number };
    high: { percentage: number; co2e: number };
  };
  totalCo2e: number;
}

type StatusLevel = "good" | "warning" | "alert";

/**
 * Determines status level for low carbon percentage
 * Good: >= 60%, Warning: 30-60%, Alert: < 30%
 */
function getLowCarbonStatus(percentage: number): StatusLevel {
  if (percentage >= 60) return "good";
  if (percentage >= 30) return "warning";
  return "alert";
}

/**
 * Determines status level for medium carbon percentage
 * Good: <= 20%, Warning: 20-40%, Alert: > 40%
 */
function getMediumCarbonStatus(percentage: number): StatusLevel {
  if (percentage <= 20) return "good";
  if (percentage <= 40) return "warning";
  return "alert";
}

/**
 * Determines status level for high carbon percentage
 * Good: <= 10%, Warning: 10-25%, Alert: > 25%
 */
function getHighCarbonStatus(percentage: number): StatusLevel {
  if (percentage <= 10) return "good";
  if (percentage <= 25) return "warning";
  return "alert";
}

/**
 * Gets styling classes based on status level
 */
function getStatusClasses(status: StatusLevel): {
  container: string;
  icon: string;
  title: string;
  description: string;
} {
  return match(status)
    .with("good", () => ({
      container: "bg-green-50 dark:bg-green-900/10",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-900 dark:text-green-100",
      description: "text-green-700 dark:text-green-300",
    }))
    .with("warning", () => ({
      container: "bg-yellow-50 dark:bg-yellow-900/10",
      icon: "text-yellow-600 dark:text-yellow-400",
      title: "text-yellow-900 dark:text-yellow-100",
      description: "text-yellow-700 dark:text-yellow-300",
    }))
    .with("alert", () => ({
      container: "bg-red-50 dark:bg-red-900/10",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-100",
      description: "text-red-700 dark:text-red-300",
    }))
    .exhaustive();
}

/**
 * Gets appropriate icon based on status level
 */
function getStatusIcon(status: StatusLevel, classes: string): React.ReactNode {
  return match(status)
    .with("good", () => (
      <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${classes}`} />
    ))
    .with("warning", () => (
      <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${classes}`} />
    ))
    .with("alert", () => (
      <TrendingDown className={`h-5 w-5 mt-0.5 flex-shrink-0 ${classes}`} />
    ))
    .exhaustive();
}

export function RegionalInsightsCard({
  categoryStats,
}: RegionalInsightsCardProps) {
  const lowStatus = getLowCarbonStatus(categoryStats.low.percentage);
  const mediumStatus = getMediumCarbonStatus(categoryStats.medium.percentage);
  const highStatus = getHighCarbonStatus(categoryStats.high.percentage);

  const lowClasses = getStatusClasses(lowStatus);
  const mediumClasses = getStatusClasses(mediumStatus);
  const highClasses = getStatusClasses(highStatus);

  return (
    <Card className="p-6 shadow-soft">
      <h4 className="font-heading text-base font-semibold mb-4">
        Regional Distribution Insights
      </h4>

      <div className="space-y-4">
        {/* Low Carbon Stats */}
        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${lowClasses.container}`}
        >
          {getStatusIcon(lowStatus, lowClasses.icon)}
          <div className="flex-1">
            <p className={`text-sm font-medium ${lowClasses.title}`}>
              {categoryStats.low.percentage.toFixed(1)}% in Low Carbon Regions
            </p>
            <p className={`text-xs ${lowClasses.description} mt-1`}>
              {match(lowStatus)
                .with(
                  "good",
                  () =>
                    `Excellent! ${categoryStats.low.co2e.toFixed(3)} MTCO2e from clean energy regions`
                )
                .with(
                  "warning",
                  () =>
                    `${categoryStats.low.co2e.toFixed(3)} MTCO2e in low-carbon regions. Consider increasing this percentage`
                )
                .with(
                  "alert",
                  () =>
                    `${categoryStats.low.co2e.toFixed(3)} MTCO2e in low-carbon regions. Significant improvement opportunity`
                )
                .exhaustive()}
            </p>
          </div>
        </div>

        {/* Medium Carbon Warning */}
        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${mediumClasses.container}`}
        >
          {getStatusIcon(mediumStatus, mediumClasses.icon)}
          <div className="flex-1">
            <p className={`text-sm font-medium ${mediumClasses.title}`}>
              {categoryStats.medium.percentage.toFixed(1)}% in Medium Carbon
              Regions
            </p>
            <p className={`text-xs ${mediumClasses.description} mt-1`}>
              {match(mediumStatus)
                .with(
                  "good",
                  () =>
                    `Good balance. ${categoryStats.medium.co2e.toFixed(3)} MTCO2e can be optimized further`
                )
                .with(
                  "warning",
                  () =>
                    `You can reduce ${categoryStats.medium.co2e.toFixed(3)} MTCO2e by migrating to low-carbon regions`
                )
                .with(
                  "alert",
                  () =>
                    `High opportunity: Migrate ${categoryStats.medium.co2e.toFixed(3)} MTCO2e to cleaner regions`
                )
                .exhaustive()}
            </p>
          </div>
        </div>

        {/* High Carbon Alert */}
        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${highClasses.container}`}
        >
          {getStatusIcon(highStatus, highClasses.icon)}
          <div className="flex-1">
            <p className={`text-sm font-medium ${highClasses.title}`}>
              {categoryStats.high.percentage.toFixed(1)}% in High Carbon Regions
            </p>
            <p className={`text-xs ${highClasses.description} mt-1`}>
              {match(highStatus)
                .with(
                  "good",
                  () =>
                    `Minimal impact: ${categoryStats.high.co2e.toFixed(3)} MTCO2e in high-carbon regions`
                )
                .with(
                  "warning",
                  () =>
                    `Consider migrating ${categoryStats.high.co2e.toFixed(3)} MTCO2e from high-carbon regions`
                )
                .with(
                  "alert",
                  () =>
                    `Priority: Migrate ${categoryStats.high.co2e.toFixed(3)} MTCO2e from regions with carbon intensity above 400 gCO2/kWh`
                )
                .exhaustive()}
            </p>
          </div>
        </div>

        {/* Link to Cloud Usage Map */}
        <div className="pt-4 border-t">
          <Link href="/cloud/usage">
            <Button variant="outline" className="w-full gap-2">
              View Regional Carbon Intensity Map
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            See detailed carbon intensity data for each region
          </p>
        </div>
      </div>
    </Card>
  );
}
