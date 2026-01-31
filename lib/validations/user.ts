import { z } from "zod";

/**
 * Schema for updating user profile
 */
export const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export type UpdateUserForm = z.infer<typeof UpdateUserSchema>;

/**
 * Schema for updating organization details
 */
export const UpdateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Name is too long"),
  headquarters: z.string().max(200, "Headquarters is too long").optional(),
  linkedinUrl: z.url("Invalid LinkedIn URL").optional().or(z.literal("")),
  employeeCount: z
    .number()
    .int("Employee count must be a whole number")
    .positive("Employee count must be positive")
    .optional()
    .nullable(),
  annualRevenue: z.number().min(0).optional().nullable(),
});

export type UpdateOrganizationForm = z.infer<typeof UpdateOrganizationSchema>;
