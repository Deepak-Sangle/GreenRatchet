"use server";

import { RegionCarbonIntensity } from "@/components/cloud/carbon-intensity-map";
import { prisma } from "@/lib/prisma";

/**
 * Fetches today's carbon intensity data for all datacenter regions
 */
export async function getLatestCarbonIntensityAction(): Promise<{
  data?: RegionCarbonIntensity[];
  error?: string;
}> {
  try {
    const latestDateWithData = await prisma.gridCarbonIntensity.findFirst({
      select: {
        datetime: true,
      },
      orderBy: {
        datetime: "desc",
      },
    });

    const latestDate: Date = latestDateWithData?.datetime ?? new Date();

    const intensityData = await prisma.gridCarbonIntensity.findMany({
      where: {
        datetime: latestDate,
      },
      orderBy: {
        datetime: "desc",
      },
      distinct: ["dataCenterRegion", "dataCenterProvider", "datetime"],
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
