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

export async function getRenewableEnergyDataAction() {
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
          cloudConnection: {
            organizationId,
            isActive: true,
          },
        },
        _sum: { co2e: true },
      }),
    ]);

    // Get unique region/provider pairs and fetch renewable data in batch
    const regionProviderPairs = regionalEnergy.map((r) => ({
      region: r.region,
      cloudProvider: r.cloudProvider,
    }));

    const renewableDataResults = await Promise.all(
      regionProviderPairs.map(({ region, cloudProvider }) =>
        prisma.gridRenewableEnergy.findFirst({
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
    const renewableDataMap = new Map(
      regionProviderPairs.map(({ region, cloudProvider }, index) => [
        `${region}|${cloudProvider}`,
        renewableDataResults[index],
      ]),
    );

    // Calculate weighted renewable energy percentage
    let totalWeightedRenewable = 0;
    let totalEnergy = 0;
    const byRegion: Record<string, number> = {};

    for (const r of regionalEnergy) {
      if (r._sum.kilowattHours !== null) {
        const energy = r._sum.kilowattHours;
        const renewableData = renewableDataMap.get(
          `${r.region}|${r.cloudProvider}`,
        );
        const renewablePercentage = renewableData?.value ?? 0;

        totalWeightedRenewable += energy * renewablePercentage;
        totalEnergy += energy;
        byRegion[r.region] = renewablePercentage;
      }
    }

    const weightedRenewablePercentage =
      totalEnergy > 0 ? totalWeightedRenewable / totalEnergy : 0;

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
        renewablePercentage: percentage,
        co2e: co2eByRegion.get(region) ?? 0,
      }),
    );

    const averageRenewablePercentage = calculateAverage(
      regionDetails.map((r) => r.renewablePercentage),
    );

    const topRegions = getTopN(regionDetails, (r) => r.renewablePercentage, 5);

    const status = getPercentageStatus(weightedRenewablePercentage);

    return {
      averageRenewablePercentage,
      totalCo2e,
      weightedRenewablePercentage,
      topRegions,
      status,
    };
  }, "get renewable energy data");
}
