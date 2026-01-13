"use client";

import type { CarbonFreeEnergyData } from "@/app/actions/carbon-free-energy-analytics";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { match } from "ts-pattern";

interface CarbonFreeEnergyStatsProps {
  data: CarbonFreeEnergyData;
}

/**
 * Gets styling and content based on status level
 */
function getStatusConfig(status: "excellent" | "good" | "fair" | "poor"): {
  container: string;
  icon: React.ReactNode;
  title: string;
  message: string;
} {
  return match(status)
    .with("excellent", () => ({
      container: "bg-success/10 border-success/20",
      icon: <CheckCircle className="h-6 w-6 text-success" />,
      title: "Excellent Performance",
      message:
        "Your workloads are predominantly powered by carbon-free energy sources",
    }))
    .with("good", () => ({
      container: "bg-info/10 border-info/20",
      icon: <TrendingUp className="h-6 w-6 text-info" />,
      title: "Good Progress",
      message:
        "Majority of your workloads use carbon-free electricity. Consider optimizing further",
    }))
    .with("fair", () => ({
      container:
        "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800",
      icon: (
        <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
      ),
      title: "Room for Improvement",
      message:
        "Significant opportunity to increase carbon-free energy usage by migrating to cleaner regions",
    }))
    .with("poor", () => ({
      container:
        "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
      icon: <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />,
      title: "Action Required",
      message:
        "Priority: Migrate workloads to regions with higher carbon-free energy availability",
    }))
    .exhaustive();
}

export function CarbonFreeEnergyStats({ data }: CarbonFreeEnergyStatsProps) {
  const statusConfig = getStatusConfig(data.status);

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className={`p-6 border-2 ${statusConfig.container}`}>
        <div className="flex items-start gap-4">
          {statusConfig.icon}
          <div className="flex-1">
            <h4 className="font-heading text-lg font-semibold mb-1">
              {statusConfig.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {statusConfig.message}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Weighted Carbon-Free %
                </p>
                <p className="text-3xl font-bold">
                  {data.weightedCarbonFreePercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on CO2e distribution
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Emissions Analyzed
                </p>
                <p className="text-2xl font-semibold">
                  {data.totalCo2e.toFixed(3)} MTCO2e
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all regions
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Regions */}
        <Card className="p-6 shadow-soft">
          <h4 className="font-heading text-base font-semibold mb-4">
            Top Regions by Carbon-Free Energy
          </h4>
          <div className="space-y-3">
            {data.topRegions.map(({ region, carbonFreePercentage, co2e }) => (
              <div
                key={region}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium">{region}</p>
                  <p className="text-xs text-muted-foreground">
                    {co2e.toFixed(3)} MTCO2e
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {carbonFreePercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">carbon-free</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actionable Insights */}
        <Card className="p-6 shadow-soft">
          <h4 className="font-heading text-base font-semibold mb-4">
            Actionable Insights
          </h4>
          <div className="space-y-3">
            {data.weightedCarbonFreePercentage < 75 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-info/10">
                <TrendingUp className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-info-foreground">
                    Increase to{" "}
                    {Math.ceil(data.weightedCarbonFreePercentage / 10) * 10 +
                      10}
                    %
                  </p>
                  <p className="text-xs text-info/80 mt-1">
                    Migrate workloads to regions with higher carbon-free energy
                    percentages to improve your sustainability profile
                  </p>
                </div>
              </div>
            )}
            {data.status === "excellent" && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-success-foreground">
                    Maintain Excellence
                  </p>
                  <p className="text-xs text-success/80 mt-1">
                    Your carbon-free energy usage is excellent. Continue
                    prioritizing clean energy regions for new deployments
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Regional Optimization</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Focus on the top regions listed above for new workload
                  deployments to maximize carbon-free energy usage
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
