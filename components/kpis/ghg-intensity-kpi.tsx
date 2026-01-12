"use client";

import { getGhgIntensityAction } from "@/app/actions/ghg-intensity-actions";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Loader2, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

interface GhgIntensityData {
  totalCo2eMT: number;
  employeeCount: number | null;
  annualRevenue: number | null;
  intensityPerEmployee: number | null;
  intensityPerRevenue: number | null;
}

export function GhgIntensityKpi() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<GhgIntensityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded && !data) {
      loadData();
    }
  }, [isExpanded]);

  async function loadData() {
    setLoading(true);
    setError(null);
    const result = await getGhgIntensityAction();
    if ("error" in result) {
      setError(result.error ?? "Failed to load GHG intensity data");
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
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              GHG Intensity Reduction
            </h2>
            <p className="text-sm text-muted-foreground">
              Carbon emissions per employee
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
              GHG Intensity Reduction measures your organization's carbon
              efficiency by calculating total greenhouse gas emissions (in
              metric tons CO2e) per employee and per million dollars of revenue.
              These social and economic KPIs help normalize emissions across
              organizations of different sizes and business models, making it
              easier to benchmark performance and track improvement over time.
              Lower intensity indicates better carbon efficiency, demonstrating
              your commitment to sustainable growth. These metrics are
              particularly valuable for sustainability-linked loans as they
              combine environmental impact with workforce scale and financial
              performance, providing lenders with a comprehensive view of your
              operational efficiency and ESG performance.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Current Metrics
            </h3>
            {loading && (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Loading intensity data...
                </p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {data && !loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Emissions
                  </p>
                  <p className="text-2xl font-semibold">
                    {data.totalCo2eMT.toFixed(3)} MTCO2e
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Employee Count
                  </p>
                  <p className="text-2xl font-semibold">
                    {data.employeeCount !== null
                      ? data.employeeCount.toLocaleString()
                      : "Not set"}
                  </p>
                  {data.employeeCount === null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Set in organization settings
                    </p>
                  )}
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Annual Revenue
                  </p>
                  <p className="text-2xl font-semibold">
                    {data.annualRevenue !== null
                      ? `$${(data.annualRevenue / 1000000).toFixed(2)}M`
                      : "Not set"}
                  </p>
                  {data.annualRevenue === null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Set in organization settings
                    </p>
                  )}
                </div>
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Intensity per Employee
                  </p>
                  <p className="text-xl font-semibold text-primary">
                    {data.intensityPerEmployee !== null
                      ? `${data.intensityPerEmployee.toFixed(6)} MTCO2e`
                      : "N/A"}
                  </p>
                  {data.intensityPerEmployee === null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Requires employee count
                    </p>
                  )}
                </div>
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Intensity per $1M Revenue
                  </p>
                  <p className="text-xl font-semibold text-primary">
                    {data.intensityPerRevenue != null
                      ? `${data.intensityPerRevenue.toFixed(6)} MTCO2e`
                      : "N/A"}
                  </p>
                  {data.intensityPerRevenue === null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Requires annual revenue
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
