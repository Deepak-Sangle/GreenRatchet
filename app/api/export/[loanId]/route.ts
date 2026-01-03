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
          where: { status: "ACCEPTED" },
          include: {
            results: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Build export data
    const exportData = {
      loanDetails: {
        name: loan.name,
        currency: loan.currency,
        observationPeriod: loan.observationPeriod,
        marginRatchetBps: loan.marginRatchetBps,
        borrower: loan.borrowerOrg.name,
        lender: loan.lenderOrg?.name || null,
      },
      kpis: loan.kpis.map((kpi) => ({
        name: kpi.name,
        definition: kpi.definition,
        metricFormula: kpi.metricFormula,
        unit: kpi.unit,
        baselineValue: kpi.baselineValue,
        targetValue: kpi.targetValue,
        observationPeriod: kpi.observationPeriod,
        marginImpactBps: kpi.marginImpactBps,
        latestResult: kpi.results[0]
          ? {
              actualValue: kpi.results[0].actualValue,
              status: kpi.results[0].status,
              periodStart: kpi.results[0].periodStart,
              periodEnd: kpi.results[0].periodEnd,
              calculationVersion: kpi.results[0].calculationVersion,
            }
          : null,
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
