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
    color: "hsl(142, 76%, 36%)",
  },
  medium: {
    label: "Medium Carbon (150-400 gCO2/kWh)",
    color: "hsl(48, 96%, 53%)",
  },
  high: {
    label: "High Carbon (>400 gCO2/kWh)",
    color: "hsl(0, 84%, 60%)",
  },
} as const;

export function LowCarbonRegionPieChart({
  data,
}: LowCarbonRegionPieChartProps) {
  const chartData = data.map(({ category, co2e, percentage }) => ({
    name: CATEGORY_CONFIG[category].label,
    value: co2e,
    percentage: percentage.toFixed(1),
    fill: CATEGORY_CONFIG[category].color,
  }));

  return (
    <Card className="p-6 shadow-soft">
      <h4 className="font-heading text-base font-semibold mb-4">
        CO2e Distribution by Region Carbon Intensity
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
            formatter={(value: number | undefined) =>
              `${value?.toFixed(2)} MTCO2e`
            }
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
