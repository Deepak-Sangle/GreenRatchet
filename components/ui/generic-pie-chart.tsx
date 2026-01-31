"use client";

import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, TrendingDown } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { match } from "ts-pattern";
import { PieChartTooltip } from "./chart-tooltip";

export interface PieDataPoint {
  category: string;
  value: number;
  percentage: number;
  color: string;
  label: string;
}

export interface InsightRule {
  category: string;
  thresholds: {
    good: (percentage: number) => boolean;
    warning: (percentage: number) => boolean;
    // alert is default if not good or warning
  };
  messages: {
    good: (value: number, percentage: number) => string;
    warning: (value: number, percentage: number) => string;
    alert: (value: number, percentage: number) => string;
  };
}

export interface GenericPieChartConfig {
  title: string;
  valueFormatter: (value: number) => string;
  height?: number;
  showInsights?: boolean;
  insightTitle?: string;
  insightRules?: InsightRule[];
  customInsights?: Array<{
    status: StatusLevel;
    title: string;
    message: string;
  }>;
}

export interface GenericPieChartProps {
  data: PieDataPoint[];
  config: GenericPieChartConfig;
}

export type StatusLevel = "good" | "warning" | "alert";

function getStatusLevel(percentage: number, rule: InsightRule): StatusLevel {
  if (rule.thresholds.good(percentage)) return "good";
  if (rule.thresholds.warning(percentage)) return "warning";
  return "alert";
}

function getStatusClasses(status: StatusLevel): {
  container: string;
  icon: string;
  title: string;
  description: string;
} {
  return match(status)
    .with("good", () => ({
      container: "bg-success/10 border-success/20",
      icon: "text-success",
      title: "text-foreground",
      description: "text-muted-foreground",
    }))
    .with("warning", () => ({
      container: "bg-warning/10 border-warning/20",
      icon: "text-warning",
      title: "text-foreground",
      description: "text-muted-foreground",
    }))
    .with("alert", () => ({
      container: "bg-destructive/10 border-destructive/20",
      icon: "text-destructive",
      title: "text-foreground",
      description: "text-muted-foreground",
    }))
    .exhaustive();
}

function getStatusIcon(status: StatusLevel, classes: string): React.ReactNode {
  return match(status)
    .with("good", () => (
      <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${classes}`} />
    ))
    .with("warning", () => (
      <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${classes}`} />
    ))
    .with("alert", () => (
      <TrendingDown className={`h-5 w-5 mt-0.5 flex-shrink-0 ${classes}`} />
    ))
    .exhaustive();
}

export function GenericPieChart({ data, config }: GenericPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    percentage: item.percentage,
    fill: item.color,
  }));

  const insights = config.showInsights
    ? [
        // Rule-based insights
        ...(config.insightRules
          ? config.insightRules
              .map((rule) => {
                const dataPoint = data.find(
                  (d) => d.category === rule.category,
                );
                if (!dataPoint) return null;

                const status = getStatusLevel(dataPoint.percentage, rule);
                const classes = getStatusClasses(status);
                const message = match(status)
                  .with("good", () =>
                    rule.messages.good(dataPoint.value, dataPoint.percentage),
                  )
                  .with("warning", () =>
                    rule.messages.warning(
                      dataPoint.value,
                      dataPoint.percentage,
                    ),
                  )
                  .with("alert", () =>
                    rule.messages.alert(dataPoint.value, dataPoint.percentage),
                  )
                  .exhaustive();

                return {
                  category: rule.category,
                  label: dataPoint.label,
                  percentage: dataPoint.percentage,
                  status,
                  classes,
                  message,
                };
              })
              .filter(
                (insight): insight is NonNullable<typeof insight> =>
                  insight !== null,
              )
          : []),
        // Custom insights
        ...(config.customInsights
          ? config.customInsights.map((insight) => ({
              category: "custom",
              label: insight.title,
              percentage: 0,
              status: insight.status,
              classes: getStatusClasses(insight.status),
              message: insight.message,
            }))
          : []),
      ]
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="p-6 shadow-soft">
        <h4 className="font-heading text-base font-semibold mb-4">
          {config.title}
        </h4>
        <ResponsiveContainer width="100%" height={config.height || 300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              // Recharts' percent value is a decimal
              label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
              outerRadius={100}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={
                <PieChartTooltip valueFormatter={config.valueFormatter} />
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "14px",
              }}
              className="text-foreground"
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Insights */}
      {config.showInsights && insights.length > 0 && (
        <Card className="p-6 shadow-soft">
          <h4 className="font-heading text-base font-semibold mb-4">
            {config.insightTitle || "Insights"}
          </h4>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${insight.classes.container}`}
              >
                {getStatusIcon(insight.status, insight.classes.icon)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${insight.classes.title}`}>
                    {insight.category === "custom"
                      ? insight.label
                      : `${insight.percentage.toFixed(1)}% ${insight.label}`}
                  </p>
                  <p className={`text-xs ${insight.classes.description} mt-1`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
