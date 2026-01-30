"use client";

import { GenericTimelineChart, type TimelineConfig, type LineConfig } from "@/components/ui/generic-timeline-chart";
import { Leaf } from "lucide-react";
import { formatMonth } from "../ui/chart-wrapper";

interface Co2eTimelineData {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

interface Co2eTimelineChartProps {
  data: Co2eTimelineData[];
}

function formatValue(value: number | undefined): string {
  if (value == null) return "N/A";
  return `${value.toFixed(2)} kg`;
}

export function Co2eTimelineChart({ data }: Co2eTimelineChartProps) {
  const historicalData = data.filter((d) => !d.isProjected);
  const projectedData = data.filter((d) => d.isProjected);

  const timelineData = data.map((d) => ({
    month: d.month,
    lines: { emissions: d.cumulative },
    isProjected: d.isProjected,
  }));

  const lastValue = historicalData[historicalData.length - 1]?.cumulative || 0;

  const config: TimelineConfig = {
    title: "CO₂e Emissions Timeline",
    description: `Cumulative emissions over time with ${projectedData.length}-month projection`,
    icon: Leaf,
    iconColor: "text-emerald-600",
    height: 400,
    yAxisFormatter: (value: number) => `${value} kg`,
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
      key: "emissions",
      label: "Actual Emissions",
      color: "hsl(var(--chart-1))",
    },
  ];

  const tooltipFormatter = (
    value: number | undefined,
    lineKey: string,
  ): [string, string] => {
    const label = lineKey === "emissions" ? "Emissions" : lineKey;
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
