/**
 * Shared AWS Utilities
 *
 * Common functions for AWS SDK operations used across metrics calculators
 */

import {
  CloudWatchClient,
  GetMetricDataCommand,
  type MetricDataQuery,
  type MetricDataResult,
} from "@aws-sdk/client-cloudwatch";
import { CostExplorerClient } from "@aws-sdk/client-cost-explorer";
import { EC2Client } from "@aws-sdk/client-ec2";
import { RDSClient } from "@aws-sdk/client-rds";
import {
  GetBucketLocationCommand,
  ListBucketsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";

/**
 * AWS Credentials obtained from AssumeRole
 */
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

/**
 * Base metric data structure
 */
export interface MetricData {
  timestamp: Date;
  value: number;
}

/**
 * Date range for metric queries
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export const CREDENTIALS = {
  accessKeyId: process.env.IAM_ACCESS_KEY_ID!,
  secretAccessKey: process.env.IAM_SECRET_ACCESS_KEY!,
};

/**
 * Assumes AWS IAM role and returns temporary credentials
 */
export async function assumeAWSRole(
  roleArn: string,
  externalId: string,
  region: string = "us-east-1"
): Promise<AWSCredentials> {
  const stsClient = new STSClient({
    region,
    credentials: CREDENTIALS,
  });

  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: "GreenRatchet-Metrics-Collection",
    ExternalId: externalId,
    DurationSeconds: 3600, // 1 hour
  });

  try {
    const response = await stsClient.send(command);

    if (!response.Credentials) {
      throw new Error("Failed to assume role: No credentials returned");
    }

    return {
      accessKeyId: response.Credentials.AccessKeyId!,
      secretAccessKey: response.Credentials.SecretAccessKey!,
      sessionToken: response.Credentials.SessionToken!,
    };
  } catch (error) {
    console.error("Error assuming AWS role:", error);
    throw new Error(
      `Failed to assume role: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Creates AWS clients with assumed role credentials
 */
export function createAWSClients(credentials: AWSCredentials, region: string) {
  const config = {
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  };

  return {
    cloudWatch: new CloudWatchClient(config),
    ec2: new EC2Client(config),
    rds: new RDSClient(config),
    s3: new S3Client(config),
    costExplorer: new CostExplorerClient(config),
  };
}

/**
 * Fetches metric data from CloudWatch
 */
export async function fetchCloudWatchMetrics(
  cloudWatchClient: CloudWatchClient,
  queries: MetricDataQuery[],
  dateRange: DateRange
): Promise<MetricDataResult[]> {
  const command = new GetMetricDataCommand({
    MetricDataQueries: queries,
    StartTime: dateRange.startDate,
    EndTime: dateRange.endDate,
  });

  try {
    const response = await cloudWatchClient.send(command);
    return response.MetricDataResults || [];
  } catch (error) {
    console.error("Error fetching CloudWatch metrics:", error);
    throw new Error(
      `Failed to fetch metrics: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Converts MetricDataResult to MetricData array
 */
export function parseMetricDataResult(result: MetricDataResult): MetricData[] {
  if (!result.Timestamps || !result.Values) {
    return [];
  }

  return result.Timestamps.map((timestamp, index) => ({
    timestamp: new Date(timestamp),
    value: (result.Values ?? []).at(index) ?? null,
  })).filter(({ value }) => value != null) as MetricData[];
}

/**
 * Helper function to calculate total network traffic
 * Combines multiple metric arrays (e.g., in + out, upload + download)
 * @param metricArrays - Arrays of MetricData to sum together
 * @returns Total network value or undefined if zero
 */
export function calculateNetwork(
  ...metricArrays: MetricData[][]
): number | undefined {
  const total = metricArrays.reduce((sum, metrics) => {
    const metricSum =
      metrics.length > 0 ? metrics.reduce((a, b) => a + b.value, 0) : 0;
    return sum + metricSum;
  }, 0);

  return total > 0 ? total : undefined;
}

/**
 * Formats date to YYYY-MM-DD format for AWS APIs
 */
export function formatDateForAWS(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Discovers S3 buckets in a specific region
 * Note: S3 ListBuckets is a global API, so we filter by region
 */
export async function discoverS3BucketsInRegion(
  s3Client: S3Client,
  region: string
): Promise<string[]> {
  try {
    // List all buckets (global API)
    const listCommand = new ListBucketsCommand({});
    const response = await s3Client.send(listCommand);

    if (!response.Buckets || response.Buckets.length === 0) {
      return [];
    }

    const bucketsInRegion: string[] = [];

    // Check each bucket's region
    for (const bucket of response.Buckets) {
      if (!bucket.Name) continue;

      try {
        const locationCommand = new GetBucketLocationCommand({
          Bucket: bucket.Name,
        });
        const locationResponse = await s3Client.send(locationCommand);

        // LocationConstraint is null for us-east-1
        const bucketRegion = locationResponse.LocationConstraint || "us-east-1";

        if (bucketRegion === region) {
          bucketsInRegion.push(bucket.Name);
        }
      } catch (error) {
        // Skip buckets we can't access
        console.warn(
          `Could not get location for bucket ${bucket.Name}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return bucketsInRegion;
  } catch (error) {
    console.error("Error discovering S3 buckets:", error);
    return [];
  }
}

/**
 * List of all AWS regions to collect metrics from
 * Updated as of January 2025
 */
export const AWS_REGIONS = [
  "us-east-1", // US East (N. Virginia)
  "us-east-2", // US East (Ohio)
  "us-west-1", // US West (N. California)
  "us-west-2", // US West (Oregon)
  "af-south-1", // Africa (Cape Town)
  "ap-east-1", // Asia Pacific (Hong Kong)
  "ap-south-1", // Asia Pacific (Mumbai)
  "ap-south-2", // Asia Pacific (Hyderabad)
  "ap-northeast-1", // Asia Pacific (Tokyo)
  "ap-northeast-2", // Asia Pacific (Seoul)
  "ap-northeast-3", // Asia Pacific (Osaka)
  "ap-southeast-1", // Asia Pacific (Singapore)
  "ap-southeast-2", // Asia Pacific (Sydney)
  "ap-southeast-3", // Asia Pacific (Jakarta)
  "ap-southeast-4", // Asia Pacific (Melbourne)
  "ca-central-1", // Canada (Central)
  "eu-central-1", // Europe (Frankfurt)
  "eu-central-2", // Europe (Zurich)
  "eu-west-1", // Europe (Ireland)
  "eu-west-2", // Europe (London)
  "eu-west-3", // Europe (Paris)
  "eu-south-1", // Europe (Milan)
  "eu-south-2", // Europe (Spain)
  "eu-north-1", // Europe (Stockholm)
  "il-central-1", // Israel (Tel Aviv)
  "me-south-1", // Middle East (Bahrain)
  "me-central-1", // Middle East (UAE)
  "sa-east-1", // South America (São Paulo)
] as const;

export type AWSRegion = (typeof AWS_REGIONS)[number];

/**
 * S3 Storage Classes supported by the OxygenIT platform
 */
export const S3_STORAGE_CLASSES = [
  "STANDARD",
  "INTELLIGENT_TIERING",
  "EXPRESS_ONEZONE",
  "STANDARD_IA",
  "ONEZONE_IA",
  "GLACIER_IR",
  "GLACIER",
  "DEEP_ARCHIVE",
  "REDUCED_REDUNDANCY",
] as const;

export type S3StorageClass = (typeof S3_STORAGE_CLASSES)[number];

/**
 * Converts AWS SDK S3 storage class string to platform storage class enum
 * @param awsStorageClass - Storage class string from AWS SDK
 * @returns Platform storage class, defaults to "STANDARD" for unknown values
 */
export function normalizeS3StorageClass(
  awsStorageClass: string | undefined
): S3StorageClass {
  if (!awsStorageClass) {
    return "STANDARD";
  }

  const normalized = awsStorageClass.toUpperCase().trim();

  // Check if the normalized value is a valid storage class
  if (S3_STORAGE_CLASSES.includes(normalized as S3StorageClass)) {
    return normalized as S3StorageClass;
  }

  // Fallback to STANDARD for unknown values
  return "STANDARD";
}
