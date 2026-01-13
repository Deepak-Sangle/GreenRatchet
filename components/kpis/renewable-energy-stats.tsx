"use client";

import type { RenewableEnergyData } from "@/app/actions/renewable-energy-analytics";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { match } from "ts-pattern";

interface RenewableEnergyStatsProps {
  data: RenewableEnergyData;
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
        "Your workloads are predominantly powered by renewable energy sources",
    }))
    .with("good", () => ({
      container: "bg-info/10 border-info/20",
      icon: <TrendingUp className="h-6 w-6 text-info" />,
      title: "Good Progress",
      message:
        "Majority of your workloads use renewable electricity. Consider optimizing further",
    }))
    .with("fair", () => ({
      container: "bg-warning/10 border-warning/20",
      icon: <AlertTriangle className="h-6 w-6 text-warning" />,
      title: "Room for Improvement",
      message:
        "Significant opportunity to increase renewable energy usage by migrating to cleaner regions",
    }))
    .with("poor", () => ({
      container: "bg-destructive/10 border-destructive/20",
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      title: "Action Required",
      message:
        "Priority: Migrate workloads to regions with higher renewable energy availability",
    }))
    .exhaustive();
}

export function RenewableEnergyStats({ data }: RenewableEnergyStatsProps) {
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
                  Weighted Renewable %
                </p>
                <p className="text-3xl font-bold">
                  {data.weightedRenewablePercentage.toFixed(1)}%
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
            Top Regions by Renewable Energy
          </h4>
          <div className="space-y-3">
            {data.topRegions.map(({ region, renewablePercentage, co2e }) => (
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
                    {renewablePercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">renewable</p>
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
            {data.weightedRenewablePercentage < 75 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-info/10">
                <TrendingUp className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Increase to{" "}
                    {Math.ceil(data.weightedRenewablePercentage / 10) * 10 + 10}
                    %
                  </p>
                  <p className="text-xs text-info/80 mt-1">
                    Migrate workloads to regions with higher renewable energy
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
                    Your renewable energy usage is excellent. Continue
                    prioritizing renewable energy regions for new deployments
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
                  deployments to maximize renewable energy usage
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
