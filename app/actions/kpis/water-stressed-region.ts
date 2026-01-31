"use server";

import { AWS_WATER_STRESS_BY_REGION } from "@/lib/constants";
import { withServerAction } from "@/lib/server-action-utils";
import { getWaterWithdrawalByRegion } from "@/lib/services/cloud-data-service";
import {
  buildCategoryStats,
  buildPieData,
  classifyByThresholds,
  getDateRange,
  type Category,
} from "@/lib/utils/analytics-helpers";

export interface RegionalWaterData {
  pieData: Array<{
    category: Category;
    waterUsage: number;
    percentage: number;
  }>;
  totalWaterUsage: number;
  categoryStats: {
    low: { percentage: number; waterUsage: number };
    medium: { percentage: number; waterUsage: number };
    high: { percentage: number; waterUsage: number };
  };
}

export async function getWaterStressedRegionDataAction() {
  return withServerAction(async (user) => {
    const organizationId = user.organizationId;
    const { startDate, endDate } = getDateRange(30);

    const { byRegion } = await getWaterWithdrawalByRegion(
      organizationId,
      startDate,
      endDate,
    );

    const categoryTotals: Record<Category, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    Object.entries(byRegion).forEach(([region, waterLiters]) => {
      const waterStressLevel =
        AWS_WATER_STRESS_BY_REGION[
          region as keyof typeof AWS_WATER_STRESS_BY_REGION
        ] ?? 3;

      const category = classifyByThresholds(waterStressLevel, 1, 3);
      categoryTotals[category] += waterLiters;
    });

    const totalWaterUsage = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0,
    );

    if (totalWaterUsage === 0) {
      return {
        pieData: [],
        totalWaterUsage: 0,
        categoryStats: {
          low: { percentage: 0, waterUsage: 0 },
          medium: { percentage: 0, waterUsage: 0 },
          high: { percentage: 0, waterUsage: 0 },
        },
      };
    }

    const pieData = buildPieData(categoryTotals, ["low", "medium", "high"], {
      valueFieldName: "waterUsage",
    });
    const categoryStats = buildCategoryStats(pieData);

    // Transform to match expected types (non-optional fields)
    const typedPieData = pieData.map((item) => ({
      category: item.category,
      waterUsage: item.waterUsage!,
      percentage: item.percentage,
    }));

    const typedCategoryStats = {
      low: {
        percentage: categoryStats.low.percentage,
        waterUsage: categoryStats.low.waterUsage!,
      },
      medium: {
        percentage: categoryStats.medium.percentage,
        waterUsage: categoryStats.medium.waterUsage!,
      },
      high: {
        percentage: categoryStats.high.percentage,
        waterUsage: categoryStats.high.waterUsage!,
      },
    };

    return {
      pieData: typedPieData,
      totalWaterUsage,
      categoryStats: typedCategoryStats,
    };
  }, "get water-stressed region data");
}
