export interface CumulativeData {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

/**
 * Simple linear regression for forecasting
 */
export function linearRegression(data: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
} {
  const n = data.length;
  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}
