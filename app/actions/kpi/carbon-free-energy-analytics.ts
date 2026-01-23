"use server";

import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import { calculateKPI } from "@/lib/services/kpi-calculator";
import {
  calculateAverage,
  getDateRange,
  getPercentageStatus,
  getTopN,
  type PercentageStatus,
} from "@/lib/utils/analytics-helpers";

export interface CarbonFreeEnergyData {
  averageCarbonFreePercentage: number;
  totalCo2e: number;
  weightedCarbonFreePercentage: number;
  topRegions: Array<{
    region: string;
    carbonFreePercentage: number;
    co2e: number;
  }>;
  status: PercentageStatus;
}

export async function getCarbonFreeEnergyDataAction() {
  return withServerAction(async (user) => {
    const organizationId = user.organizationId;
    const { startDate, endDate } = getDateRange(30);

    // Fetch CO2e data and calculate KPI in parallel to avoid sequential queries
    const [result, co2eData] = await Promise.all([
      calculateKPI(
        {
          type: "CARBON_FREE_ENERGY_PERCENTAGE",
          targetValue: 0,
          direction: "HIGHER_IS_BETTER",
        },
        organizationId,
        startDate,
        endDate,
      ),
      prisma.cloudFootprint.groupBy({
        by: ["region"],
        where: {
          cloudConnection: { organizationId, isActive: true },
        },
        _sum: { co2e: true },
      }),
    ]);

    const weightedCarbonFreePercentage = result.actualValue;
    const byRegion = result.calculationDetails.breakdown?.byRegion ?? {};

    // Build CO2e map
    const co2eByRegion = new Map(
      co2eData.map((r) => [r.region, r._sum.co2e ?? 0]),
    );

    const totalCo2e = Array.from(co2eByRegion.values()).reduce(
      (sum, val) => sum + val,
      0,
    );

    // Combine percentage and CO2e data
    const regionDetails = Object.entries(byRegion).map(
      ([region, percentage]) => ({
        region,
        carbonFreePercentage: percentage,
        co2e: co2eByRegion.get(region) ?? 0,
      }),
    );

    const averageCarbonFreePercentage = calculateAverage(
      regionDetails.map((r) => r.carbonFreePercentage),
    );

    const topRegions = getTopN(regionDetails, (r) => r.carbonFreePercentage, 5);

    const status = getPercentageStatus(weightedCarbonFreePercentage);

    return {
      averageCarbonFreePercentage,
      totalCo2e,
      weightedCarbonFreePercentage,
      topRegions,
      status,
    };
  }, "get carbon-free energy data");
}
