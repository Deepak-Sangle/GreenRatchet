"use client";

import { getGhgIntensityAction } from "@/app/actions/kpis/ghg-intensity";
import { DashboardItem } from "@/components/shared/dashboard-card";
import { TrendingDown } from "lucide-react";
import { BaseKpiCard } from "../base-kpi-card";

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
      renderAnalytics={(data) => (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <DashboardItem
            title="Total Emissions"
            contentTitle={data.totalCo2eMT.toFixed(3)}
            contentBody="Cloud carbon footprint"
            unit="MTCO2e"
          />
          <DashboardItem
            title="Employee Count"
            contentTitle={
              data.employeeCount !== null
                ? data.employeeCount.toLocaleString()
                : "Not set"
            }
            contentBody="Current headcount"
          />
          <DashboardItem
            title="Annual Revenue"
            contentTitle={
              data.annualRevenue !== null
                ? `${(data.annualRevenue / 1000000).toFixed(2)}M`
                : "Not set"
            }
            contentBody="Yearly revenue"
          />
          <DashboardItem
            title="Intensity per Employee"
            contentTitle={
              data.intensityPerEmployee !== null
                ? data.intensityPerEmployee.toFixed(6)
                : "N/A"
            }
            contentBody="Emissions per person"
            unit={data.intensityPerEmployee !== null ? "MTCO2e" : undefined}
            highlighted
          />
          <DashboardItem
            title="Intensity per $1M Revenue"
            contentTitle={
              data.intensityPerRevenue !== null
                ? data.intensityPerRevenue.toFixed(6)
                : "N/A"
            }
            contentBody="Emissions per revenue"
            unit={data.intensityPerRevenue !== null ? "MTCO2e" : undefined}
            highlighted
          />
        </div>
      )}
      kpiType="GHG_INTENSITY"
    />
  );
}
