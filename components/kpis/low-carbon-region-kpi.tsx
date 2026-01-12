"use client";

import {
  getLowCarbonRegionDataAction,
  type RegionalCo2eData,
} from "@/app/actions/low-carbon-region-analytics";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Globe, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LowCarbonRegionPieChart } from "./low-carbon-region-pie-chart";
import { RegionalInsightsCard } from "./regional-insights-card";

export function LowCarbonRegionKpi() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<RegionalCo2eData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded && !data) {
      loadData();
    }
  }, [isExpanded, data]);

  async function loadData() {
    setLoading(true);
    setError(null);
    const result = await getLowCarbonRegionDataAction();
    if ("error" in result) {
      setError(result.error);
    } else {
      setData(result.data);
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
          <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
            <Globe className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              % CO2e in Low Carbon Regions
            </h2>
            <p className="text-sm text-muted-foreground">
              Track emissions distribution across regional carbon intensity
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
              This KPI measures the percentage of your total CO2 emissions
              occurring in low-carbon regions (carbon intensity below 150
              gCO2/kWh). By strategically deploying workloads to regions powered
              by cleaner energy grids, you can significantly reduce your carbon
              footprint without infrastructure changes. This metric helps
              identify opportunities for carbon-aware workload placement,
              demonstrate sustainability commitments, and qualify for better
              terms on sustainability-linked financing.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Regional Carbon Analysis
            </h3>
            {loading && (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Loading regional data...
                </p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {data && !loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LowCarbonRegionPieChart data={data.pieData} />
                <RegionalInsightsCard
                  categoryStats={data.categoryStats}
                  totalCo2e={data.totalCo2e}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
