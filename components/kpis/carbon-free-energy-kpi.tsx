"use client";

import {
  getCarbonFreeEnergyDataAction,
  type CarbonFreeEnergyData,
} from "@/app/actions/carbon-free-energy-analytics";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CarbonFreeEnergyStats } from "./carbon-free-energy-stats";

export function CarbonFreeEnergyKpi() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<CarbonFreeEnergyData | null>(null);
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
    const result = await getCarbonFreeEnergyDataAction();
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
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Carbon-Free Energy %
            </h2>
            <p className="text-sm text-muted-foreground">
              Track percentage of workloads powered by clean electricity
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
              Carbon-Free Energy (CFE) % measures the share of cloud workloads
              that are powered by electricity generated from carbon-free sources
              such as wind, solar, hydro, or nuclear. This KPI is significant
              because increasing the use of clean electricity directly reduces
              greenhouse gas emissions and supports the broader transition to
              low-carbon energy systems. It is typically calculated by matching
              cloud workload energy consumption with provider-reported
              carbon-free or renewable energy data on a regional or hourly
              basis, expressed as a percentage of total cloud energy use. An
              increase in CFE % indicates that workloads are increasingly
              aligned with cleaner grids or regions supported by renewable
              energy procurement. For lenders, this KPI demonstrates alignment
              with long-term decarbonisation pathways, reduces transition risk
              associated with fossil-fuel dependency, and provides confidence
              that emissions reductions are being achieved through structural
              changes rather than short-term measures.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Carbon-Free Energy Analysis
            </h3>
            {loading && (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Loading carbon-free energy data...
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
                <CarbonFreeEnergyStats data={data} />
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
