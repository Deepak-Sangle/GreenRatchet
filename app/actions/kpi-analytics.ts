"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateKPI } from "@/lib/services/kpi-calculator";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * KPI Analytics interfaces
 */
export interface KPIAnalytics {
  kpiId: string;
  kpiName: string;
  kpiType: string;
  loanId: string;
  loanName: string;
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
  marginRatchet: {
    stepUpBps: number;
    stepDownBps: number;
    maxAdjustmentBps: number;
  } | null;
  historicalResults: Array<{
    actualValue: number;
    targetValue: number;
    status: string;
    periodStart: Date;
    periodEnd: Date;
  }>;
  borrowerOrgName?: string;
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
 * Get all KPI analytics for the user's organization
 * Supports both borrower and lender access
 */
export async function getKPIAnalyticsAction(): Promise<
  { data: KPIAnalytics[] } | { error: string }
> {
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
        role: true,
        organizationId: true,
      },
    });

    if (!user || !user.organizationId) {
      return { error: "User or organization not found" };
    }

    // 3. Build query based on user role
    const whereClause =
      user.role === "BORROWER"
        ? { loan: { borrowerOrgId: user.organizationId } }
        : { loan: { lenderOrgId: user.organizationId } };

    // 4. Fetch all KPIs with related data
    const kpis = await prisma.kPI.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        type: true,
        targetValue: true,
        direction: true,
        loanId: true,
        loan: {
          select: {
            id: true,
            name: true,
            borrowerOrg: {
              select: {
                name: true,
              },
            },
          },
        },
        results: {
          orderBy: { periodEnd: "desc" },
          select: {
            actualValue: true,
            targetValue: true,
            status: true,
            periodStart: true,
            periodEnd: true,
          },
        },
        marginRatchets: {
          select: {
            stepUpBps: true,
            stepDownBps: true,
            maxAdjustmentBps: true,
          },
          take: 1,
        },
      },
    });

    // 5. Transform data into analytics format
    const analytics: KPIAnalytics[] = kpis.map((kpi) => {
      const latestResult = kpi.results[0] ?? null;
      const previousResult = kpi.results[1] ?? null;

      // Calculate trend
      let trend: KPIAnalytics["trend"] = null;
      if (latestResult && previousResult) {
        const change = latestResult.actualValue - previousResult.actualValue;
        const percentageChange =
          previousResult.actualValue !== 0
            ? (change / previousResult.actualValue) * 100
            : 0;

        trend = {
          direction:
            change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
          percentageChange: Math.round(percentageChange * 100) / 100,
        };
      }

      // Get margin ratchet if exists
      const marginRatchet = kpi.marginRatchets[0] ?? null;

      return {
        kpiId: kpi.id,
        kpiName: kpi.name,
        kpiType: kpi.type,
        loanId: kpi.loanId,
        loanName: kpi.loan.name,
        targetValue: Number(kpi.targetValue),
        direction: kpi.direction,
        latestResult: latestResult
          ? {
              actualValue: latestResult.actualValue,
              status: latestResult.status,
              periodStart: latestResult.periodStart,
              periodEnd: latestResult.periodEnd,
            }
          : null,
        trend,
        marginRatchet,
        historicalResults: kpi.results,
        borrowerOrgName:
          user.role === "LENDER" ? kpi.loan.borrowerOrg.name : undefined,
      };
    });

    return { data: analytics };
  } catch (error) {
    console.error("Error fetching KPI analytics:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch KPI analytics",
    };
  }
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

    // 3. Authorization - only borrowers can trigger calculations
    if (!user || user.role !== "BORROWER" || !user.organizationId) {
      return { error: "Only borrowers can trigger KPI calculations" };
    }

    // 4. Fetch all loans with accepted KPIs for the organization
    const loans = await prisma.loan.findMany({
      where: { borrowerOrgId: user.organizationId },
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

    // 6. Calculate all accepted KPIs across all loans
    for (const loan of loans) {
      for (const kpi of loan.kpis) {
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
            loan.borrowerOrgId,
            periodStart,
            periodEnd
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
                periodStart: periodEnd.toISOString(),
                periodEnd: periodEnd.toISOString(),
              }),
              userId: user.id,
              loanId: loan.id,
              kpiId: kpi.id,
            },
          });
        }
      }
    }

    // 7. Revalidate paths
    revalidatePath("/analytics");
    revalidatePath("/kpis");
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`analytics-${user.id}`);
    revalidateTag(`audit-${user.id}`);

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

/**
 * Get detailed analytics for a specific KPI
 * Includes calculation details and recommendations
 */
export async function getKPIDetailedAnalyticsAction(
  kpiId: string
): Promise<{ data: DetailedKPIAnalytics } | { error: string }> {
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
        role: true,
        organizationId: true,
      },
    });

    if (!user || !user.organizationId) {
      return { error: "User or organization not found" };
    }

    // 3. Fetch KPI with authorization check
    const kpi = await prisma.kPI.findUnique({
      where: { id: kpiId },
      select: {
        id: true,
        name: true,
        type: true,
        targetValue: true,
        direction: true,
        loanId: true,
        loan: {
          select: {
            id: true,
            name: true,
            borrowerOrgId: true,
            lenderOrgId: true,
            borrowerOrg: {
              select: {
                name: true,
              },
            },
          },
        },
        results: {
          orderBy: { periodEnd: "desc" },
          select: {
            actualValue: true,
            targetValue: true,
            status: true,
            periodStart: true,
            periodEnd: true,
          },
        },
        marginRatchets: {
          select: {
            stepUpBps: true,
            stepDownBps: true,
            maxAdjustmentBps: true,
          },
          take: 1,
        },
      },
    });

    if (!kpi) {
      return { error: "KPI not found" };
    }

    // 4. Authorization check - borrower or lender access
    const hasAccess =
      (user.role === "BORROWER" &&
        kpi.loan.borrowerOrgId === user.organizationId) ||
      (user.role === "LENDER" && kpi.loan.lenderOrgId === user.organizationId);

    if (!hasAccess) {
      return { error: "Access denied" };
    }

    // 5. Calculate trend
    const latestResult = kpi.results[0] ?? null;
    const previousResult = kpi.results[1] ?? null;

    let trend: KPIAnalytics["trend"] = null;
    if (latestResult && previousResult) {
      const change = latestResult.actualValue - previousResult.actualValue;
      const percentageChange =
        previousResult.actualValue !== 0
          ? (change / previousResult.actualValue) * 100
          : 0;

      trend = {
        direction:
          change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
        percentageChange: Math.round(percentageChange * 100) / 100,
      };
    }

    // 6. Get calculation details from latest audit log
    let calculationDetails = null;
    if (latestResult) {
      const latestCalculationLog = await prisma.auditLog.findFirst({
        where: {
          kpiId: kpi.id,
          action: "KPI_CALCULATED",
        },
        orderBy: { createdAt: "desc" },
        select: { details: true },
      });

      if (latestCalculationLog) {
        try {
          const logDetails = JSON.parse(latestCalculationLog.details);
          calculationDetails = {
            formula: logDetails.formula ?? "",
            inputs: logDetails.dataSource ?? {},
            steps: [],
            breakdown: {},
          };
        } catch (e) {
          console.error("Error parsing calculation details:", e);
        }
      }
    }

    // 7. Generate recommendations based on KPI status and type
    const recommendations = generateRecommendations(
      kpi.type,
      kpi.direction,
      latestResult?.status ?? "PENDING"
    );

    // 8. Build detailed analytics
    const detailedAnalytics: DetailedKPIAnalytics = {
      kpiId: kpi.id,
      kpiName: kpi.name,
      kpiType: kpi.type,
      loanId: kpi.loanId,
      loanName: kpi.loan.name,
      targetValue: Number(kpi.targetValue),
      direction: kpi.direction,
      latestResult: latestResult
        ? {
            actualValue: latestResult.actualValue,
            status: latestResult.status,
            periodStart: latestResult.periodStart,
            periodEnd: latestResult.periodEnd,
          }
        : null,
      trend,
      marginRatchet: kpi.marginRatchets[0] ?? null,
      historicalResults: kpi.results,
      borrowerOrgName:
        user.role === "LENDER" ? kpi.loan.borrowerOrg.name : undefined,
      calculationDetails,
      recommendations,
    };

    return { data: detailedAnalytics };
  } catch (error) {
    console.error("Error fetching detailed KPI analytics:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch detailed KPI analytics",
    };
  }
}

/**
 * Generate recommendations based on KPI type, direction, and status
 */
function generateRecommendations(
  kpiType: string,
  direction: string,
  status: string
): string[] {
  if (status === "PASSED") {
    return ["Great job! This KPI is meeting its target."];
  }

  const recommendations: string[] = [];

  if (direction === "LOWER_IS_BETTER") {
    switch (kpiType) {
      case "CO2_EMISSION":
        recommendations.push(
          "Migrate workloads to regions with lower carbon intensity",
          "Optimize resource utilization to reduce overall compute time",
          "Consider using spot instances or reserved capacity during low-carbon periods"
        );
        break;
      case "ENERGY_CONSUMPTION":
        recommendations.push(
          "Use more efficient instance types (e.g., ARM-based processors)",
          "Reduce idle time by implementing auto-scaling policies",
          "Optimize application code to reduce computational requirements"
        );
        break;
      case "WATER_WITHDRAWAL":
        recommendations.push(
          "Migrate to regions with lower Water Usage Effectiveness (WUE) factors",
          "Reduce overall energy consumption to decrease water usage",
          "Consider regions with air-cooled data centers"
        );
        break;
      case "AI_COMPUTE_HOURS":
        recommendations.push(
          "Optimize training runs to reduce compute time",
          "Use spot instances for non-critical AI workloads",
          "Implement model compression techniques to reduce inference costs"
        );
        break;
      default:
        recommendations.push(
          "Review your cloud usage patterns",
          "Consider optimization strategies for this metric"
        );
    }
  } else {
    // HIGHER_IS_BETTER
    switch (kpiType) {
      case "LOW_CARBON_REGION_PERCENTAGE":
        recommendations.push(
          "Migrate more workloads to low-carbon regions (< 300 gCO2/kWh)",
          "Review regional carbon intensity data and plan migrations",
          "Consider multi-region deployments in low-carbon areas"
        );
        break;
      case "CARBON_FREE_ENERGY_PERCENTAGE":
        recommendations.push(
          "Schedule workloads during high carbon-free energy periods",
          "Migrate to regions with higher CFE percentages",
          "Implement time-shifting for batch workloads"
        );
        break;
      case "RENEWABLE_ENERGY_PERCENTAGE":
        recommendations.push(
          "Migrate to regions with higher renewable energy percentages",
          "Consider purchasing renewable energy credits (RECs)",
          "Schedule flexible workloads during peak renewable generation times"
        );
        break;
      case "ELECTRICITY_MIX_BREAKDOWN":
        recommendations.push(
          "Target regions with higher renewable energy in the grid mix",
          "Monitor temporal trends to identify optimal execution windows",
          "Consider regions with nuclear or hydro baseload power"
        );
        break;
      default:
        recommendations.push(
          "Review your cloud usage patterns",
          "Consider optimization strategies for this metric"
        );
    }
  }

  return recommendations;
}
