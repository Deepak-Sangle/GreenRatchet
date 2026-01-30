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
export const CloudServices = CloudServiceSchema.options;

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

/**
 * Aggregation period options for cloud usage data
 */
export const AggregationPeriodSchema = z.enum(["day", "week", "month"]);
export type AggregationPeriodValue = z.infer<typeof AggregationPeriodSchema>;

export const AGGREGATION_PERIOD_OPTIONS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
] as const;

export enum COMPUTE_PROCESSOR_TYPES {
  // CPU Processors
  CASCADE_LAKE = "Cascade Lake",
  SKYLAKE = "Skylake",
  HASWELL = "Haswell",
  BROADWELL = "Broadwell",
  COFFEE_LAKE = "Coffee Lake",
  SANDY_BRIDGE = "Sandy Bridge",
  IVY_BRIDGE = "Ivy Bridge",
  ICELAKE = "Ice Lake",
  AMD_EPYC_1ST_GEN = "AMD EPYC 1st Gen",
  AMD_EPYC_2ND_GEN = "AMD EPYC 2nd Gen",
  AMD_EPYC_3RD_GEN = "AMD EPYC 3rd Gen",
  AWS_GRAVITON = "AWS Graviton",
  AWS_GRAVITON_2 = "AWS Graviton2",
  // GPU Processors
  NVIDIA_K520 = "Nvidia K520",
  NVIDIA_A10G = "Nvidia A10G",
  NVIDIA_T4 = "Nvidia T4",
  NVIDIA_TESLA_M60 = "Nvidia Tesla M60",
  NVIDIA_TESLA_K80 = "Nvidia Tesla K80",
  NVIDIA_TESLA_V100 = "Nvidia Tesla V100",
  NVIDIA_TESLA_A100 = "Nvidia Tesla A100",
  NVIDIA_TESLA_P4 = "Nvidia Tesla P4",
  NVIDIA_TESLA_P40 = "Nvidia Tesla P40",
  NVIDIA_TESLA_P100 = "Nvidia Tesla P100",
  AMD_RADEON_PRO_V520 = "AMD Radeon Pro V520",
  XILINX_ALVEO_U250 = "Xilinx Alveo U250",
  // Unknown
  UNKNOWN = "Unknown",
}

export enum EstimateUnknownUsageBy {
  COST = "cost",
  USAGE_AMOUNT = "usageAmount",
}

export type KilowattHoursByServiceAndUsageUnit = {
  [key: string]: {
    [key: string]: KilowattHourTotals;
  };
};
export type KilowattHourTotals = {
  usageAmount?: number;
  cost?: number;
  kilowattHours: number;
};

export type CloudConstantsByProvider = {
  SSDCOEFFICIENT: number;
  HDDCOEFFICIENT: number;
  MEMORY_AVG: number;
  MEMORY_BY_COMPUTE_PROCESSOR: { [key: string]: number };
  MIN_WATTS_AVG: number;
  MIN_WATTS_BY_COMPUTE_PROCESSOR: { [key: string]: number };
  MAX_WATTS_AVG: number;
  MAX_WATTS_BY_COMPUTE_PROCESSOR: { [key: string]: number };
  PUE_AVG: number;
  NETWORKING_COEFFICIENT: number;
  MEMORY_COEFFICIENT: number;
  AVG_CPU_UTILIZATION_2020: number;
  REPLICATION_FACTORS: { [key: string]: number };
  KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT: KilowattHoursByServiceAndUsageUnit;
  ESTIMATE_UNKNOWN_USAGE_BY: EstimateUnknownUsageBy;
  SERVER_EXPECTED_LIFESPAN: number;
};

export type CloudConstantsEmissionsFactors = {
  [region: string]: number;
};

export type ReplicationFactorsForService = {
  [key: string]: (usageType?: string, region?: string) => number;
};

export const AWS_CLOUD_CONSTANTS: CloudConstantsByProvider = {
  SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
  HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
  MEMORY_AVG: 80.69,
  MEMORY_BY_COMPUTE_PROCESSOR: {
    // gigaBytes / physical chip
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 98.12,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 81.32,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 69.65,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 27.71,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 19.56,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 16.7,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 9.67,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 89.6,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 129.78,
    [COMPUTE_PROCESSOR_TYPES.AWS_GRAVITON_2]: 129.78,
  },
  MIN_WATTS_AVG: 0.74,
  MIN_WATTS_BY_COMPUTE_PROCESSOR: {
    // CPUs
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 0.64,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 0.65,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 0.71,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 1,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 1.14,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 2.17,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 3.04,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 0.82,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 0.47,
    [COMPUTE_PROCESSOR_TYPES.AWS_GRAVITON_2]: 0.47,
    // GPUs
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_K520]: 26,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_A10G]: 18,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_T4]: 8,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_M60]: 35,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80]: 35,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100]: 35,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100]: 46,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P4]: 9,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100]: 36,
    [COMPUTE_PROCESSOR_TYPES.AMD_RADEON_PRO_V520]: 26,
  },
  MAX_WATTS_AVG: 3.5,
  MAX_WATTS_BY_COMPUTE_PROCESSOR: {
    // CPUs
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 3.97,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 4.26,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 3.69,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 4.74,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 5.42,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 8.58,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 8.25,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 2.55,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 1.69,
    [COMPUTE_PROCESSOR_TYPES.AWS_GRAVITON_2]: 1.69,
    // GPUs
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_K520]: 229,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_A10G]: 153,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_T4]: 71,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_M60]: 306,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80]: 306,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100]: 306,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100]: 407,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P4]: 76.5,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100]: 306,
    [COMPUTE_PROCESSOR_TYPES.AMD_RADEON_PRO_V520]: 229,
  },
  NETWORKING_COEFFICIENT: 0.001, // kWh / Gb
  MEMORY_COEFFICIENT: 0.000392, // kWh / Gb
  PUE_AVG: 1.135,
  AVG_CPU_UTILIZATION_2020: 50,
  REPLICATION_FACTORS: {
    S3: 6,
    S3_ONE_ZONE_REDUCED_REDUNDANCY: 2,
    EC2_EBS_VOLUME: 2,
    EC2_EBS_SNAPSHOT: 3,
    EFS: 3,
    EFS_ONE_ZONE: 2,
    RDS_BACKUP: 3,
    RDS_AURORA: 6,
    RDS_MULTI_AZ: 2,
    DOCUMENT_DB_BACKUP: 3,
    DOCUMENT_DB_STORAGE: 2,
    DYNAMO_DB: 2,
    ECR_STORAGE: 3,
    DOCUMENT_ELASTICACHE_BACKUP: 3,
    SIMPLE_DB: 2,
    DEFAULT: 1,
  },
  KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT: {
    total: {},
  },
  ESTIMATE_UNKNOWN_USAGE_BY: EstimateUnknownUsageBy.COST,
  SERVER_EXPECTED_LIFESPAN: 35040, // 4 years in hours
};

export enum AWS_REGIONS {
  US_EAST_1 = "us-east-1",
  US_EAST_2 = "us-east-2",
  US_WEST_1 = "us-west-1",
  US_WEST_2 = "us-west-2",
  AF_SOUTH_1 = "af-south-1",
  AP_EAST_1 = "ap-east-1",
  AP_SOUTH_1 = "ap-south-1",
  AP_NORTHEAST_3 = "ap-northeast-3",
  AP_NORTHEAST_2 = "ap-northeast-2",
  AP_SOUTHEAST_1 = "ap-southeast-1",
  AP_SOUTHEAST_2 = "ap-southeast-2",
  AP_NORTHEAST_1 = "ap-northeast-1",
  AP_SOUTHEAST_3 = "ap-southeast-3",
  CA_CENTRAL_1 = "ca-central-1",
  CN_NORTH_1 = "cn-north-1",
  CN_NORTHWEST_1 = "cn-northwest-1",
  EU_CENTRAL_1 = "eu-central-1",
  EU_WEST_1 = "eu-west-1",
  EU_WEST_2 = "eu-west-2",
  EU_SOUTH_1 = "eu-south-1",
  EU_WEST_3 = "eu-west-3",
  EU_NORTH_1 = "eu-north-1",
  ME_SOUTH_1 = "me-south-1",
  ME_CENTRAL_1 = "me-central-1",
  SA_EAST_1 = "sa-east-1",
  US_GOV_EAST_1 = "us-gov-east-1",
  US_GOV_WEST_1 = "us-gov-west-1",
  UNKNOWN = "Unknown",
}

export const US_NERC_REGIONS_EMISSIONS_FACTORS: {
  [nercRegion: string]: number;
} = {
  RFC: 0.000410608,
  SERC: 0.000379069,
  WECC: 0.000322167,
  MRO: 0.000426254,
  TRE: 0.000373231,
};

/**
 * Regional PUE (Power Usage Effectiveness) values for AWS regions
 * Source: AWS Sustainability Report 2024
 * This only changes per year (i mean we can't get better granularity than this)
 */
export const AWS_PUE_BY_REGION: CloudConstantsEmissionsFactors = {
  [AWS_REGIONS.EU_NORTH_1]: 1.1,
  [AWS_REGIONS.EU_WEST_1]: 1.11,
  [AWS_REGIONS.US_WEST_2]: 1.12,
  [AWS_REGIONS.US_EAST_2]: 1.13,
  [AWS_REGIONS.US_EAST_1]: 1.15,
  [AWS_REGIONS.SA_EAST_1]: 1.17,
  [AWS_REGIONS.US_WEST_1]: 1.18,
  [AWS_REGIONS.CA_CENTRAL_1]: 1.19,
  [AWS_REGIONS.AF_SOUTH_1]: 1.24,
  [AWS_REGIONS.CN_NORTH_1]: 1.25,
  [AWS_REGIONS.CN_NORTHWEST_1]: 1.25,
  [AWS_REGIONS.AP_NORTHEAST_1]: 1.27,
  [AWS_REGIONS.ME_CENTRAL_1]: 1.27,
  [AWS_REGIONS.AP_SOUTHEAST_1]: 1.32,
  [AWS_REGIONS.ME_SOUTH_1]: 1.33,
  [AWS_REGIONS.EU_CENTRAL_1]: 1.35,
  [AWS_REGIONS.AP_SOUTHEAST_3]: 1.4,
  [AWS_REGIONS.AP_SOUTH_1]: 1.42,
  // Fallback to global average for regions without specific data
  [AWS_REGIONS.US_GOV_EAST_1]: 1.15,
  [AWS_REGIONS.US_GOV_WEST_1]: 1.15,
  [AWS_REGIONS.AP_EAST_1]: 1.27,
  [AWS_REGIONS.AP_NORTHEAST_3]: 1.27,
  [AWS_REGIONS.AP_NORTHEAST_2]: 1.27,
  [AWS_REGIONS.AP_SOUTHEAST_2]: 1.27,
  [AWS_REGIONS.EU_WEST_2]: 1.11,
  [AWS_REGIONS.EU_SOUTH_1]: 1.11,
  [AWS_REGIONS.EU_WEST_3]: 1.11,
  [AWS_REGIONS.UNKNOWN]: 1.15,
};

export const AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: CloudConstantsEmissionsFactors =
  {
    [AWS_REGIONS.US_EAST_1]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AWS_REGIONS.US_EAST_2]: US_NERC_REGIONS_EMISSIONS_FACTORS.RFC,
    [AWS_REGIONS.US_WEST_1]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AWS_REGIONS.US_WEST_2]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AWS_REGIONS.US_GOV_EAST_1]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AWS_REGIONS.US_GOV_WEST_1]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AWS_REGIONS.AF_SOUTH_1]: 0.0009006,
    [AWS_REGIONS.AP_EAST_1]: 0.00071,
    [AWS_REGIONS.AP_SOUTH_1]: 0.0007082,
    [AWS_REGIONS.AP_NORTHEAST_3]: 0.0004658,
    [AWS_REGIONS.AP_NORTHEAST_2]: 0.0004156,
    [AWS_REGIONS.AP_SOUTHEAST_1]: 0.000408,
    [AWS_REGIONS.AP_SOUTHEAST_2]: 0.00076,
    [AWS_REGIONS.AP_SOUTHEAST_3]: 0.0007177,
    [AWS_REGIONS.AP_NORTHEAST_1]: 0.0004658,
    [AWS_REGIONS.CA_CENTRAL_1]: 0.00012,
    [AWS_REGIONS.CN_NORTH_1]: 0.0005374,
    [AWS_REGIONS.CN_NORTHWEST_1]: 0.0005374,
    [AWS_REGIONS.EU_CENTRAL_1]: 0.000311,
    [AWS_REGIONS.EU_WEST_1]: 0.0002786,
    [AWS_REGIONS.EU_WEST_2]: 0.000225,
    [AWS_REGIONS.EU_SOUTH_1]: 0.0002134,
    [AWS_REGIONS.EU_WEST_3]: 0.0000511,
    [AWS_REGIONS.EU_NORTH_1]: 0.0000088,
    [AWS_REGIONS.ME_SOUTH_1]: 0.0005059,
    [AWS_REGIONS.ME_CENTRAL_1]: 0.0004041,
    [AWS_REGIONS.SA_EAST_1]: 0.0000617,
    [AWS_REGIONS.UNKNOWN]: 0.00039278188, // Average of the above regions
  };

/**
 * Water stress risk indicators for AWS regions
 * Scale: 5 (Extremely High Risk) to 0 (Low Risk)
 * Based on WRI Aqueduct Water Risk Atlas baseline water stress indicators
 */
export const AWS_WATER_STRESS_BY_REGION: Record<AWS_REGIONS, number> = {
  [AWS_REGIONS.US_EAST_1]: 2, // Virginia - Low-Medium stress
  [AWS_REGIONS.US_EAST_2]: 1, // Ohio - Low stress
  [AWS_REGIONS.US_WEST_1]: 4, // California - High stress
  [AWS_REGIONS.US_WEST_2]: 2, // Oregon - Low-Medium stress
  [AWS_REGIONS.US_GOV_EAST_1]: 2, // Virginia - Low-Medium stress
  [AWS_REGIONS.US_GOV_WEST_1]: 4, // California - High stress
  [AWS_REGIONS.AF_SOUTH_1]: 5, // Cape Town - Extremely High stress
  [AWS_REGIONS.AP_EAST_1]: 3, // Hong Kong - Medium-High stress
  [AWS_REGIONS.AP_SOUTH_1]: 5, // Mumbai - Extremely High stress
  [AWS_REGIONS.AP_NORTHEAST_3]: 3, // Osaka - Medium-High stress
  [AWS_REGIONS.AP_NORTHEAST_2]: 3, // Seoul - Medium-High stress
  [AWS_REGIONS.AP_SOUTHEAST_1]: 4, // Singapore - High stress
  [AWS_REGIONS.AP_SOUTHEAST_2]: 2, // Sydney - Low-Medium stress
  [AWS_REGIONS.AP_SOUTHEAST_3]: 3, // Jakarta - Medium-High stress
  [AWS_REGIONS.AP_NORTHEAST_1]: 3, // Tokyo - Medium-High stress
  [AWS_REGIONS.CA_CENTRAL_1]: 1, // Montreal - Low stress
  [AWS_REGIONS.CN_NORTH_1]: 5, // Beijing - Extremely High stress
  [AWS_REGIONS.CN_NORTHWEST_1]: 5, // Ningxia - Extremely High stress
  [AWS_REGIONS.EU_CENTRAL_1]: 2, // Frankfurt - Low-Medium stress
  [AWS_REGIONS.EU_WEST_1]: 1, // Ireland - Low stress
  [AWS_REGIONS.EU_WEST_2]: 1, // London - Low stress
  [AWS_REGIONS.EU_SOUTH_1]: 4, // Milan - High stress
  [AWS_REGIONS.EU_WEST_3]: 2, // Paris - Low-Medium stress
  [AWS_REGIONS.EU_NORTH_1]: 0, // Stockholm - Low stress
  [AWS_REGIONS.ME_SOUTH_1]: 5, // Bahrain - Extremely High stress
  [AWS_REGIONS.ME_CENTRAL_1]: 5, // UAE - Extremely High stress
  [AWS_REGIONS.SA_EAST_1]: 2, // São Paulo - Low-Medium stress
  [AWS_REGIONS.UNKNOWN]: 3, // Average risk
};

/**
 * AWS GPU instance types used for AI/ML workloads
 */
const AI_INSTANCE_TYPES = [
  "p3",
  "p4",
  "p5",
  "g4",
  "g5",
  "inf1",
  "inf2",
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
 * Water Usage Effectiveness (WUE) Data
 * Source: AWS Sustainability - https://sustainability.aboutamazon.com/products-services/aws-cloud#increasing-efficiency
 * Latest 2024 data for AWS regions
 * Formula: Water (liters) = IT energy (kWh) × WUE (L/kWh)
 */
export interface WUEData {
  region: string;
  regionId: string;
  year: number;
  wue: number | null;
}

/**
 * WUE data for 2024 (latest available)
 * Only includes regions with WUE data available
 */
export const WUE_2024_DATA: WUEData[] = [
  // Global/Regional Averages
  { region: "GLOBAL", regionId: "GLOBAL", year: 2024, wue: 0.15 },
  { region: "AMER", regionId: "AMER", year: 2024, wue: 0.14 },
  { region: "EMEA", regionId: "EMEA", year: 2024, wue: 0.12 },
  { region: "APAC", regionId: "APAC", year: 2024, wue: 0.27 },
  { region: "Europe", regionId: "Europe", year: 2024, wue: 0.04 },
  { region: "North America", regionId: "North America", year: 2024, wue: 0.13 },
  {
    region: "Central/South America",
    regionId: "Central/South America",
    year: 2024,
    wue: 0.23,
  },
  {
    region: "Asia Pacific (excl. China)",
    regionId: "Asia Pacific (excl. China)",
    year: 2024,
    wue: 0.98,
  },

  // AWS Specific Regions
  {
    region: "Europe (Stockholm)",
    regionId: "eu-north-1",
    year: 2024,
    wue: 0.02,
  },
  { region: "U.S. East (Ohio)", regionId: "us-east-2", year: 2024, wue: 0.1 },
  { region: "Europe (Ireland)", regionId: "eu-west-1", year: 2024, wue: 0.03 },
  {
    region: "Europe (Frankfurt)",
    regionId: "eu-central-1",
    year: 2024,
    wue: 0.01,
  },
  {
    region: "South America (Sao Paulo)",
    regionId: "sa-east-1",
    year: 2024,
    wue: 0.23,
  },
  {
    region: "U.S. East (Northern Virginia)",
    regionId: "us-east-1",
    year: 2024,
    wue: 0.12,
  },
  {
    region: "Asia-Pacific (Melbourne)",
    regionId: "ap-southeast-4",
    year: 2024,
    wue: 0.02,
  },
  {
    region: "Asia-Pacific (Tokyo)",
    regionId: "ap-northeast-1",
    year: 2024,
    wue: 0.91,
  },
  {
    region: "U.S. West (Oregon)",
    regionId: "us-west-2",
    year: 2024,
    wue: 0.16,
  },
  {
    region: "U.S. West (Northern California)",
    regionId: "us-west-1",
    year: 2024,
    wue: 0.51,
  },
  {
    region: "Asia-Pacific (Singapore)",
    regionId: "ap-southeast-1",
    year: 2024,
    wue: 1.68,
  },
  {
    region: "Asia-Pacific (Sydney)",
    regionId: "ap-southeast-2",
    year: 2024,
    wue: 0.12,
  },
  {
    region: "Canada (Central)",
    regionId: "ca-central-1",
    year: 2024,
    wue: 0.04,
  },
  { region: "Europe (Spain)", regionId: "eu-south-2", year: 2024, wue: 0.24 },
  { region: "Canada (West)", regionId: "ca-west-1", year: 2024, wue: 0.08 },
  {
    region: "Asia-Pacific (Jakarta)",
    regionId: "ap-southeast-3",
    year: 2024,
    wue: 2.75,
  },
];

/**
 * Default WUE value to use when region-specific data is not available
 */
export const DEFAULT_WUE = 0.15; // Global average for 2024

/**
 * Get WUE value for a specific region
 */
export function getWUEForRegion(region: string): number {
  const wueData = WUE_2024_DATA.find(
    (data) =>
      data.regionId.toLowerCase() === region.toLowerCase() ||
      data.region.toLowerCase() === region.toLowerCase(),
  );
  return wueData?.wue ?? DEFAULT_WUE;
}
