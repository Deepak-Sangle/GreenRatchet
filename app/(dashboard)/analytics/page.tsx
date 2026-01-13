import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnalyticsPageClient } from "./analytics-client";

// Enable caching for this page
export const revalidate = 60; // Revalidate every 60 seconds

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get user with organization
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true, role: true },
  });

  if (!user || !user.organizationId) {
    redirect("/auth/signin");
  }

  // Build query based on user role
  const whereClause =
    user.role === "BORROWER"
      ? { borrowerOrgId: user.organizationId }
      : { lenderOrgId: user.organizationId };

  // Fetch all loans with KPIs, margin ratchets, and results in one query
  const loans = await prisma.loan.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      borrowerOrg: {
        select: { name: true },
      },
      lenderOrg: {
        select: { name: true },
      },
      kpis: {
        select: {
          id: true,
          name: true,
          type: true,
          targetValue: true,
          direction: true,
          marginRatchets: {
            select: {
              stepUpBps: true,
              stepDownBps: true,
              maxAdjustmentBps: true,
            },
            take: 1,
          },
          results: {
            orderBy: { periodEnd: "desc" },
            take: 10,
            select: {
              actualValue: true,
              targetValue: true,
              status: true,
              periodStart: true,
              periodEnd: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AnalyticsPageClient loans={loans} userRole={user.role} userId={user.id} />
  );
}
