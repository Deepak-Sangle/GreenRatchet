/**
 * Shared utilities for analytics actions
 * Extracts common patterns to follow DRY principles
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
 * Gets authenticated user's organization ID
 * Returns error if not authenticated or no organization found
 */
export const getAuthenticatedOrganizationId = async (): Promise<
  { organizationId: string } | { error: string }
> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    return { error: "No organization found" };
  }

  return { organizationId: user.organizationId };
};

/**
 * Gets date range for last N days
 */
export const getDateRange = (
  days: number = 30
): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  return { startDate, endDate };
};

/**
 * Gets CO2e data grouped by region for an organization
 */
export const getCo2eByRegion = async (
  organizationId: string
): Promise<Array<{ region: string; co2e: number }>> => {
  const footprintData = await prisma.cloudFootprint.groupBy({
    by: ["region"],
    where: {
      cloudConnection: {
        organizationId,
      },
    },
    _sum: {
      co2e: true,
    },
  });

  return footprintData.map(({ region, _sum }) => ({
    region,
    co2e: _sum.co2e ?? 0,
  }));
};

/**
 * Calculates total CO2e from regional data
 */
export const calculateTotalCo2e = (
  regionData: Array<{ co2e: number }>
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
  n: number = 5
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
  context: string
): { error: string } => {
  console.error(`Error in ${context}:`, error);
  return {
    error: error instanceof Error ? error.message : "Failed to fetch data",
  };
};
