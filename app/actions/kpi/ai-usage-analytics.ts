"use server";

import { withServerAction } from "@/lib/server-action-utils";
import {
  calculateAIUsagePercentage,
  getAIUsageTimeline,
} from "@/lib/services/ai-usage-calculator";
import { getOrganizationConnectionIds } from "@/lib/services/cloud-data-service";

/**
 * Get AI usage data for the current organization
 */
export async function getAIUsageAction() {
  return withServerAction(async (user) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // Last 30 days

    // Get all cloud connections for the organization
    const connectionIds = await getOrganizationConnectionIds(
      user.organizationId,
    );

    const [currentUsage, timeline] = await Promise.all([
      calculateAIUsagePercentage(
        user.organizationId,
        startDate,
        endDate,
        connectionIds,
      ),
      getAIUsageTimeline(user.organizationId, startDate, endDate, connectionIds),
    ]);

    return {
      currentUsage,
      timeline,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }, "get AI usage data");
}
