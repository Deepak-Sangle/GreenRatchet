"use client";

import type { ElectricityMixDataPoint } from "@/app/actions/electricity-mix-analytics";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ElectricityMixTimelineChartProps {
  data: ElectricityMixDataPoint[];
}

export function ElectricityMixTimelineChart({
  data,
}: ElectricityMixTimelineChartProps) {
  const chartData = data.map((point) => ({
    month: format(new Date(point.month + "-01"), "MMM yyyy"),
    "Low-Carbon": Number(point.lowCarbonShare.toFixed(2)),
    Fossil: Number(point.fossilShare.toFixed(2)),
    Renewable: Number(point.renewableShare.toFixed(2)),
  }));

  return (
    <Card className="p-6 shadow-soft">
      <h4 className="font-heading text-base font-semibold mb-4">
        Electricity Mix Timeline (Month over Month)
      </h4>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="month"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            label={{
              value: "Share (%)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number | undefined) => `${value?.toFixed(2)}%`}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
          <Area
            type="monotone"
            dataKey="Low-Carbon"
            stackId="1"
            stroke="hsl(142, 76%, 36%)"
            fill="hsl(142, 76%, 36%)"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Renewable"
            stackId="2"
            stroke="hsl(173, 58%, 39%)"
            fill="hsl(173, 58%, 39%)"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Fossil"
            stackId="3"
            stroke="hsl(0, 84%, 60%)"
            fill="hsl(0, 84%, 60%)"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
