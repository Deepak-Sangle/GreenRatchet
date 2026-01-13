"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateKPI } from "@/lib/services/kpi-calculator";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Trigger KPI calculation for a specific loan
 * This would normally be run on a schedule (cron job)
 */
export async function triggerKPICalculation(loanId: string) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user) {
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
    if (!user || user.role !== "BORROWER") {
      return { error: "Only borrowers can trigger KPI calculations" };
    }

    // 4. Fetch loan with KPIs and organization
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        name: true,
        borrowerOrgId: true,
        kpis: {
          where: { status: "ACCEPTED" },
          select: {
            id: true,
            name: true,
            type: true,
            targetValue: true,
            direction: true,
            frequency: true,
          },
        },
        borrowerOrg: {
          select: {
            id: true,
            cloudConnections: {
              where: { isActive: true },
              select: { id: true, provider: true },
            },
          },
        },
      },
    });

    if (!loan || loan.borrowerOrgId !== user.organizationId) {
      return { error: "Loan not found or access denied" };
    }

    if (loan.borrowerOrg.cloudConnections.length === 0) {
      return {
        error:
          "No active cloud connections found. Please connect a cloud provider to calculate KPIs.",
      };
    }

    if (loan.kpis.length === 0) {
      return { error: "No accepted KPIs found for this loan" };
    }

    // 5. Calculate date range based on current date
    const periodEnd = new Date();
    const periodStart = new Date();

    // Use the first KPI's frequency to determine the period
    // In a real system, each KPI might have its own frequency
    const frequency = loan.kpis[0].frequency;

    switch (frequency) {
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

    // 6. Calculate all accepted KPIs
    let resultsCreated = 0;
    const errors: string[] = [];

    for (const kpi of loan.kpis) {
      try {
        // Call the refactored calculator service
        const calculationResult = await calculateKPI(
          kpi,
          loan.borrowerOrgId,
          periodStart,
          periodEnd
        );

        // Create KPIResult with all required fields
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

        // Create audit log with calculation details
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
            loanId: loan.id,
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
              periodStart: periodStart.toISOString(),
              periodEnd: periodEnd.toISOString(),
            }),
            userId: user.id,
            loanId: loan.id,
            kpiId: kpi.id,
          },
        });
      }
    }

    // 7. Revalidate paths
    revalidatePath(`/loans/${loanId}`);
    revalidatePath("/analytics");
    revalidatePath("/kpis");
    revalidateTag(`loan-${loanId}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`analytics-${user.id}`);
    revalidateTag(`audit-${user.id}`);

    // Return success with details
    if (resultsCreated > 0 && errors.length === 0) {
      return {
        success: true,
        resultsCreated,
        message: `Successfully calculated ${resultsCreated} KPI${resultsCreated > 1 ? "s" : ""}`,
      };
    } else if (resultsCreated > 0 && errors.length > 0) {
      return {
        success: true,
        resultsCreated,
        message: `Calculated ${resultsCreated} KPI${resultsCreated > 1 ? "s" : ""}, but ${errors.length} failed`,
        errors,
      };
    } else {
      return {
        error: `Failed to calculate KPIs: ${errors.join("; ")}`,
      };
    }
  } catch (error) {
    console.error("Error in triggerKPICalculation:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to calculate KPIs. Please try again later.",
    };
  }
}
