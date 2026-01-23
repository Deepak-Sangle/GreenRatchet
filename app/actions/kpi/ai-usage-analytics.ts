"use server";

import { withServerAction } from "@/lib/server-action-utils";
import {
  calculateAIUsagePercentage,
  getAIUsageTimeline,
} from "@/lib/services/ai-usage-calculator";

/**
 * Get AI usage analytics for the current organization
 */
export async function getAIUsageAnalytics() {
  return withServerAction(async (user) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // Last 30 days

    const [currentUsage, timeline] = await Promise.all([
      calculateAIUsagePercentage(user.organizationId, startDate, endDate),
      getAIUsageTimeline(user.organizationId, startDate, endDate),
    ]);

    return {
      currentUsage,
      timeline,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }, "get AI usage analytics");
}
