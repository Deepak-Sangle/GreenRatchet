"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface CarbonFreeEnergyData {
  averageCarbonFreePercentage: number;
  totalCo2e: number;
  weightedCarbonFreePercentage: number;
  topRegions: Array<{
    region: string;
    carbonFreePercentage: number;
    co2e: number;
  }>;
  status: "excellent" | "good" | "fair" | "poor";
}

/**
 * Determines status level based on weighted carbon-free percentage
 * Excellent: >= 75%, Good: 50-75%, Fair: 25-50%, Poor: < 25%
 */
function getCarbonFreeStatus(
  percentage: number
): "excellent" | "good" | "fair" | "poor" {
  if (percentage >= 75) return "excellent";
  if (percentage >= 50) return "good";
  if (percentage >= 25) return "fair";
  return "poor";
}

export async function getCarbonFreeEnergyDataAction(): Promise<
  { data: CarbonFreeEnergyData } | { error: string }
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

    // Get latest carbon-free energy data for each region
    const carbonFreeData = await prisma.gridCarbonFreeEnergy.findMany({
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

    const carbonFreeMap = new Map(
      carbonFreeData.map(({ dataCenterRegion, value }) => [
        dataCenterRegion,
        value,
      ])
    );

    // Calculate weighted carbon-free percentage and build region details
    let totalCo2e = 0;
    let weightedSum = 0;
    const regionDetails: Array<{
      region: string;
      carbonFreePercentage: number;
      co2e: number;
    }> = [];

    footprintData.forEach(({ region, _sum }) => {
      const co2e = _sum.co2e ?? 0;
      const carbonFreePercentage = carbonFreeMap.get(region) ?? 0;

      totalCo2e += co2e;
      weightedSum += co2e * carbonFreePercentage;

      regionDetails.push({
        region,
        carbonFreePercentage,
        co2e,
      });
    });

    const weightedCarbonFreePercentage =
      totalCo2e > 0 ? weightedSum / totalCo2e : 0;

    // Calculate simple average for comparison
    const averageCarbonFreePercentage =
      regionDetails.length > 0
        ? regionDetails.reduce((sum, r) => sum + r.carbonFreePercentage, 0) /
          regionDetails.length
        : 0;

    // Get top 5 regions by carbon-free percentage
    const topRegions = regionDetails
      .sort((a, b) => b.carbonFreePercentage - a.carbonFreePercentage)
      .slice(0, 5);

    const status = getCarbonFreeStatus(weightedCarbonFreePercentage);

    return {
      data: {
        averageCarbonFreePercentage,
        totalCo2e,
        weightedCarbonFreePercentage,
        topRegions,
        status,
      },
    };
  } catch (error) {
    console.error("Error fetching carbon-free energy data:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}
