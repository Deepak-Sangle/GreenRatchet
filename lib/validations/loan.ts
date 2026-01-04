import {
  KPIStatusSchema,
  LoanCurrencySchema,
  LoanTypeSchema,
  ObservationPeriodSchema,
} from "@/app/generated/schemas/schemas";
import { z } from "zod";

// Base schema (shared fields without dates)
const CreateLoanBaseSchema = z.object({
  name: z.string().min(3, "Deal name must be at least 3 characters"),
  currency: LoanCurrencySchema,
  observationPeriod: ObservationPeriodSchema,
  marginRatchetBps: z.number().int().min(-500).max(500),
  principalAmount: z
    .number()
    .min(-1, "Principal amount must be positive or -1 for N/A"),
  committedAmount: z
    .number()
    .min(-1, "Committed amount must be positive or -1 for N/A"),
  drawnAmount: z
    .number()
    .min(-1, "Drawn amount must be positive or -1 for N/A"),
  type: LoanTypeSchema,
});

// Form schema (dates as strings for HTML inputs + zodResolver)
export const CreateLoanFormSchema = CreateLoanBaseSchema.extend({
  startDate: z.string().min(1, "Start date is required"),
  maturityDate: z.string().min(1, "Maturity date is required"),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const maturity = new Date(data.maturityDate);
    return maturity > start;
  },
  {
    message: "Maturity date must be after start date",
    path: ["maturityDate"],
  }
);

// Server schema - uses z.coerce.date() to convert strings to Date objects for Prisma
export const CreateLoanSchema = CreateLoanBaseSchema.extend({
  startDate: z.coerce.date(),
  maturityDate: z.coerce.date(),
}).refine((data) => data.maturityDate > data.startDate, {
  message: "Maturity date must be after start date",
  path: ["maturityDate"],
});

// Schema for creating a new KPI - uses generated ObservationPeriod
export const CreateKPISchema = z.object({
  name: z.string().min(3, "KPI name must be at least 3 characters"),
  definition: z.string().min(10, "Definition must be at least 10 characters"),
  metricFormula: z
    .string()
    .min(5, "Metric formula must be at least 5 characters"),
  unit: z.string().min(1, "Unit is required"),
  targetValue: z.number().min(0, "Target value must be positive"),
  baselineValue: z.number().optional(),
  observationPeriod: ObservationPeriodSchema,
  marginImpactBps: z.number().int(),
});

// Schema for updating KPI status - uses generated KPIStatus but only allows ACCEPTED/REJECTED
export const UpdateKPIStatusSchema = z.object({
  status: KPIStatusSchema.exclude(["PROPOSED"]),
});

// Form input type (dates as strings for HTML inputs)
export type CreateLoanFormInput = z.infer<typeof CreateLoanFormSchema>;
// Server input type (dates as Date objects for Prisma)
export type CreateLoanInput = z.infer<typeof CreateLoanSchema>;
export type CreateKPIInput = z.infer<typeof CreateKPISchema>;
export type UpdateKPIStatusInput = z.infer<typeof UpdateKPIStatusSchema>;
