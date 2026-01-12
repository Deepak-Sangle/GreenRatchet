"use client";

import { getAIUsageAnalytics } from "@/app/actions/ai-usage-analytics";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { formatPercentage } from "@/lib/utils";
import { ChevronDown, ChevronUp, Cpu, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AIUsageTimelineChart } from "./ai-usage-timeline-chart";

interface AIUsageData {
  currentUsage: {
    aiKwh: number;
    totalKwh: number;
    percentage: number;
  };
  timeline: Array<{
    date: string;
    aiKwh: number;
    totalKwh: number;
    percentage: number;
    cumulativeAiKwh: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export function AIUsageKPI() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<AIUsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getAIUsageAnalytics();

      if ("error" in result) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch AI usage data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !data && !loading) {
      fetchData();
    }
  }, [isExpanded, data, loading]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRetry = () => {
    setData(null);
    fetchData();
  };

  return (
    <Card className="p-6 shadow-soft transition-all duration-200">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between text-left hover:bg-muted/50 -m-6 p-6 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <Cpu className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              AI Energy Usage
            </h2>
            <p className="text-sm text-muted-foreground">
              Percentage of total energy consumed by AI/ML workloads (GPU
              instances)
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
              AI energy usage measures the proportion of an organisation's total
              cloud energy consumption that is attributable to AI and
              machine-learning workloads, such as model training, inference, and
              data processing. This KPI is significant because AI workloads are
              typically far more energy-intensive than traditional applications
              and can materially increase environmental impact if left
              unmanaged. It is calculated by identifying AI/ML-related cloud
              services or workloads and dividing their estimated energy
              consumption by total cloud energy usage. Managing and, where
              appropriate, reducing this percentage indicates responsible AI
              deployment through model optimisation, efficient hardware
              selection, and workload scheduling. For lenders, this KPI provides
              transparency into emerging energy risks, demonstrates governance
              over high-growth technologies, and signals that the borrower is
              proactively managing the sustainability implications of AI
              adoption rather than allowing emissions and energy use to scale
              unchecked.
            </p>
          </div>

          {loading && (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <Loading size="lg" className="mx-auto mb-3" />
              <p className="text-muted-foreground">Loading AI usage data...</p>
            </div>
          )}

          {error && <ErrorMessage message={error} onRetry={handleRetry} />}

          {data && (
            <div className="space-y-6">
              {/* Description */}

              {/* Current Usage Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    AI Usage Percentage
                  </p>
                  <p className="text-2xl font-semibold text-primary">
                    {formatPercentage(data.currentUsage.percentage)}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    AI Energy Consumption
                  </p>
                  <p className="text-2xl font-semibold">
                    {data.currentUsage.aiKwh.toFixed(2)} kWh
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Energy Consumption
                  </p>
                  <p className="text-2xl font-semibold">
                    {data.currentUsage.totalKwh.toFixed(2)} kWh
                  </p>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">
                    AI Usage Timeline (Last 30 Days)
                  </h3>
                </div>
                <AIUsageTimelineChart
                  data={data.timeline}
                  showCumulative={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
