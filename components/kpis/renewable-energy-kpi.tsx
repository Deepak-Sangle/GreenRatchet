"use client";

import {
  getRenewableEnergyDataAction,
  type RenewableEnergyData,
} from "@/app/actions/renewable-energy-analytics";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RenewableEnergyStats } from "./renewable-energy-stats";

export function RenewableEnergyKpi() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<RenewableEnergyData | null>(null);
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
    const result = await getRenewableEnergyDataAction();
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
          <div className="h-10 w-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
            <Wind className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Renewable Energy %
            </h2>
            <p className="text-sm text-muted-foreground">
              Track percentage of workloads powered by renewable sources
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
              Renewable Energy % measures the proportion of cloud workloads
              whose electricity consumption is matched with renewable energy
              sources such as wind, solar, or hydropower. This KPI matters
              because increasing renewable energy use reduces reliance on fossil
              fuels and lowers the lifecycle carbon emissions associated with
              digital infrastructure. It is generally calculated using cloud
              provider disclosures that allocate renewable energy procurement or
              certificates to regional workload energy consumption, expressed as
              a percentage of total cloud energy use. An increase in this metric
              indicates stronger alignment with clean-energy sourcing strategies
              and supports emissions reduction over time. For lenders, Renewable
              Energy % is a familiar and comparable indicator that signals
              progress toward net-zero commitments, while also providing
              assurance that cloud-related emissions are being addressed through
              verifiable energy sourcing mechanisms.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Renewable Energy Analysis
            </h3>
            {loading && (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Loading renewable energy data...
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
                <RenewableEnergyStats data={data} />
                <div className="mt-6 pt-4 border-t">
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
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
