"use client";

import { GenericTimelineChart, type TimelineConfig, type LineConfig } from "@/components/ui/generic-timeline-chart";
import { Droplets } from "lucide-react";
import { formatMonth } from "../ui/chart-wrapper";

interface WaterTimelineData {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

interface WaterTimelineChartProps {
  data: WaterTimelineData[];
}

function formatValue(value: number | undefined): string {
  if (value == null) return "N/A";
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M L`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K L`;
  }
  return `${value.toFixed(2)} L`;
}

export function WaterTimelineChart({ data }: WaterTimelineChartProps) {
  const historicalData = data.filter((d) => !d.isProjected);
  const projectedData = data.filter((d) => d.isProjected);

  const timelineData = data.map((d) => ({
    month: d.month,
    lines: { water: d.cumulative },
    isProjected: d.isProjected,
  }));

  const lastValue = historicalData[historicalData.length - 1]?.cumulative || 0;

  const config: TimelineConfig = {
    title: "Water Withdrawal Timeline",
    description: `Cumulative water withdrawal over time with ${projectedData.length}-month projection`,
    icon: Droplets,
    iconColor: "text-info",
    height: 400,
    yAxisFormatter: formatValue,
    showProjectionLine: true,
    showStats: true,
    stats: [
      {
        label: "Current Total",
        value: lastValue,
        formatter: formatValue,
      },
      {
        label: "Projected Total (6mo)",
        value:
          projectedData.length > 0
            ? projectedData[projectedData.length - 1].cumulative
            : "N/A",
        formatter: (val: any) => (val === "N/A" ? val : formatValue(val)),
      },
    ],
  };

  const lines: LineConfig[] = [
    {
      key: "water",
      label: "Actual Withdrawal",
      color: "hsl(var(--chart-5))",
    },
  ];

  const tooltipFormatter = (
    value: number | undefined,
    lineKey: string,
  ): [string, string] => {
    const label = lineKey === "water" ? "Water" : lineKey;
    return [formatValue(value), label];
  };

  return (
    <GenericTimelineChart
      data={timelineData}
      config={config}
      lines={lines}
      xAxisFormatter={formatMonth}
      tooltipFormatter={tooltipFormatter}
    />
  );
}
