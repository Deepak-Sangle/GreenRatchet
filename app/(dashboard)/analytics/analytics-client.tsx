"use client";

import { refreshKPICalculationsAction } from "@/app/actions/kpi-analytics";
import { AiComputeHoursAnalytics } from "@/components/analytics/ai-compute-hours-analytics";
import { CarbonFreeEnergyAnalytics } from "@/components/analytics/carbon-free-energy-analytics";
import { Co2EmissionAnalytics } from "@/components/analytics/co2-emission-analytics";
import { ElectricityMixAnalytics } from "@/components/analytics/electricity-mix-analytics";
import { EnergyConsumptionAnalytics } from "@/components/analytics/energy-consumption-analytics";
import { GhgIntensityAnalytics } from "@/components/analytics/ghg-intensity-analytics";
import { LowCarbonRegionAnalytics } from "@/components/analytics/low-carbon-region-analytics";
import { RenewableEnergyAnalytics } from "@/components/analytics/renewable-energy-analytics";
import { WaterStressedRegionAnalytics } from "@/components/analytics/water-stressed-region-analytics";
import { WaterWithdrawalAnalytics } from "@/components/analytics/water-withdrawal-analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

type KPIResult = {
  actualValue: number;
  targetValue: number;
  status: string;
  periodStart: Date;
  periodEnd: Date;
};

type KPI = {
  id: string;
  name: string;
  type: string;
  targetValue: number;
  direction: string;
  results: KPIResult[];
};

interface AnalyticsPageClientProps {
  kpis: KPI[];
  userRole: string;
  userId: string;
}

export function AnalyticsPageClient({
  kpis,
  userRole,
  userId,
}: AnalyticsPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRefresh = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await refreshKPICalculationsAction();

      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(
          `Successfully calculated ${result.resultsCreated} KPI${
            result.resultsCreated === 1 ? "" : "s"
          }`,
        );
        setTimeout(() => setSuccess(null), 5000);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header with Refresh Button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">KPI Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track environmental performance across your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Calculate KPIs
              </>
            )}
          </Button>
          <Link href="/kpis/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create KPI
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-primary/10 p-3 text-sm">
          <p className="font-medium text-primary">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium">Failed to refresh KPIs</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isPending}
              variant="outline"
              size="sm"
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {kpis.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No KPIs Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Create KPIs to start tracking environmental performance.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">KPI Name</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[20%]">Latest / Target</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map((kpi) => (
                <KPITableRow key={kpi.id} kpi={kpi} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Info Card */}
      {kpis.length > 0 && (
        <Card className="border-primary/20 bg-accent/30">
          <CardContent className="p-4">
            <h3 className="font-heading font-semibold text-sm mb-1">
              Automated, Continuous ESG Assurance
            </h3>
            <p className="text-xs text-muted-foreground">
              All KPI calculations are automated, versioned, and fully
              auditable. Every calculation includes the data source, formula,
              inputs, and step-by-step details for complete transparency.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Individual KPI Table Row Component
 */
function KPITableRow({ kpi }: { kpi: KPI }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const latestResult = kpi.results[0] ?? null;

  const handleToggle = async () => {
    setIsExpanded(!isExpanded);
  };

  // Render type-specific analytics component
  const renderAnalytics = () => {
    const previousResult = kpi.results[1] ?? null;

    // Calculate trend
    let trend: {
      direction: "increasing" | "decreasing" | "stable";
      percentageChange: number;
    } | null = null;
    if (latestResult && previousResult) {
      const change = latestResult.actualValue - previousResult.actualValue;
      const percentageChange =
        previousResult.actualValue !== 0
          ? (change / previousResult.actualValue) * 100
          : 0;

      trend = {
        direction:
          change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
        percentageChange: Math.round(percentageChange * 10) / 10,
      };
    }

    const analyticsData = {
      kpiId: kpi.id,
      kpiName: kpi.name,
      kpiType: kpi.type,
      targetValue: Number(kpi.targetValue),
      direction: kpi.direction,
      latestResult: latestResult
        ? {
            actualValue: latestResult.actualValue,
            status: latestResult.status,
            periodStart: latestResult.periodStart,
            periodEnd: latestResult.periodEnd,
          }
        : null,
      trend,
      historicalResults: kpi.results,
      calculationDetails: null,
      recommendations: [],
    };

    switch (kpi.type) {
      case "CO2_EMISSION":
        return <Co2EmissionAnalytics analytics={analyticsData} />;
      case "ENERGY_CONSUMPTION":
        return <EnergyConsumptionAnalytics analytics={analyticsData} />;
      case "WATER_WITHDRAWAL":
        return <WaterWithdrawalAnalytics analytics={analyticsData} />;
      case "LOW_CARBON_REGION_PERCENTAGE":
        return <LowCarbonRegionAnalytics analytics={analyticsData} />;
      case "CARBON_FREE_ENERGY_PERCENTAGE":
        return <CarbonFreeEnergyAnalytics analytics={analyticsData} />;
      case "RENEWABLE_ENERGY_PERCENTAGE":
        return <RenewableEnergyAnalytics analytics={analyticsData} />;
      case "ELECTRICITY_MIX_BREAKDOWN":
        return <ElectricityMixAnalytics analytics={analyticsData} />;
      case "AI_COMPUTE_HOURS":
        return <AiComputeHoursAnalytics analytics={analyticsData} />;
      case "GHG_INTENSITY":
        return <GhgIntensityAnalytics analytics={analyticsData} />;
      case "WATER_STRESSED_REGION_PERCENTAGE":
        return <WaterStressedRegionAnalytics analytics={analyticsData} />;
      default:
        return (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Analytics not available for this KPI type
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-accent/50"
        onClick={handleToggle}
      >
        <TableCell className="font-medium">
          <div className="truncate">{kpi.name}</div>
        </TableCell>
        <TableCell>
          {latestResult ? (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                latestResult.status === "PASSED"
                  ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  : latestResult.status === "FAILED"
                    ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
              }`}
            >
              {latestResult.status}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">No data</span>
          )}
        </TableCell>
        <TableCell>
          {latestResult ? (
            <div className="flex items-center gap-1.5 text-sm">
              <div>
                <span className="font-medium">
                  {latestResult.actualValue.toLocaleString()}
                </span>
                <span className="text-muted-foreground"> / </span>
                <span className="text-muted-foreground">
                  {kpi.targetValue.toLocaleString()}
                </span>
              </div>
              {kpi.direction === "MINIMIZE" ? (
                <TrendingDown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/30 p-0">
            <div className="p-6 animate-in fade-in duration-200">
              {renderAnalytics()}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
