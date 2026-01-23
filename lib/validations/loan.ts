import {
  KPISchema,
  KpiStatusSchema,
  LoanSchema,
  MarginRatchetSchema,
} from "@/app/generated/schemas/schemas";
import { z } from "zod";

// Fields that the user provides when creating a loan (omit auto-generated fields)
// Use .required() to ensure fields with .default() become required in form
export const CreateLoanFormSchema = LoanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  // all these ids are added by the server
  createdByUserId: true,
  borrowerOrgId: true,
  lenderOrgId: true,
})
  .required({
    name: true,
    currency: true,
    principalAmount: true,
    committedAmount: true,
    drawnAmount: true,
    type: true,
  })
  .refine((data) => data.maturityDate > data.startDate, {
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
    direction: true,
    targetValue: true,
    frequency: true,
  });

// Fields user provides when creating a margin ratchet
export const CreateMarginRatchetFormSchema = MarginRatchetSchema.omit({
  id: true,
  loanId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateKPIStatusSchema = z.object({
  status: KpiStatusSchema,
});

export type CreateLoanForm = z.infer<typeof CreateLoanFormSchema>;
export type CreateKPIForm = z.infer<typeof CreateKPIFormSchema>;
export type UpdateKPIStatus = z.infer<typeof UpdateKPIStatusSchema>;
export type CreateMarginRatchetForm = z.infer<
  typeof CreateMarginRatchetFormSchema
>;
