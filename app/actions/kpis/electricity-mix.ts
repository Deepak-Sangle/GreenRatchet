"use server";

import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import {
  buildCloudFootprintWhereClause,
  getOrganizationConnectionIds,
} from "@/lib/services/cloud-data-service";
import {
  calculateEnergySourcePercentages,
  calculateTotalFossilMix,
  calculateTotalLowCarbonMix,
  calculateTotalRenewableMix,
} from "@/lib/services/electricity-mix-service";
import { formatToMonth } from "@/lib/utils/analytics-helpers";
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
  sourcePercentages: Record<string, number>,
): {
  lowCarbonShare: number;
  fossilShare: number;
  renewableShare: number;
} => {
  return {
    lowCarbonShare: calculateTotalLowCarbonMix(sourcePercentages) * 100,
    fossilShare: calculateTotalFossilMix(sourcePercentages) * 100,
    renewableShare: calculateTotalRenewableMix(sourcePercentages) * 100,
  };
};

export async function getElectricityMixDataAction() {
  return withServerAction(async (user) => {
    const organizationId = user.organizationId;

    // Get last 12 months of data
    const endDate = new Date();
    const startDate = subMonths(endDate, 12);

    const connectionIds = await getOrganizationConnectionIds(organizationId);

    if (connectionIds.length === 0) {
      return {
        timeline: [],
        averages: {
          lowCarbonShare: 0,
          fossilShare: 0,
          renewableShare: 0,
        },
        totalCo2e: 0,
      };
    }

    // Get regional energy data grouped by region, provider, and month
    const regionalEnergy = await prisma.cloudFootprint.groupBy({
      by: ["region", "cloudProvider", "periodStartDate"],
      where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
        kilowattHours: { not: null },
      }),
      _sum: { kilowattHours: true, co2e: true },
      orderBy: { periodStartDate: "asc" },
    });

    if (regionalEnergy.length === 0) {
      return {
        timeline: [],
        averages: {
          lowCarbonShare: 0,
          fossilShare: 0,
          renewableShare: 0,
        },
        totalCo2e: 0,
      };
    }

    // Get unique region/provider combinations
    const regionProviderPairs = [
      ...new Set(regionalEnergy.map((r) => `${r.region}|${r.cloudProvider}`)),
    ].map((pair) => {
      const [region, cloudProvider] = pair.split("|");
      return { region, cloudProvider };
    });

    // Fetch electricity mix data for all regions in one batch
    const mixDataResults = await Promise.all(
      regionProviderPairs.map(({ region, cloudProvider }) =>
        prisma.gridElectricityMix.findFirst({
          where: {
            dataCenterRegion: region,
            dataCenterProvider: cloudProvider as "AWS" | "GCP" | "AZURE",
            datetime: { gte: startDate, lte: endDate },
          },
          orderBy: { datetime: "desc" },
        }),
      ),
    );

    // Build lookup map for mix data
    const mixDataMap = new Map(
      regionProviderPairs.map(({ region, cloudProvider }, index) => [
        `${region}|${cloudProvider}`,
        mixDataResults[index],
      ]),
    );

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

    // Group by month and calculate weighted electricity mix
    const monthlyData = new Map<
      string,
      {
        weightedMix: Record<string, number>;
        totalEnergy: number;
        totalCo2e: number;
      }
    >();

    for (const r of regionalEnergy) {
      if (r._sum.kilowattHours === null) continue;

      const energy = r._sum.kilowattHours;
      const co2e = r._sum.co2e ?? 0;
      const month = formatToMonth(new Date(r.periodStartDate));
      const mixData = mixDataMap.get(`${r.region}|${r.cloudProvider}`);

      if (!mixData) continue;

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

      // Calculate total MW for this region to convert to fractions (0-1)
      const totalMW = energySources.reduce((sum, source) => {
        return sum + ((mixData[source as keyof typeof mixData] as number) || 0);
      }, 0);

      // Weight each energy source by the regional energy consumption
      if (totalMW > 0) {
        energySources.forEach((source) => {
          const mwValue = mixData[source as keyof typeof mixData] as number;
          const fraction = mwValue / totalMW;
          data.weightedMix[source] += energy * fraction;
        });
      }

      data.totalEnergy += energy;
      data.totalCo2e += co2e;
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
          const sourcePercentages = calculateEnergySourcePercentages(
            data.weightedMix,
            data.totalEnergy,
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
      timeline,
      averages,
      totalCo2e,
    };
  }, "get electricity mix data");
}
