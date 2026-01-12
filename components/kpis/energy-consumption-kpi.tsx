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
              Total energy consumption tracks the amount of electricity used to
              run an organisation’s cloud workloads over a given period,
              typically measured in kilowatt-hours (kWh). This KPI matters
              because energy use is the primary driver of both carbon emissions
              and wider environmental impacts associated with data centres,
              including pressure on power grids and upstream resource
              extraction. It is calculated by converting cloud usage (compute,
              storage, networking) into estimated energy consumption using
              provider disclosures and industry-standard conversion factors. A
              decrease in total energy consumption indicates more efficient
              workload design, reduced waste, and better use of managed or
              serverless services. From a lender’s perspective, this KPI
              provides a transparent, technology-level indicator of operational
              efficiency and serves as a leading signal for future emissions
              reductions, especially when paired with carbon-based metrics.
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
