/**
 * AI Usage Calculator Service
 * Calculates AI-related energy consumption based on EC2 GPU instance types
 */

import { prisma } from "@/lib/prisma";

/**
 * AWS GPU instance types used for AI/ML workloads
 */
const AI_INSTANCE_TYPES = [
  "p3",
  "p4",
  "p5", // NVIDIA V100, A100, H100 for ML training
  "g4",
  "g5", // NVIDIA T4, A10G for ML inference/graphics
  "inf1",
  "inf2", // AWS Inferentia for ML inference
  "trn1", // AWS Trainium for ML training
];

/**
 * Check if a service type represents an AI/ML instance
 */
export function isAIInstance(serviceType: string | null): boolean {
  if (!serviceType) return false;

  const instanceFamily = serviceType.split(".")[0]?.toLowerCase();
  return AI_INSTANCE_TYPES.includes(instanceFamily);
}

/**
 * Calculate AI usage percentage for an organization
 */
export async function calculateAIUsagePercentage(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  aiKwh: number;
  totalKwh: number;
  percentage: number;
}> {
  // Get all cloud connections for the organization
  const cloudConnections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { id: true },
  });

  const connectionIds = cloudConnections.map((c) => c.id);

  if (connectionIds.length === 0) {
    return { aiKwh: 0, totalKwh: 0, percentage: 0 };
  }

  // Get total energy consumption
  const totalResult = await prisma.cloudFootprint.aggregate({
    where: {
      cloudConnectionId: { in: connectionIds },
      periodStartDate: { gte: startDate },
      periodEndDate: { lte: endDate },
      kilowattHours: { not: null },
    },
    _sum: {
      kilowattHours: true,
    },
  });

  // Get AI-related energy consumption (EC2 GPU instances only)
  const aiResult = await prisma.cloudFootprint.aggregate({
    where: {
      cloudConnectionId: { in: connectionIds },
      serviceName: "EC2",
      serviceType: { not: null },
      periodStartDate: { gte: startDate },
      periodEndDate: { lte: endDate },
      kilowattHours: { not: null },
    },
    _sum: {
      kilowattHours: true,
    },
  });

  // Filter AI instances from EC2 data
  const ec2Footprints = await prisma.cloudFootprint.findMany({
    where: {
      cloudConnectionId: { in: connectionIds },
      serviceName: "EC2",
      serviceType: { not: null },
      periodStartDate: { gte: startDate },
      periodEndDate: { lte: endDate },
      kilowattHours: { not: null },
    },
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
export async function getAIUsageTimeline(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<
  Array<{
    date: string;
    aiKwh: number;
    totalKwh: number;
    percentage: number;
    cumulativeAiKwh: number;
  }>
> {
  // Get all cloud connections for the organization
  const cloudConnections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { id: true },
  });

  const connectionIds = cloudConnections.map((c) => c.id);

  if (connectionIds.length === 0) {
    return [];
  }

  // Get daily aggregated data
  const dailyData = await prisma.cloudFootprint.groupBy({
    by: ["periodStartDate"],
    where: {
      cloudConnectionId: { in: connectionIds },
      periodStartDate: { gte: startDate },
      periodEndDate: { lte: endDate },
      kilowattHours: { not: null },
    },
    _sum: {
      kilowattHours: true,
    },
    orderBy: {
      periodStartDate: "asc",
    },
  });

  // Get AI-specific data (EC2 GPU instances)
  const ec2Data = await prisma.cloudFootprint.findMany({
    where: {
      cloudConnectionId: { in: connectionIds },
      serviceName: "EC2",
      serviceType: { not: null },
      periodStartDate: { gte: startDate },
      periodEndDate: { lte: endDate },
      kilowattHours: { not: null },
    },
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
