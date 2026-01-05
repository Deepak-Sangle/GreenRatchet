import { auth } from "@/auth";
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

// Enable caching for this page
export const revalidate = 60; // Revalidate every 60 seconds

async function getDashboardData(userId: string, organizationId: string) {
  return unstable_cache(
    async () => {
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
    [`dashboard-${userId}-${organizationId}`],
    {
      revalidate: 60,
      tags: [`dashboard-${userId}`, `org-${organizationId}`],
    }
  )();
}

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
  const user = await getDashboardData(basicUser.id, basicUser.organizationId);

  if (!user || !user.organization) {
    redirect("/auth/signin");
  }

  const isBorrower = user.role === "BORROWER";
  const loans = isBorrower
    ? user.organization.borrowerLoans
    : user.organization.lenderLoans;
  const cloudConnections = user.organization.cloudConnections;

  const totalKPIs = loans.reduce((acc, loan) => acc + loan.kpis.length, 0);
  const acceptedKPIs = loans.reduce(
    (acc, loan) =>
      acc + loan.kpis.filter((kpi) => kpi.status === "ACCEPTED").length,
    0
  );
  const proposedKPIs = loans.reduce(
    (acc, loan) =>
      acc + loan.kpis.filter((kpi) => kpi.status === "PROPOSED").length,
    0
  );

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loans.length}</div>
            <p className="text-xs text-muted-foreground">
              {isBorrower ? "Borrowing" : "Lending"} deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKPIs}</div>
            <p className="text-xs text-muted-foreground">
              {acceptedKPIs} accepted, {proposedKPIs} proposed
            </p>
          </CardContent>
        </Card>

        {isBorrower && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cloud Connections
              </CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cloudConnections.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active connections
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposedKPIs}</div>
            <p className="text-xs text-muted-foreground">
              {isBorrower ? "Awaiting lender review" : "Require your review"}
            </p>
          </CardContent>
        </Card>
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
                          ? loan.lenderOrg
                            ? `Lender: ${loan.lenderOrg.name}`
                            : "No lender assigned"
                          : `Borrower: ${loan.borrowerOrg.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {loan.kpis.length} KPI
                        {loan.kpis.length !== 1 ? "s" : ""}
                      </Badge>
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
