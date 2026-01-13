"use client";

import { Card } from "@/components/ui/card";
import { Factory, Leaf, Zap } from "lucide-react";

interface ElectricityMixStatsProps {
  averages: {
    lowCarbonShare: number;
    fossilShare: number;
    renewableShare: number;
  };
  totalCo2e: number;
}

export function ElectricityMixStats({
  averages,
  totalCo2e,
}: ElectricityMixStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Low-Carbon Share */}
      <Card className="p-6 shadow-soft border-2 border-success/20">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              Low-Carbon Share
            </p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {averages.lowCarbonShare.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nuclear + Renewables
            </p>
          </div>
        </div>
      </Card>

      {/* Renewable Share */}
      <Card className="p-6 shadow-soft border-2 border-teal-200 dark:border-teal-800">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              Renewable Share
            </p>
            <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
              {averages.renewableShare.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Wind + Solar + Hydro
            </p>
          </div>
        </div>
      </Card>

      {/* Fossil Share */}
      <Card className="p-6 shadow-soft border-2 border-destructive/20">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Factory className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Fossil Share</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {averages.fossilShare.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Coal + Gas + Oil
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
