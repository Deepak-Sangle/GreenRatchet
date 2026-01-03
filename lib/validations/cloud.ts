import { z } from "zod";

export const connectAWSSchema = z.object({
  roleArn: z.string().regex(/^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/, "Invalid AWS Role ARN"),
  externalId: z.string().optional(),
});

export const connectGCPSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  serviceAccountKey: z.string().min(1, "Service account key is required"),
});

export type ConnectAWSInput = z.infer<typeof connectAWSSchema>;
export type ConnectGCPInput = z.infer<typeof connectGCPSchema>;
