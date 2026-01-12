"use client";

import { getEnergyTimelineAction } from "@/app/actions/energy-analytics-actions";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Loader2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { EnergyTimelineChart } from "./energy-timeline-chart";

export function EnergyConsumptionKpi() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timelineData, setTimelineData] = useState<Array<{
    month: string;
    cumulative: number;
    isProjected: boolean;
  }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded && !timelineData) {
      loadTimelineData();
    }
  }, [isExpanded]);

  async function loadTimelineData() {
    setLoading(true);
    setError(null);
    const result = await getEnergyTimelineAction();
    if ("error" in result) {
      setError(result.error ?? "Failed to load timeline data");
    } else {
      setTimelineData(result.data);
    }
    setLoading(false);
  }

  return (
    <Card className="p-6 shadow-soft transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Total Energy Consumption
            </h2>
            <p className="text-sm text-muted-foreground">
              Track energy usage from cloud operations
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-200">
          <div>
            <p className="text-muted-foreground leading-relaxed">
              Energy Consumption measures the total electrical energy (in MWh)
              consumed by your cloud infrastructure operations. This metric
              provides visibility into your energy footprint, helps identify
              energy-intensive services and regions, enables optimization of
              workload placement for energy efficiency, and supports renewable
              energy procurement decisions. Tracking energy consumption is
              crucial for understanding the relationship between your cloud
              operations and carbon emissions, as well as identifying
              opportunities for cost savings through energy efficiency
              improvements.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Performance Analytics
            </h3>
            {loading && (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Loading timeline data...
                </p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {timelineData && !loading && !error && (
              <EnergyTimelineChart data={timelineData} />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
