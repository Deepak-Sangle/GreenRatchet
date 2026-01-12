"use client";

import { Card } from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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
    color: "hsl(200, 76%, 46%)",
  },
  medium: {
    label: "Medium Water Stress (2-3)",
    color: "hsl(48, 96%, 53%)",
  },
  high: {
    label: "High Water Stress (4-5)",
    color: "hsl(0, 84%, 60%)",
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
            formatter={(value: number | undefined) => `${value?.toFixed(2)} m³`}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "14px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
