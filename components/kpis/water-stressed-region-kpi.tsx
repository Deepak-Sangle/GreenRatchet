"use client";

import {
  getWaterStressedRegionDataAction,
  type RegionalWaterData,
} from "@/app/actions/water-stressed-region-analytics";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WaterInsightsCard } from "./water-insights-card";
import { WaterStressedRegionPieChart } from "./water-stressed-region-pie-chart";

export function WaterStressedRegionKpi() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<RegionalWaterData | null>(null);
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
    const result = await getWaterStressedRegionDataAction();
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
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              % Water Usage from Water-Stressed Regions
            </h2>
            <p className="text-sm text-muted-foreground">
              Track water consumption distribution across regional water stress
              levels
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
              This KPI measures the percentage of your total water usage
              occurring in water-stressed regions (risk level 4-5 on a 0-5
              scale). Data centers consume significant water for cooling, and
              operating in water-stressed regions can strain local resources and
              increase operational risks. By strategically deploying workloads
              to regions with abundant water resources, you can reduce
              environmental impact, mitigate water scarcity risks, and
              demonstrate responsible water stewardship for sustainability
              reporting and financing.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Regional Water Stress Analysis
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
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WaterStressedRegionPieChart data={data.pieData} />
                  <WaterInsightsCard
                    categoryStats={data.categoryStats}
                    totalWaterUsage={data.totalWaterUsage}
                  />
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Water stress data source: WRI Aqueduct</span>
                    <a
                      href="https://www.wri.org/applications/aqueduct/country-rankings/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Learn more
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
