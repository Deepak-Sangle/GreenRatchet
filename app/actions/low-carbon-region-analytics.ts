"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type CarbonCategory = "low" | "medium" | "high";

/**
 * Classifies region based on carbon intensity from GridCarbonIntensity table
 * Low: < 150, Medium: 150-400, High: > 400 gCO2eq/kWh
 */
function classifyRegion(carbonIntensity: number): CarbonCategory {
  if (carbonIntensity < 150) return "low";
  if (carbonIntensity <= 400) return "medium";
  return "high";
}

export interface RegionalCo2eData {
  pieData: Array<{
    category: CarbonCategory;
    co2e: number;
    percentage: number;
  }>;
  totalCo2e: number;
  categoryStats: {
    low: { percentage: number; co2e: number };
    medium: { percentage: number; co2e: number };
    high: { percentage: number; co2e: number };
  };
}

export async function getLowCarbonRegionDataAction(): Promise<
  { data: RegionalCo2eData } | { error: string }
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

    // Get latest carbon intensity data for each region
    const latestCarbonIntensity = await prisma.gridCarbonIntensity.findMany({
      where: {
        dataCenterProvider: "AWS",
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

    const carbonIntensityMap = new Map(
      latestCarbonIntensity.map(({ dataCenterRegion, value }) => [
        dataCenterRegion,
        value,
      ])
    );

    // Fetch and aggregate cloud footprint data by region
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

    // Calculate totals by category
    const categoryTotals: Record<CarbonCategory, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    footprintData.forEach(({ region, _sum }) => {
      const co2e = _sum.co2e ?? 0;
      const carbonIntensity = carbonIntensityMap.get(region) ?? 400;
      const category = classifyRegion(carbonIntensity);
      categoryTotals[category] += co2e;
    });

    const totalCo2e = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0
    );

    // Build pie chart data
    const pieData = (["low", "medium", "high"] as CarbonCategory[]).map(
      (category) => {
        const co2e = categoryTotals[category];
        const percentage = totalCo2e > 0 ? (co2e / totalCo2e) * 100 : 0;
        return { category, co2e, percentage };
      }
    );

    // Build category stats for insights
    const categoryStats = {
      low: {
        percentage: pieData[0].percentage,
        co2e: categoryTotals.low,
      },
      medium: {
        percentage: pieData[1].percentage,
        co2e: categoryTotals.medium,
      },
      high: {
        percentage: pieData[2].percentage,
        co2e: categoryTotals.high,
      },
    };

    return {
      data: {
        pieData,
        totalCo2e,
        categoryStats,
      },
    };
  } catch (error) {
    console.error("Error fetching low carbon region data:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}
