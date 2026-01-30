"use client";

import { GenericTimelineChart, type TimelineConfig, type LineConfig } from "@/components/ui/generic-timeline-chart";
import { formatPercentage } from "@/lib/utils";
import { Cpu } from "lucide-react";

interface AIUsageTimelineData {
  date: string;
  aiKwh: number;
  totalKwh: number;
  percentage: number;
  cumulativeAiKwh: number;
}

interface AIUsageTimelineChartProps {
  data: AIUsageTimelineData[];
  showCumulative?: boolean;
}

function formatEnergy(value: number | undefined): string {
  if (value == null) return "N/A";
  return `${value.toFixed(2)} kWh`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AIUsageTimelineChart({
  data,
  showCumulative = false,
}: AIUsageTimelineChartProps) {
  const timelineData = data.map((d) => ({
    month: d.date,
    lines: showCumulative
      ? { percentage: d.percentage, cumulative: d.cumulativeAiKwh }
      : { percentage: d.percentage, cumulative: null },
    isProjected: false,
  }));

  const totalAiEnergy = data.reduce((sum, d) => sum + d.aiKwh, 0);

  const config: TimelineConfig = {
    title: "AI Usage Timeline",
    description: `AI workload percentage over time${showCumulative ? " with cumulative energy" : ""}`,
    icon: Cpu,
    iconColor: "text-primary",
    height: 320,
    yAxisFormatter: (value: number) => `${value}%`,
    showProjectionLine: false,
    showStats: true,
    stats: [
      {
        label: "Current Period",
        value:
          data.length > 0
            ? `${formatDate(data[0]?.date)} - ${formatDate(data[data.length - 1]?.date)}`
            : "No data",
      },
      {
        label: "Total AI Energy",
        value: totalAiEnergy,
        formatter: formatEnergy,
      },
    ],
  };

  const lines: LineConfig[] = showCumulative
    ? [
        {
          key: "percentage",
          label: "AI Usage %",
          color: "hsl(var(--primary))",
        },
        {
          key: "cumulative",
          label: "Cumulative AI kWh",
          color: "hsl(var(--chart-2))",
        },
      ]
    : [
        {
          key: "percentage",
          label: "AI Usage %",
          color: "hsl(var(--primary))",
        },
      ];

  const tooltipFormatter = (
    value: number | undefined,
    lineKey: string,
  ): [string, string] => {
    if (lineKey === "percentage") {
      return [formatPercentage(value), "AI Usage"];
    }
    if (lineKey === "cumulative") {
      return [formatEnergy(value), "Cumulative"];
    }
    return [value?.toString() || "N/A", lineKey];
  };

  return (
    <GenericTimelineChart
      data={timelineData}
      config={config}
      lines={lines}
      xAxisFormatter={formatDate}
      tooltipFormatter={tooltipFormatter}
    />
  );
}
