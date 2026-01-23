import { auth } from "@/auth";
import { DashboardItem } from "@/components/shared/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Cloud, FileText, Plus, TrendingUp } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

const getDashboardData = unstable_cache(
  async (userId: string) => {
    console.log("dashboard cache miss");
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: {
            borrowerLoans: {
              include: {
                kpis: true,
                lenderOrg: true,
                borrowerOrg: true,
              },
              orderBy: { createdAt: "desc" },
            },
            lenderLoans: {
              include: {
                kpis: true,
                borrowerOrg: true,
                lenderOrg: true,
              },
              orderBy: { createdAt: "desc" },
            },
            cloudConnections: {
              where: { isActive: true },
            },
          },
        },
      },
    });
  },
  // unstable_cache already uses function arguments to identify cache items
  ["dashboard"],
  {
    revalidate: 60,
  },
);

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // First get basic user info to check organization
  const basicUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true, role: true, name: true },
  });

  if (!basicUser || !basicUser.organizationId) {
    redirect("/auth/signin");
  }

  // Get cached dashboard data
  const user = await getDashboardData(basicUser.id);

  if (!user || !user.organization) {
    redirect("/auth/signin");
  }

  const isBorrower = user.role === "BORROWER";
  const loans = isBorrower
    ? user.organization.borrowerLoans
    : user.organization.lenderLoans;
  const cloudConnections = user.organization.cloudConnections;

  const allKPIs = loans.flatMap((l) => l.kpis);
  const totalKPIs = allKPIs.length;
  const acceptedKPIs = allKPIs.filter(
    (kpi) => kpi.status === "ACCEPTED",
  ).length;
  const proposedKPIs = allKPIs.filter(
    (kpi) => kpi.status === "PROPOSED",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        {isBorrower && (
          <Link href="/loans/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create SLL Deal
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardItem
          title="Total Deals"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          contentTitle={loans.length.toString()}
          contentBody={isBorrower ? "Borrowing deals" : "Lending deals"}
        />

        <DashboardItem
          title="Total KPIs"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          contentTitle={totalKPIs.toString()}
          contentBody={`${acceptedKPIs} accepted, ${proposedKPIs} proposed`}
        />

        <DashboardItem
          title="Cloud Connections"
          icon={<Cloud className="h-4 w-4 text-muted-foreground" />}
          contentTitle={cloudConnections.length.toString()}
          contentBody="Active connections"
        />

        <DashboardItem
          title="Pending Actions"
          icon={null}
          contentTitle={proposedKPIs.toString()}
          contentBody={
            isBorrower ? "Awaiting lender review" : "Require your review"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent SLL Deals</CardTitle>
          <CardDescription>
            {isBorrower
              ? "Your sustainability-linked loan deals"
              : "Deals requiring your review"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {isBorrower
                  ? "No deals yet. Create your first SLL deal to get started."
                  : "No deals assigned to you yet."}
              </p>
              {isBorrower && (
                <Link href="/loans/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create SLL Deal
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {loans.slice(0, 5).map((loan) => (
                <Link
                  key={loan.id}
                  href={`/loans/${loan.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">{loan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {isBorrower
                          ? `Lender: ${loan.lenderOrg?.name ?? "No lender assigned"}`
                          : `Borrower: ${loan.borrowerOrg.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{loan.kpis.length} KPI</Badge>
                      {loan.kpis.some((kpi) => kpi.status === "PROPOSED") && (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
