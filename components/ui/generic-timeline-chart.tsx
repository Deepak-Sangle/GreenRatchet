"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
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
import { formatMonth } from "./chart-wrapper";

export interface TimelineDataPoint {
  month: string; // month string (e.g., "2024-01")
  // actual values, instead of storing a number, we store a Record<string, number | null>
  // so if there are multiple lines, each one will be identified using the string key
  // so make sure that the key here match with the `GenericTimelineChartProps.lines` keys
  lines: Record<string, number | null>; // multiple data lines
  isProjected?: boolean;
}

export interface TimelineConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  height?: number;
  yAxisFormatter?: (value: number) => string;
  showProjectionLine?: boolean;
  showStats?: boolean;
  stats?: Array<{
    label: string;
    value: string | number;
    formatter?: (value: any) => string;
  }>;
}

export interface LineConfig {
  key: string;
  label: string;
  color: string; // CSS variable name like 'var(--chart-1)'
  strokeDasharray?: string;
  fillOpacity?: number;
}

export interface GenericTimelineChartProps {
  data: TimelineDataPoint[];
  config: TimelineConfig;
  lines: LineConfig[];
  xAxisFormatter?: (value: string) => string;
  tooltipFormatter?: (
    value: number | undefined,
    lineKey: string,
    dataPoint: TimelineDataPoint,
  ) => [string, string] | null;
}

export function GenericTimelineChart({
  data,
  config,
  lines,
  xAxisFormatter = formatMonth,
  tooltipFormatter,
}: GenericTimelineChartProps) {
  const { chartData, historicalData, projectedData, lastHistoricalPoint } =
    useMemo(() => {
      const historical = data.filter((d) => !d.isProjected);
      const projected = data.filter((d) => d.isProjected);
      const lastHistorical = historical[historical.length - 1];

      // Create chart data with proper connection for projections
      const chart = data.map((d) => {
        const point: Record<string, any> = { month: d.month };

        lines.forEach((line) => {
          if (d.isProjected) {
            point[`${line.key}_projected`] = d.lines[line.key];
            point[line.key] = null;
          } else {
            point[line.key] = d.lines[line.key];
            point[`${line.key}_projected`] = null;
          }
        });

        return point;
      });

      // Add connection: last historical point should also start projected lines
      if (lastHistorical && projected.length > 0) {
        const lastHistoricalIndex = chart.findIndex(
          (d) => d.month === lastHistorical.month,
        );
        if (lastHistoricalIndex >= 0) {
          lines.forEach((line) => {
            const value = lastHistorical.lines[line.key];
            if (value != null) {
              chart[lastHistoricalIndex][`${line.key}_projected`] = value;
            }
          });
        }
      }

      return {
        chartData: chart,
        historicalData: historical,
        projectedData: projected,
        lastHistoricalPoint: lastHistorical,
      };
    }, [data, lines]);

  // Calculate trend for first line (primary metric)
  const primaryLine = lines[0];
  const trend = useMemo(() => {
    if (!primaryLine || historicalData.length < 2) {
      return null;
    }

    const firstValue = historicalData[0]?.lines[primaryLine.key] || 0;
    const lastValue =
      historicalData[historicalData.length - 1]?.lines[primaryLine.key] || 0;
    const trendValue = lastValue - firstValue;
    const trendPercent =
      firstValue > 0 ? ((trendValue / firstValue) * 100).toFixed(1) : "0.0";

    return { value: trendValue, percent: trendPercent };
  }, [historicalData, primaryLine]);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <config.icon className={`h-5 w-5 ${config.iconColor}`} />
              {config.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
          {trend && (
            <div className="flex items-center gap-2">
              <Badge variant={trend.value > 0 ? "destructive" : "default"}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend.value > 0 ? "+" : ""}
                {trend.percent}%
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: `${config.height || 400}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                {lines.map((line, index) => (
                  <g key={line.key}>
                    <linearGradient
                      id={`${line.key}Gradient`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={line.color}
                        stopOpacity={line.fillOpacity || 0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={line.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id={`${line.key}ProjectedGradient`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={line.color}
                        stopOpacity={(line.fillOpacity || 0.3) * 0.7}
                      />
                      <stop
                        offset="95%"
                        stopColor={line.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </g>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickFormatter={xAxisFormatter}
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
                tickFormatter={config.yAxisFormatter}
              />
              <RechartsTooltip
                formatter={(
                  value: number | undefined,
                  name?: string,
                  props?: { payload?: any },
                ) => {
                  if (!name || !props?.payload) return null;

                  // Handle projected lines at boundary points
                  const isProjectedLine = name.endsWith("_projected");
                  const lineKey = isProjectedLine
                    ? name.replace("_projected", "")
                    : name;
                  const hasHistorical = props.payload[lineKey] != null;
                  const hasProjected =
                    props.payload[`${lineKey}_projected`] != null;

                  if (isProjectedLine && hasHistorical && hasProjected) {
                    return null; // Skip projected at boundary
                  }

                  if (tooltipFormatter) {
                    return tooltipFormatter(value, lineKey, props.payload);
                  }

                  const line = lines.find((l) => l.key === lineKey);
                  const label = isProjectedLine
                    ? `${line?.label} (Projected)`
                    : line?.label;
                  return [value?.toString() || "N/A", label || name];
                }}
                labelFormatter={(label: any) => xAxisFormatter(String(label))}
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
                  if (!payload) return null;

                  // Filter to show only main lines (not projected duplicates)
                  const mainLines = payload.filter(
                    (entry) =>
                      !entry.dataKey?.toString().endsWith("_projected"),
                  );

                  return (
                    <div className="flex items-center justify-center gap-6 mb-2">
                      {mainLines.map((entry, index) => {
                        const hasProjected = projectedData.length > 0;
                        return (
                          <div
                            key={`legend-${index}`}
                            className="flex items-center gap-4"
                          >
                            <div className="flex items-center gap-2">
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
                              <span className="text-sm text-muted-foreground">
                                {entry.value}
                              </span>
                            </div>
                            {hasProjected && (
                              <div className="flex items-center gap-2">
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
                                <span className="text-sm text-muted-foreground">
                                  {entry.value} (Projected)
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
              {config.showProjectionLine && lastHistoricalPoint && (
                <ReferenceLine
                  x={lastHistoricalPoint.month}
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
              {lines.map((line) => (
                <g key={line.key}>
                  <Area
                    type="monotone"
                    dataKey={line.key}
                    stroke={line.color}
                    strokeWidth={2}
                    fill={`url(#${line.key}Gradient)`}
                    connectNulls
                  />
                  {projectedData.length > 0 && (
                    <Area
                      type="monotone"
                      dataKey={`${line.key}_projected`}
                      stroke={line.color}
                      strokeWidth={2}
                      strokeDasharray={line.strokeDasharray || "5 5"}
                      fill={`url(#${line.key}ProjectedGradient)`}
                      connectNulls
                    />
                  )}
                </g>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {config.showStats && config.stats && (
          <div
            className={`mt-4 grid grid-cols-${config.stats.length} gap-4 text-center`}
          >
            {config.stats.map((stat, index) => (
              <div key={index}>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">
                  {stat.formatter ? stat.formatter(stat.value) : stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
