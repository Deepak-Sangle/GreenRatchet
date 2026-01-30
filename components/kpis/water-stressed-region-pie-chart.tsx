"use client";

import {
  GenericPieChart,
  type GenericPieChartConfig,
  type PieDataPoint,
} from "@/components/ui/generic-pie-chart";

interface WaterStressedRegionPieChartProps {
  data: Array<{
    category: "low" | "medium" | "high";
    waterUsage: number;
    percentage: number;
  }>;
}

const configs = {
  low: {
    label: "Low Water Stress",
    color: "hsl(var(--pie-chart-1))",
  },
  medium: {
    label: "Medium Water Stress",
    color: "hsl(var(--pie-chart-2))",
  },
  high: {
    label: "High Water Stress",
    color: "hsl(var(--pie-chart-3))",
  },
};

export function WaterStressedRegionPieChart({
  data,
}: WaterStressedRegionPieChartProps) {
  const pieData: PieDataPoint[] = data.map((item) => ({
    category: item.category,
    value: item.waterUsage,
    percentage: item.percentage,
    color: configs[item.category].color,
    label: configs[item.category].label,
  }));

  const config: GenericPieChartConfig = {
    title: "Water Usage Distribution by Region Water Stress",
    valueFormatter: (value: number) => `${value.toFixed(2)} m³`,
    height: 300,
    showInsights: true,
    insightTitle: "Water Stress Distribution Insights",
    insightRules: [
      {
        category: "low",
        thresholds: {
          good: (percentage: number) => percentage >= 60,
          warning: (percentage: number) => percentage >= 30,
        },
        messages: {
          good: (value: number) =>
            `Excellent! ${value.toFixed(2)} m³ from water-abundant regions`,
          warning: (value: number) =>
            `${value.toFixed(2)} m³ in low-stress regions. Consider increasing this percentage`,
          alert: (value: number) =>
            `${value.toFixed(2)} m³ in low-stress regions. Significant improvement opportunity`,
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
            `Good balance. ${value.toFixed(2)} m³ can be optimized further`,
          warning: (value: number) =>
            `You can reduce impact by migrating ${value.toFixed(2)} m³ to low-stress regions`,
          alert: (value: number) =>
            `High opportunity: Migrate ${value.toFixed(2)} m³ to water-abundant regions`,
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
            `Minimal impact: ${value.toFixed(2)} m³ in water-stressed regions`,
          warning: (value: number) =>
            `Consider migrating ${value.toFixed(2)} m³ from water-stressed regions`,
          alert: (value: number) =>
            `Priority: Migrate ${value.toFixed(2)} m³ from regions with high water stress (risk level 4-5)`,
        },
      },
    ],
  };

  return <GenericPieChart data={pieData} config={config} />;
}
