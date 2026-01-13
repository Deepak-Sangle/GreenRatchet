"use client";

import { Card } from "@/components/ui/card";
import { chartPalettes } from "@/lib/utils/chart-colors";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChartTooltip } from "../ui/chart-tooltip";

interface WaterStressedRegionPieChartProps {
  data: Array<{
    category: "low" | "medium" | "high";
    waterUsage: number;
    percentage: number;
  }>;
}

const CATEGORY_CONFIG = {
  low: {
    label: "Low Water Stress (0-1)",
    color: chartPalettes.waterStress.low,
  },
  medium: {
    label: "Medium Water Stress (2-3)",
    color: chartPalettes.waterStress.medium,
  },
  high: {
    label: "High Water Stress (4-5)",
    color: chartPalettes.waterStress.high,
  },
} as const;

export function WaterStressedRegionPieChart({
  data,
}: WaterStressedRegionPieChartProps) {
  const chartData = data.map(({ category, waterUsage, percentage }) => ({
    name: CATEGORY_CONFIG[category].label,
    value: waterUsage,
    percentage: percentage.toFixed(1),
    fill: CATEGORY_CONFIG[category].color,
  }));

  return (
    <Card className="p-6 shadow-soft">
      <h4 className="font-heading text-base font-semibold mb-4">
        Water Usage Distribution by Region Water Stress
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => `${percent}%`}
            outerRadius={100}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            content={
              <PieChartTooltip
                valueFormatter={(value) => `${value.toFixed(2)} m³`}
              />
            }
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: "14px",
            }}
            className="text-foreground"
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
