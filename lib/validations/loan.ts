import {
  KPISchema,
  KpiStatusSchema,
  LoanSchema,
  MarginRatchetSchema,
} from "@/app/generated/schemas/schemas";
import { z } from "zod";

// Fields that the user provides when creating a loan (omit auto-generated fields)
// Use .required() to ensure fields with .default() become required in form
const LoanCreateFields = LoanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  // all these ids are added by the server
  createdByUserId: true,
  borrowerOrgId: true,
  lenderOrgId: true,
  // startDate and maturityDate are required but we set that below
  startDate: true,
  maturityDate: true,
}).required({
  name: true,
  currency: true,
  principalAmount: true,
  committedAmount: true,
  drawnAmount: true,
  type: true,
});

// Form schema: dates as strings for HTML inputs
export const CreateLoanFormSchema = LoanCreateFields.extend({
  startDate: z.string().min(1, "Start date is required"),
  maturityDate: z.string().min(1, "Maturity date is required"),
}).refine((data) => new Date(data.maturityDate) > new Date(data.startDate), {
  message: "Maturity date must be after start date",
  path: ["maturityDate"],
});

// Server schema: coerce strings to dates for Prisma
export const CreateLoanSchema = LoanCreateFields.extend({
  startDate: z.coerce.date(),
  maturityDate: z.coerce.date(),
}).refine((data) => data.maturityDate > data.startDate, {
  message: "Maturity date must be after start date",
  path: ["maturityDate"],
});

export const CreateKPIFormSchema = KPISchema.omit({
  // omit metadata fields
  id: true,
  loanId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  // for additional validation, omit fields here
  name: true,
  // target value must be greater than 0
  targetValue: true,
})
  .extend({
    effectiveFrom: z.string().min(1, "Effective from date is required"),
    effectiveTo: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    targetValue: z.number().min(1, "Target value must be greater than 0"),
  })
  .required({
    name: true,
    type: true,
    valueType: true,
    direction: true,
    targetValue: true,
    frequency: true,
  })
  // add custom refinements here so that the zod form would show errors
  // this is better than showing only the valid values in the form (bcz its cumbersome)
  .refine(
    (data) => {
      if (data.type === "CO2_EMISSION") {
        // CO2 emission KPI must be absolute or ratio - percentage is not allowed
        return data.valueType === "ABSOLUTE" || data.valueType === "RATIO";
      }
      return true;
    },
    {
      message:
        "CO2 emission KPI must be absolute or ratio - percentage is not allowed",
      path: ["valueType"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "AI_COMPUTE_HOURS") {
        // AI compute hours KPI must be absolute - percentage and ratio are not allowed
        return data.valueType === "ABSOLUTE";
      }
      return true;
    },
    {
      message:
        "AI compute hours KPI must be absolute - percentage and ratio are not allowed",
      path: ["valueType"],
    }
  );

// Fields user provides when creating a margin ratchet
const MarginRatchetCreateFields = MarginRatchetSchema.omit({
  id: true,
  loanId: true,
  createdAt: true,
  updatedAt: true,
});

// Form schema: dates as strings for HTML inputs
export const CreateMarginRatchetFormSchema = MarginRatchetCreateFields.extend({
  observationStart: z.string().min(1, "Observation start date is required"),
  observationEnd: z.string().optional(),
});

export const UpdateKPIStatusSchema = z.object({
  status: KpiStatusSchema,
});

export type CreateLoanForm = z.infer<typeof CreateLoanFormSchema>;
export type CreateLoan = z.infer<typeof CreateLoanSchema>;
export type CreateKPIForm = z.infer<typeof CreateKPIFormSchema>;
export type UpdateKPIStatus = z.infer<typeof UpdateKPIStatusSchema>;
export type CreateMarginRatchetForm = z.infer<
  typeof CreateMarginRatchetFormSchema
>;
