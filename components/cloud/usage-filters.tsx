"use client";

import type { CloudUsageResponse } from "@/app/actions/cloud";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AGGREGATION_PERIOD_OPTIONS,
  CLOUD_SERVICE_LABELS,
  CloudServices,
  TIME_RANGE_OPTIONS,
  type AggregationPeriodValue,
  type CloudService,
  type TimeRangeValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { handleExport } from "@/lib/utils/usage-export";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { useCallback } from "react";

interface UsageFiltersProps {
  selectedServices: CloudService[];
  toggleService: (service: CloudService) => void;
  selectedRegions: string[];
  toggleRegion: (region: string) => void;
  timeRange: TimeRangeValue;
  setTimeRange: (value: TimeRangeValue) => void;
  customStartDate: string;
  setCustomStartDate: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  aggregationPeriod: AggregationPeriodValue;
  setAggregationPeriod: (value: AggregationPeriodValue) => void;
  resetFilters: () => void;
  loading: boolean;
  data: CloudUsageResponse | null;
}

export function UsageFilters({
  selectedServices,
  toggleService,
  selectedRegions,
  toggleRegion,
  timeRange,
  setTimeRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  aggregationPeriod,
  setAggregationPeriod,
  resetFilters,
  loading,
  data,
}: UsageFiltersProps) {
  const onExport = useCallback(() => {
    handleExport(data);
  }, [data]);

  return (
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
                  onClick={onExport}
                  disabled={loading || !data}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
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
          <div className="flex flex-wrap gap-2 py-1.5">
            {CloudServices.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                  selectedServices.includes(service)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {CLOUD_SERVICE_LABELS[service]}
              </button>
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
                <Calendar className="h-4 w-4 mr-2" />
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
                        : "bg-background hover:bg-muted",
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
  );
}
