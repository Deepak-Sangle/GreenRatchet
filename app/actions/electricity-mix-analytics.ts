"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface ElectricityMixDataPoint {
  month: string;
  lowCarbonShare: number;
  fossilShare: number;
  renewableShare: number;
  totalCo2e: number;
}

export interface ElectricityMixData {
  timeline: ElectricityMixDataPoint[];
  averages: {
    lowCarbonShare: number;
    fossilShare: number;
    renewableShare: number;
  };
  totalCo2e: number;
}

/**
 * Calculates energy shares from electricity mix data
 */
function calculateEnergyShares(mix: {
  nuclear: number;
  wind: number;
  solar: number;
  hydro: number;
  geothermal: number;
  coal: number;
  gas: number;
  oil: number;
  biomass: number;
  unknown: number;
  hydroDischarge: number;
  batteryDischarge: number;
}): {
  lowCarbonShare: number;
  fossilShare: number;
  renewableShare: number;
} {
  const total =
    mix.nuclear +
    mix.wind +
    mix.solar +
    mix.hydro +
    mix.geothermal +
    mix.coal +
    mix.gas +
    mix.oil +
    mix.biomass +
    mix.unknown +
    mix.hydroDischarge +
    mix.batteryDischarge;

  if (total === 0) {
    return { lowCarbonShare: 0, fossilShare: 0, renewableShare: 0 };
  }

  const lowCarbon =
    mix.nuclear + mix.wind + mix.solar + mix.hydro + mix.geothermal;
  const fossil = mix.coal + mix.gas + mix.oil;
  const renewable = mix.wind + mix.solar + mix.hydro + mix.geothermal;

  return {
    lowCarbonShare: (lowCarbon / total) * 100,
    fossilShare: (fossil / total) * 100,
    renewableShare: (renewable / total) * 100,
  };
}

/**
 * Formats date to YYYY-MM format for monthly grouping
 */
function formatToMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function getElectricityMixDataAction(): Promise<
  { data: ElectricityMixData } | { error: string }
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

    // Get cloud footprint data with date ranges
    const footprintData = await prisma.cloudFootprint.findMany({
      where: {
        cloudConnection: {
          organizationId: user.organizationId,
        },
      },
      select: {
        region: true,
        co2e: true,
        periodStartDate: true,
        periodEndDate: true,
      },
      orderBy: {
        periodStartDate: "asc",
      },
    });

    if (footprintData.length === 0) {
      return { error: "No cloud footprint data available" };
    }

    // Get unique regions
    const regions = [...new Set(footprintData.map((f) => f.region))];

    // Get electricity mix data for these regions
    const electricityMixData = await prisma.gridElectricityMix.findMany({
      where: {
        dataCenterProvider: "AWS",
        dataCenterRegion: {
          in: regions,
        },
      },
      select: {
        dataCenterRegion: true,
        datetime: true,
        nuclear: true,
        wind: true,
        solar: true,
        hydro: true,
        geothermal: true,
        coal: true,
        gas: true,
        oil: true,
        biomass: true,
        unknown: true,
        hydroDischarge: true,
        batteryDischarge: true,
      },
      orderBy: {
        datetime: "asc",
      },
    });

    // Group footprint data by month and region
    const monthlyFootprintMap = new Map<string, Map<string, number>>();

    footprintData.forEach(({ region, co2e, periodStartDate }) => {
      const month = formatToMonth(new Date(periodStartDate));
      if (!monthlyFootprintMap.has(month)) {
        monthlyFootprintMap.set(month, new Map());
      }
      const regionMap = monthlyFootprintMap.get(month)!;
      regionMap.set(region, (regionMap.get(region) ?? 0) + co2e);
    });

    // Group electricity mix by month and region, then calculate weighted averages
    const monthlyMixMap = new Map<
      string,
      {
        lowCarbonShare: number;
        fossilShare: number;
        renewableShare: number;
        totalCo2e: number;
      }
    >();

    electricityMixData.forEach((mix) => {
      const month = formatToMonth(new Date(mix.datetime));
      const region = mix.dataCenterRegion;

      // Get CO2e weight for this region in this month
      const regionCo2e = monthlyFootprintMap.get(month)?.get(region) ?? 0;

      if (regionCo2e === 0) return;

      const shares = calculateEnergyShares(mix);

      const currentData = monthlyMixMap.get(month) ?? {
        lowCarbonShare: 0,
        fossilShare: 0,
        renewableShare: 0,
        totalCo2e: 0,
      };

      monthlyMixMap.set(month, {
        lowCarbonShare:
          currentData.lowCarbonShare + shares.lowCarbonShare * regionCo2e,
        fossilShare: currentData.fossilShare + shares.fossilShare * regionCo2e,
        renewableShare:
          currentData.renewableShare + shares.renewableShare * regionCo2e,
        totalCo2e: currentData.totalCo2e + regionCo2e,
      });
    });

    // Calculate weighted averages and build timeline
    const timeline: ElectricityMixDataPoint[] = [];
    let totalLowCarbon = 0;
    let totalFossil = 0;
    let totalRenewable = 0;
    let totalCo2e = 0;

    Array.from(monthlyMixMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, data]) => {
        if (data.totalCo2e > 0) {
          const lowCarbonShare = data.lowCarbonShare / data.totalCo2e;
          const fossilShare = data.fossilShare / data.totalCo2e;
          const renewableShare = data.renewableShare / data.totalCo2e;

          timeline.push({
            month,
            lowCarbonShare,
            fossilShare,
            renewableShare,
            totalCo2e: data.totalCo2e,
          });

          totalLowCarbon += data.lowCarbonShare;
          totalFossil += data.fossilShare;
          totalRenewable += data.renewableShare;
          totalCo2e += data.totalCo2e;
        }
      });

    const averages = {
      lowCarbonShare: totalCo2e > 0 ? totalLowCarbon / totalCo2e : 0,
      fossilShare: totalCo2e > 0 ? totalFossil / totalCo2e : 0,
      renewableShare: totalCo2e > 0 ? totalRenewable / totalCo2e : 0,
    };

    return {
      data: {
        timeline,
        averages,
        totalCo2e,
      },
    };
  } catch (error) {
    console.error("Error fetching electricity mix data:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}
