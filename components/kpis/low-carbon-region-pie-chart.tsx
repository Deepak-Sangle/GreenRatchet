"use client";

import {
  GenericPieChart,
  type GenericPieChartConfig,
  type PieDataPoint,
} from "@/components/ui/generic-pie-chart";

interface LowCarbonRegionPieChartProps {
  data: Array<{
    category: "low" | "medium" | "high";
    co2e: number;
    percentage: number;
  }>;
}

const CATEGORY_CONFIG = {
  low: {
    label: "Low Carbon (<150 gCO2/kWh)",
    color: "hsl(var(--pie-chart-1))",
  },
  medium: {
    label: "Medium Carbon (150-400 gCO2/kWh)",
    color: "hsl(var(--pie-chart-2))",
  },
  high: {
    label: "High Carbon (>400 gCO2/kWh)",
    color: "hsl(var(--pie-chart-3))",
  },
} as const;

export function LowCarbonRegionPieChart({
  data,
}: LowCarbonRegionPieChartProps) {
  const pieData: PieDataPoint[] = data.map((item) => ({
    category: item.category,
    value: item.co2e,
    percentage: item.percentage,
    color: CATEGORY_CONFIG[item.category].color,
    label: CATEGORY_CONFIG[item.category].label,
  }));

  const config: GenericPieChartConfig = {
    title: "CO2e Distribution by Region Carbon Intensity",
    valueFormatter: (value: number) => `${value.toFixed(2)} MTCO2e`,
    height: 300,
    showInsights: true,
    insightTitle: "Carbon Intensity Distribution Insights",
    insightRules: [
      {
        category: "low",
        thresholds: {
          good: (percentage: number) => percentage >= 70,
          warning: (percentage: number) => percentage >= 40,
        },
        messages: {
          good: (value: number) =>
            `Excellent! ${value.toFixed(2)} MTCO2e from low-carbon regions`,
          warning: (value: number) =>
            `${value.toFixed(2)} MTCO2e in low-carbon regions. Consider increasing this percentage`,
          alert: (value: number) =>
            `${value.toFixed(2)} MTCO2e in low-carbon regions. Significant improvement opportunity`,
        },
      },
      {
        category: "medium",
        thresholds: {
          good: (percentage: number) => percentage <= 20,
          warning: (percentage: number) => percentage <= 40,
        },
        messages: {
          good: (value: number) =>
            `Good balance. ${value.toFixed(2)} MTCO2e can be optimized further`,
          warning: (value: number) =>
            `Consider migrating ${value.toFixed(2)} MTCO2e to low-carbon regions`,
          alert: (value: number) =>
            `High opportunity: Migrate ${value.toFixed(2)} MTCO2e to low-carbon regions`,
        },
      },
      {
        category: "high",
        thresholds: {
          good: (percentage: number) => percentage <= 10,
          warning: (percentage: number) => percentage <= 25,
        },
        messages: {
          good: (value: number) =>
            `Minimal impact: ${value.toFixed(2)} MTCO2e in high-carbon regions`,
          warning: (value: number) =>
            `Consider migrating ${value.toFixed(2)} MTCO2e from high-carbon regions`,
          alert: (value: number) =>
            `Priority: Migrate ${value.toFixed(2)} MTCO2e from high-carbon regions (>400 gCO2/kWh)`,
        },
      },
    ],
  };

  return <GenericPieChart data={pieData} config={config} />;
}
