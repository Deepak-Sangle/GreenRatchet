"use server";

import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import {
  buildCloudFootprintWhereClause,
  getOrganizationConnectionIds,
} from "@/lib/services/cloud-data-service";
import {
  CumulativeData,
  linearRegression,
} from "@/lib/services/regression";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";

export async function getCo2eTimelineAction() {
  return withServerAction(async (user) => {
    const monthsHistory: number = 12;
    const monthsProjection: number = 6;
    const organizationId: string = user.organizationId;

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

    // Build monthly emissions array in chronological order
    const monthlyEmissions: number[] = [];
    const historicalData: CumulativeData[] = [];
    let cumulativeTotal = 0;

    // Map aggregated data by month for quick lookup
    const monthlyDataMap = new Map<string, number>();
    monthlyAggregates.forEach((aggregate) => {
      const monthKey = format(
        startOfMonth(aggregate.periodStartDate),
        "yyyy-MM",
      );
      const co2eKg = (aggregate._sum.co2e ?? 0) * 1000; // Convert MTCO2e to kg
      const currentValue = monthlyDataMap.get(monthKey) ?? 0;
      monthlyDataMap.set(monthKey, currentValue + co2eKg);
    });

    // Build arrays in chronological order with cumulative totals
    for (let i = 0; i < monthsHistory; i++) {
      const month = subMonths(endOfMonth(endDate), monthsHistory - 1 - i);
      const monthKey = format(startOfMonth(month), "yyyy-MM");
      const monthlyEmission = monthlyDataMap.get(monthKey) || 0;

      monthlyEmissions.push(monthlyEmission);
      cumulativeTotal += monthlyEmission;

      historicalData.push({
        month: monthKey,
        cumulative: Math.round(cumulativeTotal * 100) / 100,
        isProjected: false,
      });
    }

    const regressionData = monthlyEmissions
      .map((emission, index) => ({
        x: index,
        y: emission,
      }))
      .filter((d) => d.y > 0);

    // Calculate projections if we have enough data
    const projectedData: CumulativeData[] = [];
    if (regressionData.length >= 3) {
      const { slope, intercept } = linearRegression(regressionData);
      let projectedCumulative = cumulativeTotal;

      for (let i = 1; i <= monthsProjection; i++) {
        const month = addMonths(endOfMonth(endDate), i);
        const monthKey = format(startOfMonth(month), "yyyy-MM");
        const projectedMonthlyValue =
          slope * (monthsHistory + i - 1) + intercept;
        projectedCumulative += Math.max(0, projectedMonthlyValue);

        projectedData.push({
          month: monthKey,
          cumulative: Math.round(projectedCumulative * 100) / 100,
          isProjected: true,
        });
      }
    }

    return [...historicalData, ...projectedData];
  }, "fetch CO2e timeline");
}
