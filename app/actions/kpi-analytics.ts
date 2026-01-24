"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateKPI } from "@/lib/services/kpi-calculator";
import { revalidatePath } from "next/cache";

/**
 * KPI Analytics interfaces
 */
export interface KPIAnalytics {
  kpiId: string;
  kpiName: string;
  kpiType: string;
  targetValue: number;
  direction: string;
  latestResult: {
    actualValue: number;
    status: string;
    periodStart: Date;
    periodEnd: Date;
  } | null;
  trend: {
    direction: "increasing" | "decreasing" | "stable";
    percentageChange: number;
  } | null;
  historicalResults: Array<{
    actualValue: number;
    targetValue: number;
    status: string;
    periodStart: Date;
    periodEnd: Date;
  }>;
}

export interface DetailedKPIAnalytics extends KPIAnalytics {
  calculationDetails: {
    formula: string;
    inputs: Record<string, number | string>;
    steps: string[];
    breakdown?: {
      byRegion?: Record<string, number>;
      byService?: Record<string, number>;
      byEnergySource?: Record<string, number>;
    };
  } | null;
  recommendations: string[];
}

/**
 * Refresh all KPI calculations for the user's organization
 * Triggers calculations for all accepted KPIs across all loans
 */
export async function refreshKPICalculationsAction(): Promise<
  { success: true; resultsCreated: number } | { error: string }
> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        organizationId: true,
      },
    });

    // 3. Authorization
    if (!user || !user.organizationId) {
      return { error: "Only borrowers can trigger KPI calculations" };
    }

    // 4. Fetch all accepted KPIs for the organization
    const kpis = await prisma.kPI.findMany({
      where: {
        organizationId: user.organizationId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        targetValue: true,
        direction: true,
        frequency: true,
        organizationId: true,
      },
    });

    // Check if organization has active cloud connections
    const cloudConnections = await prisma.cloudConnection.findMany({
      where: { organizationId: user.organizationId, isActive: true },
      select: { id: true },
    });

    if (cloudConnections.length === 0) {
      return {
        error:
          "No active cloud connections found. Please connect a cloud provider to calculate KPIs.",
      };
    }

    // 5. Calculate date range based on current date
    const periodEnd = new Date();

    let resultsCreated = 0;
    const errors: string[] = [];

    // 6. Calculate all accepted KPIs
    for (const kpi of kpis) {
      try {
        // Determine period start based on KPI frequency
        const periodStart = new Date();
        switch (kpi.frequency) {
          case "MONTHLY":
            periodStart.setMonth(periodStart.getMonth() - 1);
            break;
          case "QUARTERLY":
            periodStart.setMonth(periodStart.getMonth() - 3);
            break;
          case "ANNUAL":
            periodStart.setFullYear(periodStart.getFullYear() - 1);
            break;
          default:
            periodStart.setMonth(periodStart.getMonth() - 1);
        }

        // Call the calculator service
        const calculationResult = await calculateKPI(
          kpi,
          kpi.organizationId,
          periodStart,
          periodEnd,
        );

        // Create KPIResult
        await prisma.kPIResult.create({
          data: {
            kpiId: kpi.id,
            periodStart,
            periodEnd,
            actualValue: calculationResult.actualValue,
            targetValue: calculationResult.targetValue,
            status: calculationResult.status,
          },
        });

        // Create audit log
        await prisma.auditLog.create({
          data: {
            action: "KPI_CALCULATED",
            entity: "KPI",
            entityId: kpi.id,
            details: JSON.stringify({
              kpiName: kpi.name,
              kpiType: kpi.type,
              actualValue: calculationResult.actualValue,
              targetValue: calculationResult.targetValue,
              status: calculationResult.status,
              formula: calculationResult.calculationDetails.formula,
              dataSource: calculationResult.dataSource,
              periodStart: periodStart.toISOString(),
              periodEnd: periodEnd.toISOString(),
            }),
            userId: user.id,
            organizationId: user.organizationId,
            kpiId: kpi.id,
          },
        });

        resultsCreated++;
      } catch (error) {
        console.error(`Error calculating KPI ${kpi.name}:`, error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`${kpi.name}: ${errorMessage}`);

        // Log the error in audit log
        await prisma.auditLog.create({
          data: {
            action: "KPI_CALCULATION_FAILED",
            entity: "KPI",
            entityId: kpi.id,
            details: JSON.stringify({
              kpiName: kpi.name,
              kpiType: kpi.type,
              error: errorMessage,
              periodStart: periodEnd.toISOString(),
              periodEnd: periodEnd.toISOString(),
            }),
            userId: user.id,
            organizationId: user.organizationId,
            kpiId: kpi.id,
          },
        });
      }
    }

    // 7. Revalidate paths
    revalidatePath("/analytics");
    revalidatePath("/kpis");

    // Return results
    if (resultsCreated === 0 && errors.length === 0) {
      return { error: "No accepted KPIs found to calculate" };
    }

    if (errors.length > 0 && resultsCreated === 0) {
      return { error: `Failed to calculate KPIs: ${errors.join("; ")}` };
    }

    return { success: true, resultsCreated };
  } catch (error) {
    console.error("Error in refreshKPICalculationsAction:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to refresh KPI calculations. Please try again later.",
    };
  }
}
