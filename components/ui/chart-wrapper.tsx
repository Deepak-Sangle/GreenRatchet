"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

interface ChartWrapperProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function ChartWrapper({ 
  title, 
  icon: Icon, 
  children, 
  className = "" 
}: ChartWrapperProps) {
  return (
    <Card className={`shadow-soft ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TimelineChartData {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

export function formatMonth(monthStr: string): string {
  const date = new Date(monthStr + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function formatValue(value: number | undefined, unit: string): string {
  return value != null ? `${value.toFixed(1)} ${unit}` : `0 ${unit}`;
}

export function prepareTimelineData(data: TimelineChartData[]) {
  const historicalData = data.filter((d) => !d.isProjected);
  const projectedData = data.filter((d) => d.isProjected);
  const lastHistoricalMonth = historicalData[historicalData.length - 1]?.month;
  const lastHistoricalValue = historicalData[historicalData.length - 1]?.cumulative;

  // Create chart data with proper connection
  const chartData = data.map((d) => ({
    month: d.month,
    historical: d.isProjected ? null : d.cumulative,
    projected: d.isProjected ? d.cumulative : null,
  }));

  // Add connection point for smooth transition
  if (lastHistoricalMonth && projectedData.length > 0) {
    const connectionIndex = chartData.findIndex(d => d.month === lastHistoricalMonth);
    if (connectionIndex >= 0 && connectionIndex < chartData.length - 1) {
      chartData[connectionIndex + 1] = {
        ...chartData[connectionIndex + 1],
        projected: lastHistoricalValue,
      };
    }
  }

  return { chartData, lastHistoricalMonth };
}
