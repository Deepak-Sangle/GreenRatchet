"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface RenewableEnergyData {
  averageRenewablePercentage: number;
  totalCo2e: number;
  weightedRenewablePercentage: number;
  topRegions: Array<{
    region: string;
    renewablePercentage: number;
    co2e: number;
  }>;
  status: "excellent" | "good" | "fair" | "poor";
}

/**
 * Determines status level based on weighted renewable percentage
 * Excellent: >= 75%, Good: 50-75%, Fair: 25-50%, Poor: < 25%
 */
function getRenewableStatus(
  percentage: number
): "excellent" | "good" | "fair" | "poor" {
  if (percentage >= 75) return "excellent";
  if (percentage >= 50) return "good";
  if (percentage >= 25) return "fair";
  return "poor";
}

export async function getRenewableEnergyDataAction(): Promise<
  { data: RenewableEnergyData } | { error: string }
> {
  try {
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

    // Get cloud footprint data grouped by region
    const footprintData = await prisma.cloudFootprint.groupBy({
      by: ["region"],
      where: {
        cloudConnection: {
          organizationId: user.organizationId,
        },
      },
      _sum: {
        co2e: true,
      },
    });

    if (footprintData.length === 0) {
      return { error: "No cloud footprint data available" };
    }

    // Get latest renewable energy data for each region
    const renewableData = await prisma.gridRenewableEnergy.findMany({
      where: {
        dataCenterProvider: "AWS",
        dataCenterRegion: {
          in: footprintData.map((f) => f.region),
        },
      },
      orderBy: {
        datetime: "desc",
      },
      distinct: ["dataCenterRegion"],
      select: {
        dataCenterRegion: true,
        value: true,
      },
    });

    const renewableMap = new Map(
      renewableData.map(({ dataCenterRegion, value }) => [
        dataCenterRegion,
        value,
      ])
    );

    // Calculate weighted renewable percentage and build region details
    let totalCo2e = 0;
    let weightedSum = 0;
    const regionDetails: Array<{
      region: string;
      renewablePercentage: number;
      co2e: number;
    }> = [];

    footprintData.forEach(({ region, _sum }) => {
      const co2e = _sum.co2e ?? 0;
      const renewablePercentage = renewableMap.get(region) ?? 0;

      totalCo2e += co2e;
      weightedSum += co2e * renewablePercentage;

      regionDetails.push({
        region,
        renewablePercentage,
        co2e,
      });
    });

    const weightedRenewablePercentage =
      totalCo2e > 0 ? weightedSum / totalCo2e : 0;

    // Calculate simple average for comparison
    const averageRenewablePercentage =
      regionDetails.length > 0
        ? regionDetails.reduce((sum, r) => sum + r.renewablePercentage, 0) /
          regionDetails.length
        : 0;

    // Get top 5 regions by renewable percentage
    const topRegions = regionDetails
      .sort((a, b) => b.renewablePercentage - a.renewablePercentage)
      .slice(0, 5);

    const status = getRenewableStatus(weightedRenewablePercentage);

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
    console.error("Error fetching renewable energy data:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}
