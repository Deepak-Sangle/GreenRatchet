/**
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
  config?: BuildPieDataConfig
): PieDataPoint<T>[] => {
  const total = Object.values(categoryTotals).reduce(
    (sum: number, val) => sum + (val as number),
    0
  );

  return categories.map((category) => {
    const value = categoryTotals[category];
    const percentage =
      (total as number) > 0 ? (value / (total as number)) * 100 : 0;

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
  pieData: PieDataPoint<T>[]
): CategoryStats<T> => {
  return pieData.reduce(
    (stats, { category, value, percentage, co2e, waterUsage }) => ({
      ...stats,
      [category]: { percentage, value, co2e, waterUsage },
    }),
    {} as CategoryStats<T>
  );
};

/**
 * Classifies value into low/medium/high categories based on thresholds
 */
export const classifyByThresholds = (
  value: number,
  lowThreshold: number,
  highThreshold: number
): Category => {
  if (value < lowThreshold) return "low";
  if (value <= highThreshold) return "medium";
  return "high";
};
