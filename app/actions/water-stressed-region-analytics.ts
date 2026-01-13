"use server";

import { AWS_WATER_STRESS_BY_REGION } from "@/lib/constants";
import { calculateKPI } from "@/lib/services/kpi-calculator";
import {
  getAuthenticatedOrganizationId,
  getDateRange,
  handleAnalyticsError,
} from "@/lib/utils/analytics-helpers";
import {
  buildCategoryStats,
  buildPieData,
  classifyByThresholds,
  type Category,
} from "@/lib/utils/category-analytics-helpers";

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

export async function getWaterStressedRegionDataAction(): Promise<
  { data: RegionalWaterData } | { error: string }
> {
  try {
    const authResult = await getAuthenticatedOrganizationId();
    if ("error" in authResult) {
      return authResult;
    }

    const { organizationId } = authResult;
    const { startDate, endDate } = getDateRange(30);

    const result = await calculateKPI(
      {
        type: "WATER_WITHDRAWAL",
        targetValue: 0,
        direction: "LOWER_IS_BETTER",
      },
      organizationId,
      startDate,
      endDate
    );

    const byRegion = result.calculationDetails.breakdown?.byRegion ?? {};

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
      0
    );

    if (totalWaterUsage === 0) {
      return { error: "No water usage data calculated" };
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
      data: {
        pieData: typedPieData,
        totalWaterUsage,
        categoryStats: typedCategoryStats,
      },
    };
  } catch (error) {
    return handleAnalyticsError(error, "getWaterStressedRegionDataAction");
  }
}
