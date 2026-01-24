import { KPISchema } from "@/app/generated/schemas/schemas";
import { z } from "zod";

export const CreateKPIFormSchema = KPISchema.omit({
  // omit metadata fields
  id: true,
  // loanId removed from schema
  organizationId: true,
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

export type CreateKPIForm = z.infer<typeof CreateKPIFormSchema>;
