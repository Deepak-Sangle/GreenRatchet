import { cn } from "@/lib/utils";
import { match } from "ts-pattern";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  highlighted?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  highlighted = false,
  className = "",
}: MetricCardProps) {
  const baseClasses = "rounded-lg p-4 transition-all duration-200";
  const bgClasses = highlighted
    ? "bg-primary/10 border border-primary/20"
    : "bg-muted/50 border border-transparent";
  const textClasses = highlighted ? "text-primary" : "";

  return (
    <div className={cn(baseClasses, bgClasses, className)}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-2xl font-bold font-heading", textClasses)}>
        {value}
        {unit && (
          <span className="text-sm ml-1 font-normal opacity-70">{unit}</span>
        )}
      </p>
    </div>
  );
}

interface MetricGridProps {
  metrics: Array<{
    label: string;
    value: string | number;
    unit?: string;
    highlighted?: boolean;
    className?: string;
  }>;
  columns?: number;
}

export function MetricGrid({ metrics, columns = 2 }: MetricGridProps) {
  const gridClasses = `grid gap-4 ${match(columns)
    .with(1, () => "grid-cols-1")
    .with(2, () => "grid-cols-1 sm:grid-cols-2")
    .with(3, () => "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")
    .otherwise(() => "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}`;

  return (
    <div className={gridClasses}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
