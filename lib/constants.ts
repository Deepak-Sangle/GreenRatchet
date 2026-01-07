/**
 * Application-wide constants
 */

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
