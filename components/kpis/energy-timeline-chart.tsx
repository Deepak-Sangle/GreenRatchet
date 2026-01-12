"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parse } from "date-fns";
import { TrendingUp, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface EnergyTimelineData {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

interface EnergyTimelineChartProps {
  data: EnergyTimelineData[];
}

function formatMonth(monthStr: string): string {
  const date = parse(monthStr, "yyyy-MM", new Date());
  return format(date, "MMM yy");
}

function formatValue(value: number | undefined): string {
  return value != null ? `${value.toFixed(1)} MWh` : `0 MWh`;
}

export function EnergyTimelineChart({ data }: EnergyTimelineChartProps) {
  const historicalData = data.filter((d) => !d.isProjected);
  const projectedData = data.filter((d) => d.isProjected);
  const lastHistoricalMonth = historicalData[historicalData.length - 1]?.month;
  const lastHistoricalValue =
    historicalData[historicalData.length - 1]?.cumulative;

  // Create chart data with proper connection
  const chartData = data.map((d) => ({
    month: d.month,
    historical: d.isProjected ? null : d.cumulative,
    projected: d.isProjected ? d.cumulative : null,
  }));

  // Add connection: last historical point should also start the projected line
  if (
    lastHistoricalMonth &&
    lastHistoricalValue != null &&
    projectedData.length > 0
  ) {
    const lastHistoricalIndex = chartData.findIndex(
      (d) => d.month === lastHistoricalMonth
    );
    if (lastHistoricalIndex >= 0) {
      chartData[lastHistoricalIndex] = {
        ...chartData[lastHistoricalIndex],
        projected: lastHistoricalValue,
      };
    }
  }

  // Calculate trend
  const firstValue = historicalData[0]?.cumulative || 0;
  const lastValue = lastHistoricalValue || 0;
  const trend = lastValue - firstValue;
  const trendPercent =
    firstValue > 0 ? ((trend / firstValue) * 100).toFixed(1) : "0.0";

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              Energy Consumption Timeline
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Cumulative energy consumption over time with{" "}
              {projectedData.length}
              -month projection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={trend > 0 ? "destructive" : "default"}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend > 0 ? "+" : ""}
              {trendPercent}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="energyHistoricalGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="energyProjectedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-4))"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-4))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} MWh`}
              />
              <RechartsTooltip
                formatter={(
                  value: number | undefined,
                  name?: string,
                  props?: {
                    payload?: {
                      month: string;
                      historical?: number;
                      projected?: number;
                    };
                  }
                ) => {
                  // At boundary point (has both values), only show historical
                  if (
                    props?.payload?.historical != null &&
                    props?.payload?.projected != null &&
                    name === "projected"
                  ) {
                    return null;
                  }
                  const label = name === "historical" ? "Actual" : "Projected";
                  return [formatValue(value), label];
                }}
                labelFormatter={(label: string) => formatMonth(label)}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="flex items-center justify-center gap-6 mb-2">
                      {payload?.map((entry, index) => (
                        <div
                          key={`legend-${index}`}
                          className="flex items-center gap-2"
                        >
                          {entry.dataKey === "historical" ? (
                            <svg
                              width="32"
                              height="2"
                              className="overflow-visible"
                            >
                              <line
                                x1="0"
                                y1="1"
                                x2="32"
                                y2="1"
                                stroke={entry.color}
                                strokeWidth="2"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="32"
                              height="2"
                              className="overflow-visible"
                            >
                              <line
                                x1="0"
                                y1="1"
                                x2="32"
                                y2="1"
                                stroke={entry.color}
                                strokeWidth="2"
                                strokeDasharray="5 5"
                              />
                            </svg>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {entry.dataKey === "historical"
                              ? "Actual Consumption"
                              : "Projected Consumption"}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {lastHistoricalMonth && (
                <ReferenceLine
                  x={lastHistoricalMonth}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                  label={{
                    value: "Projection Start",
                    position: "top",
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="historical"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                fill="url(#energyHistoricalGradient)"
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#energyProjectedGradient)"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Current Total</p>
            <p className="text-2xl font-bold">{formatValue(lastValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Growth Rate</p>
            <p className="text-2xl font-bold">
              {trend > 0 ? "+" : ""}
              {trendPercent}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Projected Total (6mo)
            </p>
            <p className="text-2xl font-bold">
              {projectedData.length > 0
                ? formatValue(
                    projectedData[projectedData.length - 1].cumulative
                  )
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
