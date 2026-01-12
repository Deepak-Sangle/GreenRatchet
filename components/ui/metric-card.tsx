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
  className = "" 
}: MetricCardProps) {
  const baseClasses = "rounded-lg p-4";
  const bgClasses = highlighted 
    ? "bg-primary/10" 
    : "bg-muted/50";
  const textClasses = highlighted 
    ? "text-primary" 
    : "";

  return (
    <div className={`${baseClasses} ${bgClasses} ${className}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${textClasses}`}>
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
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
  }>;
  columns?: number;
}

export function MetricGrid({ metrics, columns = 2 }: MetricGridProps) {
  const gridClasses = `grid gap-4 ${
    columns === 1 ? "grid-cols-1" :
    columns === 2 ? "grid-cols-1 sm:grid-cols-2" :
    columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  }`;

  return (
    <div className={gridClasses}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
