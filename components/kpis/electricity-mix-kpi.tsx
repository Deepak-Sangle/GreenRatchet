"use client";

import {
  getElectricityMixDataAction,
  type ElectricityMixData,
} from "@/app/actions/electricity-mix-analytics";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ElectricityMixStats } from "./electricity-mix-stats";
import { ElectricityMixTimelineChart } from "./electricity-mix-timeline-chart";

export function ElectricityMixKpi() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<ElectricityMixData | null>(null);
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
    const result = await getElectricityMixDataAction();
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
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Electricity Mix Breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              Track energy source composition over time
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
              The electricity mix shows the breakdown of electricity sources
              powering your cloud infrastructure by energy type. This metric
              tracks three key categories: Low-Carbon (nuclear + renewables),
              Renewable (wind + solar + hydro + geothermal), and Fossil (coal +
              gas + oil). Understanding your electricity mix composition helps
              identify trends in clean energy adoption, assess exposure to
              fossil fuel-based electricity, demonstrate progress toward
              renewable energy goals, and make informed decisions about regional
              workload placement. This historical view enables you to track
              improvements over time and communicate sustainability progress to
              stakeholders.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Electricity Mix Analysis
            </h3>
            {loading && (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Loading electricity mix data...
                </p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {data && !loading && !error && (
              <div className="space-y-6">
                <ElectricityMixStats
                  averages={data.averages}
                  totalCo2e={data.totalCo2e}
                />
                <ElectricityMixTimelineChart data={data.timeline} />
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Data source: Electricity Maps</span>
                    <a
                      href="https://www.electricitymaps.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Learn more
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
