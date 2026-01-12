"use server";

import { getMonthlyWaterWithProjection } from "@/lib/services/water-analytics";
import { withServerAction } from "@/lib/server-action-utils";

export async function getWaterTimelineAction() {
  return withServerAction(
    async (user) => {
      return await getMonthlyWaterWithProjection(
        user.organizationId,
        12, // 12 months history
        6 // 6 months projection
      );
    },
    "fetch water timeline"
  );
}
