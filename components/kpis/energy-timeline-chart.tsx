"use client";

import { GenericTimelineChart, type TimelineConfig, type LineConfig } from "@/components/ui/generic-timeline-chart";
import { Zap } from "lucide-react";
import { formatMonth } from "../ui/chart-wrapper";

interface EnergyTimelineData {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

interface EnergyTimelineChartProps {
  data: EnergyTimelineData[];
}

function formatValue(value: number | undefined): string {
  if (value == null) return "N/A";
  return `${value.toFixed(2)} MWh`;
}

export function EnergyTimelineChart({ data }: EnergyTimelineChartProps) {
  const historicalData = data.filter((d) => !d.isProjected);
  const projectedData = data.filter((d) => d.isProjected);

  const timelineData = data.map((d) => ({
    month: d.month,
    lines: { energy: d.cumulative },
    isProjected: d.isProjected,
  }));

  const lastValue = historicalData[historicalData.length - 1]?.cumulative || 0;

  const config: TimelineConfig = {
    title: "Energy Consumption Timeline",
    description: `Cumulative energy consumption over time with ${projectedData.length}-month projection`,
    icon: Zap,
    iconColor: "text-warning",
    height: 400,
    yAxisFormatter: (value: number) => `${value} MWh`,
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
      key: "energy",
      label: "Actual Consumption",
      color: "hsl(var(--chart-1))",
    },
  ];

  const tooltipFormatter = (
    value: number | undefined,
    lineKey: string,
  ): [string, string] => {
    const label = lineKey === "energy" ? "Energy" : lineKey;
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
