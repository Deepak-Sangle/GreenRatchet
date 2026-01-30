"use server";

import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import {
  buildCategoryStats,
  buildPieData,
  classifyByThresholds,
  type Category,
} from "@/lib/utils/category-analytics-helpers";

export interface RegionalCo2eData {
  pieData: Array<{
    category: Category;
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

export async function getLowCarbonRegionDataAction() {
  return withServerAction(async (user) => {
    const organizationId = user.organizationId;

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
      ]),
    );

    const footprintData = await prisma.cloudFootprint.groupBy({
      by: ["region"],
      where: {
        cloudConnection: {
          organizationId,
        },
      },
      _sum: {
        co2e: true,
      },
    });

    if (footprintData.length === 0) {
      return {
        pieData: [],
        totalCo2e: 0,
        categoryStats: {
          low: { percentage: 0, co2e: 0 },
          medium: { percentage: 0, co2e: 0 },
          high: { percentage: 0, co2e: 0 },
        },
      };
    }

    const categoryTotals: Record<Category, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    footprintData.forEach(({ region, _sum }) => {
      const co2e = _sum.co2e ?? 0;
      const carbonIntensity = carbonIntensityMap.get(region) ?? 400;
      const category = classifyByThresholds(carbonIntensity, 150, 400);
      categoryTotals[category] += co2e;
    });

    const totalCo2e = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0,
    );

    const pieData = buildPieData(categoryTotals, ["low", "medium", "high"], {
      valueFieldName: "co2e",
    });
    const categoryStats = buildCategoryStats(pieData);

    // Transform to match expected types (non-optional fields)
    const typedPieData = pieData.map((item) => ({
      category: item.category,
      co2e: item.co2e!,
      percentage: item.percentage,
    }));

    const typedCategoryStats = {
      low: {
        percentage: categoryStats.low.percentage,
        co2e: categoryStats.low.co2e!,
      },
      medium: {
        percentage: categoryStats.medium.percentage,
        co2e: categoryStats.medium.co2e!,
      },
      high: {
        percentage: categoryStats.high.percentage,
        co2e: categoryStats.high.co2e!,
      },
    };

    return {
      pieData: typedPieData,
      totalCo2e,
      categoryStats: typedCategoryStats,
    };
  }, "get low-carbon region data");
}
