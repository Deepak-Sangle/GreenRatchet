"use client";

import { getEnergyTimelineAction } from "@/app/actions/energy-analytics-actions";
import { createKpiComponent } from "@/lib/factories/kpi-component-factory";
import { Zap } from "lucide-react";
import { EnergyTimelineChart } from "./energy-timeline-chart";

interface EnergyTimelineData {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

export const EnergyConsumptionKpi = createKpiComponent<EnergyTimelineData[]>({
  config: {
    title: "Total Energy Consumption",
    description: "Cumulative energy usage over time",
    icon: Zap,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBgColor: "bg-amber-100 dark:bg-amber-900/20",
    explanationText: "Track your organization's total energy consumption from cloud infrastructure. This includes compute, storage, and networking energy usage across all connected cloud providers.",
  },
  fetchAction: getEnergyTimelineAction,
  metrics: [
    {
      label: "Current Total",
      getValue: (data) => {
        const latest = data[data.length - 1];
        return latest ? latest.cumulative.toFixed(1) : "0";
      },
      getUnit: () => "MWh",
      isHighlighted: () => true,
    },
    {
      label: "Historical Data Points",
      getValue: (data: EnergyTimelineData[]) => data.filter((d: EnergyTimelineData) => !d.isProjected).length,
    },
    {
      label: "Projected Data Points", 
      getValue: (data: EnergyTimelineData[]) => data.filter((d: EnergyTimelineData) => d.isProjected).length,
    },
  ],
  customContent: (data) => (
    <div className="pt-4 border-t">
      <h3 className="font-heading text-lg font-semibold mb-4">
        Energy Timeline
      </h3>
      <EnergyTimelineChart data={data} />
    </div>
  ),
  columns: 3,
});
