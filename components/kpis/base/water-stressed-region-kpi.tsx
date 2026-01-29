"use client";

import {
  getWaterStressedRegionDataAction,
  type RegionalWaterData,
} from "@/app/actions/kpi/water-stressed-region-analytics";
import { Droplets, ExternalLink } from "lucide-react";
import { BaseKpiCard } from "../base-kpi-card";
import { WaterInsightsCard } from "../water-insights-card";
import { WaterStressedRegionPieChart } from "../water-stressed-region-pie-chart";

export function WaterStressedRegionKpi() {
  return (
    <BaseKpiCard<RegionalWaterData>
      title="% Water Usage from Water-Stressed Regions"
      subtitle="Track water consumption distribution across regional water stress levels"
      icon={Droplets}
      iconColor="text-blue-600 dark:text-blue-400"
      iconBgColor="bg-blue-100 dark:bg-blue-900/20"
      analyticsTitle="Regional Water Stress Analysis"
      longDescription="This KPI measures the proportion of total cloud-related water
              consumption that occurs in regions classified as water-stressed.
              It is significant because data centres in water-scarce areas can
              intensify local environmental and social pressures, especially
              during periods of drought or competing community demand. The
              metric is calculated by mapping cloud workloads to their
              geographic regions, estimating associated water use, and
              determining the percentage attributable to regions with high or
              extremely high water stress based on recognised water-risk
              indices. A decrease in this percentage indicates more responsible
              workload placement, reduced exposure to physical water risk, and
              improved resilience of cloud operations. For lenders, this KPI
              highlights how the borrower is managing location-specific
              natural-resource risks and demonstrates a more holistic approach
              to sustainability beyond carbon alone, which is increasingly
              important in long-term credit assessments."
      fetchAction={getWaterStressedRegionDataAction}
      renderAnalytics={(data) => (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WaterStressedRegionPieChart data={data.pieData} />
            <WaterInsightsCard
              categoryStats={data.categoryStats}
              totalWaterUsage={data.totalWaterUsage}
            />
          </div>
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Water stress data source: WRI Aqueduct</span>
              <a
                href="https://www.wri.org/applications/aqueduct/country-rankings/"
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
      kpiType="WATER_STRESSED_REGION_PERCENTAGE"
    />
  );
}
