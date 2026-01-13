import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface KPITrendIndicatorProps {
  trend: "increasing" | "decreasing" | "stable";
  percentageChange?: number;
  className?: string;
}

export function KPITrendIndicator({
  trend,
  percentageChange,
  className,
}: KPITrendIndicatorProps) {
  const trendConfig = {
    increasing: {
      icon: TrendingUp,
      className: "text-emerald-600 dark:text-emerald-400",
      label: "Increasing",
    },
    decreasing: {
      icon: TrendingDown,
      className: "text-red-600 dark:text-red-400",
      label: "Decreasing",
    },
    stable: {
      icon: Minus,
      className: "text-muted-foreground",
      label: "Stable",
    },
  };

  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <Icon className={`h-4 w-4 ${config.className}`} />
      {percentageChange !== undefined && (
        <span className={`text-sm font-medium ${config.className}`}>
          {Math.abs(percentageChange).toFixed(1)}%
        </span>
      )}
    </div>
  );
}
