"use server";

import { auth } from "@/auth";
import {
  CLOUD_SERVICES,
  CLOUD_SERVICE_LABELS,
  TimeRangeValue,
  type CloudService,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  CloudUsageFilterSchema,
  ConnectAWSSchema,
  ConnectGCPSchema,
  type CloudUsageFilterInput,
  type ConnectAWSInput,
  type ConnectGCPInput,
} from "@/lib/validations/cloud";
import { subDays, subYears } from "date-fns";
import { revalidatePath, revalidateTag } from "next/cache";
import { match } from "ts-pattern";
import { Prisma } from "../generated/prisma/client";

export async function connectAWS(data: ConnectAWSInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER" || !user.organizationId) {
      return { error: "Only borrowers can connect cloud providers" };
    }

    const validated = await ConnectAWSSchema.parseAsync(data);

    // will test later if this works
    // const stsClient = new STSClient({
    //   region: process.env.AWS_REGION || "us-east-1",
    // });
    // const roleSessionName = `greenratchet-${user.id}`.slice(0, 64);

    // try {
    //   await stsClient.send(
    //     new AssumeRoleCommand({
    //       RoleArn: validated.roleArn,
    //       RoleSessionName: roleSessionName,
    //       ExternalId: validated.externalId,
    //     })
    //   );
    // } catch (error) {
    //   console.error("Error assuming AWS role:", error);
    //   return { error: "Invalid AWS role ARN or external ID" };
    // }

    const connection = await prisma.cloudConnection.create({
      data: {
        provider: "AWS",
        accountId: validated.roleArn.split(":")[4],
        roleArn: validated.roleArn,
        externalId: validated.externalId,
        organizationId: user.organizationId,
        isActive: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CLOUD_CONNECTION_CREATED",
        entity: "CLOUD_CONNECTION",
        entityId: connection.id,
        details: JSON.stringify({ provider: "AWS" }),
        userId: user.id,
        cloudConnectionId: connection.id,
      },
    });

    revalidatePath("/cloud");
    revalidatePath("/dashboard");
    revalidateTag(`cloud-${user.id}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`dashboard-${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error connecting AWS:", error);
    return { error: "Failed to connect AWS account" };
  }
}

export async function connectGCP(data: ConnectGCPInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER" || !user.organizationId) {
      return { error: "Only borrowers can connect cloud providers" };
    }

    const validated = await ConnectGCPSchema.parseAsync(data);

    // TODO: Validate GCP service account key by making a test API call
    // For hackathon: accept any JSON

    const connection = await prisma.cloudConnection.create({
      data: {
        provider: "GCP",
        projectId: validated.projectId,
        serviceAccountKey: validated.serviceAccountKey,
        organizationId: user.organizationId,
        isActive: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CLOUD_CONNECTION_CREATED",
        entity: "CLOUD_CONNECTION",
        entityId: connection.id,
        details: JSON.stringify({
          provider: "GCP",
          projectId: validated.projectId,
        }),
        userId: user.id,
        cloudConnectionId: connection.id,
      },
    });

    revalidatePath("/cloud");
    revalidatePath("/dashboard");
    revalidateTag(`cloud-${user.id}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`dashboard-${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error connecting GCP:", error);
    return { error: "Failed to connect GCP project" };
  }
}

export async function disconnectCloud(connectionId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { error: "Unauthorized" };
    }

    const connection = await prisma.cloudConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.organizationId !== user.organizationId) {
      return { error: "Connection not found" };
    }

    await prisma.cloudConnection.update({
      where: { id: connectionId },
      data: { isActive: false },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CLOUD_CONNECTION_DISCONNECTED",
        entity: "CLOUD_CONNECTION",
        entityId: connectionId,
        details: JSON.stringify({ provider: connection.provider }),
        userId: user.id,
        cloudConnectionId: connectionId,
      },
    });

    revalidatePath("/cloud");
    revalidatePath("/dashboard");
    revalidateTag(`cloud-${user.id}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`dashboard-${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting cloud:", error);
    return { error: "Failed to disconnect cloud provider" };
  }
}

/**
 * Triggers a backfill of cloud usage data for the last 1 year
 */
export async function backfillCloudUsageAction(): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    // 3. Authorization - only borrowers can backfill
    if (!user || user.role !== "BORROWER" || !user.organizationId) {
      return { error: "Only borrowers can backfill cloud usage data" };
    }

    // 4. Get active cloud connections
    const connections = await prisma.cloudConnection.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
    });

    if (connections.length === 0) {
      return { error: "No active cloud connections found" };
    }

    const availableRegions = await getAllAvailableRegions();

    // 5. Calculate date range (last 1 year)
    const endDate = new Date();
    // take only the date part (no hours, minutes, seconds)
    endDate.setHours(0, 0, 0, 0);
    const startDate = subYears(endDate, 1);
    startDate.setHours(0, 0, 0, 0);

    // 6. Trigger sync for each connection (fire and forget)
    for (const connection of connections) {
      const url = new URL(`${process.env.CCF_API_URL}/footprint-sync`);
      url.searchParams.set("startDate", startDate.toISOString());
      url.searchParams.set("endDate", endDate.toISOString());
      url.searchParams.set("groupBy", "day");
      url.searchParams.set("ignoreCache", "true");

      // Fire and forget - don't await
      fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cloudConnectionId: connection.id,
          organizationId: user.organizationId,
          config: {
            AWS: {
              INCLUDE_ESTIMATES: true,
              INCLUDE_EMBODIED_METRICS: true,
              INCLUDE_OPERATIONAL_METRICS: true,
              USE_BILLING_DATA: false,
              accounts: [{ id: connection.accountId }],
              CURRENT_REGIONS: availableRegions,
              authentication: {
                mode: "AWS",
                options: {
                  externalId: connection.externalId,
                },
              },
            },
          },
        }),
      }).catch((error) => {
        console.error(
          `Error triggering backfill for connection ${connection.id}:`,
          error
        );
      });
    }

    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CLOUD_BACKFILL_TRIGGERED",
        entity: "CLOUD_CONNECTION",
        entityId: user.organizationId,
        details: JSON.stringify({
          connectionCount: connections.length,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        userId: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error triggering cloud usage backfill:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to trigger cloud usage backfill",
    };
  }
}

/**
 * Calculates the date range based on the relative time range value
 */
function calculateDateRange(
  timeRange: TimeRangeValue,
  customStartDate?: Date,
  customEndDate?: Date
): { startDate: Date; endDate: Date } {
  const now = new Date();

  return match(timeRange)
    .with("7d", () => ({ startDate: subDays(now, 7), endDate: now }))
    .with("30d", () => ({ startDate: subDays(now, 30), endDate: now }))
    .with("90d", () => ({ startDate: subDays(now, 90), endDate: now }))
    .with("1y", () => ({ startDate: subYears(now, 1), endDate: now }))
    .with("custom", () => ({
      startDate: customStartDate ?? subDays(now, 30),
      endDate: customEndDate ?? now,
    }))
    .exhaustive();
}

export interface CloudUsageDataPoint {
  date: string;
  co2e: number; // in metric tons (mtCO2e)
  kilowattHours: number;
  cost: number;
  // Separate metrics by type
  operational_co2e?: number;
  operational_kilowattHours?: number;
  operational_cost?: number;
  embodied_co2e?: number;
  embodied_kilowattHours?: number;
  embodied_cost?: number;
}

export interface CloudUsageByService {
  service: CloudService;
  label: string;
  co2e: number; // in metric tons (mtCO2e)
  kilowattHours: number;
  cost: number;
}

export interface CloudUsageByRegion {
  region: string;
  co2e: number; // in metric tons (mtCO2e)
  kilowattHours: number;
  cost: number;
}

export interface CloudUsageByInstanceType {
  instanceType: string;
  serviceName: string;
  co2e: number; // in metric tons (mtCO2e)
  kilowattHours: number;
  cost: number;
}

export interface CloudFootprint {
  co2e: number;
  kilowattHours: number | null;
  cost: number | null;
  periodStartDate: Date;
  serviceName: string;
  cloudProvider: string;
  region: string;
  tags: string | null;
  periodEndDate: Date;
  type: string;
  serviceType: string | null;
}

export interface CloudUsageResponse {
  timeSeries: CloudUsageDataPoint[];
  byService: CloudUsageByService[];
  byRegion: CloudUsageByRegion[];
  byInstanceType: CloudUsageByInstanceType[];
  footprints: CloudFootprint[];
  totals: {
    co2e: number; // in metric tons (mtCO2e)
    kilowattHours: number;
    cost: number;
  };
  availableRegions: string[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Gets the ISO week key for a date (YYYY-Www format)
 */
function getWeekKey(date: Date): string {
  const tempDate = new Date(date);
  // Set to nearest Thursday: current date + 4 - current day number
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  // Get first day of year
  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(
    ((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  // Return ISO week format
  return `${tempDate.getFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

/**
 * Gets the month key for a date (YYYY-MM format)
 */
function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

function getDayKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Gets the date key based on aggregation period
 */
function getDateKey(date: Date, aggregation: "day" | "week" | "month"): string {
  return match(aggregation)
    .with("day", () => getDayKey(date))
    .with("week", () => getWeekKey(date))
    .with("month", () => getMonthKey(date))
    .exhaustive();
}

/**
 * Aggregates footprint data by date with support for day, week, and month aggregation
 */
function aggregateByDate(
  footprints: Array<{
    periodStartDate: Date;
    co2e: number;
    kilowattHours: number | null;
    cost: number | null;
    type: string;
  }>,
  aggregation: "day" | "week" | "month" = "day"
): CloudUsageDataPoint[] {
  const dateMap = new Map<string, CloudUsageDataPoint>();

  for (const footprint of footprints) {
    const dateKey = getDateKey(footprint.periodStartDate, aggregation);
    const existing = dateMap.get(dateKey);
    const isOperational = footprint.type === "OPERATIONAL_METRICS";
    const cost = footprint.cost ?? 0;

    if (existing) {
      dateMap.set(dateKey, {
        date: dateKey,
        co2e: existing.co2e + footprint.co2e,
        kilowattHours: existing.kilowattHours + (footprint.kilowattHours ?? 0),
        cost: existing.cost + cost,
        operational_co2e: isOperational
          ? (existing.operational_co2e ?? 0) + footprint.co2e
          : existing.operational_co2e,
        operational_kilowattHours: isOperational
          ? (existing.operational_kilowattHours ?? 0) +
            (footprint.kilowattHours ?? 0)
          : existing.operational_kilowattHours,
        operational_cost: isOperational
          ? (existing.operational_cost ?? 0) + cost
          : existing.operational_cost,
        embodied_co2e: !isOperational
          ? (existing.embodied_co2e ?? 0) + footprint.co2e
          : existing.embodied_co2e,
        embodied_kilowattHours: !isOperational
          ? (existing.embodied_kilowattHours ?? 0) +
            (footprint.kilowattHours ?? 0)
          : existing.embodied_kilowattHours,
        embodied_cost: !isOperational
          ? (existing.embodied_cost ?? 0) + cost
          : existing.embodied_cost,
      });
    } else {
      dateMap.set(dateKey, {
        date: dateKey,
        co2e: footprint.co2e,
        kilowattHours: footprint.kilowattHours ?? 0,
        cost: cost,
        operational_co2e: isOperational ? footprint.co2e : undefined,
        operational_kilowattHours: isOperational
          ? (footprint.kilowattHours ?? undefined)
          : undefined,
        operational_cost: isOperational ? cost : undefined,
        embodied_co2e: !isOperational ? footprint.co2e : undefined,
        embodied_kilowattHours: !isOperational
          ? (footprint.kilowattHours ?? undefined)
          : undefined,
        embodied_cost: !isOperational ? cost : undefined,
      });
    }
  }

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Aggregates footprint data by service
 */
function aggregateByService(
  footprints: Array<{
    serviceName: string;
    co2e: number;
    kilowattHours: number | null;
    cost: number | null;
  }>,
  serviceLabels: Record<CloudService, string>
): CloudUsageByService[] {
  const serviceMap = new Map<string, CloudUsageByService>();

  for (const footprint of footprints) {
    const service = footprint.serviceName as CloudService;
    const existing = serviceMap.get(service);

    if (existing) {
      serviceMap.set(service, {
        ...existing,
        co2e: existing.co2e + footprint.co2e,
        kilowattHours: existing.kilowattHours + (footprint.kilowattHours ?? 0),
        cost: existing.cost + (footprint.cost ?? 0),
      });
    } else {
      serviceMap.set(service, {
        service,
        label: serviceLabels[service] ?? service,
        co2e: footprint.co2e,
        kilowattHours: footprint.kilowattHours ?? 0,
        cost: footprint.cost ?? 0,
      });
    }
  }

  return Array.from(serviceMap.values()).sort((a, b) => b.co2e - a.co2e);
}

/**
 * Aggregates footprint data by region
 */
function aggregateByRegion(
  footprints: Array<{
    region: string;
    co2e: number;
    kilowattHours: number | null;
    cost: number | null;
  }>
): CloudUsageByRegion[] {
  const regionMap = new Map<string, CloudUsageByRegion>();

  for (const footprint of footprints) {
    const existing = regionMap.get(footprint.region);

    if (existing) {
      regionMap.set(footprint.region, {
        region: footprint.region,
        co2e: existing.co2e + footprint.co2e,
        kilowattHours: existing.kilowattHours + (footprint.kilowattHours ?? 0),
        cost: existing.cost + (footprint.cost ?? 0),
      });
    } else {
      regionMap.set(footprint.region, {
        region: footprint.region,
        co2e: footprint.co2e,
        kilowattHours: footprint.kilowattHours ?? 0,
        cost: footprint.cost ?? 0,
      });
    }
  }

  return Array.from(regionMap.values()).sort((a, b) => b.co2e - a.co2e);
}

/**
 * Normalizes instance type by extracting the part before colon if present
 */
function normalizeInstanceType(serviceType: string | null): string {
  if (!serviceType) return "Unknown";
  const colonIndex = serviceType.indexOf(":");
  return colonIndex > 0 ? serviceType.substring(0, colonIndex) : serviceType;
}

/**
 * Aggregates footprint data by instance type (serviceType)
 */
function aggregateByInstanceType(
  footprints: Array<{
    serviceType: string | null;
    serviceName: string;
    co2e: number;
    kilowattHours: number | null;
    cost: number | null;
    type: string;
  }>
): CloudUsageByInstanceType[] {
  // Filter to only embodied metrics as requested
  const embodiedFootprints = footprints.filter(
    (fp) => fp.type === "EMBODIED_METRICS"
  );

  const instanceTypeMap = new Map<string, CloudUsageByInstanceType>();

  for (const footprint of embodiedFootprints) {
    const instanceType = normalizeInstanceType(footprint.serviceType);
    const existing = instanceTypeMap.get(instanceType);

    if (existing) {
      instanceTypeMap.set(instanceType, {
        instanceType,
        serviceName: existing.serviceName, // Keep first service name
        co2e: existing.co2e + footprint.co2e,
        kilowattHours: existing.kilowattHours + (footprint.kilowattHours ?? 0),
        cost: existing.cost + (footprint.cost ?? 0),
      });
    } else {
      instanceTypeMap.set(instanceType, {
        instanceType,
        serviceName: footprint.serviceName,
        co2e: footprint.co2e,
        kilowattHours: footprint.kilowattHours ?? 0,
        cost: footprint.cost ?? 0,
      });
    }
  }

  return Array.from(instanceTypeMap.values()).sort((a, b) => b.co2e - a.co2e);
}

/**
 * Calculates totals from footprint data
 */
function calculateTotals(
  footprints: Array<{
    co2e: number;
    kilowattHours: number | null;
    cost: number | null;
  }>
): { co2e: number; kilowattHours: number; cost: number } {
  return footprints.reduce<{
    co2e: number;
    kilowattHours: number;
    cost: number;
  }>(
    (totals, footprint) => ({
      co2e: totals.co2e + footprint.co2e,
      kilowattHours: totals.kilowattHours + (footprint.kilowattHours ?? 0),
      cost: totals.cost + (footprint.cost ?? 0),
    }),
    { co2e: 0, kilowattHours: 0, cost: 0 }
  );
}

export async function getAllAvailableRegions(): Promise<string[]> {
  const regions = await prisma.cloudFootprint.findMany({
    select: { region: true },
    distinct: ["region"],
  });
  return regions
    .map((r) => r.region)
    .filter(Boolean)
    .sort();
}

/**
 * Internal function that fetches cloud usage data (cached)
 */
async function fetchCloudUsageDataInternal(
  userId: string,
  organizationId: string,
  validated: CloudUsageFilterInput,
  startDate: Date,
  endDate: Date,
  connectionIds: string[]
): Promise<CloudUsageResponse> {
  console.log("fetchCloudUsageDataInternal", {
    userId,
    organizationId,
    validated,
    startDate,
    endDate,
    connectionIds,
  });

  // 7. Build the query with filters (periodStartDate/periodEndDate are stored as ISO strings)
  const whereClause: Prisma.CloudFootprintWhereInput = {
    cloudConnectionId: { in: connectionIds },
    periodStartDate: { gte: startDate.toISOString() },
    periodEndDate: { lte: endDate.toISOString() },
  };

  // Filter by services if specified
  if (
    validated.services.length > 0 &&
    validated.services.length < CLOUD_SERVICES.length
  ) {
    whereClause.serviceName = { in: validated.services };
  }

  // Filter by regions if specified
  if (validated.regions.length > 0) {
    whereClause.region = { in: validated.regions };
  }

  // 8. Fetch footprint data
  const footprints: CloudFootprint[] = await prisma.cloudFootprint.findMany({
    where: whereClause,
    select: {
      periodStartDate: true,
      serviceName: true,
      region: true,
      cloudProvider: true,
      tags: true,
      periodEndDate: true,
      co2e: true,
      kilowattHours: true,
      cost: true,
      type: true,
      serviceType: true,
    },
    orderBy: { periodStartDate: "asc" },
  });

  // 9. Get all available regions for filter options
  const availableRegions = await getAllAvailableRegions();

  // 10. Aggregate the data
  const timeSeries = aggregateByDate(footprints, validated.aggregation);
  const byService = aggregateByService(footprints, CLOUD_SERVICE_LABELS);
  const byRegion = aggregateByRegion(footprints);
  const byInstanceType = aggregateByInstanceType(footprints);
  const totals = calculateTotals(footprints);

  return {
    timeSeries,
    byService,
    byRegion,
    byInstanceType,
    totals,
    footprints,
    availableRegions,
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  };
}

/**
 * Fetches cloud usage data with filtering
 */
export async function getCloudUsageData(
  filters: Partial<CloudUsageFilterInput>
): Promise<{ data?: CloudUsageResponse; error?: string }> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    // 3. Authorization - check user has organization
    if (!user || !user.organizationId) {
      return { error: "No organization found" };
    }

    // 4. Validate with Zod
    const validated = await CloudUsageFilterSchema.parseAsync(filters);

    // 5. Calculate date range
    const { startDate, endDate } = calculateDateRange(
      validated.timeRange,
      validated.startDate,
      validated.endDate
    );

    // 6. Fetch cloud connections for the organization
    const connections = await prisma.cloudConnection.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      select: { id: true },
    });

    if (connections.length === 0) {
      return {
        data: {
          timeSeries: [],
          footprints: [],
          byService: [],
          byRegion: [],
          byInstanceType: [],
          totals: { co2e: 0, kilowattHours: 0, cost: 0 },
          availableRegions: [],
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        },
      };
    }

    const connectionIds = connections.map((c) => c.id);

    // Generate cache key based on filters and connection IDs
    // organizationId is guaranteed to be non-null due to check above
    const organizationId = user.organizationId;
    // const cacheKey = generateCacheKey(
    //   user.id,
    //   organizationId,
    //   validated,
    //   startDate,
    //   endDate,
    //   connectionIds
    // );

    const data = await fetchCloudUsageDataInternal(
      user.id,
      organizationId,
      validated,
      startDate,
      endDate,
      connectionIds
    );

    // Fetch data with caching (60 second revalidation)
    // const cachedFetch = unstable_cache(
    //   async () => {
    //     return fetchCloudUsageDataInternal(
    //       user.id,
    //       organizationId,
    //       validated,
    //       startDate,
    //       endDate,
    //       connectionIds
    //     );
    //   },
    //   [cacheKey],
    //   {
    //     revalidate: 3600, // Revalidate every hour
    //     tags: [
    //       `cloud-usage-${user.id}`,
    //       `org-${organizationId}`,
    //       `cloud-connections-${organizationId}`,
    //     ],
    //   }
    // );
    // const data = await cachedFetch();

    return { data };
  } catch (error) {
    console.error("Error fetching cloud usage data:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch cloud usage data",
    };
  }
}

/**
 * Exports cloud usage data as CSV based on filters
 */
export async function exportCloudUsageCSV(
  footprints: CloudFootprint[]
): Promise<{ csv?: string; error?: string }> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    // 3. Authorization - only borrowers can export cloud usage
    if (!user || user.role !== "BORROWER" || !user.organizationId) {
      return { error: "Only borrowers can export cloud usage data" };
    }

    // 9. Convert to CSV
    if (footprints.length === 0) {
      return { csv: "" };
    }

    // CSV header
    const headers = [
      "Period Start",
      "Period End",
      "Cloud Provider",
      "Service Name",
      "Region",
      "Energy (kWh)",
      "CO2e (mtCO2e)",
      "Cost ($)",
      "Metric Type",
      "Service Type",
      "Tags",
    ];

    // CSV rows
    const rows = footprints.map((fp) => [
      fp.periodStartDate.toLocaleString(),
      fp.periodEndDate.toLocaleString(),
      fp.cloudProvider,
      fp.serviceName,
      fp.region,
      fp.kilowattHours?.toString() ?? "N/A",
      fp.co2e.toString(),
      fp.cost?.toString() ?? "N/A",
      fp.type,
      fp.serviceType ?? "N/A",
      fp.tags ?? "",
    ]);

    // Combine header and rows with proper CSV escaping
    const csvLines = [headers, ...rows].map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if needed
          const cellStr = cell.toString();
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    );

    const csv = csvLines.join("\n");

    return { csv };
  } catch (error) {
    console.error("Error exporting cloud usage data:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to export cloud usage data",
    };
  }
}
