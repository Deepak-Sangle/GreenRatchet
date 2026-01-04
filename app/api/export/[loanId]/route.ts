import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  props: { params: Promise<{ loanId: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: params.loanId },
      include: {
        borrowerOrg: true,
        lenderOrg: true,
        kpis: {
          where: { status: { in: ["ACCEPTED"] } },
          include: {
            results: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            marginRatchets: true,
          },
        },
        marginRatchets: {
          include: {
            kpi: true,
          },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Helper to safely extract calculation method
    // const getCalculationMethod = (kpi: (typeof loan.kpis)[0]) => {
    //   try {
    //     const method = kpi.calculationMethod as {
    //       formula?: string;
    //       description?: string;
    //     };
    //     return {
    //       formula: method?.formula || "",
    //       description: method?.description || "",
    //     };
    //   } catch {
    //     return { formula: "", description: "" };
    //   }
    // };

    // Build export data
    const exportData = {
      loanDetails: {
        name: loan.name,
        currency: loan.currency,
        type: loan.type,
        principalAmount: loan.principalAmount,
        committedAmount: loan.committedAmount,
        drawnAmount: loan.drawnAmount,
        startDate: loan.startDate,
        maturityDate: loan.maturityDate,
        borrower: loan.borrowerOrg.name,
        lender: loan.lenderOrg?.name || null,
      },
      kpis: loan.kpis.map((kpi) => {
        // const calcMethod = getCalculationMethod(kpi);
        return {
          name: kpi.name,
          category: kpi.category,
          valueType: kpi.valueType,
          direction: kpi.direction,
          unit: kpi.unit,
          baselineValue: kpi.baselineValue?.toString() || null,
          targetValue: kpi.targetValue.toString(),
          thresholdMin: kpi.thresholdMin?.toString() || null,
          thresholdMax: kpi.thresholdMax?.toString() || null,
          frequency: kpi.frequency,
          // calculationFormula: calcMethod.formula,
          // calculationDescription: calcMethod.description,
          effectiveFrom: kpi.effectiveFrom,
          effectiveTo: kpi.effectiveTo,
          status: kpi.status,
          marginRatchets: kpi.marginRatchets.map((ratchet) => ({
            stepUpBps: ratchet.stepUpBps,
            stepDownBps: ratchet.stepDownBps,
            maxAdjustmentBps: ratchet.maxAdjustmentBps,
          })),
          latestResult: kpi.results[0]
            ? {
                actualValue: kpi.results[0].actualValue,
                status: kpi.results[0].status,
                periodStart: kpi.results[0].periodStart,
                periodEnd: kpi.results[0].periodEnd,
              }
            : null,
        };
      }),
      marginRatchetsSummary: loan.marginRatchets.map((ratchet) => ({
        kpiName: ratchet.kpi.name,
        stepUpBps: ratchet.stepUpBps,
        stepDownBps: ratchet.stepDownBps,
        maxAdjustmentBps: ratchet.maxAdjustmentBps,
      })),
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: session.user.email,
        systemVersion: "GreenRatchet v1.0.0",
      },
      disclaimer:
        "This document is for informational purposes only. Legal loan documentation is managed outside the GreenRatchet platform. All KPI calculations use automated, continuous, cloud-native ESG assurance with full auditability.",
    };

    // Return as JSON download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="kpi-schedule-${loan.name.replace(/ /g, "-")}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export KPI schedule" },
      { status: 500 }
    );
  }
}
