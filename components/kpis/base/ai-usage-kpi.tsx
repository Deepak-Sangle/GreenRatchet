"use client";

import { getAIUsageAction } from "@/app/actions/kpis/ai-usage";
import { formatPercentage } from "@/lib/utils";
import { Cpu, Zap } from "lucide-react";
import { AIUsageTimelineChart } from "../ai-usage-timeline-chart";
import { BaseKpiCard } from "../base-kpi-card";

interface AIUsageData {
  currentUsage: {
    aiKwh: number;
    totalKwh: number;
    percentage: number;
  };
  timeline: Array<{
    date: string;
    aiKwh: number;
    totalKwh: number;
    percentage: number;
    cumulativeAiKwh: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export function AIUsageKPI() {
  return (
    <BaseKpiCard<AIUsageData>
      title="AI Energy Usage"
      subtitle="Percentage of total energy consumed by AI/ML workloads (GPU instances)"
      icon={Cpu}
      longDescription="AI energy usage measures the proportion of an organisation's total
              cloud energy consumption that is attributable to AI and
              machine-learning workloads, such as model training, inference, and
              data processing. This KPI is significant because AI workloads are
              typically far more energy-intensive than traditional applications
              and can materially increase environmental impact if left
              unmanaged. It is calculated by identifying AI/ML-related cloud
              services or workloads and dividing their estimated energy
              consumption by total cloud energy usage. Managing and, where
              appropriate, reducing this percentage indicates responsible AI
              deployment through model optimisation, efficient hardware
              selection, and workload scheduling."
      fetchAction={getAIUsageAction}
      renderAnalytics={(data) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">
                AI Usage Percentage
              </p>
              <p className="text-2xl font-semibold text-primary">
                {formatPercentage(data.currentUsage.percentage)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">
                AI Energy Consumption
              </p>
              <p className="text-2xl font-semibold">
                {data.currentUsage.aiKwh.toFixed(2)} kWh
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Total Energy Consumption
              </p>
              <p className="text-2xl font-semibold">
                {data.currentUsage.totalKwh.toFixed(2)} kWh
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-medium">AI Usage Timeline (Last 30 Days)</h3>
            </div>
            <AIUsageTimelineChart data={data.timeline} showCumulative={true} />
          </div>
        </div>
      )}
      kpiType="AI_COMPUTE_HOURS"
    />
  );
}
