"use server";

import { auth } from "@/auth";
import { AWS_WATER_STRESS_BY_REGION } from "@/lib/constants";
import { getWUEForRegion } from "@/lib/constants/wue-data";
import { prisma } from "@/lib/prisma";

type WaterStressCategory = "low" | "medium" | "high";

/**
 * Classifies region based on water stress risk indicator
 * Low: 0-1, Medium: 2-3, High: 4-5
 */
function classifyWaterStress(riskLevel: number): WaterStressCategory {
  if (riskLevel <= 1) return "low";
  if (riskLevel <= 3) return "medium";
  return "high";
}

/**
 * Calculates water withdrawal from energy consumption using WUE
 * Formula: Water (liters) = IT energy (kWh) × WUE (L/kWh)
 */
function calculateWaterWithdrawal(energyKWh: number, region: string): number {
  const wue = getWUEForRegion(region);
  return energyKWh * wue;
}

export interface RegionalWaterData {
  pieData: Array<{
    category: WaterStressCategory;
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

    // Fetch cloud footprint data with energy consumption
    const footprintData = await prisma.cloudFootprint.findMany({
      where: {
        cloudConnection: {
          organizationId: user.organizationId,
        },
        kilowattHours: {
          not: null,
        },
      },
      select: {
        region: true,
        kilowattHours: true,
      },
    });

    if (footprintData.length === 0) {
      return { error: "No energy data available for water calculation" };
    }

    // Calculate water withdrawal by region and categorize by stress level
    const categoryTotals: Record<WaterStressCategory, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    footprintData.forEach(({ region, kilowattHours }) => {
      const energyKWh = kilowattHours ?? 0;
      const waterLiters = calculateWaterWithdrawal(energyKWh, region);

      const waterStressLevel =
        AWS_WATER_STRESS_BY_REGION[
          region as keyof typeof AWS_WATER_STRESS_BY_REGION
        ] ?? 3;

      const category = classifyWaterStress(waterStressLevel);
      categoryTotals[category] += waterLiters;
    });

    const totalWaterUsage = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0
    );

    if (totalWaterUsage === 0) {
      return { error: "No water usage data calculated" };
    }

    // Build pie chart data
    const pieData = (["low", "medium", "high"] as WaterStressCategory[]).map(
      (category) => {
        const waterUsage = categoryTotals[category];
        const percentage =
          totalWaterUsage > 0 ? (waterUsage / totalWaterUsage) * 100 : 0;
        return { category, waterUsage, percentage };
      }
    );

    // Build category stats for insights
    const categoryStats = {
      low: {
        percentage: pieData[0].percentage,
        waterUsage: categoryTotals.low,
      },
      medium: {
        percentage: pieData[1].percentage,
        waterUsage: categoryTotals.medium,
      },
      high: {
        percentage: pieData[2].percentage,
        waterUsage: categoryTotals.high,
      },
    };

    return {
      data: {
        pieData,
        totalWaterUsage,
        categoryStats,
      },
    };
  } catch (error) {
    console.error("Error fetching water stressed region data:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}
