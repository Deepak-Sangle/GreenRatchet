/**
 * Shared utilities for analytics actions
 * Extracts common patterns to follow DRY principles
 */

/**
 * Status levels based on percentage thresholds
 */
export type PercentageStatus = "excellent" | "good" | "fair" | "poor";

/**
 * Determines status level based on percentage
 * Excellent: >= 75%, Good: 50-75%, Fair: 25-50%, Poor: < 25%
 */
export const getPercentageStatus = (percentage: number): PercentageStatus => {
  if (percentage >= 75) return "excellent";
  if (percentage >= 50) return "good";
  if (percentage >= 25) return "fair";
  return "poor";
};

/**
 * Gets date range for last N days
 */
export const getDateRange = (
  days: number = 30,
): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  return { startDate, endDate };
};

/**
 * Calculates total CO2e from regional data
 */
export const calculateTotalCo2e = (
  regionData: Array<{ co2e: number }>,
): number => {
  return regionData.reduce((sum, r) => sum + r.co2e, 0);
};

/**
 * Calculates simple average from array of values
 */
export const calculateAverage = (values: number[]): number => {
  return values.length > 0
    ? values.reduce((sum, val) => sum + val, 0) / values.length
    : 0;
};

/**
 * Gets top N items from array sorted by a numeric property
 */
export const getTopN = <T>(
  items: T[],
  sortBy: (item: T) => number,
  n: number = 5,
): T[] => {
  return [...items].sort((a, b) => sortBy(b) - sortBy(a)).slice(0, n);
};

/**
 * Formats date to YYYY-MM format for monthly grouping
 */
export const formatToMonth = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * Generic error handler for analytics actions
 */
export const handleAnalyticsError = (
  error: unknown,
  context: string,
): { error: string } => {
  console.error(`Error in ${context}:`, error);
  return {
    error: error instanceof Error ? error.message : "Failed to fetch data",
  };
}; /**
 * Shared utilities for category-based analytics (pie charts)
 * Used for low-carbon regions and water-stressed regions
 */
/**
 * Generic category type for analytics
 */
export type Category = "low" | "medium" | "high";
/**
 * Generic pie data structure with flexible value field
 */

export interface PieDataPoint<T extends string = Category> {
  category: T;
  value: number;
  percentage: number;
  co2e?: number; // For carbon-based analytics
  waterUsage?: number; // For water-based analytics
}
/**
 * Generic category stats structure with flexible value field
 */

export type CategoryStats<T extends string = Category> = Record<
  T,
  { percentage: number; value: number; co2e?: number; waterUsage?: number }
>;
/**
 * Configuration for building pie data
 */
interface BuildPieDataConfig {
  valueFieldName?: "co2e" | "waterUsage"; // Optional specific field name
}
/**
 * Builds pie chart data from category totals
 */

export const buildPieData = <T extends string = Category>(
  categoryTotals: Record<T, number>,
  categories: T[],
  config?: BuildPieDataConfig,
): PieDataPoint<T>[] => {
  const total = Object.values(categoryTotals).reduce(
    (sum: number, val) => sum + (val as number),
    0,
  );

  return categories.map((category) => {
    const value = categoryTotals[category];
    const percentage = total > 0 ? (value / total) * 100 : 0;

    const dataPoint: PieDataPoint<T> = { category, value, percentage };

    // Add specific field if configured
    if (config?.valueFieldName === "co2e") {
      dataPoint.co2e = value;
    } else if (config?.valueFieldName === "waterUsage") {
      dataPoint.waterUsage = value;
    }

    return dataPoint;
  });
};
/**
 * Builds category stats from pie data
 */

export const buildCategoryStats = <T extends string = Category>(
  pieData: PieDataPoint<T>[],
): CategoryStats<T> => {
  return pieData.reduce(
    (stats, { category, value, percentage, co2e, waterUsage }) => ({
      ...stats,
      [category]: { percentage, value, co2e, waterUsage },
    }),
    {} as CategoryStats<T>,
  );
};
/**
 * Classifies value into low/medium/high categories based on thresholds
 */

export const classifyByThresholds = (
  value: number,
  lowThreshold: number,
  highThreshold: number,
): Category => {
  if (value < lowThreshold) return "low";
  if (value <= highThreshold) return "medium";
  return "high";
};
