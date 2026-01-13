/**
 * Cloud Data Service
 * Centralized service for querying cloud footprint data
 * Used by both KPI calculators and analytics pages to ensure consistency
 */

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Get cloud connection IDs for an organization
 */
export async function getOrganizationConnectionIds(
  organizationId: string
): Promise<string[]> {
  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { id: true },
  });

  return connections.map((c) => c.id);
}

/**
 * Build base where clause for cloud footprint queries
 */
export function buildCloudFootprintWhereClause(
  connectionIds: string[],
  startDate: Date,
  endDate: Date,
  additionalFilters?: Prisma.CloudFootprintWhereInput
): Prisma.CloudFootprintWhereInput {
  return {
    cloudConnectionId: { in: connectionIds },
    periodStartDate: { gte: startDate },
    periodEndDate: { lte: endDate },
    ...additionalFilters,
  };
}

/**
 * Get total CO2e emissions for an organization in a date range
 */
export async function getTotalCo2e(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  if (connectionIds.length === 0) {
    return 0;
  }

  const result = await prisma.cloudFootprint.aggregate({
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate),
    _sum: {
      co2e: true,
    },
  });

  return result._sum.co2e ?? 0;
}

/**
 * Get total energy consumption (kWh) for an organization in a date range
 */
export async function getTotalEnergy(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  if (connectionIds.length === 0) {
    return 0;
  }

  const result = await prisma.cloudFootprint.aggregate({
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
      kilowattHours: { not: null },
    }),
    _sum: {
      kilowattHours: true,
    },
  });

  return result._sum.kilowattHours ?? 0;
}

/**
 * Get CO2e emissions by region
 */
export async function getCo2eByRegion(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  if (connectionIds.length === 0) {
    return {};
  }

  const results = await prisma.cloudFootprint.groupBy({
    by: ["region"],
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate),
    _sum: {
      co2e: true,
    },
  });

  return results.reduce(
    (acc, result) => {
      acc[result.region] = result._sum.co2e ?? 0;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Get CO2e emissions by service
 */
export async function getCo2eByService(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  if (connectionIds.length === 0) {
    return {};
  }

  const results = await prisma.cloudFootprint.groupBy({
    by: ["serviceName"],
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate),
    _sum: {
      co2e: true,
    },
  });

  return results.reduce(
    (acc, result) => {
      acc[result.serviceName] = result._sum.co2e ?? 0;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Get energy consumption by region
 */
export async function getEnergyByRegion(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  if (connectionIds.length === 0) {
    return {};
  }

  const results = await prisma.cloudFootprint.groupBy({
    by: ["region"],
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
      kilowattHours: { not: null },
    }),
    _sum: {
      kilowattHours: true,
    },
  });

  return results.reduce(
    (acc, result) => {
      acc[result.region] = result._sum.kilowattHours ?? 0;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Get energy consumption by service
 */
export async function getEnergyByService(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  if (connectionIds.length === 0) {
    return {};
  }

  const results = await prisma.cloudFootprint.groupBy({
    by: ["serviceName"],
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
      kilowattHours: { not: null },
    }),
    _sum: {
      kilowattHours: true,
    },
  });

  return results.reduce(
    (acc, result) => {
      acc[result.serviceName] = result._sum.kilowattHours ?? 0;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Get water withdrawal by region using WUE factors
 */
export async function getWaterWithdrawalByRegion(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ total: number; byRegion: Record<string, number> }> {
  const connectionIds = await getOrganizationConnectionIds(organizationId);

  if (connectionIds.length === 0) {
    return { total: 0, byRegion: {} };
  }

  const results = await prisma.cloudFootprint.groupBy({
    by: ["region"],
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
      kilowattHours: { not: null },
    }),
    _sum: {
      kilowattHours: true,
    },
  });

  let total = 0;
  const byRegion: Record<string, number> = {};

  // Import WUE function dynamically to avoid circular dependency
  const { getWUEForRegion } = await import("@/lib/constants/wue-data");

  results.forEach((result) => {
    if (result._sum.kilowattHours !== null) {
      const wue = getWUEForRegion(result.region);
      const waterLiters = result._sum.kilowattHours * wue;
      total += waterLiters;
      byRegion[result.region] = waterLiters;
    }
  });

  return { total, byRegion };
}
