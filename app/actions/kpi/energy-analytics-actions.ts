"use server";

import { getMonthlyEnergyWithProjection } from "@/lib/services/energy-analytics";
import { withServerAction } from "@/lib/server-action-utils";

export async function getEnergyTimelineAction() {
  return withServerAction(
    async (user) => {
      return await getMonthlyEnergyWithProjection(
        user.organizationId,
        12, // 12 months history
        6 // 6 months projection
      );
    },
    "fetch energy timeline"
  );
}
