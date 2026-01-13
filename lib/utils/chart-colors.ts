/**
 * Chart color utilities for theme-aware data visualization
 * Provides consistent colors that work well in both light and dark themes
 */

/**
 * Semantic chart colors that adapt to theme
 */
export const chartColors = {
  // Primary data series colors (using CSS variables)
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
  quaternary: "hsl(var(--chart-4))",
  quinary: "hsl(var(--chart-5))",

  // Status colors for different data categories
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  info: "hsl(var(--info))",

  // Neutral colors
  muted: "hsl(var(--muted))",
  accent: "hsl(var(--accent))",
} as const;

/**
 * Predefined color palettes for common chart types
 */
export const chartPalettes = {
  // Environmental impact categories
  carbonIntensity: {
    low: chartColors.success, // Green for low carbon
    medium: chartColors.warning, // Yellow for medium carbon
    high: chartColors.destructive, // Red for high carbon
  },

  // Water stress categories
  waterStress: {
    low: chartColors.info, // Blue for low water stress
    medium: chartColors.warning, // Yellow for medium water stress
    high: chartColors.destructive, // Red for high water stress
  },

  // Energy source types
  energyMix: {
    renewable: chartColors.success, // Green for renewable
    lowCarbon: chartColors.primary, // Primary color for low-carbon
    fossil: chartColors.destructive, // Red for fossil fuels
    nuclear: chartColors.info, // Blue for nuclear
    hydro: chartColors.tertiary, // Alternative color for hydro
  },

  // General purpose multi-series palette
  multiSeries: [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.quaternary,
    chartColors.quinary,
  ],

  // Status-based palette
  status: {
    positive: chartColors.success,
    neutral: chartColors.warning,
    negative: chartColors.destructive,
    info: chartColors.info,
  },
} as const;

/**
 * Gets a color from a palette by index, cycling through available colors
 */
export function getChartColor(
  palette: readonly string[],
  index: number
): string {
  return palette[index % palette.length];
}

/**
 * Creates gradient definitions for area charts
 */
export function createChartGradient(
  id: string,
  color: string,
  startOpacity: number = 0.3,
  endOpacity: number = 0
) {
  return {
    id,
    color,
    startOpacity,
    endOpacity,
  };
}

/**
 * Chart theme configuration for consistent styling
 */
export const chartTheme = {
  // Grid and axis styling
  grid: {
    stroke: "hsl(var(--border))",
    strokeDasharray: "3 3",
  },

  // Axis styling
  axis: {
    stroke: "hsl(var(--muted-foreground))",
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  },

  // Tooltip styling
  tooltip: {
    contentStyle: {
      backgroundColor: "hsl(var(--popover))",
      borderColor: "hsl(var(--border))",
      borderRadius: "var(--radius)",
      color: "hsl(var(--popover-foreground))",
    },
  },

  // Legend styling
  legend: {
    wrapperStyle: {
      color: "hsl(var(--foreground))",
    },
  },
} as const;

/**
 * Utility to get theme-appropriate colors for data categories
 */
export function getCategoryColors<T extends string>(
  categories: readonly T[],
  palette: readonly string[] = chartPalettes.multiSeries
): Record<T, string> {
  const result = {} as Record<T, string>;

  categories.forEach((category, index) => {
    result[category] = getChartColor(palette, index);
  });

  return result;
}

/**
 * Common chart props that ensure consistent theming
 */
export const commonChartProps = {
  cartesianGrid: chartTheme.grid,
  xAxis: chartTheme.axis,
  yAxis: chartTheme.axis,
  tooltip: chartTheme.tooltip,
  legend: chartTheme.legend,
} as const;
