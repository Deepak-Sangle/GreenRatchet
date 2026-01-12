"use client";

import { getWaterTimelineAction } from "@/app/actions/water-analytics-actions";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WaterTimelineChart } from "./water-timeline-chart";

export function WaterWithdrawalKpi() {
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
    const result = await getWaterTimelineAction();
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
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Total Water Withdrawal
            </h2>
            <p className="text-sm text-muted-foreground">
              Track water consumption from cloud operations
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
              Water Withdrawal measures the total water consumed by data center
              cooling systems supporting your cloud infrastructure. Calculated
              using Water Usage Effectiveness (WUE) metrics, this KPI helps you
              understand the water footprint of your operations across different
              regions. Water scarcity is a growing concern in many data center
              locations, making this metric crucial for sustainable operations.
              By tracking water withdrawal, you can identify water-intensive
              regions, optimize workload placement to minimize water impact, and
              support corporate water stewardship goals. This metric is
              particularly important for organizations with commitments to water
              conservation and those operating in water-stressed regions.
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
              <>
                <WaterTimelineChart data={timelineData} />
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Data source: AWS Sustainability</span>
                    <a
                      href="https://sustainability.aboutamazon.com/products-services/aws-cloud#increasing-efficiency"
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
