/**
 * CO2e Analytics Service
 * Provides time-series data and forecasting for CO2e emissions
 */

import { prisma } from "@/lib/prisma";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  buildCloudFootprintWhereClause,
  getOrganizationConnectionIds,
} from "./cloud-data-service";

interface MonthlyEmission {
  month: string;
  co2e: number;
  isProjected: boolean;
}

interface CumulativeEmission {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

/**
 * Simple linear regression for forecasting
 */
function linearRegression(data: { x: number; y: number }[]): {
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

/**
 * Fetch monthly CO2e emissions with projections (cumulative totals)
 */
export async function getMonthlyEmissionsWithProjection(
  organizationId: string,
  monthsHistory = 12,
  monthsProjection = 6
): Promise<CumulativeEmission[]> {
  const endDate = new Date();
  const startDate = subMonths(startOfMonth(endDate), monthsHistory - 1);

  // Get connection IDs for the organization
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  if (connectionIds.length === 0) {
    return [];
  }

  // Fetch aggregated monthly data using Prisma groupBy
  const monthlyAggregates = await prisma.cloudFootprint.groupBy({
    by: ["periodStartDate"],
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate),
    _sum: {
      co2e: true,
    },
    orderBy: {
      periodStartDate: "asc",
    },
  });

  // Map aggregated data by month
  const monthlyData = new Map<string, number>();

  monthlyAggregates.forEach((aggregate) => {
    const monthKey = format(startOfMonth(aggregate.periodStartDate), "yyyy-MM");
    const co2eKg = (aggregate._sum.co2e ?? 0) * 1000; // Convert MTCO2e to kg
    const currentValue = monthlyData.get(monthKey) || 0;
    monthlyData.set(monthKey, currentValue + co2eKg);
  });

  // Create historical data points with cumulative totals
  const historicalData: CumulativeEmission[] = [];
  let cumulativeTotal = 0;

  for (let i = 0; i < monthsHistory; i++) {
    const month = subMonths(endOfMonth(endDate), monthsHistory - 1 - i);
    const monthKey = format(startOfMonth(month), "yyyy-MM");
    const monthlyEmission = monthlyData.get(monthKey) || 0;
    cumulativeTotal += monthlyEmission;

    historicalData.push({
      month: monthKey,
      cumulative: Math.round(cumulativeTotal * 100) / 100,
      isProjected: false,
    });
  }

  // Prepare data for linear regression using monthly emissions
  const monthlyEmissions = Array.from({ length: monthsHistory }, (_, i) => {
    const month = subMonths(endOfMonth(endDate), monthsHistory - 1 - i);
    const monthKey = format(startOfMonth(month), "yyyy-MM");
    return monthlyData.get(monthKey) || 0;
  });

  const regressionData = monthlyEmissions
    .map((emission, index) => ({
      x: index,
      y: emission,
    }))
    .filter((d) => d.y > 0);

  // Calculate projections if we have enough data
  const projectedData: CumulativeEmission[] = [];
  if (regressionData.length >= 3) {
    const { slope, intercept } = linearRegression(regressionData);
    let projectedCumulative = cumulativeTotal;

    for (let i = 1; i <= monthsProjection; i++) {
      const month = addMonths(endOfMonth(endDate), i);
      const monthKey = format(startOfMonth(month), "yyyy-MM");
      const projectedMonthlyValue = slope * (monthsHistory + i - 1) + intercept;
      projectedCumulative += Math.max(0, projectedMonthlyValue);

      projectedData.push({
        month: monthKey,
        cumulative: Math.round(projectedCumulative * 100) / 100,
        isProjected: true,
      });
    }
  }

  return [...historicalData, ...projectedData];
}
