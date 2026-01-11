"use client";

import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Leaf } from "lucide-react";
import { useState } from "react";

export function Co2EmissionKpi() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-6 shadow-soft transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              CO2 Emissions
            </h2>
            <p className="text-sm text-muted-foreground">
              Track carbon footprint from cloud operations
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
              CO2 Emissions measures the total carbon dioxide equivalent (CO2e)
              produced by your cloud infrastructure operations, including both
              operational emissions from energy consumption and embodied
              emissions from hardware manufacturing. This metric helps you
              identify high-emission services and regions, make informed
              decisions about cloud provider selection, demonstrate progress
              toward net-zero commitments, and qualify for sustainability-linked
              financing with better terms. Tracking this KPI is essential for
              regulatory compliance, stakeholder expectations, and unlocking
              cost savings through energy efficiency improvements.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Performance Analytics
            </h3>
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Graph components will be integrated here
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Time series, regional breakdown, service comparison charts
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
