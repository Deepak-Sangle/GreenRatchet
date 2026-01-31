"use client";

import { getWaterTimelineAction } from "@/app/actions/kpis/water-withdrawl";
import { Droplets, ExternalLink } from "lucide-react";
import { BaseKpiCard } from "../base-kpi-card";
import { WaterTimelineChart } from "../water-timeline-chart";

export function WaterWithdrawalKpi() {
  return (
    <BaseKpiCard
      title="Total Water Withdrawal"
      subtitle="Track water consumption from cloud operations"
      icon={Droplets}
      iconColor="text-blue-600 dark:text-blue-400"
      iconBgColor="bg-blue-100 dark:bg-blue-900/20"
      longDescription="Total water withdrawal measures the volume of freshwater used to
              support cloud operations, primarily for data-centre cooling and
              power generation. This KPI is significant because water scarcity
              is a growing environmental risk, and data centres can place
              additional stress on local water resources, particularly in
              water-stressed regions. The metric is typically calculated by
              applying provider-reported water-use factors to cloud energy
              consumption and aggregating the estimated water use across regions
              and services. A reduction in total water withdrawal indicates
              improved efficiency, smarter workload placement, or greater
              reliance on facilities with advanced cooling technologies and
              lower water intensity."
      fetchAction={getWaterTimelineAction}
      renderAnalytics={(data) => (
        <>
          <WaterTimelineChart data={data} />
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Data source: AWS Sustainability</span>
              <a
                href="https://sustainability.aboutamazon.com/products-services/aws-cloud#increasing-efficiency"
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
      kpiType="WATER_WITHDRAWAL"
    />
  );
}
