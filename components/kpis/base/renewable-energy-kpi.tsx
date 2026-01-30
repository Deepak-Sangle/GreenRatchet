"use client";

import { getRenewableEnergyDataAction } from "@/app/actions/kpi/renewable-energy-analytics";
import { ExternalLink, Wind } from "lucide-react";
import { BaseKpiCard } from "../base-kpi-card";
import { RenewableEnergyStats } from "../renewable-energy-pie-chart";

export function RenewableEnergyKpi() {
  return (
    <BaseKpiCard
      title="Renewable Energy %"
      subtitle="Track percentage of workloads powered by renewable sources"
      icon={Wind}
      iconColor="text-cyan-600 dark:text-cyan-400"
      iconBgColor="bg-cyan-100 dark:bg-cyan-900/20"
      analyticsTitle="Renewable Energy Analysis"
      longDescription="Renewable Energy % measures the proportion of cloud workloads
              whose electricity consumption is matched with renewable energy
              sources such as wind, solar, or hydropower. This KPI matters
              because increasing renewable energy use reduces reliance on fossil
              fuels and lowers the lifecycle carbon emissions associated with
              digital infrastructure. It is generally calculated using cloud
              provider disclosures that allocate renewable energy procurement or
              certificates to regional workload energy consumption, expressed as
              a percentage of total cloud energy use. An increase in this metric
              indicates stronger alignment with clean-energy sourcing strategies
              and supports emissions reduction over time. For lenders, Renewable
              Energy % is a familiar and comparable indicator that signals
              progress toward net-zero commitments, while also providing
              assurance that cloud-related emissions are being addressed through
              verifiable energy sourcing mechanisms."
      fetchAction={getRenewableEnergyDataAction}
      renderAnalytics={(data) => (
        <>
          <RenewableEnergyStats data={data} />
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
      kpiType="RENEWABLE_ENERGY_PERCENTAGE"
    />
  );
}
