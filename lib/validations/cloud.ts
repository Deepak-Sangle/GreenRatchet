import {
  AggregationPeriodSchema,
  CloudMetricSchema,
  CloudServiceSchema,
  TimeRangeSchema,
} from "@/lib/constants";
import { z } from "zod";

export const ConnectAWSSchema = z.object({
  roleArn: z
    .string()
    .regex(/^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/, "Invalid AWS Role ARN"),
  externalId: z.string().optional(),
});

export const ConnectGCPSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  serviceAccountKey: z.string().min(1, "Service account key is required"),
});

export const CloudUsageFilterSchema = z.object({
  services: z.array(CloudServiceSchema).default(CloudServiceSchema.options),
  regions: z.array(z.string()).default([]),
  timeRange: TimeRangeSchema.default(TimeRangeSchema.options[0]),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  metric: CloudMetricSchema.default(CloudMetricSchema.options[0]),
  aggregation: AggregationPeriodSchema.default("day"),
});

export type ConnectAWSInput = z.infer<typeof ConnectAWSSchema>;
export type ConnectGCPInput = z.infer<typeof ConnectGCPSchema>;
export type CloudUsageFilterInput = z.infer<typeof CloudUsageFilterSchema>;
