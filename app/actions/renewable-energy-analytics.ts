"use server";

import { prisma } from "@/lib/prisma";
import { calculateKPI } from "@/lib/services/kpi-calculator";
import {
  calculateAverage,
  getAuthenticatedOrganizationId,
  getDateRange,
  getPercentageStatus,
  getTopN,
  handleAnalyticsError,
  type PercentageStatus,
} from "@/lib/utils/analytics-helpers";

export interface RenewableEnergyData {
  averageRenewablePercentage: number;
  totalCo2e: number;
  weightedRenewablePercentage: number;
  topRegions: Array<{
    region: string;
    renewablePercentage: number;
    co2e: number;
  }>;
  status: PercentageStatus;
}

export async function getRenewableEnergyDataAction(): Promise<
  { data: RenewableEnergyData } | { error: string }
> {
  try {
    const authResult = await getAuthenticatedOrganizationId();
    if ("error" in authResult) {
      return authResult;
    }

    const { organizationId } = authResult;
    const { startDate, endDate } = getDateRange(30);

    // Fetch CO2e data and calculate KPI in parallel to avoid sequential queries
    const [result, co2eData] = await Promise.all([
      calculateKPI(
        {
          type: "RENEWABLE_ENERGY_PERCENTAGE",
          targetValue: 0,
          direction: "HIGHER_IS_BETTER",
        },
        organizationId,
        startDate,
        endDate
      ),
      prisma.cloudFootprint.groupBy({
        by: ["region"],
        where: {
          cloudConnection: { organizationId, isActive: true },
        },
        _sum: { co2e: true },
      }),
    ]);

    const weightedRenewablePercentage = result.actualValue;
    const byRegion = result.calculationDetails.breakdown?.byRegion ?? {};

    // Build CO2e map
    const co2eByRegion = new Map(
      co2eData.map((r) => [r.region, r._sum.co2e ?? 0])
    );

    const totalCo2e = Array.from(co2eByRegion.values()).reduce(
      (sum, val) => sum + val,
      0
    );

    // Combine percentage and CO2e data
    const regionDetails = Object.entries(byRegion).map(
      ([region, percentage]) => ({
        region,
        renewablePercentage: percentage,
        co2e: co2eByRegion.get(region) ?? 0,
      })
    );

    const averageRenewablePercentage = calculateAverage(
      regionDetails.map((r) => r.renewablePercentage)
    );

    const topRegions = getTopN(regionDetails, (r) => r.renewablePercentage, 5);

    const status = getPercentageStatus(weightedRenewablePercentage);

    return {
      data: {
        averageRenewablePercentage,
        totalCo2e,
        weightedRenewablePercentage,
        topRegions,
        status,
      },
    };
  } catch (error) {
    return handleAnalyticsError(error, "getRenewableEnergyDataAction");
  }
}
