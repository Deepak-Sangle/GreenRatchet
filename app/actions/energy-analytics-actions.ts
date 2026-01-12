"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMonthlyEnergyWithProjection } from "@/lib/services/energy-analytics";

export async function getEnergyTimelineAction() {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // 2. Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!user?.organizationId) {
      return { error: "No organization found" };
    }

    // 3. Fetch monthly energy with projection
    const data = await getMonthlyEnergyWithProjection(
      user.organizationId,
      12, // 12 months history
      6 // 6 months projection
    );

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching energy timeline:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch energy timeline",
    };
  }
}
