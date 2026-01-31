"use server";

import { getWUEForRegion } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import {
  buildCloudFootprintWhereClause,
  getOrganizationConnectionIds,
} from "@/lib/services/cloud-data-service";
import { linearRegression } from "@/lib/services/regression";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";

interface CumulativeWater {
  month: string;
  cumulative: number;
  isProjected: boolean;
}

export async function getWaterTimelineAction() {
  return withServerAction(async (user) => {
    const { organizationId } = user;
    const monthsHistory = 12;
    const monthsProjection = 6;

    const endDate = new Date();
    const startDate = subMonths(startOfMonth(endDate), monthsHistory - 1);

    // Get connection IDs for the organization
    const connectionIds = await getOrganizationConnectionIds(organizationId);

    if (connectionIds.length === 0) {
      return [];
    }

    // Fetch regional energy data grouped by region and month
    // Use groupBy to match KPI calculator approach for consistency
    const footprintData = await prisma.cloudFootprint.groupBy({
      by: ["region", "periodStartDate"],
      where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
        kilowattHours: { not: null },
      }),
      _sum: {
        kilowattHours: true,
      },
      orderBy: {
        periodStartDate: "asc",
      },
    });

    // Calculate water withdrawal by month
    // Apply WUE to aggregated regional energy totals
    const monthlyData = new Map<string, number>();

    footprintData.forEach((record) => {
      const monthKey = format(startOfMonth(record.periodStartDate), "yyyy-MM");
      const energyKWh = record._sum.kilowattHours ?? 0;
      const wue = getWUEForRegion(record.region);
      const waterLiters = energyKWh * wue;

      const currentValue = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, currentValue + waterLiters);
    });

    // Create historical data points with cumulative totals
    const historicalData: CumulativeWater[] = [];
    let cumulativeTotal = 0;

    for (let i = 0; i < monthsHistory; i++) {
      const month = subMonths(endOfMonth(endDate), monthsHistory - 1 - i);
      const monthKey = format(startOfMonth(month), "yyyy-MM");
      const monthlyWater = monthlyData.get(monthKey) || 0;
      cumulativeTotal += monthlyWater;

      historicalData.push({
        month: monthKey,
        cumulative: Math.round(cumulativeTotal * 100) / 100,
        isProjected: false,
      });
    }

    // Prepare data for linear regression using monthly water withdrawal
    const monthlyWater = Array.from({ length: monthsHistory }, (_, i) => {
      const month = subMonths(endOfMonth(endDate), monthsHistory - 1 - i);
      const monthKey = format(startOfMonth(month), "yyyy-MM");
      return monthlyData.get(monthKey) || 0;
    });

    const regressionData = monthlyWater
      .map((water, index) => ({
        x: index,
        y: water,
      }))
      .filter((d) => d.y > 0);

    // Calculate projections if we have enough data
    const projectedData: CumulativeWater[] = [];
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
  }, "fetch water timeline");
}
