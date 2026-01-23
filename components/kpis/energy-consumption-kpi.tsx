"use client";

import { getEnergyTimelineAction } from "@/app/actions/kpi/energy-analytics-actions";
import { Zap } from "lucide-react";
import { BaseKpiCard } from "./base-kpi-card";
import { EnergyTimelineChart } from "./energy-timeline-chart";

export function EnergyConsumptionKpi() {
  return (
    <BaseKpiCard
      title="Total Energy Consumption"
      subtitle="Track energy usage from cloud operations"
      icon={Zap}
      iconColor="text-amber-600 dark:text-amber-400"
      iconBgColor="bg-amber-100 dark:bg-amber-900/20"
      longDescription="Total energy consumption tracks the amount of electricity used to
              run an organisation’s cloud workloads over a given period,
              typically measured in kilowatt-hours (kWh). This KPI matters
              because energy use is the primary driver of both carbon emissions
              and wider environmental impacts associated with data centres,
              including pressure on power grids and upstream resource
              extraction. It is calculated by converting cloud usage (compute,
              storage, networking) into estimated energy consumption using
              provider disclosures and industry-standard conversion factors. A
              decrease in total energy consumption indicates more efficient
              workload design, reduced waste, and better use of managed or
              serverless services. From a lender’s perspective, this KPI
              provides a transparent, technology-level indicator of operational
              efficiency and serves as a leading signal for future emissions
              reductions, especially when paired with carbon-based metrics."
      fetchAction={getEnergyTimelineAction}
      renderAnalytics={(data) => <EnergyTimelineChart data={data} />}
    />
  );
}
