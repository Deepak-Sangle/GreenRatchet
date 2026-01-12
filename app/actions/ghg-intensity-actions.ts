"use server";

import { prisma } from "@/lib/prisma";
import { getActiveCloudConnections, withServerAction } from "@/lib/server-action-utils";

interface GhgIntensityData {
  totalCo2eMT: number;
  employeeCount: number | null;
  annualRevenue: number | null;
  intensityPerEmployee: number | null;
  intensityPerRevenue: number | null;
}

/**
 * Calculates GHG intensity (CO2e per employee) for the organization
 * @returns Total CO2e, employee count, and intensity metric
 */
export async function getGhgIntensityAction(): Promise<
  { success: true; data: GhgIntensityData } | { error: string }
> {
  return withServerAction(
    async (user) => {
      const connectionsResult = await getActiveCloudConnections(user.organizationId);
      if ("error" in connectionsResult) {
        throw new Error(connectionsResult.error);
      }

      const totalCo2eResult = await prisma.cloudFootprint.aggregate({
        where: {
          cloudConnectionId: { in: connectionsResult.connectionIds },
        },
        _sum: {
          co2e: true,
        },
      });

      const totalCo2eMT = totalCo2eResult._sum.co2e ?? 0;
      const employeeCount = user.organization?.employeeCount ?? null;
      const annualRevenue = user.organization?.annualRevenue ?? null;

      const intensityPerEmployee =
        employeeCount && employeeCount > 0 ? totalCo2eMT / employeeCount : null;

      const intensityPerRevenue =
        annualRevenue && annualRevenue > 0
          ? (totalCo2eMT / annualRevenue) * 1000000
          : null;

      return {
        totalCo2eMT,
        employeeCount,
        annualRevenue,
        intensityPerEmployee,
        intensityPerRevenue,
      };
    },
    "calculate GHG intensity"
  );
}
