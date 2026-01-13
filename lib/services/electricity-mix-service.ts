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
  periodEnd: Date
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
      }
    ),
    _sum: { kilowattHours: true },
  });

  const weightedMix: Record<string, number> = {};
  ENERGY_SOURCES.forEach((source) => {
    weightedMix[source] = 0;
  });

  let totalEnergy = 0;
  const byRegion: Record<string, number> = {};

  for (const r of regionalEnergy) {
    if (r._sum.kilowattHours !== null) {
      const energy = r._sum.kilowattHours;

      const mixData = await prisma.gridElectricityMix.findFirst({
        where: {
          dataCenterRegion: r.region,
          dataCenterProvider: r.cloudProvider as "AWS" | "GCP" | "AZURE",
          datetime: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { datetime: "desc" },
      });

      if (mixData) {
        ENERGY_SOURCES.forEach((source) => {
          const value = mixData[source] as number;
          weightedMix[source] += energy * value;
        });
        totalEnergy += energy;
        byRegion[r.region] = energy;
      }
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
  totalEnergy: number
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
export function calculateRenewablePercentage(
  sourcePercentages: Record<string, number>
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
export function calculateLowCarbonPercentage(
  sourcePercentages: Record<string, number>
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
export function calculateFossilPercentage(
  sourcePercentages: Record<string, number>
): number {
  return sourcePercentages.coal + sourcePercentages.gas + sourcePercentages.oil;
}
