"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            employeeCount: true,
            annualRevenue: true,
          },
        },
      },
    });

    if (!user?.organizationId) {
      return { error: "No organization found" };
    }

    const cloudConnections = await prisma.cloudConnection.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      select: { id: true },
    });

    if (cloudConnections.length === 0) {
      return {
        error: "No active cloud connections found",
      };
    }

    const connectionIds = cloudConnections.map((c) => c.id);

    const totalCo2eResult = await prisma.cloudFootprint.aggregate({
      where: {
        cloudConnectionId: { in: connectionIds },
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
      success: true,
      data: {
        totalCo2eMT,
        employeeCount,
        annualRevenue,
        intensityPerEmployee,
        intensityPerRevenue,
      },
    };
  } catch (error) {
    console.error("Error calculating GHG intensity:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to calculate GHG intensity",
    };
  }
}
