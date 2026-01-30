"use client";

import type { ElectricityMixDataPoint } from "@/app/actions/kpi/electricity-mix-analytics";
import { GenericTimelineChart, type TimelineConfig, type LineConfig } from "@/components/ui/generic-timeline-chart";
import { formatPercentage } from "@/lib/utils";
import { Zap } from "lucide-react";
import { formatMonth } from "../ui/chart-wrapper";

interface ElectricityMixTimelineChartProps {
  data: ElectricityMixDataPoint[];
}

export function ElectricityMixTimelineChart({
  data,
}: ElectricityMixTimelineChartProps) {
  const timelineData = data.map((d) => ({
    month: d.month,
    lines: {
      lowCarbon: d.lowCarbonShare,
      renewable: d.renewableShare,
      fossil: d.fossilShare,
    },
    isProjected: false,
  }));

  const avgLowCarbon =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.lowCarbonShare, 0) / data.length
      : 0;

  const config: TimelineConfig = {
    title: "Electricity Mix Timeline",
    description: "Energy source breakdown over time (Month over Month)",
    icon: Zap,
    iconColor: "text-warning",
    height: 400,
    yAxisFormatter: (value: number) => `${value}%`,
    showProjectionLine: false,
    showStats: true,
    stats: [
      {
        label: "Avg Low-Carbon",
        value: avgLowCarbon,
        formatter: formatPercentage,
      },
      {
        label: "Data Points",
        value: data.length,
      },
    ],
  };

  const lines: LineConfig[] = [
    {
      key: "lowCarbon",
      label: "Low-Carbon",
      color: "hsl(var(--chart-1))",
    },
    {
      key: "renewable",
      label: "Renewable",
      color: "hsl(var(--chart-4))",
    },
    {
      key: "fossil",
      label: "Fossil",
      color: "hsl(var(--chart-3))",
    },
  ];

  const tooltipFormatter = (
    value: number | undefined,
    lineKey: string,
  ): [string, string] => {
    const labels: Record<string, string> = {
      lowCarbon: "Low-Carbon",
      renewable: "Renewable",
      fossil: "Fossil",
    };
    return [formatPercentage(value), labels[lineKey] || lineKey];
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
