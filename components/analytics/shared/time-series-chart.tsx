"use client";

import { Card } from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartErrorBoundary } from "./chart-error-boundary";

interface TimeSeriesDataPoint {
  date: string;
  actualValue: number;
  targetValue: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title?: string;
  yAxisLabel?: string;
  className?: string;
}

export function TimeSeriesChart({
  data,
  title,
  yAxisLabel,
  className,
}: TimeSeriesChartProps) {
  if (data.length === 0) {
    return (
      <Card className={`p-6 ${className ?? ""}`}>
        <p className="text-sm text-muted-foreground text-center">
          No historical data available
        </p>
      </Card>
    );
  }

  return (
    <ChartErrorBoundary>
      <Card className={`p-6 ${className ?? ""}`}>
        {title && <h3 className="font-heading font-semibold mb-4">{title}</h3>}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      },
                    }
                  : undefined
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
              labelStyle={{
                color: "hsl(var(--card-foreground))",
                fontWeight: 600,
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <Line
              type="monotone"
              dataKey="actualValue"
              name="Actual Value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="targetValue"
              name="Target Value"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--muted-foreground))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </ChartErrorBoundary>
  );
}
