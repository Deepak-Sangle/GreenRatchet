/**
 * Reusable chart tooltip components with proper dark mode support
 */

interface BaseTooltipProps {
  active?: boolean;
  payload?: any[];
}

interface PieChartTooltipProps extends BaseTooltipProps {
  valueFormatter?: (value: number) => string;
  showPercentage?: boolean;
}

interface TimelineTooltipProps extends BaseTooltipProps {
  label?: string;
  valueFormatter?: (value: number) => string;
}

/**
 * Custom tooltip for pie charts with dark mode support
 */
export function PieChartTooltip({
  active,
  payload,
  valueFormatter = (value) => value.toFixed(2),
  showPercentage = true,
}: PieChartTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-popover border border-border rounded-md p-3 shadow-md">
        <p className="text-popover-foreground font-medium">
          {data.payload?.name}
        </p>
        <p className="text-popover-foreground">
          <span className="font-medium">Value:</span>{" "}
          {valueFormatter(data.value)}
        </p>
        {showPercentage && (
          <p className="text-popover-foreground">
            <span className="font-medium">Percentage:</span>{" "}
            {data.payload?.percentage}%
          </p>
        )}
      </div>
    );
  }
  return null;
}

/**
 * Custom tooltip for timeline/area charts with dark mode support
 */
export function TimelineTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => `${value.toFixed(2)}%`,
}: TimelineTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-md p-3 shadow-md">
        <p className="text-popover-foreground font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-popover-foreground">
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.dataKey}:</span>{" "}
            {valueFormatter(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
