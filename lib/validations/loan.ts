import { z } from "zod";

export const CreateLoanSchema = z.object({
  name: z.string().min(3, "Deal name must be at least 3 characters"),
  currency: z.enum(["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "INR"]),
  observationPeriod: z.enum(["Annual", "Quarterly", "Monthly"]),
  marginRatchetBps: z.number().int().min(-500).max(500),
});

export const CreateKPISchema = z.object({
  name: z.string().min(3, "KPI name must be at least 3 characters"),
  definition: z.string().min(10, "Definition must be at least 10 characters"),
  metricFormula: z
    .string()
    .min(5, "Metric formula must be at least 5 characters"),
  unit: z.string().min(1, "Unit is required"),
  targetValue: z.number().min(0, "Target value must be positive"),
  baselineValue: z.number().optional(),
  observationPeriod: z.string().min(1, "Observation period is required"),
  marginImpactBps: z.number().int(),
});

export const UpdateKPIStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export type CreateLoanInput = z.infer<typeof CreateLoanSchema>;
export type CreateKPIInput = z.infer<typeof CreateKPISchema>;
export type UpdateKPIStatusInput = z.infer<typeof UpdateKPIStatusSchema>;
