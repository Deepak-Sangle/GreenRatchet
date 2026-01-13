"use client";

import type { ElectricityMixDataPoint } from "@/app/actions/electricity-mix-analytics";
import { Card } from "@/components/ui/card";
import { chartPalettes, chartTheme } from "@/lib/utils/chart-colors";
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
import { TimelineTooltip } from "../ui/chart-tooltip";

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
          <CartesianGrid
            strokeDasharray={chartTheme.grid.strokeDasharray}
            stroke={chartTheme.grid.stroke}
          />
          <XAxis
            dataKey="month"
            className="text-xs"
            stroke={chartTheme.axis.stroke}
            fontSize={chartTheme.axis.fontSize}
            tickLine={chartTheme.axis.tickLine}
            axisLine={chartTheme.axis.axisLine}
          />
          <YAxis
            className="text-xs"
            stroke={chartTheme.axis.stroke}
            fontSize={chartTheme.axis.fontSize}
            tickLine={chartTheme.axis.tickLine}
            axisLine={chartTheme.axis.axisLine}
            label={{
              value: "Share (%)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <Tooltip content={<TimelineTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
            iconType="line"
            className="text-foreground"
          />
          <Area
            type="monotone"
            dataKey="Low-Carbon"
            stackId="1"
            stroke={chartPalettes.energyMix.lowCarbon}
            fill={chartPalettes.energyMix.lowCarbon}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Renewable"
            stackId="2"
            stroke={chartPalettes.energyMix.renewable}
            fill={chartPalettes.energyMix.renewable}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Fossil"
            stackId="3"
            stroke={chartPalettes.energyMix.fossil}
            fill={chartPalettes.energyMix.fossil}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
