"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchCloudUsageData } from "@/lib/services/cloud-data";
import { calculateKPI } from "@/lib/services/kpi-calculator";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Trigger KPI calculation for a specific loan
 * This would normally be run on a schedule (cron job)
 */
export async function triggerKPICalculation(loanId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER") {
      return { error: "Only borrowers can trigger KPI calculations" };
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        kpis: {
          where: { status: "ACCEPTED" },
        },
        borrowerOrg: {
          include: {
            cloudConnections: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!loan || loan.borrowerOrgId !== user.organizationId) {
      return { error: "Loan not found" };
    }

    const cloudConnections = loan.borrowerOrg.cloudConnections;

    if (cloudConnections.length === 0) {
      return { error: "No active cloud connections found" };
    }

    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 1);
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setSeconds(-1);

    // Fetch cloud data from all connected providers
    const cloudConnection = cloudConnections[0]; // Use first connection for demo
    const cloudData = await fetchCloudUsageData(cloudConnection.id);

    // Calculate all accepted KPIs
    let resultsCreated = 0;

    for (const kpi of loan.kpis) {
      const calculationResult = calculateKPI(kpi, cloudData);

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
            actualValue: calculationResult.actualValue,
            targetValue: calculationResult.targetValue,
            status: calculationResult.status,
          }),
          userId: user.id,
          loanId: loan.id,
          kpiId: kpi.id,
        },
      });

      resultsCreated++;
    }

    // Update cloud connection last sync
    await prisma.cloudConnection.update({
      where: { id: cloudConnection.id },
      data: { lastSync: new Date() },
    });

    revalidatePath(`/loans/${loanId}`);
    revalidatePath("/analytics");
    revalidateTag(`loan-${loanId}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`analytics-${user.id}`);
    revalidateTag(`audit-${user.id}`);

    return { success: true, resultsCreated };
  } catch (error) {
    console.error("Error calculating KPIs:", error);
    return { error: "Failed to calculate KPIs" };
  }
}
