"use client";

import {
  backfillCloudUsageAction,
  exportCloudUsageCSV,
  getCloudUsageData,
  type CloudUsageResponse,
} from "@/app/actions/cloud";
import { CO2ComparisonCarousel } from "@/components/co2-comparison-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AGGREGATION_PERIOD_OPTIONS,
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  CLOUD_METRIC_OPTIONS,
  CLOUD_SERVICE_LABELS,
  CLOUD_SERVICES,
  TIME_RANGE_OPTIONS,
  type AggregationPeriodValue,
  type CloudMetricValue,
  type CloudService,
  type TimeRangeValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  Cloud,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Info,
  Leaf,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { match } from "ts-pattern";

/** Chart colors for services */
const SERVICE_COLORS: Record<CloudService, string> = {
  EC2: "hsl(152, 58%, 38%)",
  EBS: "hsl(168, 55%, 42%)",
  ElastiCache: "hsl(140, 45%, 48%)",
  RDS: "hsl(180, 50%, 38%)",
  S3: "hsl(195, 45%, 42%)",
  Lambda: "hsl(210, 50%, 45%)",
};

/** Formats a metric value with appropriate units */
function formatMetricValue(value: number, metric: CloudMetricValue): string {
  return match(metric)
    .with("co2e", () => {
      // CO2e is stored in metric tons (mtCO2e)
      if (value >= 1000) {
        return `${(value / 1000).toFixed(3)} ktCO₂e`;
      } else if (value >= 1) {
        return `${value.toFixed(3)} mtCO₂e`;
      } else if (value >= 0.001) {
        return `${(value * 1000).toFixed(2)} kg CO₂e`;
      } else {
        return `${(value * 1000000).toFixed(2)} g CO₂e`;
      }
    })
    .with("kilowattHours", () =>
      value >= 1000
        ? `${(value / 1000).toFixed(3)} MWh`
        : `${value.toFixed(3)} kWh`
    )
    .with("cost", () => `$${value.toFixed(2)}`)
    .exhaustive();
}

/** Formats date for chart display based on aggregation period */
function formatChartDate(
  dateString: string,
  aggregation: AggregationPeriodValue
): string {
  return match(aggregation)
    .with("day", () => format(new Date(dateString), "MMM d"))
    .with("week", () => {
      // For week format (YYYY-Www), extract and display as "Week N"
      const weekMatch = dateString.match(/W(\d+)/);
      return weekMatch ? `Week ${weekMatch[1]}` : dateString;
    })
    .with("month", () => format(new Date(dateString + "-01"), "MMM yyyy"))
    .exhaustive();
}

/** Gets aggregation label for display */
function getAggregationLabel(aggregation: AggregationPeriodValue): string {
  const option = AGGREGATION_PERIOD_OPTIONS.find(
    (o) => o.value === aggregation
  );
  return option?.label.toLowerCase() ?? "daily";
}

/** Gets the metric label for display */
function getMetricLabel(metric: CloudMetricValue): string {
  const option = CLOUD_METRIC_OPTIONS.find((o) => o.value === metric);
  return option?.label ?? metric;
}

/** Gets the icon for a metric */
function getMetricIcon(metric: CloudMetricValue): React.ReactNode {
  return match(metric)
    .with("co2e", () => <Leaf className="h-4 w-4" />)
    .with("kilowattHours", () => <Zap className="h-4 w-4" />)
    .with("cost", () => <TrendingUp className="h-4 w-4" />)
    .exhaustive();
}

/** Service toggle button component */
function ServiceToggle({
  service,
  selected,
  onToggle,
}: {
  service: CloudService;
  selected: boolean;
  onToggle: (service: CloudService) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(service)}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {CLOUD_SERVICE_LABELS[service]}
    </button>
  );
}

/** Gets relevant emissions factors for regions in use */
function getRelevantEmissionsFactors(
  availableRegions: string[]
): Array<{ region: string; factor: number }> {
  return availableRegions
    .map((region) => ({
      region,
      factor: AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH[region] ?? 0,
    }))
    .filter((item) => item.factor > 0)
    .sort((a, b) => a.region.localeCompare(b.region));
}

/** Exports calculation constants to CSV */
function exportConstantsToCSV(availableRegions: string[]): void {
  const csvLines: string[] = [];

  // Header
  csvLines.push("Calculation Constants for Cloud Carbon Footprint\n");

  // Key Constants
  csvLines.push("\nKey Constants");
  csvLines.push("Constant,Value,Unit");
  csvLines.push(
    `Power Usage Effectiveness (PUE),${AWS_CLOUD_CONSTANTS.PUE_AVG},ratio`
  );
  csvLines.push(
    `SSD Coefficient,${AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT},Wh/TB-hour`
  );
  csvLines.push(
    `HDD Coefficient,${AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT},Wh/TB-hour`
  );
  csvLines.push(
    `Memory Coefficient,${AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT},kWh/GB`
  );
  csvLines.push(
    `Networking Coefficient,${AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT},kWh/GB`
  );
  csvLines.push(
    `Average CPU Utilization,${AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020},%`
  );
  csvLines.push(
    `Server Expected Lifespan,${AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN},hours`
  );

  // Regional Emissions Factors
  csvLines.push("\n\nRegional Emissions Factors (Active Regions)");
  csvLines.push("Region,Emissions Factor (mtCO2e/kWh)");
  const emissionsFactors = getRelevantEmissionsFactors(availableRegions);
  for (const { region, factor } of emissionsFactors) {
    csvLines.push(`${region},${factor}`);
  }

  // Storage Replication Factors
  csvLines.push("\n\nStorage Replication Factors");
  csvLines.push("Service,Replication Factor");
  for (const [service, factor] of Object.entries(
    AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS
  )) {
    csvLines.push(`${service},${factor}`);
  }

  const csv = csvLines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cloud-constants-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function CloudUsagePage() {
  const [data, setData] = useState<CloudUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedServices, setSelectedServices] = useState<CloudService[]>([
    ...CLOUD_SERVICES,
  ]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>("30d");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [selectedMetric, setSelectedMetric] =
    useState<CloudMetricValue>("co2e");
  const [aggregationPeriod, setAggregationPeriod] =
    useState<AggregationPeriodValue>("day");

  // Backfill state
  const [backfillDialogOpen, setBackfillDialogOpen] = useState(false);
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillError, setBackfillError] = useState<string | null>(null);

  // Export state
  const [exportLoading, setExportLoading] = useState(false);

  // CO2 comparison state
  const [selectedComparisonIndex, setSelectedComparisonIndex] = useState(0);

  // Y-axis scale selection for timeline chart
  const [yAxisMetric, setYAxisMetric] = useState<CloudMetricValue>("co2e");

  /** Toggles a service in the filter */
  const toggleService = useCallback((service: CloudService) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  }, []);

  /** Toggles a region in the filter */
  const toggleRegion = useCallback((region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  }, []);

  /** Fetches cloud usage data */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getCloudUsageData({
      services: selectedServices,
      regions: selectedRegions,
      timeRange,
      startDate:
        timeRange === "custom" && customStartDate
          ? new Date(customStartDate)
          : undefined,
      endDate:
        timeRange === "custom" && customEndDate
          ? new Date(customEndDate)
          : undefined,
      metric: selectedMetric,
      aggregation: aggregationPeriod,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setData(result.data);
      console.log("Data is: ", JSON.stringify(result.data, null, 2));
    }

    setLoading(false);
  }, [
    selectedServices,
    selectedRegions,
    timeRange,
    customStartDate,
    customEndDate,
    selectedMetric,
    aggregationPeriod,
  ]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Resets all filters to defaults */
  const resetFilters = useCallback(() => {
    setSelectedServices([...CLOUD_SERVICES]);
    setSelectedRegions([]);
    setTimeRange("30d");
    setCustomStartDate("");
    setCustomEndDate("");
    setSelectedMetric("co2e");
    setAggregationPeriod("day");
  }, []);

  /** Handles backfill action */
  const handleBackfill = useCallback(async () => {
    setBackfillLoading(true);
    setBackfillError(null);

    const result = await backfillCloudUsageAction();

    if (result.error) {
      setBackfillError(result.error);
      setBackfillLoading(false);
    } else {
      setBackfillLoading(false);
      setBackfillDialogOpen(true);
    }
  }, []);

  /** Handles CSV export */
  const handleExport = useCallback(async () => {
    if (!data?.footprints) return;

    setExportLoading(true);

    const result = await exportCloudUsageCSV(data.footprints);

    setExportLoading(false);

    if (result.error) {
      alert(result.error);
    } else if (result.csv !== undefined) {
      // Create blob and download
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cloud-usage-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [data]);

  /** Prepares time series data for the chart */
  const timeSeriesChartData = data?.timeSeries.map((point) => {
    const operationalKey = `operational_${yAxisMetric}` as keyof typeof point;
    const embodiedKey = `embodied_${yAxisMetric}` as keyof typeof point;

    return {
      date: point.date,
      [yAxisMetric]: point[yAxisMetric],
      operational: point[operationalKey] ?? 0,
      embodied: point[embodiedKey] ?? 0,
    };
  });

  /** Prepares service data for the pie chart */
  const serviceChartData = data?.byService.map((service) => ({
    name: service.label,
    value: service[selectedMetric],
    color: SERVICE_COLORS[service.service],
  }));

  /** Prepares region data for the bar chart */
  const regionChartData = data?.byRegion.map((region) => ({
    region: region.region,
    [selectedMetric]: region[selectedMetric],
  }));

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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleBackfill}
                  disabled={backfillLoading}
                  variant="outline"
                  className="gap-2"
                >
                  <Database
                    className={cn("h-4 w-4", backfillLoading && "animate-spin")}
                  />
                  Backfill Data
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Backfill cloud usage data for the last 1 year. This process
                  runs in the background and may take several minutes to
                  complete.
                </p>
              </TooltipContent>
            </Tooltip>
            <Button
              onClick={fetchData}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Backfill Error */}
        {backfillError && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{backfillError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backfill Success Dialog */}
        <Dialog open={backfillDialogOpen} onOpenChange={setBackfillDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Backfill Started
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-2">
                <p>
                  Your cloud usage data backfill has been initiated
                  successfully. This process will retrieve and process data from
                  the last 1 year.
                </p>
                <div className="rounded-md bg-muted p-3 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    What happens next?
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Data is being fetched in the background</li>
                    <li>This may take several minutes to complete</li>
                    <li>You can continue using the application</li>
                  </ul>
                </div>
                <p className="text-sm">
                  <strong>Please click on refresh button</strong> to see the
                  newly backfilled data in your charts and reports.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setBackfillDialogOpen(false)}>
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filter Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Filters</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={exportLoading || loading || !data}
                      className="gap-2"
                    >
                      <Download
                        className={cn(
                          "h-4 w-4",
                          exportLoading && "animate-pulse"
                        )}
                      />
                      Export CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Export cloud usage data as CSV based on current filters
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-muted-foreground"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Services Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Services</Label>
              <div className="flex flex-wrap gap-2">
                {CLOUD_SERVICES.map((service) => (
                  <ServiceToggle
                    key={service}
                    service={service}
                    selected={selectedServices.includes(service)}
                    onToggle={toggleService}
                  />
                ))}
              </div>
              {selectedServices.length === 0 && (
                <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    No services selected. All services will be included in the
                    results by default.
                  </p>
                </div>
              )}
            </div>

            {/* Time Range and Metric Filters */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Time Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Time Range</Label>
                <Select
                  value={timeRange}
                  onValueChange={(v) => setTimeRange(v as TimeRangeValue)}
                >
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {timeRange === "custom" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Aggregation Period Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Aggregation</Label>
                <Select
                  value={aggregationPeriod}
                  onValueChange={(v) =>
                    setAggregationPeriod(v as AggregationPeriodValue)
                  }
                >
                  <SelectTrigger>
                    <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select aggregation" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGGREGATION_PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region Filter */}
              {data?.availableRegions && data.availableRegions.length > 0 && (
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label className="text-sm font-medium">Regions</Label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border rounded-md bg-muted/30">
                    {data.availableRegions.map((region) => (
                      <button
                        type="button"
                        key={region}
                        onClick={() => toggleRegion(region)}
                        className={cn(
                          "px-2 py-1 text-xs rounded-md transition-colors",
                          selectedRegions.includes(region)
                            ? "bg-primary text-primary-foreground"
                            : "bg-background hover:bg-muted"
                        )}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {!loading && !error && data && data.timeSeries.length === 0 && (
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
        {!loading && !error && data && data.timeSeries.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total CO₂e
                  </CardTitle>
                  <Leaf className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatMetricValue(data.totals.co2e, "co2e")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(data.dateRange.startDate), "MMM d")} -{" "}
                    {format(new Date(data.dateRange.endDate), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--chart-2))]/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Energy
                  </CardTitle>
                  <Zap className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatMetricValue(
                      data.totals.kilowattHours,
                      "kilowattHours"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Electricity consumed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--chart-3))]/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Cost
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatMetricValue(data.totals.cost, "cost")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cloud spend
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Metrics Explanation Card */}
            <Card className="border-primary/20 bg-accent/20">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-sm">
                      Understanding Operational vs Embodied Metrics
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <span className="font-medium">
                            Operational Metrics
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Energy consumed and emissions produced during the
                          active use of cloud resources (compute, storage,
                          networking). Measured in real-time based on actual
                          workload.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: "hsl(152, 58%, 58%)" }}
                          />
                          <span className="font-medium">Embodied Metrics</span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Emissions from manufacturing, transporting, and
                          disposing of hardware infrastructure. Amortized over
                          the expected lifespan of the equipment (typically 4
                          years for servers).{" "}
                          <a
                            href="https://www.oxygenit.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Source: OxygenIT
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Charts */}
            <Tabs defaultValue="timeseries" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="timeseries" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Cloud className="h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="regions" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Regions
                </TabsTrigger>
              </TabsList>

              {/* Time Series Chart */}
              <TabsContent value="timeseries">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          {getMetricLabel(yAxisMetric)} Over Time
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getAggregationLabel(aggregationPeriod)} breakdown of{" "}
                          {getMetricLabel(yAxisMetric).toLowerCase()}{" "}
                          (operational vs embodied)
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {data.timeSeries.length} data points
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={timeSeriesChartData}
                          margin={{ top: 10 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorOperational"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorEmbodied"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="hsl(152, 58%, 58%)"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="hsl(152, 58%, 58%)"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) =>
                              formatChartDate(date, aggregationPeriod)
                            }
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                              formatMetricValue(value, yAxisMetric)
                            }
                          />
                          <RechartsTooltip
                            formatter={(
                              value: number | undefined,
                              name?: string
                            ) => {
                              const label =
                                name === "operational"
                                  ? "Operational"
                                  : name === "embodied"
                                    ? "Embodied"
                                    : (name ?? "Value");
                              return [
                                formatMetricValue(value ?? 0, yAxisMetric),
                                label,
                              ];
                            }}
                            labelFormatter={(label: string) =>
                              match(aggregationPeriod)
                                .with("day", () =>
                                  format(new Date(label), "MMM d, yyyy")
                                )
                                .with("week", () => {
                                  const weekMatch =
                                    label.match(/(\d{4})-W(\d+)/);
                                  return weekMatch
                                    ? `Week ${weekMatch[2]}, ${weekMatch[1]}`
                                    : label;
                                })
                                .with("month", () =>
                                  format(new Date(label + "-01"), "MMMM yyyy")
                                )
                                .exhaustive()
                            }
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="line"
                            formatter={(value) => {
                              return value === "operational"
                                ? "Operational Metrics"
                                : value === "embodied"
                                  ? "Embodied Metrics"
                                  : value;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="operational"
                            name="Operational"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#colorOperational)"
                          />
                          <Area
                            type="monotone"
                            dataKey="embodied"
                            name="Embodied"
                            stroke="hsl(152, 58%, 58%)"
                            strokeWidth={2}
                            fill="url(#colorEmbodied)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Metric Toggle */}
                    <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground mr-2">
                        Select metric:
                      </span>
                      {CLOUD_METRIC_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setYAxisMetric(option.value)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium",
                            yAxisMetric === option.value
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {getMetricIcon(option.value)}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Pie Chart */}
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Cloud className="h-5 w-5" />
                          {getMetricLabel(selectedMetric)} by Service
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Breakdown of environmental impact by AWS service
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {data.byService.length} services
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={serviceChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) =>
                                `${name} ${((percent ?? 0) * 100).toFixed(3)}%`
                              }
                              labelLine={false}
                            >
                              {serviceChartData?.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                  stroke="hsl(var(--background))"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(value: number | undefined) =>
                                formatMetricValue(value ?? 0, selectedMetric)
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {data.byService.map((service) => (
                          <div
                            key={service.service}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    SERVICE_COLORS[service.service],
                                }}
                              />
                              <span className="font-medium">
                                {service.label}
                              </span>
                            </div>
                            <span className="text-muted-foreground">
                              {formatMetricValue(
                                service[selectedMetric],
                                selectedMetric
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Regions Bar Chart */}
              <TabsContent value="regions">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          {getMetricLabel(selectedMetric)} by Region
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Geographic distribution of your cloud environmental
                          impact
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {data.byRegion.length} regions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={regionChartData}
                          layout="vertical"
                          margin={{ left: 80 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            horizontal={true}
                            vertical={false}
                          />
                          <XAxis
                            type="number"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                              selectedMetric === "cost"
                                ? `$${value}`
                                : value.toFixed(1)
                            }
                          />
                          <YAxis
                            dataKey="region"
                            type="category"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            width={70}
                          />
                          <RechartsTooltip
                            formatter={(value: number | undefined) =>
                              formatMetricValue(value ?? 0, selectedMetric)
                            }
                            labelFormatter={(label: any) => `Region: ${label}`}
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                          />
                          <Bar
                            dataKey={selectedMetric}
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* CO2 Comparison Section - 2 Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* CO2 Comparison Card - Left Half */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-primary" />
                        CO₂e Equivalency
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your emissions compared to everyday activities
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CO2ComparisonCarousel
                    totalCo2e={data.totals.co2e}
                    selectedIndex={selectedComparisonIndex}
                    onIndexChange={setSelectedComparisonIndex}
                    formatCo2e={(value) => formatMetricValue(value, "co2e")}
                  />
                </CardContent>
              </Card>

              {/* Calculation Constants Card - Right Half */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Calculation Methodology
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Constants used for carbon footprint calculations
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            exportConstantsToCSV(data.availableRegions)
                          }
                          className="gap-2"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          Export
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download calculation constants as CSV</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Constants */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Key Constants
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex flex-col p-2 rounded-md bg-muted/30">
                        <span className="text-muted-foreground">
                          Average Power Usage Effectiveness (PUE)
                        </span>
                        <span className="font-medium text-foreground">
                          {AWS_CLOUD_CONSTANTS.PUE_AVG}
                        </span>
                      </div>
                      <div className="flex flex-col p-2 rounded-md bg-muted/30">
                        <span className="text-muted-foreground">
                          Memory Coefficient
                        </span>
                        <span className="font-medium text-foreground">
                          {AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT} kWh/GB
                        </span>
                      </div>
                      <div className="flex flex-col p-2 rounded-md bg-muted/30">
                        <span className="text-muted-foreground">
                          SSD Coefficient
                        </span>
                        <span className="font-medium text-foreground">
                          {AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT} Wh/TB
                        </span>
                      </div>
                      <div className="flex flex-col p-2 rounded-md bg-muted/30">
                        <span className="text-muted-foreground">
                          HDD Coefficient
                        </span>
                        <span className="font-medium text-foreground">
                          {AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT} Wh/TB
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Regional Emissions Factors */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
                      <span>Emissions Factors (Active Regions)</span>
                      <Badge variant="secondary" className="text-xs">
                        {data.availableRegions.length} regions
                      </Badge>
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                      {getRelevantEmissionsFactors(data.availableRegions)
                        .slice(0, 8)
                        .map(({ region, factor }) => (
                          <div
                            key={region}
                            className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-muted/30 transition-colors"
                          >
                            <span className="text-muted-foreground font-mono">
                              {region}
                            </span>
                            <span className="font-medium text-foreground">
                              {factor.toFixed(7)} mtCO₂e/kWh
                            </span>
                          </div>
                        ))}
                      {data.availableRegions.length > 8 && (
                        <p className="text-xs text-muted-foreground italic pt-1">
                          +{data.availableRegions.length - 8} more regions
                          (export for full list)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Methodology Note */}
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <p>
                      Calculations use region-specific grid carbon intensity and
                      PUE. Export for full methodology details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
