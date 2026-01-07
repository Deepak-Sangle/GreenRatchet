/**
 * AWS Embodied Metrics Calculator
 *
 * Calculates embodied carbon metrics for AWS infrastructure using Cost Explorer API
 * Captures billing cost and usage hours per service/region/instance type
 *
 * Supported Services: EC2, S3, EBS, RDS, DynamoDB, DocumentDB, Redshift, Neptune, Keyspaces
 */

import { prisma } from "@/lib/prisma";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";
import {
  assumeAWSRole,
  createAWSClients,
  formatDateForAWS,
  type DateRange,
} from "./aws-utils";

/**
 * Embodied metrics data structure from Cost Explorer
 */
interface EmbodiedMetricsData {
  serviceName: string;
  region: string;
  instanceType?: string;
  usageType?: string;
  instanceHours?: number;
  storageGBHours?: number;
  requestCount?: number;
  dataTransferGB?: number;
  totalCost: number;
  unblendedCost?: number;
}

/**
 * AWS Service name mapping (Cost Explorer uses different names)
 */
const SERVICE_NAME_MAP: Record<string, string> = {
  "Amazon Elastic Compute Cloud - Compute": "EC2",
  "Amazon Elastic Compute Cloud": "EC2",
  "Amazon Simple Storage Service": "S3",
  "Amazon Elastic Block Store": "EBS",
  "Amazon Relational Database Service": "RDS",
  "Amazon DynamoDB": "DynamoDB",
  "Amazon DocumentDB": "DocumentDB",
  "Amazon Redshift": "Redshift",
  "Amazon Neptune": "Neptune",
  "Amazon Keyspaces": "Keyspaces",
};

/**
 * Normalizes AWS service name from Cost Explorer to our internal naming
 */
function normalizeServiceName(costExplorerServiceName: string): string | null {
  for (const [key, value] of Object.entries(SERVICE_NAME_MAP)) {
    if (costExplorerServiceName.includes(key)) {
      return value;
    }
  }
  return null;
}

/**
 * Extracts region from usage type
 * Usage types often contain region codes (e.g., "USE1-BoxUsage:t2.micro" -> us-east-1)
 */
function extractRegion(usageType: string): string {
  const regionCodes: Record<string, string> = {
    USE1: "us-east-1",
    USE2: "us-east-2",
    USW1: "us-west-1",
    USW2: "us-west-2",
    EUW1: "eu-west-1",
    EUW2: "eu-west-2",
    EUW3: "eu-west-3",
    EUC1: "eu-central-1",
    APN1: "ap-northeast-1",
    APN2: "ap-northeast-2",
    APS1: "ap-southeast-1",
    APS2: "ap-southeast-2",
    SAE1: "sa-east-1",
    CAN1: "ca-central-1",
  };

  for (const [code, region] of Object.entries(regionCodes)) {
    if (usageType.startsWith(code)) {
      return region;
    }
  }

  return "global"; // Default for services without region info
}

/**
 * Extracts instance type from usage type
 * E.g., "BoxUsage:t2.micro" -> "t2.micro"
 */
function extractInstanceType(usageType: string): string | undefined {
  // EC2: BoxUsage:t2.micro, USE1-BoxUsage:t2.micro
  const ec2Match = usageType.match(/BoxUsage:([a-z0-9.-]+)/i);
  if (ec2Match) return ec2Match[1];

  // RDS: InstanceUsage:db.t3.micro
  const rdsMatch = usageType.match(/InstanceUsage:([a-z0-9.-]+)/i);
  if (rdsMatch) return rdsMatch[1];

  // EBS: VolumeUsage.gp2, VolumeUsage.gp3
  const ebsMatch = usageType.match(/VolumeUsage\.([a-z0-9.-]+)/i);
  if (ebsMatch) return ebsMatch[1];

  return undefined;
}

/**
 * Fetches cost and usage data from AWS Cost Explorer
 */
async function fetchCostAndUsage(
  costExplorerClient: CostExplorerClient,
  dateRange: DateRange
): Promise<EmbodiedMetricsData[]> {
  const command = new GetCostAndUsageCommand({
    TimePeriod: {
      Start: formatDateForAWS(dateRange.startDate),
      End: formatDateForAWS(dateRange.endDate),
    },
    Granularity: "MONTHLY",
    Metrics: ["UnblendedCost", "UsageQuantity"],
    GroupBy: [
      { Type: "DIMENSION", Key: "SERVICE" },
      { Type: "DIMENSION", Key: "USAGE_TYPE" },
    ],
  });

  try {
    const response = await costExplorerClient.send(command);
    const metricsData: EmbodiedMetricsData[] = [];

    if (!response.ResultsByTime || response.ResultsByTime.length === 0) {
      return metricsData;
    }

    // Process each time period (typically one for monthly)
    for (const timeData of response.ResultsByTime) {
      if (!timeData.Groups) continue;

      for (const group of timeData.Groups) {
        const serviceName = group.Keys?.[0] || "Unknown";
        const usageType = group.Keys?.[1] || "Unknown";

        // Normalize service name
        const normalizedService = normalizeServiceName(serviceName);
        if (!normalizedService) continue; // Skip unsupported services

        // Extract metrics
        const totalCost = parseFloat(
          group.Metrics?.UnblendedCost?.Amount || "0"
        );
        const usageAmount = parseFloat(
          group.Metrics?.UsageQuantity?.Amount || "0"
        );

        if (totalCost === 0 && usageAmount === 0) continue; // Skip empty entries

        // Parse usage type for details
        const region = extractRegion(usageType);
        const instanceType = extractInstanceType(usageType);

        // Classify usage amount based on service and usage type
        let instanceHours: number | undefined;
        let storageGBHours: number | undefined;
        let requestCount: number | undefined;
        let dataTransferGB: number | undefined;

        // EC2, RDS: Instance hours
        if (
          (normalizedService === "EC2" || normalizedService === "RDS") &&
          usageType.includes("Usage")
        ) {
          instanceHours = usageAmount;
        }

        // S3, EBS: Storage GB-hours
        if (
          (normalizedService === "S3" || normalizedService === "EBS") &&
          (usageType.includes("Storage") || usageType.includes("TimedStorage"))
        ) {
          storageGBHours = usageAmount;
        }

        // DynamoDB, S3: Requests
        if (
          (normalizedService === "DynamoDB" || normalizedService === "S3") &&
          usageType.includes("Requests")
        ) {
          requestCount = usageAmount;
        }

        // Data Transfer
        if (
          usageType.includes("DataTransfer") ||
          usageType.includes("Transfer")
        ) {
          dataTransferGB = usageAmount;
        }

        metricsData.push({
          serviceName: normalizedService,
          region,
          instanceType,
          usageType,
          instanceHours,
          storageGBHours,
          requestCount,
          dataTransferGB,
          totalCost,
          unblendedCost: totalCost, // Same for now
        });
      }
    }

    return metricsData;
  } catch (error) {
    console.error("Error fetching Cost Explorer data:", error);
    throw new Error(
      `Failed to fetch cost data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Upserts CloudService record
 */
async function upsertCloudService(
  cloudConnectionId: string,
  serviceName: string,
  serviceId: string,
  region: string,
  additionalData: Record<string, any>
) {
  const existingService = await prisma.cloudService.findFirst({
    where: {
      cloudConnectionId,
      serviceName,
      serviceId,
      region,
    },
  });

  if (existingService) {
    return await prisma.cloudService.update({
      where: { id: existingService.id },
      data: {
        additionalData,
        updatedAt: new Date(),
      },
    });
  } else {
    return await prisma.cloudService.create({
      data: {
        cloudConnectionId,
        serviceName,
        serviceId,
        region,
        additionalData,
      },
    });
  }
}

/**
 * Upserts embodied metrics for a cloud service
 */
async function upsertEmbodiedMetrics(
  tx: any,
  cloudServiceId: string,
  metric: EmbodiedMetricsData,
  dateRange: DateRange
) {
  // Check if embodied metrics already exist for this period
  const existingMetrics = await tx.cloudEmbodiedMetrics.findFirst({
    where: {
      cloudServiceId,
      periodStart: dateRange.startDate,
      periodEnd: dateRange.endDate,
    },
  });

  if (existingMetrics) {
    // Update existing metrics
    return await tx.cloudEmbodiedMetrics.update({
      where: { id: existingMetrics.id },
      data: {
        totalCost: metric.totalCost,
        unblendedCost: metric.unblendedCost,
        instanceHours: metric.instanceHours,
        storageGBHours: metric.storageGBHours,
        requestCount: metric.requestCount,
        dataTransferGB: metric.dataTransferGB,
        usageType: metric.usageType,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new metrics
    return await tx.cloudEmbodiedMetrics.create({
      data: {
        cloudServiceId,
        periodStart: dateRange.startDate,
        periodEnd: dateRange.endDate,
        region: metric.region,
        instanceType: metric.instanceType,
        serviceName: metric.serviceName,
        usageType: metric.usageType,
        instanceHours: metric.instanceHours,
        storageGBHours: metric.storageGBHours,
        requestCount: metric.requestCount,
        dataTransferGB: metric.dataTransferGB,
        totalCost: metric.totalCost,
        unblendedCost: metric.unblendedCost,
      },
    });
  }
}

/**
 * Processes and stores embodied metrics data
 */
async function processAndStoreEmbodiedMetrics(
  cloudConnectionId: string,
  metricsData: EmbodiedMetricsData[],
  dateRange: DateRange
): Promise<number> {
  if (metricsData.length === 0) return 0;

  // Group metrics by service name, region, and instance type
  const groupedMetrics = new Map<string, EmbodiedMetricsData>();

  for (const metric of metricsData) {
    const key = `${metric.serviceName}-${metric.region}-${metric.instanceType || "default"}`;

    if (groupedMetrics.has(key)) {
      const existing = groupedMetrics.get(key)!;
      // Aggregate metrics
      existing.totalCost += metric.totalCost;
      existing.unblendedCost =
        (existing.unblendedCost || 0) + (metric.unblendedCost || 0);
      existing.instanceHours =
        (existing.instanceHours || 0) + (metric.instanceHours || 0);
      existing.storageGBHours =
        (existing.storageGBHours || 0) + (metric.storageGBHours || 0);
      existing.requestCount =
        (existing.requestCount || 0) + (metric.requestCount || 0);
      existing.dataTransferGB =
        (existing.dataTransferGB || 0) + (metric.dataTransferGB || 0);
    } else {
      groupedMetrics.set(key, { ...metric });
    }
  }

  let processedCount = 0;

  for (const metric of groupedMetrics.values()) {
    await prisma.$transaction(async (tx) => {
      // Generate service ID (combination of service name, region, and instance type)
      const serviceId = `${metric.serviceName}-${metric.region}-${metric.instanceType || "default"}`;

      // Upsert service
      const service = await upsertCloudService(
        cloudConnectionId,
        metric.serviceName,
        serviceId,
        metric.region,
        {
          instanceType: metric.instanceType,
        }
      );

      // Upsert embodied metrics
      await upsertEmbodiedMetrics(tx, service.id, metric, dateRange);
    });

    processedCount++;
  }

  return processedCount;
}

/**
 * Main orchestrator: Calculates and stores embodied metrics for AWS
 * Note: Cost Explorer is a global service and returns data for ALL regions automatically
 */
export async function calculateAndStoreAWSEmbodiedMetrics(
  cloudConnectionId: string,
  dateRange: DateRange
): Promise<{
  success: boolean;
  metricsProcessed: number;
  regionBreakdown: Record<string, number>;
  error?: string;
}> {
  try {
    // 1. Get CloudConnection from database
    const connection = await prisma.cloudConnection.findUnique({
      where: { id: cloudConnectionId },
      include: { organization: true },
    });

    if (!connection || connection.provider !== "AWS") {
      return {
        success: false,
        metricsProcessed: 0,
        regionBreakdown: {},
        error: "Invalid AWS connection",
      };
    }

    if (!connection.roleArn || !connection.externalId) {
      return {
        success: false,
        metricsProcessed: 0,
        regionBreakdown: {},
        error: "Missing AWS credentials",
      };
    }

    console.log(
      `\nCalculating embodied metrics for connection ${cloudConnectionId}...`
    );
    console.log(
      `Note: Cost Explorer returns data for ALL regions automatically`
    );

    // 2. Assume AWS role (region doesn't matter for Cost Explorer, it's global)
    const credentials = await assumeAWSRole(
      connection.roleArn,
      connection.externalId,
      "us-east-1" // Use any region for STS authentication
    );

    // 3. Create AWS clients
    const clients = createAWSClients(credentials, "us-east-1");

    // 4. Fetch cost and usage data (automatically includes all regions)
    console.log("Fetching cost and usage data from Cost Explorer...");
    const metricsData = await fetchCostAndUsage(
      clients.costExplorer,
      dateRange
    );

    console.log(`Fetched ${metricsData.length} cost/usage entries`);

    // Count entries by region for reporting
    const regionCounts = metricsData.reduce(
      (acc, metric) => {
        acc[metric.region] = (acc[metric.region] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(
      `  Regions found: ${Object.keys(regionCounts).length} (${Object.keys(regionCounts).join(", ")})`
    );

    // 5. Process and store metrics
    console.log("Processing and storing embodied metrics...");
    const processedCount = await processAndStoreEmbodiedMetrics(
      cloudConnectionId,
      metricsData,
      dateRange
    );

    // Count processed metrics by region
    const processedRegionBreakdown: Record<string, number> = {};
    for (const [region, count] of Object.entries(regionCounts)) {
      processedRegionBreakdown[region] = count;
    }

    // 6. Update connection's lastSync timestamp
    await prisma.cloudConnection.update({
      where: { id: cloudConnectionId },
      data: { lastSync: new Date() },
    });

    console.log(
      `✓ Successfully processed ${processedCount} embodied metrics across ${Object.keys(regionCounts).length} regions`
    );

    return {
      success: true,
      metricsProcessed: processedCount,
      regionBreakdown: processedRegionBreakdown,
    };
  } catch (error) {
    console.error("Error calculating AWS embodied metrics:", error);
    return {
      success: false,
      metricsProcessed: 0,
      regionBreakdown: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cron job entry point: Run embodied metrics collection for all AWS connections
 */
export async function runAWSEmbodiedMetricsCollection() {
  // Get all active AWS connections
  const awsConnections = await prisma.cloudConnection.findMany({
    where: {
      provider: "AWS",
      isActive: true,
    },
  });

  console.log(`\n========================================`);
  console.log(`AWS Embodied Metrics Collection`);
  console.log(`========================================`);
  console.log(`Found ${awsConnections.length} active AWS connections`);

  // Calculate metrics for the last month
  const now = new Date();
  const dateRange: DateRange = {
    startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1), // First day of last month
    endDate: new Date(now.getFullYear(), now.getMonth(), 0), // Last day of last month
  };

  console.log(
    `Period: ${formatDateForAWS(dateRange.startDate)} to ${formatDateForAWS(dateRange.endDate)}`
  );
  console.log(`========================================\n`);

  for (const connection of awsConnections) {
    console.log(`\n----------------------------------------`);
    console.log(`Processing connection ${connection.id}...`);
    console.log(`----------------------------------------`);

    const result = await calculateAndStoreAWSEmbodiedMetrics(
      connection.id,
      dateRange
    );

    if (result.success) {
      console.log(
        `\n✓ Connection ${connection.id}: Processed ${result.metricsProcessed} metrics`
      );
      console.log(`  Region breakdown:`);
      Object.entries(result.regionBreakdown)
        .sort(([, a], [, b]) => b - a) // Sort by count descending
        .forEach(([region, count]) => {
          console.log(`    ${region}: ${count} entries`);
        });
    } else {
      console.error(`\n✗ Connection ${connection.id}: ${result.error}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Embodied metrics collection completed`);
  console.log(`========================================\n`);
}
