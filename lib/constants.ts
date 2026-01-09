/**
 * Application-wide constants
 */

import z from "zod";

/**
 * GreenRatchet's AWS account ID - used for cross-account IAM role trust policies
 */
export const GREENRATCHET_AWS_ACCOUNT_ID = "869442501222";

/**
 * S3 bucket for storing CloudFormation templates and IAM policies
 */
export const CFN_TEMPLATE_S3_BUCKET = "bridgly-usage-policies";

/**
 * S3 region for the CloudFormation template bucket
 */
export const CFN_TEMPLATE_S3_REGION = "us-east-1";

/**
 * S3 key for the AWS IAM policy CloudFormation template
 */
export const CFN_TEMPLATE_S3_KEY = "aws-iam-policy.yaml";

/**
 * Full S3 URL for the CloudFormation template
 */
export const CFN_TEMPLATE_URL = `https://${CFN_TEMPLATE_S3_BUCKET}.s3.${CFN_TEMPLATE_S3_REGION}.amazonaws.com/${CFN_TEMPLATE_S3_KEY}`;

/**
 * Supported cloud providers
 */
export const CLOUD_PROVIDERS = {
  AWS: "AWS",
  // GCP: "GCP",
  // AZURE: "AZURE",
} as const;

/**
 * Maximum file upload size in bytes (2MB)
 */
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Allowed image MIME types for uploads
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Supported cloud services for usage tracking
 */
export const CloudServiceSchema = z.enum([
  "EC2",
  "EBS",
  "ElastiCache",
  "RDS",
  "S3",
  "Lambda",
]);
export type CloudService = z.infer<typeof CloudServiceSchema>;
export const CLOUD_SERVICES = CloudServiceSchema.options;

/**
 * Human-readable labels for cloud services
 */
export const CLOUD_SERVICE_LABELS: Record<CloudService, string> = {
  EC2: "EC2",
  EBS: "EBS",
  ElastiCache: "ElastiCache",
  RDS: "RDS",
  S3: "S3",
  Lambda: "Lambda",
};

export const TimeRangeSchema = z.enum(["7d", "30d", "90d", "1y", "custom"]);
export type TimeRangeValue = z.infer<typeof TimeRangeSchema>;
export const TIME_RANGE_OPTIONS = TimeRangeSchema.options.map((option) => ({
  value: option,
  label: option,
}));

export const CloudMetricSchema = z.enum(["co2e", "kilowattHours", "cost"]);
export type CloudMetricValue = z.infer<typeof CloudMetricSchema>;

/**
 * Metric options for cloud usage charts
 */
export const CLOUD_METRIC_OPTIONS = [
  { value: "co2e", label: "CO₂e (kg)", color: "hsl(var(--chart-1))" },
  {
    value: "kilowattHours",
    label: "Energy (kWh)",
    color: "hsl(var(--chart-2))",
  },
  { value: "cost", label: "Cost ($)", color: "hsl(var(--chart-3))" },
] as const;
