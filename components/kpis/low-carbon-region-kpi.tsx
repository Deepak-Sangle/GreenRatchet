"use client";

import { getLowCarbonRegionDataAction } from "@/app/actions/kpi/low-carbon-region-analytics";
import { Globe } from "lucide-react";
import { BaseKpiCard } from "./base-kpi-card";
import { LowCarbonRegionPieChart } from "./low-carbon-region-pie-chart";
import { RegionalInsightsCard } from "./regional-insights-card";

export function LowCarbonRegionKpi() {
  return (
    <BaseKpiCard
      title="% CO2e in Low Carbon Regions"
      subtitle="Track emissions distribution across regional carbon intensity"
      icon={Globe}
      iconColor="text-teal-600 dark:text-teal-400"
      iconBgColor="bg-teal-100 dark:bg-teal-900/20"
      analyticsTitle="Regional Carbon Analysis"
      longDescription="This KPI measures the proportion of total cloud-related CO₂e
              emissions generated in regions with relatively low grid carbon
              intensity. It is significant because the environmental impact of
              cloud workloads depends heavily on where the underlying
              electricity is produced—regions with cleaner energy mixes result
              in lower emissions for the same level of compute. The metric is
              calculated by categorising cloud usage by region, applying
              region-specific emission factors, and determining the percentage
              of total CO₂e that comes from regions below a defined
              carbon-intensity threshold. Increasing this percentage indicates
              that workloads are being intentionally placed in cleaner regions,
              leading to immediate emissions reductions without sacrificing
              business growth. For lenders, this KPI demonstrates strong
              operational control, clear decarbonisation levers, and a credible
              pathway for ongoing emissions improvement that does not rely
              solely on offsets."
      fetchAction={getLowCarbonRegionDataAction}
      renderAnalytics={(data) => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LowCarbonRegionPieChart data={data.pieData} />
          <RegionalInsightsCard
            categoryStats={data.categoryStats}
            totalCo2e={data.totalCo2e}
          />
        </div>
      )}
      kpiType="LOW_CARBON_REGION_PERCENTAGE"
    />
  );
}
