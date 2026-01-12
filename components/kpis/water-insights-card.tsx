"use client";

import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, TrendingDown } from "lucide-react";
import { match } from "ts-pattern";

interface WaterInsightsCardProps {
  categoryStats: {
    low: { percentage: number; waterUsage: number };
    medium: { percentage: number; waterUsage: number };
    high: { percentage: number; waterUsage: number };
  };
  totalWaterUsage: number;
}

type StatusLevel = "good" | "warning" | "alert";

/**
 * Determines status level for low water stress percentage
 * Good: >= 60%, Warning: 30-60%, Alert: < 30%
 */
function getLowWaterStressStatus(percentage: number): StatusLevel {
  if (percentage >= 60) return "good";
  if (percentage >= 30) return "warning";
  return "alert";
}

/**
 * Determines status level for medium water stress percentage
 * Good: <= 20%, Warning: 20-40%, Alert: > 40%
 */
function getMediumWaterStressStatus(percentage: number): StatusLevel {
  if (percentage <= 20) return "good";
  if (percentage <= 40) return "warning";
  return "alert";
}

/**
 * Determines status level for high water stress percentage
 * Good: <= 10%, Warning: 10-25%, Alert: > 25%
 */
function getHighWaterStressStatus(percentage: number): StatusLevel {
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
      container: "bg-blue-50 dark:bg-blue-900/10",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-100",
      description: "text-blue-700 dark:text-blue-300",
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

export function WaterInsightsCard({ categoryStats }: WaterInsightsCardProps) {
  const lowStatus = getLowWaterStressStatus(categoryStats.low.percentage);
  const mediumStatus = getMediumWaterStressStatus(
    categoryStats.medium.percentage
  );
  const highStatus = getHighWaterStressStatus(categoryStats.high.percentage);

  const lowClasses = getStatusClasses(lowStatus);
  const mediumClasses = getStatusClasses(mediumStatus);
  const highClasses = getStatusClasses(highStatus);

  return (
    <Card className="p-6 shadow-soft">
      <h4 className="font-heading text-base font-semibold mb-4">
        Water Stress Distribution Insights
      </h4>

      <div className="space-y-4">
        {/* Low Water Stress Stats */}
        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${lowClasses.container}`}
        >
          {getStatusIcon(lowStatus, lowClasses.icon)}
          <div className="flex-1">
            <p className={`text-sm font-medium ${lowClasses.title}`}>
              {categoryStats.low.percentage.toFixed(1)}% in Low Water Stress
              Regions
            </p>
            <p className={`text-xs ${lowClasses.description} mt-1`}>
              {match(lowStatus)
                .with(
                  "good",
                  () =>
                    `Excellent! ${categoryStats.low.waterUsage.toFixed(2)} m³ from water-abundant regions`
                )
                .with(
                  "warning",
                  () =>
                    `${categoryStats.low.waterUsage.toFixed(2)} m³ in low-stress regions. Consider increasing this percentage`
                )
                .with(
                  "alert",
                  () =>
                    `${categoryStats.low.waterUsage.toFixed(2)} m³ in low-stress regions. Significant improvement opportunity`
                )
                .exhaustive()}
            </p>
          </div>
        </div>

        {/* Medium Water Stress Warning */}
        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${mediumClasses.container}`}
        >
          {getStatusIcon(mediumStatus, mediumClasses.icon)}
          <div className="flex-1">
            <p className={`text-sm font-medium ${mediumClasses.title}`}>
              {categoryStats.medium.percentage.toFixed(1)}% in Medium Water
              Stress Regions
            </p>
            <p className={`text-xs ${mediumClasses.description} mt-1`}>
              {match(mediumStatus)
                .with(
                  "good",
                  () =>
                    `Good balance. ${categoryStats.medium.waterUsage.toFixed(2)} m³ can be optimized further`
                )
                .with(
                  "warning",
                  () =>
                    `You can reduce impact by migrating ${categoryStats.medium.waterUsage.toFixed(2)} m³ to low-stress regions`
                )
                .with(
                  "alert",
                  () =>
                    `High opportunity: Migrate ${categoryStats.medium.waterUsage.toFixed(2)} m³ to water-abundant regions`
                )
                .exhaustive()}
            </p>
          </div>
        </div>

        {/* High Water Stress Alert */}
        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${highClasses.container}`}
        >
          {getStatusIcon(highStatus, highClasses.icon)}
          <div className="flex-1">
            <p className={`text-sm font-medium ${highClasses.title}`}>
              {categoryStats.high.percentage.toFixed(1)}% in High Water Stress
              Regions
            </p>
            <p className={`text-xs ${highClasses.description} mt-1`}>
              {match(highStatus)
                .with(
                  "good",
                  () =>
                    `Minimal impact: ${categoryStats.high.waterUsage.toFixed(2)} m³ in water-stressed regions`
                )
                .with(
                  "warning",
                  () =>
                    `Consider migrating ${categoryStats.high.waterUsage.toFixed(2)} m³ from water-stressed regions`
                )
                .with(
                  "alert",
                  () =>
                    `Priority: Migrate ${categoryStats.high.waterUsage.toFixed(2)} m³ from regions with high water stress (risk level 4-5)`
                )
                .exhaustive()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
