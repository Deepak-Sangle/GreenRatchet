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

  // Build query based on user role (now just organization check)
  // Assuming Lender/Borrower distinction is removed or irrelevant for direct KPI view

  // Fetch kpis for the organization
  const kpis = await prisma.kPI.findMany({
    where: { organizationId: user.organizationId },
    select: {
      id: true,
      name: true,
      type: true,
      targetValue: true,
      direction: true,
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <AnalyticsPageClient kpis={kpis} userRole={user.role} userId={user.id} />
  );
}
