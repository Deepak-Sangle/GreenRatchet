"use client";

import type { CarbonFreeEnergyData } from "@/app/actions/kpis/carbon-free-energy";
import {
  GenericPieChart,
  type GenericPieChartConfig,
  type PieDataPoint,
} from "@/components/ui/generic-pie-chart";

interface CarbonFreeEnergyStatsProps {
  data: CarbonFreeEnergyData;
}

export function CarbonFreeEnergyStats({ data }: CarbonFreeEnergyStatsProps) {
  const pieData: PieDataPoint[] = data.topRegions.map((region, index) => ({
    category: region.region,
    value: region.co2e,
    percentage: (region.co2e / data.totalCo2e) * 100,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
    label: `${region.region} (${region.carbonFreePercentage.toFixed(0)}% Carbon Free Energy)`,
  }));

  const config: GenericPieChartConfig = {
    title: "CO2e Distribution by Region (Carbon-Free Energy %)",
    valueFormatter: (value: number) => `${value.toFixed(3)} MTCO2e`,
    height: 300,
    showInsights: true,
    insightTitle: "Regional Carbon-Free Energy Insights",
    insightRules: data.topRegions.map((region) => ({
      category: region.region,
      thresholds: {
        // Low co2 allocation is good only if the carbon free is low
        good: (percentage: number) =>
          percentage <= 20 && region.carbonFreePercentage < 30, // Low CO2e allocation is good
        warning: (percentage: number) =>
          percentage <= 40 && region.carbonFreePercentage < 50, // Medium CO2e allocation is warning
      },
      messages: {
        good: (value: number) =>
          `${region.region}: Low impact with ${value.toFixed(3)} MTCO2e (${region.carbonFreePercentage.toFixed(1)}% carbon-free energy)`,
        warning: (value: number) =>
          `${region.region}: Moderate impact with ${value.toFixed(3)} MTCO2e (${region.carbonFreePercentage.toFixed(1)}% carbon-free energy)`,
        alert: (value: number) =>
          `${region.region}: High impact with ${value.toFixed(3)} MTCO2e (${region.carbonFreePercentage.toFixed(1)}% carbon-free energy) - consider migration`,
      },
    })),
    customInsights: [
      {
        status:
          data.weightedCarbonFreePercentage >= 75
            ? "good"
            : data.weightedCarbonFreePercentage >= 40
              ? "warning"
              : "alert",
        title: "Overall Performance",
        message: `Total CO2e: ${data.totalCo2e.toFixed(3)} MTCO2e across all regions with ${data.weightedCarbonFreePercentage.toFixed(1)}% weighted average carbon-free energy`,
      },
    ],
  };

  return <GenericPieChart data={pieData} config={config} />;
}
