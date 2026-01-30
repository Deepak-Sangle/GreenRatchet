"use server";

import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import {
  buildCloudFootprintWhereClause,
  getOrganizationConnectionIds,
} from "@/lib/services/cloud-data-service";
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

    const connectionIds = await getOrganizationConnectionIds(organizationId);

    // Fetch regional energy and CO2e data in parallel
    const [regionalEnergy, co2eData] = await Promise.all([
      prisma.cloudFootprint.groupBy({
        by: ["region", "cloudProvider"],
        where: buildCloudFootprintWhereClause(
          connectionIds,
          startDate,
          endDate,
          {
            kilowattHours: { not: null },
          },
        ),
        _sum: { kilowattHours: true },
      }),
      prisma.cloudFootprint.groupBy({
        by: ["region"],
        where: {
          cloudConnection: { organizationId, isActive: true },
        },
        _sum: { co2e: true },
      }),
    ]);

    // Get unique region/provider pairs and fetch CFE data in batch
    const regionProviderPairs = regionalEnergy.map((r) => ({
      region: r.region,
      cloudProvider: r.cloudProvider,
    }));

    const cfeDataResults = await Promise.all(
      regionProviderPairs.map(({ region, cloudProvider }) =>
        prisma.gridCarbonFreeEnergy.findFirst({
          where: {
            dataCenterRegion: region,
            dataCenterProvider: cloudProvider as "AWS" | "GCP" | "AZURE",
            datetime: { gte: startDate, lte: endDate },
          },
          orderBy: { datetime: "desc" },
        }),
      ),
    );

    // Build lookup map
    const cfeDataMap = new Map(
      regionProviderPairs.map(({ region, cloudProvider }, index) => [
        `${region}|${cloudProvider}`,
        cfeDataResults[index],
      ]),
    );

    // Calculate weighted carbon-free energy percentage
    let totalWeightedCFE = 0;
    let totalEnergy = 0;
    const byRegion: Record<string, number> = {};

    for (const r of regionalEnergy) {
      if (r._sum.kilowattHours !== null) {
        const energy = r._sum.kilowattHours;
        const cfeData = cfeDataMap.get(`${r.region}|${r.cloudProvider}`);
        const cfePercentage = cfeData?.value ?? 0;

        totalWeightedCFE += energy * cfePercentage;
        totalEnergy += energy;
        byRegion[r.region] = cfePercentage;
      }
    }

    const weightedCarbonFreePercentage =
      totalEnergy > 0 ? totalWeightedCFE / totalEnergy : 0;

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
