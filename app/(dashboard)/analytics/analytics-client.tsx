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
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState, useTransition } from "react";

type KPIResult = {
  actualValue: number;
  targetValue: number;
  status: string;
  periodStart: Date;
  periodEnd: Date;
};

type MarginRatchet = {
  stepUpBps: number;
  stepDownBps: number;
  maxAdjustmentBps: number;
};

type KPI = {
  id: string;
  name: string;
  type: string;
  targetValue: number;
  direction: string;
  marginRatchets: MarginRatchet[];
  results: KPIResult[];
};

type Loan = {
  id: string;
  name: string;
  borrowerOrg: { name: string };
  lenderOrg: { name: string } | null;
  kpis: KPI[];
};

interface AnalyticsPageClientProps {
  loans: Loan[];
  userRole: string;
  userId: string;
}

export function AnalyticsPageClient({
  loans,
  userRole,
  userId,
}: AnalyticsPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isBorrower = userRole === "BORROWER";

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
          }`
        );
        setTimeout(() => setSuccess(null), 5000);
      }
    });
  };

  // Flatten all KPIs from all loans
  const allKPIs = loans.flatMap((loan) =>
    loan.kpis.map((kpi) => ({
      ...kpi,
      loanName: loan.name,
      borrowerOrgName: userRole === "LENDER" ? loan.borrowerOrg.name : null,
      lenderOrgName:
        userRole === "BORROWER" ? (loan.lenderOrg?.name ?? null) : null,
    }))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header with Refresh Button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">KPI Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track environmental performance across all your SLL deals
          </p>
        </div>
        {isBorrower && (
          <Button
            onClick={handleRefresh}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh KPIs
              </>
            )}
          </Button>
        )}
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
      {allKPIs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No KPIs Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {isBorrower
                ? "Create KPIs for your loans to start tracking environmental performance."
                : "Once the borrower creates KPIs for their loans, you'll see analytics here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">KPI Name</TableHead>
                <TableHead className="w-[15%]">Loan</TableHead>
                {userRole === "LENDER" && (
                  <TableHead className="w-[15%]">Borrower</TableHead>
                )}
                {userRole === "BORROWER" && (
                  <TableHead className="w-[15%]">Lender</TableHead>
                )}
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[12%]">Latest / Target</TableHead>
                <TableHead className="w-[15%]">Margin Ratchet</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allKPIs.map((kpi) => (
                <KPITableRow key={kpi.id} kpi={kpi} userRole={userRole} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Info Card */}
      {allKPIs.length > 0 && (
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
function KPITableRow({
  kpi,
  userRole,
}: {
  kpi: KPI & {
    loanName: string;
    borrowerOrgName: string | null;
    lenderOrgName: string | null;
  };
  userRole: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const latestResult = kpi.results[0] ?? null;
  const marginRatchet = kpi.marginRatchets[0] ?? null;

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
      loanId: "",
      loanName: kpi.loanName,
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
      marginRatchet,
      historicalResults: kpi.results,
      borrowerOrgName: kpi.borrowerOrgName ?? undefined,
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
          <div className="truncate text-sm">{kpi.loanName}</div>
        </TableCell>
        {userRole === "LENDER" && (
          <TableCell>
            <div className="truncate text-sm">{kpi.borrowerOrgName || "-"}</div>
          </TableCell>
        )}
        {userRole === "BORROWER" && (
          <TableCell>
            <div className="truncate text-sm">{kpi.lenderOrgName || "-"}</div>
          </TableCell>
        )}
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
          {marginRatchet ? (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-0.5">
                <ArrowUp className="h-3 w-3 text-muted-foreground" />
                <span>{marginRatchet.stepUpBps}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <ArrowDown className="h-3 w-3 text-muted-foreground" />
                <span>{marginRatchet.stepDownBps}</span>
              </div>
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
          <TableCell colSpan={7} className="bg-muted/30 p-0">
            <div className="p-6 animate-in fade-in duration-200">
              {renderAnalytics()}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
