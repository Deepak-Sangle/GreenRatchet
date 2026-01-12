"use server";

import { RegionCarbonIntensity } from "@/components/cloud/carbon-intensity-map";
import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

/**
 * Fetches today's carbon intensity data for all datacenter regions
 */
export async function getTodayCarbonIntensityAction(): Promise<{
  data?: RegionCarbonIntensity[];
  error?: string;
}> {
  try {
    const today = new Date();
    const startDate = startOfDay(today);
    const endDate = endOfDay(today);

    const intensityData = await prisma.gridCarbonIntensity.findMany({
      where: {
        datetime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        datetime: "desc",
      },
      distinct: ["dataCenterRegion", "dataCenterProvider"],
    });

    const formattedData: RegionCarbonIntensity[] = intensityData.map(
      (item) => ({
        region: item.dataCenterRegion,
        zone: item.zone,
        provider: item.dataCenterProvider,
        value: item.value,
        datetime: item.datetime,
        isEstimated: item.isEstimated,
      })
    );

    return { data: formattedData };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch carbon intensity data",
    };
  }
}
