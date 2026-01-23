"use client";

import { getGhgIntensityAction } from "@/app/actions/kpi/ghg-intensity-actions";
import { MetricGrid } from "@/components/ui/metric-card";
import { TrendingDown } from "lucide-react";
import { BaseKpiCard } from "./base-kpi-card";

interface GhgIntensityData {
  totalCo2eMT: number;
  employeeCount: number | null;
  annualRevenue: number | null;
  intensityPerEmployee: number | null;
  intensityPerRevenue: number | null;
}

export function GhgIntensityKpi() {
  return (
    <BaseKpiCard<GhgIntensityData>
      title="GHG Intensity Reduction"
      subtitle="Carbon emissions per employee"
      icon={TrendingDown}
      iconColor="text-blue-600 dark:text-blue-400"
      iconBgColor="bg-blue-100 dark:bg-blue-900/20"
      analyticsTitle="Current Metrics"
      longDescription="GHG intensity reduction measures the amount of greenhouse gas
            emissions generated per employee or per unit of revenue, linking
            cloud-related emissions directly to business scale and productivity.
            This KPI is significant because it shows whether a company is
            decoupling growth from environmental impact—one of the core
            objectives of sustainable economic development. It is calculated by
            dividing total cloud CO₂e emissions by either average headcount or
            total revenue over the same period. A reduction in this metric
            indicates that the organisation is becoming more carbon-efficient as
            it grows, through improved cloud architecture, better resource
            utilisation, or cleaner energy sources. For lenders, this KPI is
            especially valuable because it normalises emissions against business
            performance, enabling fair comparison across companies and ensuring
            that sustainability targets remain ambitious yet achievable during
            periods of expansion."
      fetchAction={getGhgIntensityAction}
      renderAnalytics={(data) => {
        const metrics = [
          {
            label: "Total Emissions",
            value: data.totalCo2eMT.toFixed(3),
            unit: "MTCO2e",
          },
          {
            label: "Employee Count",
            value:
              data.employeeCount !== null
                ? data.employeeCount.toLocaleString()
                : "Not set",
          },
          {
            label: "Annual Revenue",
            value:
              data.annualRevenue !== null
                ? `$${(data.annualRevenue / 1000000).toFixed(2)}M`
                : "Not set",
          },
          {
            label: "Intensity per Employee",
            value:
              data.intensityPerEmployee !== null
                ? data.intensityPerEmployee.toFixed(6)
                : "N/A",
            unit: data.intensityPerEmployee !== null ? "MTCO2e" : undefined,
            highlighted: true,
          },
          {
            label: "Intensity per $1M Revenue",
            value:
              data.intensityPerRevenue !== null
                ? data.intensityPerRevenue.toFixed(6)
                : "N/A",
            unit: data.intensityPerRevenue !== null ? "MTCO2e" : undefined,
            highlighted: true,
          },
        ];
        return <MetricGrid metrics={metrics} columns={5} />;
      }}
    />
  );
}
