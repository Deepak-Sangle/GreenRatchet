"use client";

import { formatDate, formatPercentage } from "@/lib/utils";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AIUsageTimelineData {
  date: string;
  aiKwh: number;
  totalKwh: number;
  percentage: number;
  cumulativeAiKwh: number;
}

interface AIUsageTimelineChartProps {
  data: AIUsageTimelineData[];
  showCumulative?: boolean;
}

export function AIUsageTimelineChart({
  data,
  showCumulative = false,
}: AIUsageTimelineChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      month: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      percentage: item.percentage,
      aiKwh: item.aiKwh,
      cumulative: showCumulative ? item.cumulativeAiKwh : null,
    }));
  }, [data, showCumulative]);

  const maxPercentage = Math.max(...data.map((d) => d.percentage), 10);

  return (
    <div className="space-y-4">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="aiUsageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
              {showCumulative && (
                <linearGradient
                  id="cumulativeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0}
                  />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
              domain={[0, Math.ceil(maxPercentage * 1.1)]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]?.payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="font-medium">{label}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            AI Usage:
                          </span>
                          <span className="font-medium text-primary">
                            {formatPercentage(data.percentage)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            AI Energy:
                          </span>
                          <span>{data.aiKwh.toFixed(2)} kWh</span>
                        </div>
                        {showCumulative && data.cumulative !== null && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              Cumulative:
                            </span>
                            <span>{data.cumulative.toFixed(2)} kWh</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#aiUsageGradient)"
              name="AI Usage %"
            />
            {showCumulative && (
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#cumulativeGradient)"
                name="Cumulative AI kWh"
                yAxisId="right"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Current Period</p>
          <p className="font-medium">
            {data.length > 0 ? formatDate(data[0]?.date) : "No data"} -{" "}
            {data.length > 0
              ? formatDate(data[data.length - 1]?.date)
              : "No data"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Total AI Energy</p>
          <p className="font-medium">
            {data.reduce((sum, d) => sum + d.aiKwh, 0).toFixed(2)} kWh
          </p>
        </div>
      </div>
    </div>
  );
}
