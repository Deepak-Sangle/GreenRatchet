"use server";

import { getLinkedInEmployeeCount } from "@/lib/services/linkedin-scraper";
import { z } from "zod";

const LinkedInUrlSchema = z.object({
  linkedinUrl: z.string().url("Invalid LinkedIn URL"),
});

interface FetchEmployeeCountResult {
  success: boolean;
  employeeCount?: number;
  error?: string;
}

/**
 * Server action to fetch employee count from LinkedIn company page
 * @param linkedinUrl - Full LinkedIn company URL
 * @returns Employee count or error
 */
export async function fetchLinkedInEmployeeCountAction(
  linkedinUrl: string
): Promise<FetchEmployeeCountResult> {
  try {
    const validated = LinkedInUrlSchema.parse({ linkedinUrl });

    const result = await getLinkedInEmployeeCount(validated.linkedinUrl);

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.at(0)?.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
