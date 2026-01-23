"use server";

import { getMonthlyEmissionsWithProjection } from "@/lib/services/co2e-analytics";
import { withServerAction } from "@/lib/server-action-utils";

export async function getCo2eTimelineAction() {
  return withServerAction(
    async (user) => {
      return await getMonthlyEmissionsWithProjection(
        user.organizationId,
        12, // 12 months history
        6 // 6 months projection
      );
    },
    "fetch CO2e timeline"
  );
}
