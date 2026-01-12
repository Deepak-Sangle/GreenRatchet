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
              This KPI measures the proportion of total cloud-related water
              consumption that occurs in regions classified as water-stressed.
              It is significant because data centres in water-scarce areas can
              intensify local environmental and social pressures, especially
              during periods of drought or competing community demand. The
              metric is calculated by mapping cloud workloads to their
              geographic regions, estimating associated water use, and
              determining the percentage attributable to regions with high or
              extremely high water stress based on recognised water-risk
              indices. A decrease in this percentage indicates more responsible
              workload placement, reduced exposure to physical water risk, and
              improved resilience of cloud operations. For lenders, this KPI
              highlights how the borrower is managing location-specific
              natural-resource risks and demonstrates a more holistic approach
              to sustainability beyond carbon alone, which is increasingly
              important in long-term credit assessments.
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
