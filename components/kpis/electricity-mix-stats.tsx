"use client";

import { DashboardItem } from "@/components/shared/dashboard-card";
import { Factory, Leaf, Zap } from "lucide-react";

interface ElectricityMixStatsProps {
  averages: {
    lowCarbonShare: number;
    fossilShare: number;
    renewableShare: number;
  };
}

export function ElectricityMixStats({ averages }: ElectricityMixStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DashboardItem
        title="Low-Carbon Share"
        icon={<Leaf className="h-4 w-4 text-success" />}
        contentTitle={`${averages.lowCarbonShare.toFixed(1)}%`}
        contentBody="Nuclear + Renewables"
      />
      <DashboardItem
        title="Renewable Share"
        icon={<Zap className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
        contentTitle={`${averages.renewableShare.toFixed(1)}%`}
        contentBody="Wind + Solar + Hydro"
      />
      <DashboardItem
        title="Fossil Share"
        icon={<Factory className="h-4 w-4 text-destructive" />}
        contentTitle={`${averages.fossilShare.toFixed(1)}%`}
        contentBody="Coal + Gas + Oil"
      />
    </div>
  );
}
