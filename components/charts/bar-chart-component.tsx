"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartDataPoint {
  [key: string]: string | number;
}

interface BarChartComponentProps {
  data: BarChartDataPoint[];
  dataKey: string;
  categoryKey: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  formatValue?: (value: number) => string;
  formatAxisTick?: (value: number) => string;
  formatTooltipLabel?: (label: any) => string;
  barColor?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  className?: string;
}

export function BarChartComponent({
  data,
  dataKey,
  categoryKey,
  title,
  description,
  icon: Icon,
  formatValue = (value) => value.toFixed(2),
  formatAxisTick = (value) => value.toFixed(2),
  formatTooltipLabel = (label) => `${categoryKey}: ${label}`,
  barColor = "hsl(var(--primary))",
  height = 400,
  layout = "vertical",
  className,
}: BarChartComponentProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <Badge variant="secondary">{data.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("w-full")} style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout={layout}
              margin={
                layout === "vertical" ? { left: 80 } : { bottom: 60, top: 10 }
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={layout === "vertical"}
                vertical={layout === "horizontal"}
              />
              {layout === "vertical" ? (
                <>
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatAxisTick}
                  />
                  <YAxis
                    dataKey={categoryKey}
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={categoryKey}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatAxisTick}
                  />
                </>
              )}
              <RechartsTooltip
                formatter={(value: number | undefined) =>
                  formatValue(value ?? 0)
                }
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar
                dataKey={dataKey}
                fill={barColor}
                radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
