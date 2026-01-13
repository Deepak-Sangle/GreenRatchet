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

// Threshold configuration for GHG intensity color coding
const INTENSITY_THRESHOLDS = {
  employee: {
    excellent: 0.01, // < 0.01 MTCO2e per employee (green)
    good: 0.05, // < 0.05 MTCO2e per employee (yellow)
    // >= 0.05 MTCO2e per employee (red)
  },
  revenue: {
    excellent: 0.1, // < 0.1 MTCO2e per $1M revenue (green)
    good: 0.5, // < 0.5 MTCO2e per $1M revenue (yellow)
    // >= 0.5 MTCO2e per $1M revenue (red)
  },
} as const;

/**
 * Determines the color scheme based on GHG intensity thresholds
 */
function getIntensityColorScheme(
  value: number | null,
  type: "employee" | "revenue"
) {
  if (value === null) {
    return {
      bgClass: "bg-muted/50",
      textClass: "text-muted-foreground",
      label: "N/A",
    };
  }

  const thresholds = INTENSITY_THRESHOLDS[type];

  if (value < thresholds.excellent) {
    return {
      bgClass: "bg-emerald-100 dark:bg-emerald-900/20",
      textClass: "text-emerald-700 dark:text-emerald-400",
      label: "Excellent",
    };
  } else if (value < thresholds.good) {
    return {
      bgClass: "bg-yellow-100 dark:bg-yellow-900/20",
      textClass: "text-yellow-700 dark:text-yellow-400",
      label: "Good",
    };
  } else {
    return {
      bgClass: "bg-red-100 dark:bg-red-900/20",
      textClass: "text-red-700 dark:text-red-400",
      label: "Needs Improvement",
    };
  }
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
                {(() => {
                  const employeeColorScheme = getIntensityColorScheme(
                    data.intensityPerEmployee,
                    "employee"
                  );
                  return (
                    <div
                      className={`${employeeColorScheme.bgClass} rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">
                          Intensity per Employee
                        </p>
                        {data.intensityPerEmployee !== null && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full bg-background/50 ${employeeColorScheme.textClass} font-medium`}
                          >
                            {employeeColorScheme.label}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xl font-semibold ${data.intensityPerEmployee !== null ? employeeColorScheme.textClass : "text-muted-foreground"}`}
                      >
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
                  );
                })()}
                {(() => {
                  const revenueColorScheme = getIntensityColorScheme(
                    data.intensityPerRevenue,
                    "revenue"
                  );
                  return (
                    <div
                      className={`${revenueColorScheme.bgClass} rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">
                          Intensity per $1M Revenue
                        </p>
                        {data.intensityPerRevenue !== null && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full bg-background/50 ${revenueColorScheme.textClass} font-medium`}
                          >
                            {revenueColorScheme.label}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xl font-semibold ${data.intensityPerRevenue !== null ? revenueColorScheme.textClass : "text-muted-foreground"}`}
                      >
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
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
