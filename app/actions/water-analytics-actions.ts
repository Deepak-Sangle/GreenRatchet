"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMonthlyWaterWithProjection } from "@/lib/services/water-analytics";

export async function getWaterTimelineAction() {
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

    // 3. Fetch monthly water withdrawal with projection
    const data = await getMonthlyWaterWithProjection(
      user.organizationId,
      12, // 12 months history
      6 // 6 months projection
    );

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching water timeline:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch water timeline",
    };
  }
}
