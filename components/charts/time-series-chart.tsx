"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface TimeSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

interface DataSeries {
  key: string;
  name: string;
  color: string;
  gradientId?: string;
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  series: DataSeries[];
  title: string;
  description?: string;
  icon?: LucideIcon;
  formatValue?: (value: number) => string;
  formatDate?: (date: string) => string;
  formatTooltipLabel?: (label: string) => string;
  height?: number;
  className?: string;
}

export function TimeSeriesChart({
  data,
  series,
  title,
  description,
  icon: Icon,
  formatValue = (value) => value.toFixed(2),
  formatDate = (date) => date,
  formatTooltipLabel = (label) => label,
  height = 400,
  className,
}: TimeSeriesChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <Badge variant="secondary">{data.length} data points</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("w-full")} style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10 }}>
              <defs>
                {series.map((s) => (
                  <linearGradient
                    key={s.gradientId ?? s.key}
                    id={s.gradientId ?? `gradient-${s.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
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
                tickFormatter={(value) => formatValue(value)}
              />
              <RechartsTooltip
                formatter={(value: number | undefined, name?: string) => {
                  const seriesItem = series.find((s) => s.key === name);
                  const label = seriesItem?.name ?? name ?? "Value";
                  return [formatValue(value ?? 0), label];
                }}
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="line"
                formatter={(value) => {
                  const seriesItem = series.find((s) => s.key === value);
                  return seriesItem?.name ?? value;
                }}
              />
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#${s.gradientId ?? `gradient-${s.key}`})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
