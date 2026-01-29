"use client";

import { CreateKpiDialog } from "@/components/kpis/create-kpi-dialog";
import { ExpandableKpiCard } from "@/components/ui/expandable-kpi-card";
import { useExpandableData } from "@/lib/hooks/use-expandable-data";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface BaseKpiCardProps<T> {
  title: string;
  subtitle: string;
  longDescription: string | ReactNode;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  fetchAction: () => Promise<{ success: true; data: T } | { error: string }>;
  renderAnalytics: (data: T) => ReactNode;
  analyticsTitle?: string;
  className?: string;
  kpiType?: string;
}

/**
 * A generic KPI card component that handles:
 * 1. Data fetching using useExpandableData hook
 * 2. Expansion logic and UI states (loading, error)
 * 3. Consistent layout for title, subtitle, icon, and long description
 * 4. A dedicated section for analytics/charts
 */
export function BaseKpiCard<T>({
  title,
  subtitle,
  longDescription,
  icon,
  iconColor,
  iconBgColor,
  fetchAction,
  renderAnalytics,
  analyticsTitle = "Performance Analytics",
  kpiType,
}: BaseKpiCardProps<T>) {
  const { isExpanded, data, loading, error, toggleExpanded } =
    useExpandableData<T>({
      fetchData: fetchAction,
    });

  return (
    <ExpandableKpiCard
      title={title}
      description={subtitle}
      icon={icon}
      iconColor={iconColor || "text-emerald-600 dark:text-emerald-400"}
      iconBgColor={iconBgColor || "bg-emerald-100 dark:bg-emerald-900/20"}
      loading={loading}
      error={error}
      isExpanded={isExpanded}
      onToggle={toggleExpanded}
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {typeof longDescription === "string" ? (
              <p className="text-muted-foreground leading-relaxed">
                {longDescription}
              </p>
            ) : (
              longDescription
            )}
          </div>
          {kpiType && (
            <div className="shrink-0">
              <CreateKpiDialog kpiType={kpiType} defaultName={title} />
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-heading text-lg font-semibold mb-4">
            {analyticsTitle}
          </h3>
          {data && renderAnalytics(data)}
        </div>
      </div>
    </ExpandableKpiCard>
  );
}
