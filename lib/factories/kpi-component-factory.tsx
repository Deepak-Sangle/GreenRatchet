"use client";

import { ExpandableKpiCard } from "@/components/ui/expandable-kpi-card";
import { MetricGrid } from "@/components/ui/metric-card";
import { useExpandableData } from "@/lib/hooks/use-expandable-data";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface KpiConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  explanationText?: string;
}

interface MetricConfig {
  label: string;
  getValue: (data: any) => string | number;
  getUnit?: (data: any) => string | undefined;
  isHighlighted?: (data: any) => boolean;
}

interface CreateKpiComponentProps<T> {
  config: KpiConfig;
  fetchAction: () => Promise<{ success: true; data: T } | { error: string }>;
  metrics: MetricConfig[];
  customContent?: (data: T) => ReactNode;
  columns?: number;
}

export function createKpiComponent<T>({
  config,
  fetchAction,
  metrics,
  customContent,
  columns = 2,
}: CreateKpiComponentProps<T>) {
  return function KpiComponent() {
    const { data, loading, error, toggleExpanded } = useExpandableData<T>({
      fetchData: fetchAction,
    });

    const metricData = data ? metrics.map(metric => ({
      label: metric.label,
      value: metric.getValue(data),
      unit: metric.getUnit?.(data),
      highlighted: metric.isHighlighted?.(data) ?? false,
    })) : [];

    return (
      <ExpandableKpiCard
        title={config.title}
        description={config.description}
        icon={config.icon}
        iconColor={config.iconColor}
        iconBgColor={config.iconBgColor}
        loading={loading}
        error={error}
        onExpand={toggleExpanded}
      >
        <div className="space-y-6">
          {config.explanationText && (
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {config.explanationText}
              </p>
            </div>
          )}

          {customContent && data && (
            <div>{customContent(data)}</div>
          )}

          {data && (
            <div className="pt-4 border-t">
              <h3 className="font-heading text-lg font-semibold mb-4">
                Current Metrics
              </h3>
              <MetricGrid metrics={metricData} columns={columns} />
            </div>
          )}
        </div>
      </ExpandableKpiCard>
    );
  };
}

// Example usage factory for common patterns
export function createSimpleKpiComponent<T>(
  config: KpiConfig,
  fetchAction: () => Promise<{ success: true; data: T } | { error: string }>,
  getValue: (data: T) => string | number,
  unit?: string
) {
  return createKpiComponent({
    config,
    fetchAction,
    metrics: [
      {
        label: config.title,
        getValue,
        getUnit: () => unit,
        isHighlighted: () => true,
      }
    ],
    columns: 1,
  });
}
