"use server";

import { isAIInstance } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import {
  buildCloudFootprintWhereClause,
  getOrganizationConnectionIds,
} from "@/lib/services/cloud-data-service";

/**
 * Calculate AI usage percentage for an organization
 */
async function calculateAIUsagePercentage(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  connectionIds: string[],
): Promise<{
  aiKwh: number;
  totalKwh: number;
  percentage: number;
}> {
  if (connectionIds.length === 0) {
    return { aiKwh: 0, totalKwh: 0, percentage: 0 };
  }

  // Get total energy consumption
  const totalResult = await prisma.cloudFootprint.aggregate({
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
      kilowattHours: { not: null },
    }),
    _sum: {
      kilowattHours: true,
    },
  });

  // Get AI-related energy consumption (EC2 GPU instances only)
  const ec2Footprints = await prisma.cloudFootprint.findMany({
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
      serviceName: "EC2",
      serviceType: { not: null },
      kilowattHours: { not: null },
    }),
    select: {
      serviceType: true,
      kilowattHours: true,
    },
  });

  const aiKwh = ec2Footprints
    .filter((footprint) => isAIInstance(footprint.serviceType))
    .reduce((sum, footprint) => sum + (footprint.kilowattHours || 0), 0);

  const totalKwh = totalResult._sum.kilowattHours || 0;
  const percentage = totalKwh > 0 ? (aiKwh / totalKwh) * 100 : 0;

  return {
    aiKwh,
    totalKwh,
    percentage,
  };
}

/**
 * Get AI usage timeline data for charts
 */
async function getAIUsageTimeline(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  connectionIds: string[],
): Promise<
  Array<{
    date: string;
    aiKwh: number;
    totalKwh: number;
    percentage: number;
    cumulativeAiKwh: number;
  }>
> {
  if (connectionIds.length === 0) {
    return [];
  }

  // Get daily aggregated data
  const dailyData = await prisma.cloudFootprint.groupBy({
    by: ["periodStartDate"],
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
      kilowattHours: { not: null },
    }),
    _sum: {
      kilowattHours: true,
    },
    orderBy: {
      periodStartDate: "asc",
    },
  });

  // Get AI-specific data (EC2 GPU instances)
  const ec2Data = await prisma.cloudFootprint.findMany({
    where: buildCloudFootprintWhereClause(connectionIds, startDate, endDate, {
      serviceName: "EC2",
      serviceType: { not: null },
      kilowattHours: { not: null },
    }),
    select: {
      periodStartDate: true,
      serviceType: true,
      kilowattHours: true,
    },
    orderBy: {
      periodStartDate: "asc",
    },
  });

  // Group AI data by date
  const aiDataByDate = new Map<string, number>();
  ec2Data.forEach((footprint) => {
    if (isAIInstance(footprint.serviceType)) {
      const dateKey = footprint.periodStartDate.toISOString().split("T")[0];
      const current = aiDataByDate.get(dateKey) || 0;
      aiDataByDate.set(dateKey, current + (footprint.kilowattHours || 0));
    }
  });

  // Combine data and calculate cumulative
  let cumulativeAiKwh = 0;

  return dailyData.map((day) => {
    const dateKey = day.periodStartDate.toISOString().split("T")[0];
    const totalKwh = day._sum.kilowattHours || 0;
    const aiKwh = aiDataByDate.get(dateKey) || 0;
    const percentage = totalKwh > 0 ? (aiKwh / totalKwh) * 100 : 0;

    cumulativeAiKwh += aiKwh;

    return {
      date: dateKey,
      aiKwh,
      totalKwh,
      percentage,
      cumulativeAiKwh,
    };
  });
}

/**
 * Get AI usage data for the current organization
 */
export async function getAIUsageAction() {
  return withServerAction(async (user) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // Last 30 days

    // Get all cloud connections for the organization
    const connectionIds = await getOrganizationConnectionIds(
      user.organizationId,
    );

    const [currentUsage, timeline] = await Promise.all([
      calculateAIUsagePercentage(
        user.organizationId,
        startDate,
        endDate,
        connectionIds,
      ),
      getAIUsageTimeline(
        user.organizationId,
        startDate,
        endDate,
        connectionIds,
      ),
    ]);

    return {
      currentUsage,
      timeline,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }, "get AI usage data");
}
