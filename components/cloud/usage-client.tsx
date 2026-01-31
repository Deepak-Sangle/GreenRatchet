"use client";

import type { CloudUsageResponse } from "@/app/actions/cloud";
import { BackfillUsageButton } from "@/components/cloud/backfill-usage-button";
import { CalculationConstantsCard } from "@/components/cloud/calculation-constants-card";
import { CarbonIntensityMap } from "@/components/cloud/carbon-intensity-map";
import { MetricExplanationCard } from "@/components/cloud/metric-explanation-card";
import { UsageFilters } from "@/components/cloud/usage-filters";
import { UsageTabs } from "@/components/cloud/usage-tabs";
import { CO2ComparisonCarousel } from "@/components/co2-comparison-carousel";
import { DashboardItem } from "@/components/shared/dashboard-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type CloudMetricValue, type CloudService } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatMetricValue } from "@/lib/utils/usage";
import { CloudUsageFilterInput } from "@/lib/validations/cloud";
import { Cloud, Leaf, RefreshCw, TrendingUp, Zap } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

const CloudUsageItems = [
  {
    title: "Total CO₂e",
    metric: "co2e" as CloudMetricValue,
    icon: <Leaf className="h-4 w-4" />,
    description: "Carbon dioxide equivalent emitted",
  },
  {
    title: "Total Energy",
    metric: "kilowattHours" as CloudMetricValue,
    icon: <Zap className="h-4 w-4" />,
    description: "Electricity consumed",
  },
  {
    title: "Total Cost",
    metric: "cost" as CloudMetricValue,
    icon: <TrendingUp className="h-4 w-4" />,
    description: "Cloud cost",
  },
];

interface UsageClientProps {
  initialData: CloudUsageResponse | null;
  initialFilters: CloudUsageFilterInput;
}

export function UsageClient({ initialData, initialFilters }: UsageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Update URL helper
  const updateUrl = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          // concatenate array values with comma (and in server we again split it)
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  /** Toggles a service in the filter */
  const toggleService = useCallback(
    (service: CloudService) => {
      const current = initialFilters.services;
      const next = current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service];
      updateUrl({ services: next });
    },
    [initialFilters.services, updateUrl],
  );

  /** Toggles a region in the filter */
  const toggleRegion = useCallback(
    (region: string) => {
      const current = initialFilters.regions;
      const next = current.includes(region)
        ? current.filter((r) => r !== region)
        : [...current, region];
      updateUrl({ regions: next });
    },
    [initialFilters.regions, updateUrl],
  );

  /** Helper for single-value changes */
  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      updateUrl({ [key]: value });
    },
    [updateUrl],
  );

  /** Resets all filters to defaults */
  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [router, pathname]);

  const refreshData = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Cloud Usage</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your cloud environmental footprint across all connected
              providers
            </p>
          </div>
          <div className="flex gap-2">
            <BackfillUsageButton />
            <Button
              onClick={refreshData}
              disabled={isPending}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4", isPending && "animate-spin")}
              />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Filter Card */}
        <UsageFilters
          selectedServices={initialFilters.services}
          toggleService={toggleService}
          selectedRegions={initialFilters.regions}
          toggleRegion={toggleRegion}
          timeRange={initialFilters.timeRange}
          setTimeRange={(v) => handleFilterChange("timeRange", v)}
          customStartDate={initialFilters.startDate?.toISOString() || ""}
          setCustomStartDate={(v) => handleFilterChange("startDate", v)}
          customEndDate={initialFilters.endDate?.toISOString() || ""}
          setCustomEndDate={(v) => handleFilterChange("endDate", v)}
          aggregationPeriod={initialFilters.aggregation}
          setAggregationPeriod={(v) => handleFilterChange("aggregation", v)}
          resetFilters={resetFilters}
          loading={isPending}
          data={initialData}
        />

        {/* No Data State */}
        {!isPending && initialData && initialData.timeSeries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Cloud className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Usage Data</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                No cloud usage data found for the selected filters. Either
                change the filters or connect a cloud provider and sync data to
                see your environmental footprint.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Data Display */}
        {initialData && initialData.timeSeries.length > 0 && (
          <div
            className={cn(
              "space-y-6 transition-opacity duration-200",
              isPending ? "opacity-50 pointer-events-none" : "opacity-100",
            )}
          >
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {CloudUsageItems.map((item) => (
                <DashboardItem
                  key={item.metric}
                  title={item.title}
                  icon={item.icon}
                  contentTitle={formatMetricValue(
                    initialData.totals[item.metric],
                    item.metric,
                  )}
                  contentBody={item.description}
                />
              ))}
            </div>

            {/* Metrics Explanation Card */}
            <MetricExplanationCard />

            {/* Charts Tabs */}
            <UsageTabs
              data={initialData}
              aggregationPeriod={initialFilters.aggregation}
            />

            {/* Calculation & Comparison Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-primary" />
                      CO₂e Equivalency
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your emissions compared to everyday activities
                    </p>
                  </div>
                  <CO2ComparisonCarousel
                    totalCo2e={initialData.totals.co2e}
                    formatCo2e={(value) => formatMetricValue(value, "co2e")}
                  />
                </CardContent>
              </Card>

              <CalculationConstantsCard
                availableRegions={initialData.availableRegions}
              />
            </div>

            {/* Carbon Intensity Map */}
            <CarbonIntensityMap />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
