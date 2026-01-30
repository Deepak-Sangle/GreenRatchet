"use client";

import type { RenewableEnergyData } from "@/app/actions/kpi/renewable-energy-analytics";
import {
  GenericPieChart,
  type GenericPieChartConfig,
  type PieDataPoint,
} from "@/components/ui/generic-pie-chart";

interface RenewableEnergyStatsProps {
  data: RenewableEnergyData;
}

export function RenewableEnergyStats({ data }: RenewableEnergyStatsProps) {
  const pieData: PieDataPoint[] = data.topRegions.map((region, index) => ({
    category: region.region,
    value: region.co2e,
    percentage: (region.co2e / data.totalCo2e) * 100,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
    label: `${region.region} (${region.renewablePercentage.toFixed(0)}% Renewable Energy)`,
  }));

  const config: GenericPieChartConfig = {
    title: "CO2e Distribution by Region (Renewable Energy %)",
    valueFormatter: (value: number) => `${value.toFixed(3)} MTCO2e`,
    height: 300,
    showInsights: true,
    insightTitle: "Regional Renewable Energy Insights",
    customInsights: [
      {
        status:
          data.weightedRenewablePercentage >= 70
            ? "good"
            : data.weightedRenewablePercentage >= 40
              ? "warning"
              : "alert",
        title: "Overall Performance",
        message: `Total CO2e: ${data.totalCo2e.toFixed(3)} MTCO2e across all regions with ${data.weightedRenewablePercentage.toFixed(1)}% weighted average renewable energy`,
      },
    ],
    insightRules: data.topRegions.slice(0, 3).map((region) => ({
      category: region.region,
      thresholds: {
        // Low allocation is good only if the %RE is low, else its bad
        good: (percentage: number) =>
          percentage <= 20 && region.renewablePercentage < 30, // Low CO2e allocation is good
        warning: (percentage: number) =>
          percentage <= 40 && region.renewablePercentage < 50, // Medium CO2e allocation is warning
      },
      messages: {
        good: (value: number) =>
          `Low impact with ${value.toFixed(3)} MTCO2e (${region.renewablePercentage.toFixed(1)}% renewable energy)`,
        warning: (value: number) =>
          `Moderate impact with ${value.toFixed(3)} MTCO2e (${region.renewablePercentage.toFixed(1)}% renewable energy)`,
        alert: (value: number) =>
          `High impact with ${value.toFixed(3)} MTCO2e (${region.renewablePercentage.toFixed(1)}% renewable energy) - consider migration`,
      },
    })),
  };

  return <GenericPieChart data={pieData} config={config} />;
}
