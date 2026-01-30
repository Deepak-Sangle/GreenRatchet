"use client";

import { getCarbonFreeEnergyDataAction } from "@/app/actions/kpi/carbon-free-energy-analytics";
import { ExternalLink, Zap } from "lucide-react";
import { BaseKpiCard } from "../base-kpi-card";
import { CarbonFreeEnergyStats } from "../carbon-free-energy-pie-chart";

export function CarbonFreeEnergyKpi() {
  return (
    <BaseKpiCard
      title="Carbon-Free Energy %"
      subtitle="Track percentage of workloads powered by clean electricity"
      icon={Zap}
      iconColor="text-purple-600 dark:text-purple-400"
      iconBgColor="bg-purple-100 dark:bg-purple-900/20"
      analyticsTitle="Carbon-Free Energy Analysis"
      longDescription="Carbon-Free Energy (CFE) % measures the share of cloud workloads
              that are powered by electricity generated from carbon-free sources
              such as wind, solar, hydro, or nuclear. This KPI is significant
              because increasing the use of clean electricity directly reduces
              greenhouse gas emissions and supports the broader transition to
              low-carbon energy systems. It is typically calculated by matching
              cloud workload energy consumption with provider-reported
              carbon-free or renewable energy data on a regional or hourly
              basis, expressed as a percentage of total cloud energy use. An
              increase in CFE % indicates that workloads are increasingly
              aligned with cleaner grids or regions supported by renewable
              energy procurement. For lenders, this KPI demonstrates alignment
              with long-term decarbonisation pathways, reduces transition risk
              associated with fossil-fuel dependency, and provides confidence
              that emissions reductions are being achieved through structural
              changes rather than short-term measures."
      fetchAction={getCarbonFreeEnergyDataAction}
      renderAnalytics={(data) => (
        <>
          <CarbonFreeEnergyStats data={data} />
          <div className="mt-6 pt-4 border-t">
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
        </>
      )}
      kpiType="CARBON_FREE_ENERGY_PERCENTAGE"
    />
  );
}
