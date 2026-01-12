"use client";

import { getGhgIntensityAction } from "@/app/actions/ghg-intensity-actions";
import { ExpandableKpiCard } from "@/components/ui/expandable-kpi-card";
import { MetricGrid } from "@/components/ui/metric-card";
import { useExpandableData } from "@/lib/hooks/use-expandable-data";
import { TrendingDown } from "lucide-react";

interface GhgIntensityData {
  totalCo2eMT: number;
  employeeCount: number | null;
  annualRevenue: number | null;
  intensityPerEmployee: number | null;
  intensityPerRevenue: number | null;
}

export function GhgIntensityKpi() {
  const { data, loading, error, toggleExpanded } = useExpandableData<GhgIntensityData>({
    fetchData: getGhgIntensityAction,
  });

  const metrics = data ? [
    {
      label: "Total Emissions",
      value: data.totalCo2eMT.toFixed(3),
      unit: "MTCO2e",
    },
    {
      label: "Employee Count",
      value: data.employeeCount !== null ? data.employeeCount.toLocaleString() : "Not set",
    },
    {
      label: "Annual Revenue",
      value: data.annualRevenue !== null ? `$${(data.annualRevenue / 1000000).toFixed(2)}M` : "Not set",
    },
    {
      label: "Intensity per Employee",
      value: data.intensityPerEmployee !== null ? data.intensityPerEmployee.toFixed(6) : "N/A",
      unit: data.intensityPerEmployee !== null ? "MTCO2e" : undefined,
      highlighted: true,
    },
    {
      label: "Intensity per $1M Revenue",
      value: data.intensityPerRevenue !== null ? data.intensityPerRevenue.toFixed(6) : "N/A",
      unit: data.intensityPerRevenue !== null ? "MTCO2e" : undefined,
      highlighted: true,
    },
  ] : [];

  return (
    <ExpandableKpiCard
      title="GHG Intensity Reduction"
      description="Carbon emissions per employee"
      icon={TrendingDown}
      iconColor="text-blue-600 dark:text-blue-400"
      iconBgColor="bg-blue-100 dark:bg-blue-900/20"
      loading={loading}
      error={error}
      onExpand={toggleExpanded}
    >
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground leading-relaxed">
            GHG Intensity Reduction measures your organization's carbon
            efficiency by calculating total greenhouse gas emissions (in
            metric tons CO2e) per employee and per million dollars of revenue.
            These social and economic KPIs help normalize emissions across
            organizations of different sizes and business models, making it
            easier to benchmark performance and track improvement over time.
            Lower intensity indicates better carbon efficiency, demonstrating
            your commitment to sustainable growth.
          </p>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-heading text-lg font-semibold mb-4">
            Current Metrics
          </h3>
          {data && <MetricGrid metrics={metrics} columns={5} />}
        </div>
      </div>
    </ExpandableKpiCard>
  );
}
