/**
 * Electricity Mix Service
 *
 * Centralized service for electricity mix calculations
 * Used by both KPI calculator and analytics
 */

import { prisma } from "@/lib/prisma";
import {
  buildCloudFootprintWhereClause,
  getOrganizationConnectionIds,
} from "./cloud-data-service";

export interface ElectricityMixResult {
  weightedMix: Record<string, number>;
  totalEnergy: number;
  byRegion: Record<string, number>;
}

const ENERGY_SOURCES = [
  "nuclear",
  "geothermal",
  "biomass",
  "coal",
  "wind",
  "solar",
  "hydro",
  "gas",
  "oil",
  "unknown",
] as const;

/**
 * Calculate weighted electricity mix for an organization
 * Weights by energy consumption (kWh) across all regions
 */
export async function calculateWeightedElectricityMix(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<ElectricityMixResult> {
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  const regionalEnergy = await prisma.cloudFootprint.groupBy({
    by: ["region", "cloudProvider"],
    where: buildCloudFootprintWhereClause(
      connectionIds,
      periodStart,
      periodEnd,
      {
        kilowattHours: { not: null },
      },
    ),
    _sum: { kilowattHours: true },
  });

  // Fetch all mix data in parallel
  const regionProviderPairs = regionalEnergy.map((r) => ({
    region: r.region,
    cloudProvider: r.cloudProvider,
  }));

  const mixDataResults = await Promise.all(
    regionProviderPairs.map(({ region, cloudProvider }) =>
      prisma.gridElectricityMix.findFirst({
        where: {
          dataCenterRegion: region,
          dataCenterProvider: cloudProvider as "AWS" | "GCP" | "AZURE",
          datetime: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { datetime: "desc" },
      }),
    ),
  );

  // Build lookup map
  const mixDataMap = new Map(
    regionProviderPairs.map(({ region, cloudProvider }, index) => [
      `${region}|${cloudProvider}`,
      mixDataResults[index],
    ]),
  );

  const weightedMix: Record<string, number> = {};
  ENERGY_SOURCES.forEach((source) => {
    weightedMix[source] = 0;
  });

  let totalEnergy = 0;
  const byRegion: Record<string, number> = {};

  for (const r of regionalEnergy) {
    if (r._sum.kilowattHours === null) continue;

    const energy = r._sum.kilowattHours;
    const mixData = mixDataMap.get(`${r.region}|${r.cloudProvider}`);

    if (!mixData) continue;

    // Calculate total MW for this region to convert to fractions (0-1)
    const totalMW = ENERGY_SOURCES.reduce((sum, source) => {
      return sum + ((mixData[source] as number) || 0);
    }, 0);

    // If we have valid data, calculate weighted fractions
    if (totalMW > 0) {
      ENERGY_SOURCES.forEach((source) => {
        const mwValue = (mixData[source] as number) || 0;
        const fraction = mwValue / totalMW;
        weightedMix[source] += energy * fraction;
      });
      totalEnergy += energy;
      byRegion[r.region] = energy;
    }
  }

  return {
    weightedMix,
    totalEnergy,
    byRegion,
  };
}

/**
 * Calculate energy source percentages from weighted mix
 */
export function calculateEnergySourcePercentages(
  weightedMix: Record<string, number>,
  totalEnergy: number,
): Record<string, number> {
  const percentages: Record<string, number> = {};

  ENERGY_SOURCES.forEach((source) => {
    percentages[source] =
      totalEnergy > 0 ? weightedMix[source] / totalEnergy : 0;
  });

  return percentages;
}

/**
 * Calculate renewable energy percentage from energy source percentages
 */
export function calculateTotalRenewableMix(
  sourcePercentages: Record<string, number>,
): number {
  return (
    sourcePercentages.wind +
    sourcePercentages.solar +
    sourcePercentages.hydro +
    sourcePercentages.geothermal +
    sourcePercentages.biomass
  );
}

/**
 * Calculate low carbon percentage (renewables + nuclear)
 */
export function calculateTotalLowCarbonMix(
  sourcePercentages: Record<string, number>,
): number {
  return (
    sourcePercentages.nuclear +
    sourcePercentages.wind +
    sourcePercentages.solar +
    sourcePercentages.hydro +
    sourcePercentages.geothermal +
    sourcePercentages.biomass
  );
}

/**
 * Calculate fossil fuel percentage
 */
export function calculateTotalFossilMix(
  sourcePercentages: Record<string, number>,
): number {
  return sourcePercentages.coal + sourcePercentages.gas + sourcePercentages.oil;
}
