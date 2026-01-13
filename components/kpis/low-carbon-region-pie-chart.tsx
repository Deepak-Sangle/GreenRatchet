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
    color: chartPalettes.carbonIntensity.low,
  },
  medium: {
    label: "Medium Carbon (150-400 gCO2/kWh)",
    color: chartPalettes.carbonIntensity.medium,
  },
  high: {
    label: "High Carbon (>400 gCO2/kWh)",
    color: chartPalettes.carbonIntensity.high,
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
            content={
              <PieChartTooltip
                valueFormatter={(value) => `${value.toFixed(2)} MTCO2e`}
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
