/**
 * AWS Operational Metrics Calculator
 *
 * Calculates usage metrics for AWS services via CloudWatch SDK
 * Metrics are used as input for CO2 calculations via OxygenIT API
 *
 * Supported Services: EC2, S3, EBS, RDS,
 */

import { CloudOperationalMetrics } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CloudWatchClient,
  ListMetricsCommand,
  type MetricDataQuery,
} from "@aws-sdk/client-cloudwatch";
import {
  DescribeInstancesCommand,
  DescribeVolumesCommand,
  EC2Client,
  Instance,
} from "@aws-sdk/client-ec2";
import { DescribeDBInstancesCommand, RDSClient } from "@aws-sdk/client-rds";
import {
  assumeAWSRole,
  AWS_REGIONS,
  calculateNetwork,
  createAWSClients,
  discoverS3BucketsInRegion,
  fetchCloudWatchMetrics,
  parseMetricDataResult,
  type AWSCredentials,
  type DateRange,
  type MetricData,
} from "./aws-utils";

/**
 * Service-specific usage metrics for OxygenIT API
 */
interface EC2UsageMetrics {
  serviceName: "EC2";
  instanceId: string;
  instanceType: string;
  region: string;
  cpuUtilization: MetricData[]; // Percentage
  networkIn: MetricData[]; // Bytes
  networkOut: MetricData[]; // Bytes
  diskReadBytes: MetricData[]; // Bytes
  diskWriteBytes: MetricData[]; // Bytes
}

interface S3UsageMetrics {
  serviceName: "S3";
  bucketName: string;
  region: string;
  storageClass: string; // StandardStorage, StandardIAStorage, GlacierStorage, etc.
  numberOfObjects: MetricData[]; // Count
  bucketSizeBytes: MetricData[]; // Bytes
  bytesUploaded: MetricData[]; // Bytes
  bytesDownloaded: MetricData[]; // Bytes
}

interface EBSUsageMetrics {
  serviceName: "EBS";
  volumeId: string;
  volumeType: string;
  volumeSizeGB: number; // Volume size in GB
  region: string;
  volumeReadBytes: MetricData[]; // Bytes
  volumeWriteBytes: MetricData[]; // Bytes
  volumeReadOps: MetricData[]; // Count
  volumeWriteOps: MetricData[]; // Count
}

interface RDSUsageMetrics {
  serviceName: "RDS";
  dbInstanceIdentifier: string;
  dbInstanceClass: string;
  engine: string;
  region: string;
  allocatedStorageGB: number; // Allocated storage in GB
  cpuUtilization: MetricData[]; // Percentage
  databaseConnections: MetricData[]; // Count
  readIOPS: MetricData[]; // Count/Second
  writeIOPS: MetricData[]; // Count/Second
  networkReceiveThroughput: MetricData[]; // Bytes/Second
  networkTransmitThroughput: MetricData[]; // Bytes/Second
}

export type ServiceUsageMetrics =
  | EC2UsageMetrics
  | S3UsageMetrics
  | EBSUsageMetrics
  | RDSUsageMetrics;

/**
 * EC2: Calculate operational metrics
 */
export async function calculateEC2Metrics(
  cloudWatchClient: CloudWatchClient,
  ec2Client: EC2Client,
  dateRange: DateRange,
  region: string
): Promise<EC2UsageMetrics[]> {
  // Discover EC2 instances
  const describeCommand = new DescribeInstancesCommand({});
  const instancesResponse = await ec2Client.send(describeCommand);

  const instances: Instance[] =
    instancesResponse.Reservations?.flatMap((r) => r.Instances || []) || [];

  const metrics: EC2UsageMetrics[] = [];

  for (const instance of instances) {
    if (!instance.InstanceId || instance.State?.Name !== "running") {
      continue;
    }

    const instanceId = instance.InstanceId;
    const instanceType = instance.InstanceType || "unknown";

    // Build CloudWatch queries for this instance
    const queries: MetricDataQuery[] = [
      {
        Id: "cpuUtilization",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EC2",
            MetricName: "CPUUtilization",
            Dimensions: [{ Name: "InstanceId", Value: instanceId }],
          },
          Period: 3600, // 1 hour aggregation
          Stat: "Average",
        },
      },
      {
        Id: "networkIn",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EC2",
            MetricName: "NetworkIn",
            Dimensions: [{ Name: "InstanceId", Value: instanceId }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
      {
        Id: "networkOut",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EC2",
            MetricName: "NetworkOut",
            Dimensions: [{ Name: "InstanceId", Value: instanceId }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
      {
        Id: "diskReadBytes",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EC2",
            MetricName: "DiskReadBytes",
            Dimensions: [{ Name: "InstanceId", Value: instanceId }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
      {
        Id: "diskWriteBytes",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EC2",
            MetricName: "DiskWriteBytes",
            Dimensions: [{ Name: "InstanceId", Value: instanceId }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
    ];

    const results = await fetchCloudWatchMetrics(
      cloudWatchClient,
      queries,
      dateRange
    );

    metrics.push({
      serviceName: "EC2",
      instanceId,
      instanceType,
      region,
      cpuUtilization: parseMetricDataResult(
        results.find((r) => r.Id === "cpuUtilization")!
      ),
      networkIn: parseMetricDataResult(
        results.find((r) => r.Id === "networkIn")!
      ),
      networkOut: parseMetricDataResult(
        results.find((r) => r.Id === "networkOut")!
      ),
      diskReadBytes: parseMetricDataResult(
        results.find((r) => r.Id === "diskReadBytes")!
      ),
      diskWriteBytes: parseMetricDataResult(
        results.find((r) => r.Id === "diskWriteBytes")!
      ),
    });
  }

  return metrics;
}

/**
 * Helper: Discover storage classes for an S3 bucket by querying CloudWatch metrics
 * Returns only storage classes that have actual metrics available
 */
async function discoverS3StorageClasses(
  cloudWatchClient: CloudWatchClient,
  bucketName: string
): Promise<string[]> {
  const storageClasses = new Set<string>();

  try {
    // List all BucketSizeBytes metrics for this bucket
    const listCommand = new ListMetricsCommand({
      Namespace: "AWS/S3",
      MetricName: "BucketSizeBytes",
      Dimensions: [{ Name: "BucketName", Value: bucketName }],
    });

    const response = await cloudWatchClient.send(listCommand);

    // Extract unique StorageType dimension values
    if (response.Metrics) {
      for (const metric of response.Metrics) {
        const storageTypeDimension = metric.Dimensions?.find(
          (d) => d.Name === "StorageType"
        );
        if (storageTypeDimension?.Value) {
          storageClasses.add(storageTypeDimension.Value);
        }
      }
    }
  } catch (error) {
    console.warn(
      `Failed to discover storage classes for bucket ${bucketName}:`,
      error
    );
  }

  return Array.from(storageClasses);
}

/**
 * S3: Calculate operational metrics
 * Note: S3 metrics are limited and region-specific buckets need special handling
 * Discovers storage classes dynamically for each bucket
 */
export async function calculateS3Metrics(
  cloudWatchClient: CloudWatchClient,
  dateRange: DateRange,
  region: string,
  bucketNames: string[] // Bucket names to process (can be auto-discovered)
): Promise<S3UsageMetrics[]> {
  const metrics: S3UsageMetrics[] = [];

  for (const bucketName of bucketNames) {
    // Discover which storage classes exist for this bucket
    const storageClasses = await discoverS3StorageClasses(
      cloudWatchClient,
      bucketName
    );

    if (storageClasses.length === 0) {
      console.warn(
        `No storage classes found for bucket ${bucketName}, skipping`
      );
      continue;
    }

    console.log(
      `  Bucket ${bucketName} has storage classes: ${storageClasses.join(", ")}`
    );

    // Query for network metrics (these are bucket-level, not storage-class specific)
    const networkQueries: MetricDataQuery[] = [
      {
        Id: "bytesUploaded",
        MetricStat: {
          Metric: {
            Namespace: "AWS/S3",
            MetricName: "BytesUploaded",
            Dimensions: [{ Name: "BucketName", Value: bucketName }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
      {
        Id: "bytesDownloaded",
        MetricStat: {
          Metric: {
            Namespace: "AWS/S3",
            MetricName: "BytesDownloaded",
            Dimensions: [{ Name: "BucketName", Value: bucketName }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
    ];

    const networkResults = await fetchCloudWatchMetrics(
      cloudWatchClient,
      networkQueries,
      dateRange
    );

    const bytesUploaded = parseMetricDataResult(
      networkResults.find((r) => r.Id === "bytesUploaded")!
    );
    const bytesDownloaded = parseMetricDataResult(
      networkResults.find((r) => r.Id === "bytesDownloaded")!
    );

    // Query metrics for each discovered storage class
    for (const storageClass of storageClasses) {
      const storageQueries: MetricDataQuery[] = [
        {
          Id: "numberOfObjects",
          MetricStat: {
            Metric: {
              Namespace: "AWS/S3",
              MetricName: "NumberOfObjects",
              Dimensions: [
                { Name: "BucketName", Value: bucketName },
                { Name: "StorageType", Value: storageClass },
              ],
            },
            Period: 86400, // Daily
            Stat: "Average",
          },
        },
        {
          Id: "bucketSizeBytes",
          MetricStat: {
            Metric: {
              Namespace: "AWS/S3",
              MetricName: "BucketSizeBytes",
              Dimensions: [
                { Name: "BucketName", Value: bucketName },
                { Name: "StorageType", Value: storageClass },
              ],
            },
            Period: 86400,
            Stat: "Average",
          },
        },
      ];

      const storageResults = await fetchCloudWatchMetrics(
        cloudWatchClient,
        storageQueries,
        dateRange
      );

      const numberOfObjects = parseMetricDataResult(
        storageResults.find((r) => r.Id === "numberOfObjects")!
      );
      const bucketSizeBytes = parseMetricDataResult(
        storageResults.find((r) => r.Id === "bucketSizeBytes")!
      );

      metrics.push({
        serviceName: "S3",
        bucketName,
        region,
        storageClass,
        numberOfObjects,
        bucketSizeBytes,
        bytesUploaded,
        bytesDownloaded,
      });
    }
  }

  return metrics;
}

/**
 * EBS: Calculate operational metrics
 */
export async function calculateEBSMetrics(
  cloudWatchClient: CloudWatchClient,
  ec2Client: EC2Client,
  dateRange: DateRange,
  region: string
): Promise<EBSUsageMetrics[]> {
  // Discover EBS volumes
  const describeCommand = new DescribeVolumesCommand({});
  const volumesResponse = await ec2Client.send(describeCommand);

  const volumes = volumesResponse.Volumes || [];
  const metrics: EBSUsageMetrics[] = [];

  for (const volume of volumes) {
    if (!volume.VolumeId || volume.State !== "in-use") {
      continue;
    }

    const volumeId = volume.VolumeId;
    const volumeType = volume.VolumeType || "unknown";
    const volumeSizeGB = volume.Size || 0;

    const queries: MetricDataQuery[] = [
      {
        Id: "volumeReadBytes",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EBS",
            MetricName: "VolumeReadBytes",
            Dimensions: [{ Name: "VolumeId", Value: volumeId }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
      {
        Id: "volumeWriteBytes",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EBS",
            MetricName: "VolumeWriteBytes",
            Dimensions: [{ Name: "VolumeId", Value: volumeId }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
      {
        Id: "volumeReadOps",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EBS",
            MetricName: "VolumeReadOps",
            Dimensions: [{ Name: "VolumeId", Value: volumeId }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
      {
        Id: "volumeWriteOps",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EBS",
            MetricName: "VolumeWriteOps",
            Dimensions: [{ Name: "VolumeId", Value: volumeId }],
          },
          Period: 3600,
          Stat: "Sum",
        },
      },
    ];

    const results = await fetchCloudWatchMetrics(
      cloudWatchClient,
      queries,
      dateRange
    );

    metrics.push({
      serviceName: "EBS",
      volumeId,
      volumeType,
      volumeSizeGB,
      region,
      volumeReadBytes: parseMetricDataResult(
        results.find((r) => r.Id === "volumeReadBytes")!
      ),
      volumeWriteBytes: parseMetricDataResult(
        results.find((r) => r.Id === "volumeWriteBytes")!
      ),
      volumeReadOps: parseMetricDataResult(
        results.find((r) => r.Id === "volumeReadOps")!
      ),
      volumeWriteOps: parseMetricDataResult(
        results.find((r) => r.Id === "volumeWriteOps")!
      ),
    });
  }

  return metrics;
}

/**
 * RDS: Calculate operational metrics
 */
export async function calculateRDSMetrics(
  cloudWatchClient: CloudWatchClient,
  rdsClient: RDSClient,
  dateRange: DateRange,
  region: string
): Promise<RDSUsageMetrics[]> {
  // Discover RDS instances
  const describeCommand = new DescribeDBInstancesCommand({});
  const instancesResponse = await rdsClient.send(describeCommand);

  const dbInstances = instancesResponse.DBInstances || [];
  const metrics: RDSUsageMetrics[] = [];

  for (const dbInstance of dbInstances) {
    if (
      !dbInstance.DBInstanceIdentifier ||
      dbInstance.DBInstanceStatus !== "available"
    ) {
      continue;
    }

    const dbInstanceIdentifier = dbInstance.DBInstanceIdentifier;
    const dbInstanceClass = dbInstance.DBInstanceClass || "unknown";
    const engine = dbInstance.Engine || "unknown";
    const allocatedStorageGB = dbInstance.AllocatedStorage || 0;

    const queries: MetricDataQuery[] = [
      {
        Id: "cpuUtilization",
        MetricStat: {
          Metric: {
            Namespace: "AWS/RDS",
            MetricName: "CPUUtilization",
            Dimensions: [
              { Name: "DBInstanceIdentifier", Value: dbInstanceIdentifier },
            ],
          },
          Period: 3600,
          Stat: "Average",
        },
      },
      {
        Id: "databaseConnections",
        MetricStat: {
          Metric: {
            Namespace: "AWS/RDS",
            MetricName: "DatabaseConnections",
            Dimensions: [
              { Name: "DBInstanceIdentifier", Value: dbInstanceIdentifier },
            ],
          },
          Period: 3600,
          Stat: "Average",
        },
      },
      {
        Id: "readIOPS",
        MetricStat: {
          Metric: {
            Namespace: "AWS/RDS",
            MetricName: "ReadIOPS",
            Dimensions: [
              { Name: "DBInstanceIdentifier", Value: dbInstanceIdentifier },
            ],
          },
          Period: 3600,
          Stat: "Average",
        },
      },
      {
        Id: "writeIOPS",
        MetricStat: {
          Metric: {
            Namespace: "AWS/RDS",
            MetricName: "WriteIOPS",
            Dimensions: [
              { Name: "DBInstanceIdentifier", Value: dbInstanceIdentifier },
            ],
          },
          Period: 3600,
          Stat: "Average",
        },
      },
      {
        Id: "networkReceiveThroughput",
        MetricStat: {
          Metric: {
            Namespace: "AWS/RDS",
            MetricName: "NetworkReceiveThroughput",
            Dimensions: [
              { Name: "DBInstanceIdentifier", Value: dbInstanceIdentifier },
            ],
          },
          Period: 3600,
          Stat: "Average",
        },
      },
      {
        Id: "networkTransmitThroughput",
        MetricStat: {
          Metric: {
            Namespace: "AWS/RDS",
            MetricName: "NetworkTransmitThroughput",
            Dimensions: [
              { Name: "DBInstanceIdentifier", Value: dbInstanceIdentifier },
            ],
          },
          Period: 3600,
          Stat: "Average",
        },
      },
    ];

    const results = await fetchCloudWatchMetrics(
      cloudWatchClient,
      queries,
      dateRange
    );

    metrics.push({
      serviceName: "RDS",
      dbInstanceIdentifier,
      dbInstanceClass,
      engine,
      region,
      allocatedStorageGB,
      cpuUtilization: parseMetricDataResult(
        results.find((r) => r.Id === "cpuUtilization")!
      ),
      databaseConnections: parseMetricDataResult(
        results.find((r) => r.Id === "databaseConnections")!
      ),
      readIOPS: parseMetricDataResult(
        results.find((r) => r.Id === "readIOPS")!
      ),
      writeIOPS: parseMetricDataResult(
        results.find((r) => r.Id === "writeIOPS")!
      ),
      networkReceiveThroughput: parseMetricDataResult(
        results.find((r) => r.Id === "networkReceiveThroughput")!
      ),
      networkTransmitThroughput: parseMetricDataResult(
        results.find((r) => r.Id === "networkTransmitThroughput")!
      ),
    });
  }

  return metrics;
}

/**
 * Upserts service metadata into CloudService table
 */
async function upsertCloudService(
  cloudConnectionId: string,
  serviceName: string,
  serviceId: string,
  region: string,
  additionalData: Record<string, any>
) {
  // Check if service already exists
  const existingService = await prisma.cloudService.findFirst({
    where: {
      cloudConnectionId,
      serviceName,
      serviceId,
      region,
    },
  });

  if (existingService) {
    // Update existing service
    return await prisma.cloudService.update({
      where: { id: existingService.id },
      data: {
        additionalData,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new service
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
 * Helper to process and store metrics for a single service
 */
async function processAndStoreServiceMetrics(
  cloudConnectionId: string,
  metrics: ServiceUsageMetrics[],
  dateRange: DateRange
): Promise<number> {
  if (metrics.length === 0) return 0;

  // Prepare all service and usage data
  const serviceData = metrics
    .map((metric) => {
      let serviceId: string;
      let additionalData: Record<string, any>;

      if (metric.serviceName === "EC2") {
        serviceId = metric.instanceId;
        additionalData = {
          instanceType: metric.instanceType,
        };
      } else if (metric.serviceName === "S3") {
        // Include storage class in serviceId to track different classes separately
        serviceId = `${metric.bucketName}/${metric.storageClass}`;
        additionalData = {
          storageClass: metric.storageClass,
        };
      } else if (metric.serviceName === "EBS") {
        serviceId = metric.volumeId;
        additionalData = {
          volumeType: metric.volumeType,
        };
      } else if (metric.serviceName === "RDS") {
        serviceId = metric.dbInstanceIdentifier;
        additionalData = {
          dbInstanceClass: metric.dbInstanceClass,
          engine: metric.engine,
        };
      } else {
        return null;
      }

      return { metric, serviceId, additionalData };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Process each service and create usage data in a transaction
  let processedCount = 0;

  for (const { metric, serviceId, additionalData } of serviceData) {
    await prisma.$transaction(async (tx) => {
      // Upsert service
      const service = await upsertCloudService(
        cloudConnectionId,
        metric.serviceName,
        serviceId,
        metric.region,
        additionalData
      );

      // Extract usage data fields
      const usageData: UsageData = extractUsageDataFromMetrics(metric);

      // Create usage data
      await tx.cloudOperationalMetrics.create({
        data: {
          cloudServiceId: service.id,
          periodStart: dateRange.startDate,
          periodEnd: dateRange.endDate,
          ...usageData,
        },
      });
    });

    processedCount++;
  }

  return processedCount;
}

/**
 * Converts gigabytes to bytes
 */
function gbToBytes(gb: number): number {
  return gb * 1024 * 1024 * 1024;
}

export type UsageData = Pick<
  CloudOperationalMetrics,
  | "averageCpuLoad"
  | "network"
  | "instanceType"
  | "region"
  | "storageBytes"
  | "storageClass"
>;

/**
 * Extracts usage data fields from service metrics
 */
function extractUsageDataFromMetrics(
  usageMetrics: ServiceUsageMetrics
): UsageData {
  let averageCpuLoad: number | undefined;
  let network: number | undefined;
  let instanceType: string | undefined;
  let storageBytes: number | undefined;
  let storageClass: string | undefined;

  // All metrics have region, so extract it first
  const region = usageMetrics.region;

  if (usageMetrics.serviceName === "EC2") {
    const cpuValues = usageMetrics.cpuUtilization.map((m) => m.value);
    averageCpuLoad =
      cpuValues.length > 0
        ? cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length
        : undefined;

    network = calculateNetwork(usageMetrics.networkIn, usageMetrics.networkOut);
    instanceType = usageMetrics.instanceType;
  } else if (usageMetrics.serviceName === "RDS") {
    const cpuValues = usageMetrics.cpuUtilization.map((m) => m.value);
    averageCpuLoad =
      cpuValues.length > 0
        ? cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length
        : undefined;

    network = calculateNetwork(
      usageMetrics.networkReceiveThroughput,
      usageMetrics.networkTransmitThroughput
    );
    instanceType = usageMetrics.dbInstanceClass;
    storageBytes = gbToBytes(usageMetrics.allocatedStorageGB);
  } else if (usageMetrics.serviceName === "S3") {
    network = calculateNetwork(
      usageMetrics.bytesUploaded,
      usageMetrics.bytesDownloaded
    );

    const sizeValues = usageMetrics.bucketSizeBytes.map((m) => m.value);
    storageBytes =
      sizeValues.length > 0
        ? sizeValues.reduce((a, b) => a + b, 0) / sizeValues.length
        : undefined;

    storageClass = usageMetrics.storageClass;
  } else if (usageMetrics.serviceName === "EBS") {
    network = calculateNetwork(
      usageMetrics.volumeReadBytes,
      usageMetrics.volumeWriteBytes
    );
    instanceType = usageMetrics.volumeType;
    storageBytes = gbToBytes(usageMetrics.volumeSizeGB);
  }

  return {
    averageCpuLoad: averageCpuLoad ?? null,
    network: network ?? null,
    instanceType: instanceType ?? null,
    region,
    storageBytes: storageBytes ?? null,
    storageClass: storageClass ?? null,
  };
}

/**
 * Main orchestrator: Calculates and stores operational metrics for a single region
 */
async function calculateAndStoreRegionalMetrics(
  cloudConnectionId: string,
  dateRange: DateRange,
  region: string,
  credentials: AWSCredentials,
  s3BucketNames: string[] = []
): Promise<{
  success: boolean;
  servicesProcessed: number;
  region: string;
  error?: string;
}> {
  try {
    console.log(`  [${region}] Fetching metrics...`);

    // Create AWS clients for this region
    const clients = createAWSClients(credentials, region);

    // Auto-discover S3 buckets if none provided
    let bucketsToProcess = s3BucketNames;
    if (bucketsToProcess.length === 0) {
      console.log(`  [${region}] Auto-discovering S3 buckets...`);
      bucketsToProcess = await discoverS3BucketsInRegion(clients.s3, region);
      if (bucketsToProcess.length > 0) {
        console.log(
          `  [${region}] Found ${bucketsToProcess.length} S3 bucket(s): ${bucketsToProcess.join(", ")}`
        );
      }
    }

    // Fetch all metrics in parallel for better performance
    const [ec2Metrics, ebsMetrics, rdsMetrics, s3Metrics] = await Promise.all([
      calculateEC2Metrics(clients.cloudWatch, clients.ec2, dateRange, region),
      calculateEBSMetrics(clients.cloudWatch, clients.ec2, dateRange, region),
      calculateRDSMetrics(clients.cloudWatch, clients.rds, dateRange, region),
      // S3 metrics - use discovered or provided buckets
      calculateS3Metrics(
        clients.cloudWatch,
        dateRange,
        region,
        bucketsToProcess
      ),
    ]);

    const totalMetrics =
      ec2Metrics.length +
      ebsMetrics.length +
      rdsMetrics.length +
      s3Metrics.length;

    if (totalMetrics === 0) {
      console.log(`  [${region}] No resources found, skipping`);
      return {
        success: true,
        servicesProcessed: 0,
        region,
      };
    }

    console.log(
      `  [${region}] Found: ${ec2Metrics.length} EC2, ${ebsMetrics.length} EBS, ` +
        `${rdsMetrics.length} RDS, ${s3Metrics.length} S3`
    );

    // Process and store all metrics in parallel
    const [ec2Count, ebsCount, rdsCount, s3Count] = await Promise.all([
      processAndStoreServiceMetrics(cloudConnectionId, ec2Metrics, dateRange),
      processAndStoreServiceMetrics(cloudConnectionId, ebsMetrics, dateRange),
      processAndStoreServiceMetrics(cloudConnectionId, rdsMetrics, dateRange),
      processAndStoreServiceMetrics(cloudConnectionId, s3Metrics, dateRange),
    ]);

    const totalServicesProcessed = ec2Count + ebsCount + rdsCount + s3Count;

    console.log(
      `  [${region}] ✓ Processed ${totalServicesProcessed} services ` +
        `(EC2: ${ec2Count}, EBS: ${ebsCount}, RDS: ${rdsCount}, S3: ${s3Count})`
    );

    return {
      success: true,
      servicesProcessed: totalServicesProcessed,
      region,
    };
  } catch (error) {
    console.error(`  [${region}] ✗ Error:`, error);
    return {
      success: false,
      servicesProcessed: 0,
      region,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main orchestrator: Calculates and stores operational metrics across all AWS regions
 */
export async function calculateAndStoreAWSOperationalMetrics(
  cloudConnectionId: string,
  dateRange: DateRange,
  regions: string[] = [],
  s3BucketNames: string[] = [] // Optional: S3 buckets to monitor
): Promise<{
  success: boolean;
  servicesProcessed: number;
  regionResults: Array<{
    region: string;
    servicesProcessed: number;
    success: boolean;
    error?: string;
  }>;
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
        servicesProcessed: 0,
        regionResults: [],
        error: "Invalid AWS connection",
      };
    }

    if (!connection.roleArn || !connection.externalId) {
      return {
        success: false,
        servicesProcessed: 0,
        regionResults: [],
        error: "Missing AWS credentials",
      };
    }

    // Use all AWS regions if none specified
    const regionsToProcess =
      regions.length > 0 ? regions : ([...AWS_REGIONS] as string[]);

    console.log(
      `\nCalculating operational metrics across ${regionsToProcess.length} regions...`
    );

    // 2. Assume AWS role once (credentials work for all regions)
    const credentials = await assumeAWSRole(
      connection.roleArn,
      connection.externalId,
      "us-east-1" // Region for STS, doesn't matter which
    );

    // 3. Process all regions in parallel
    const regionResults = await Promise.all(
      regionsToProcess.map((region) =>
        calculateAndStoreRegionalMetrics(
          cloudConnectionId,
          dateRange,
          region,
          credentials,
          s3BucketNames
        )
      )
    );

    // 4. Calculate totals
    const totalServicesProcessed = regionResults.reduce(
      (sum, result) => sum + result.servicesProcessed,
      0
    );
    const successfulRegions = regionResults.filter((r) => r.success).length;
    const failedRegions = regionResults.filter((r) => !r.success);

    // 5. Update connection's lastSync timestamp
    await prisma.cloudConnection.update({
      where: { id: cloudConnectionId },
      data: { lastSync: new Date() },
    });

    console.log(
      `\n✓ Successfully processed ${totalServicesProcessed} services across ${successfulRegions}/${regionsToProcess.length} regions`
    );

    if (failedRegions.length > 0) {
      console.log(
        `⚠️  Failed regions: ${failedRegions.map((r) => r.region).join(", ")}`
      );
    }

    return {
      success: failedRegions.length === 0,
      servicesProcessed: totalServicesProcessed,
      regionResults,
    };
  } catch (error) {
    console.error("Error calculating AWS operational metrics:", error);
    return {
      success: false,
      servicesProcessed: 0,
      regionResults: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cron job entry point: Run operational metrics collection for all AWS connections
 */
export async function runAWSOperationalMetricsCollection() {
  // Get all active AWS connections
  const awsConnections = await prisma.cloudConnection.findMany({
    where: {
      provider: "AWS",
      isActive: true,
    },
  });

  console.log(`\nFound ${awsConnections.length} active AWS connections`);

  // Calculate metrics for the last 24 hours
  const dateRange: DateRange = {
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    endDate: new Date(),
  };

  for (const connection of awsConnections) {
    console.log(`\n========================================`);
    console.log(`Processing connection ${connection.id}...`);
    console.log(`========================================`);

    const result = await calculateAndStoreAWSOperationalMetrics(
      connection.id,
      dateRange,
      [], // Empty array = process all regions
      [] // S3 bucket names would need to be discovered or configured
    );

    if (result.success) {
      console.log(
        `\n✓ Connection ${connection.id}: Processed ${result.servicesProcessed} services across ${result.regionResults.length} regions`
      );
    } else {
      console.error(`\n✗ Connection ${connection.id}: ${result.error}`);
      // Show which regions failed
      const failedRegions = result.regionResults.filter((r) => !r.success);
      if (failedRegions.length > 0) {
        console.error(
          `  Failed regions: ${failedRegions.map((r) => `${r.region} (${r.error})`).join(", ")}`
        );
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Operational metrics collection completed`);
  console.log(`========================================\n`);
}
