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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

// Enable caching for this page
export const revalidate = 60; // Revalidate every 60 seconds

async function getLoansData(userId: string, organizationId: string) {
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
            },
          },
        },
      });
    },
    [`loans-${userId}-${organizationId}`],
    {
      revalidate: 60,
      tags: [`loans-${userId}`, `org-${organizationId}`],
    }
  )();
}

export default async function LoansPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // First get basic user info to check organization
  const basicUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true, role: true },
  });

  if (!basicUser || !basicUser.organizationId) {
    redirect("/auth/signin");
  }

  // Get cached loans data
  const user = await getLoansData(basicUser.id, basicUser.organizationId);

  if (!user || !user.organization) {
    redirect("/auth/signin");
  }

  const isBorrower = user.role === "BORROWER";
  const loans = isBorrower
    ? user.organization.borrowerLoans
    : user.organization.lenderLoans;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SLL Deals</h1>
          <p className="text-muted-foreground">
            Manage your sustainability-linked loan agreements
          </p>
        </div>
        {isBorrower && (
          <Link href="/loans/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deals</CardTitle>
          <CardDescription>
            {isBorrower
              ? "Your active and past SLL deals"
              : "Deals you are reviewing or have reviewed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No deals found.</p>
              {isBorrower && (
                <Link href="/loans/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Deal
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Name</TableHead>
                  <TableHead>{isBorrower ? "Lender" : "Borrower"}</TableHead>
                  <TableHead>KPIs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const proposedKPIs = loan.kpis.filter(
                    (kpi) => kpi.status === "PROPOSED"
                  ).length;
                  const acceptedKPIs = loan.kpis.filter(
                    (kpi) => kpi.status === "ACCEPTED"
                  ).length;

                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.name}</TableCell>
                      <TableCell>
                        {isBorrower
                          ? loan.lenderOrg?.name || "No lender"
                          : loan.borrowerOrg.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="outline">
                            {loan.kpis.length} total
                          </Badge>
                          {acceptedKPIs > 0 && (
                            <Badge variant="success">
                              {acceptedKPIs} accepted
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {proposedKPIs > 0 ? (
                          <Badge variant="warning">Pending Review</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(loan.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/loans/${loan.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
