"use server";

import { prisma } from "@/lib/prisma";
import {
  buildCloudFootprintWhereClause,
  getOrganizationConnectionIds,
} from "@/lib/services/cloud-data-service";
import {
  calculateEnergySourcePercentages,
  calculateFossilPercentage,
  calculateLowCarbonPercentage,
  calculateRenewablePercentage,
} from "@/lib/services/electricity-mix-service";
import {
  formatToMonth,
  getAuthenticatedOrganizationId,
  handleAnalyticsError,
} from "@/lib/utils/analytics-helpers";
import { subMonths } from "date-fns";

export interface ElectricityMixDataPoint {
  month: string;
  lowCarbonShare: number;
  fossilShare: number;
  renewableShare: number;
  totalEnergy: number;
}

export interface ElectricityMixData {
  timeline: ElectricityMixDataPoint[];
  averages: {
    lowCarbonShare: number;
    fossilShare: number;
    renewableShare: number;
  };
  totalCo2e: number;
}

/**
 * Calculates energy shares from electricity mix percentages
 * Uses shared service functions for consistency with KPI calculator
 */
const calculateEnergyShares = (
  sourcePercentages: Record<string, number>
): {
  lowCarbonShare: number;
  fossilShare: number;
  renewableShare: number;
} => {
  return {
    lowCarbonShare: calculateLowCarbonPercentage(sourcePercentages) * 100,
    fossilShare: calculateFossilPercentage(sourcePercentages) * 100,
    renewableShare: calculateRenewablePercentage(sourcePercentages) * 100,
  };
};

export async function getElectricityMixDataAction(): Promise<
  { data: ElectricityMixData } | { error: string }
> {
  try {
    const authResult = await getAuthenticatedOrganizationId();
    if ("error" in authResult) {
      return authResult;
    }

    const { organizationId } = authResult;

    // Get last 12 months of data
    const endDate = new Date();
    const startDate = subMonths(endDate, 12);

    const connectionIds = await getOrganizationConnectionIds(organizationId);

    if (connectionIds.length === 0) {
      return { error: "No active cloud connections found" };
    }

    // Get regional energy data grouped by region, provider, and month
    // This matches the KPI calculator approach
    const regionalEnergy = await prisma.cloudFootprint.groupBy({
      by: ["region", "cloudProvider", "periodStartDate"],
      where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
        kilowattHours: { not: null },
      }),
      _sum: { kilowattHours: true, co2e: true },
      orderBy: { periodStartDate: "asc" },
    });

    if (regionalEnergy.length === 0) {
      return { error: "No cloud footprint data available" };
    }

    // Group by month and calculate weighted electricity mix
    const monthlyData = new Map<
      string,
      {
        weightedMix: Record<string, number>;
        totalEnergy: number;
        totalCo2e: number;
      }
    >();

    const energySources = [
      "nuclear",
      "geothermal",
      "biomass",
      "coal",
      "wind",
      "solar",
      "hydro",
      "gas",
      "oil",
      "unknown",
    ];

    for (const r of regionalEnergy) {
      if (r._sum.kilowattHours !== null) {
        const energy = r._sum.kilowattHours;
        const co2e = r._sum.co2e ?? 0;
        const month = formatToMonth(new Date(r.periodStartDate));

        // Get electricity mix data for this region
        const mixData = await prisma.gridElectricityMix.findFirst({
          where: {
            dataCenterRegion: r.region,
            dataCenterProvider: r.cloudProvider as "AWS" | "GCP" | "AZURE",
            datetime: { gte: startDate, lte: endDate },
          },
          orderBy: { datetime: "desc" },
        });

        if (mixData) {
          if (!monthlyData.has(month)) {
            const initialMix: Record<string, number> = {};
            energySources.forEach((source) => {
              initialMix[source] = 0;
            });
            monthlyData.set(month, {
              weightedMix: initialMix,
              totalEnergy: 0,
              totalCo2e: 0,
            });
          }

          const data = monthlyData.get(month)!;

          // Weight each energy source by the regional energy consumption
          energySources.forEach((source) => {
            const value = mixData[source as keyof typeof mixData] as number;
            data.weightedMix[source] += energy * value;
          });

          data.totalEnergy += energy;
          data.totalCo2e += co2e;
        }
      }
    }

    // Calculate timeline with weighted averages
    const timeline: ElectricityMixDataPoint[] = [];
    let totalCo2e = 0;
    let totalWeightedLowCarbon = 0;
    let totalWeightedFossil = 0;
    let totalWeightedRenewable = 0;
    let totalEnergy = 0;

    Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, data]) => {
        if (data.totalEnergy > 0) {
          // Calculate weighted average for each source using shared service
          const sourcePercentages = calculateEnergySourcePercentages(
            data.weightedMix,
            data.totalEnergy
          );

          const shares = calculateEnergyShares(sourcePercentages);

          timeline.push({
            month,
            lowCarbonShare: shares.lowCarbonShare,
            fossilShare: shares.fossilShare,
            renewableShare: shares.renewableShare,
            totalEnergy: data.totalEnergy,
          });

          totalCo2e += data.totalCo2e;
          totalEnergy += data.totalEnergy;
          totalWeightedLowCarbon += shares.lowCarbonShare * data.totalEnergy;
          totalWeightedFossil += shares.fossilShare * data.totalEnergy;
          totalWeightedRenewable += shares.renewableShare * data.totalEnergy;
        }
      });

    const averages = {
      lowCarbonShare:
        totalEnergy > 0 ? totalWeightedLowCarbon / totalEnergy : 0,
      fossilShare: totalEnergy > 0 ? totalWeightedFossil / totalEnergy : 0,
      renewableShare:
        totalEnergy > 0 ? totalWeightedRenewable / totalEnergy : 0,
    };

    return {
      data: {
        timeline,
        averages,
        totalCo2e,
      },
    };
  } catch (error) {
    return handleAnalyticsError(error, "getElectricityMixDataAction");
  }
}
