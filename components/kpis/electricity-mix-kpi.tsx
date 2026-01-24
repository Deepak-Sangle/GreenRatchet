"use client";

import {
  getElectricityMixDataAction,
  type ElectricityMixData,
} from "@/app/actions/kpi/electricity-mix-analytics";
import { BarChart3, ExternalLink } from "lucide-react";
import { BaseKpiCard } from "./base-kpi-card";
import { ElectricityMixStats } from "./electricity-mix-stats";
import { ElectricityMixTimelineChart } from "./electricity-mix-timeline-chart";

export function ElectricityMixKpi() {
  return (
    <BaseKpiCard<ElectricityMixData>
      title="Electricity Mix Breakdown"
      subtitle="Track energy source composition over time"
      icon={BarChart3}
      iconColor="text-indigo-600 dark:text-indigo-400"
      iconBgColor="bg-indigo-100 dark:bg-indigo-900/20"
      analyticsTitle="Electricity Mix Analysis"
      longDescription="Electricity mix breakdown tracks how cloud energy consumption is
              distributed across different energy sources—such as renewable,
              nuclear, and fossil-based electricity—over time. This KPI is
              significant because not all electricity has the same environmental
              impact, and changes in the energy mix directly influence both
              carbon emissions and broader ecosystem pressures from fuel
              extraction and combustion. It is calculated by mapping cloud
              workload energy use to region-specific electricity mix data
              provided by cloud providers or grid operators and expressing each
              source as a percentage of total energy consumption. A shift toward
              cleaner sources within the mix indicates structural
              decarbonisation rather than short-term optimisation. For lenders,
              this KPI provides transparency into energy dependency risks,
              enables trend-based assessment of sustainability progress, and
              supports confidence that emissions reductions are driven by
              lasting changes in the underlying power supply."
      fetchAction={getElectricityMixDataAction}
      renderAnalytics={(data) => (
        <div className="space-y-6">
          <ElectricityMixStats
            averages={data.averages}
            totalCo2e={data.totalCo2e}
          />
          <ElectricityMixTimelineChart data={data.timeline} />
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Data source: Electricity Maps</span>
              <a
                href="https://www.electricitymaps.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Learn more
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
      kpiType="ELECTRICITY_MIX_BREAKDOWN"
    />
  );
}
