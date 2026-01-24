"use client";

import type { CloudUsageResponse } from "@/app/actions/cloud";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CLOUD_METRIC_OPTIONS,
  type AggregationPeriodValue,
  type CloudMetricValue,
  type CloudService,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  formatAxisTick,
  formatChartDate,
  formatMetricValue,
  getAggregationLabel,
  getMetricLabel,
} from "@/lib/utils/usage";
import { handleTabExport } from "@/lib/utils/usage-export";
import { format } from "date-fns";
import {
  Activity,
  BarChart3,
  Cloud,
  Database,
  FileSpreadsheet,
  Leaf,
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
import z from "zod";

/** Chart colors for services */
const SERVICE_COLORS: Record<CloudService, string> = {
  EC2: "hsl(152, 58%, 38%)",
  EBS: "hsl(168, 55%, 42%)",
  ElastiCache: "hsl(140, 45%, 48%)",
  RDS: "hsl(180, 50%, 38%)",
  S3: "hsl(195, 45%, 42%)",
  Lambda: "hsl(210, 50%, 45%)",
};

/** Gets the icon for a metric */
function getMetricIcon(metric: CloudMetricValue): React.ReactNode {
  return match(metric)
    .with("co2e", () => <Leaf className="h-4 w-4" />)
    .with("kilowattHours", () => <Zap className="h-4 w-4" />)
    .with("cost", () => <TrendingUp className="h-4 w-4" />)
    .exhaustive();
}

interface UsageTabsProps {
  data: CloudUsageResponse;
  aggregationPeriod: AggregationPeriodValue;
}

const UsageTabEnumSchema = z.enum([
  "timeseries",
  "services",
  "regions",
  "instancetypes",
]);
type UsageTabEnum = z.infer<typeof UsageTabEnumSchema>;

export function UsageTabs({ data, aggregationPeriod }: UsageTabsProps) {
  // Local state for UI-specific things not in the main filter URL
  const [selectedMetric, setSelectedMetric] =
    useState<CloudMetricValue>("co2e");

  // Active tab state for export
  const [activeTab, setActiveTab] = useState<UsageTabEnum>("timeseries");

  // Y-axis scale selection for timeline chart (independent from main filter)
  const [yAxisMetric, setYAxisMetric] =
    useState<CloudMetricValue>(selectedMetric);

  // Sync yAxisMetric with selectedMetric when selectedMetric changes
  useEffect(() => {
    setYAxisMetric(selectedMetric);
  }, [selectedMetric]);

  const onTabExport = useCallback(() => {
    handleTabExport(data, activeTab, yAxisMetric);
  }, [data, activeTab, yAxisMetric]);

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

  /** Prepares instance type data for the bar chart */
  const instanceTypeChartData = data?.byInstanceType.map((instanceType) => ({
    instanceType: instanceType.instanceType,
    serviceName: instanceType.serviceName,
    co2e: instanceType.co2e,
    kilowattHours: instanceType.kilowattHours,
    cost: instanceType.cost,
  }));

  return (
    <Tabs
      defaultValue="timeseries"
      className="space-y-4"
      onValueChange={(value) =>
        setActiveTab(UsageTabEnumSchema.safeParse(value).data ?? "timeseries")
      }
    >
      <div className="flex items-center justify-between gap-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
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
          <TabsTrigger value="instancetypes" className="gap-2">
            <Database className="h-4 w-4" />
            Instance Types
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Select
            value={selectedMetric}
            onValueChange={(v) => setSelectedMetric(v as CloudMetricValue)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {CLOUD_METRIC_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {getMetricIcon(option.value)}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={onTabExport}
            disabled={!data}
            variant="outline"
            size="sm"
            className="gap-2 flex-shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

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
                  {getMetricLabel(yAxisMetric).toLowerCase()} (operational vs
                  embodied)
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
                <AreaChart data={timeSeriesChartData} margin={{ top: 10 }}>
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
                    formatter={(value: number | undefined, name?: string) => {
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
                    labelFormatter={(label: any) =>
                      match(aggregationPeriod)
                        .with("day", () =>
                          format(new Date(label), "MMM d, yyyy"),
                        )
                        .with("week", () => {
                          const weekMatch = label.match(/(\d{4})-W(\d+)/);
                          return weekMatch
                            ? `Week ${weekMatch[2]}, ${weekMatch[1]}`
                            : label;
                        })
                        .with("month", () =>
                          format(new Date(label + "-01"), "MMMM yyyy"),
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
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
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
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
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
                          backgroundColor: SERVICE_COLORS[service.service],
                        }}
                      />
                      <span className="font-medium">{service.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatMetricValue(
                        service[selectedMetric],
                        selectedMetric,
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
                  Geographic distribution of your cloud environmental impact
                </p>
              </div>
              <Badge variant="secondary">{data.byRegion.length} regions</Badge>
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
                      formatAxisTick(value, selectedMetric)
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

      {/* Instance Types Bar Chart */}
      <TabsContent value="instancetypes">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {getMetricLabel(selectedMetric)} by Instance Type
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Embodied emissions breakdown by instance type (hardware
                  footprint)
                </p>
              </div>
              <Badge variant="secondary">
                {data.byInstanceType.length} instance types
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={instanceTypeChartData}
                  layout="vertical"
                  margin={{ left: 120 }}
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
                      formatAxisTick(value, selectedMetric)
                    }
                  />
                  <YAxis
                    dataKey="instanceType"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) {
                        return null;
                      }
                      const data = payload[0].payload;
                      return (
                        <div
                          className="rounded-md border bg-popover p-3 shadow-md"
                          style={{
                            backgroundColor: "hsl(var(--popover))",
                            borderColor: "hsl(var(--border))",
                          }}
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {data.instanceType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Service: {data.serviceName}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {formatMetricValue(
                                data[selectedMetric],
                                selectedMetric,
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey={selectedMetric}
                    fill="hsl(152, 58%, 58%)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
