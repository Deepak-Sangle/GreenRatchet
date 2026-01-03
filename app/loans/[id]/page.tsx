import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KPIFormDialog } from "@/components/loans/kpi-form-dialog";
import { InviteLenderDialog } from "@/components/loans/invite-lender-dialog";
import { KPIReviewActions } from "@/components/loans/kpi-review-actions";
import { CalculateKPIsButton } from "@/components/loans/calculate-kpis-button";
import { formatBps } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default async function LoanDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const loan = await prisma.loan.findUnique({
    where: { id: params.id },
    include: {
      borrowerOrg: true,
      lenderOrg: true,
      kpis: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!loan) {
    notFound();
  }

  // Check permissions
  const isBorrower = user.role === "BORROWER" && loan.borrowerOrgId === user.organizationId;
  const isLender = user.role === "LENDER" && loan.lenderOrgId === user.organizationId;

  if (!isBorrower && !isLender) {
    redirect("/dashboard");
  }

  const hasLender = !!loan.lenderOrgId;
  const proposedKPIs = loan.kpis.filter((kpi) => kpi.status === "PROPOSED");
  const acceptedKPIs = loan.kpis.filter((kpi) => kpi.status === "ACCEPTED");
  const rejectedKPIs = loan.kpis.filter((kpi) => kpi.status === "REJECTED");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/loans"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Deals
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{loan.name}</h1>
            <p className="text-muted-foreground mt-2">
              {isBorrower ? "You are the borrower" : "You are the lender"}
            </p>
          </div>
          <div className="flex gap-2">
            {isBorrower && acceptedKPIs.length > 0 && (
              <CalculateKPIsButton loanId={loan.id} />
            )}
            {acceptedKPIs.length > 0 && (
              <Link href={`/api/export/${loan.id}`} target="_blank">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export KPI Schedule
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Observation Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loan.observationPeriod}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Margin Ratchet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBps(loan.marginRatchetBps)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loan.currency}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Borrower</p>
              <p className="text-sm text-muted-foreground">
                {loan.borrowerOrg.name}
              </p>
            </div>
            <Badge>Borrower</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Lender</p>
              <p className="text-sm text-muted-foreground">
                {loan.lenderOrg?.name || "Not yet assigned"}
              </p>
            </div>
            {hasLender ? (
              <Badge>Lender</Badge>
            ) : (
              isBorrower && <InviteLenderDialog loanId={loan.id} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ESG KPIs</CardTitle>
              <CardDescription>
                {isBorrower
                  ? "Enter KPIs as commercially agreed. Legal documentation happens outside the platform."
                  : "Review proposed KPIs. Accept or reject each KPI."}
              </CardDescription>
            </div>
            {isBorrower && <KPIFormDialog loanId={loan.id} />}
          </div>
        </CardHeader>
        <CardContent>
          {loan.kpis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No KPIs defined yet.
              </p>
              {isBorrower && (
                <p className="text-sm text-muted-foreground">
                  Add AI-focused environmental KPIs to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {proposedKPIs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    Proposed KPIs
                    <Badge variant="warning">{proposedKPIs.length}</Badge>
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Margin Impact</TableHead>
                        {isLender && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposedKPIs.map((kpi) => (
                        <TableRow key={kpi.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{kpi.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {kpi.definition}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{kpi.unit}</TableCell>
                          <TableCell>{kpi.targetValue}</TableCell>
                          <TableCell>{formatBps(kpi.marginImpactBps)}</TableCell>
                          {isLender && (
                            <TableCell>
                              <KPIReviewActions kpiId={kpi.id} />
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {acceptedKPIs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    Accepted KPIs
                    <Badge variant="success">{acceptedKPIs.length}</Badge>
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Baseline</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Margin Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acceptedKPIs.map((kpi) => (
                        <TableRow key={kpi.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{kpi.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {kpi.definition}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{kpi.unit}</TableCell>
                          <TableCell>
                            {kpi.baselineValue || "—"}
                          </TableCell>
                          <TableCell>{kpi.targetValue}</TableCell>
                          <TableCell>{formatBps(kpi.marginImpactBps)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {rejectedKPIs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    Rejected KPIs
                    <Badge variant="destructive">{rejectedKPIs.length}</Badge>
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Margin Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedKPIs.map((kpi) => (
                        <TableRow key={kpi.id} className="opacity-60">
                          <TableCell>
                            <div>
                              <p className="font-medium">{kpi.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {kpi.definition}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{kpi.unit}</TableCell>
                          <TableCell>{kpi.targetValue}</TableCell>
                          <TableCell>{formatBps(kpi.marginImpactBps)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isBorrower && acceptedKPIs.length > 0 && (
        <Card className="border-primary/20 bg-accent/30">
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your KPIs have been accepted. Connect your cloud providers to enable
              automated, continuous, cloud-native ESG assurance with full auditability.
            </p>
            <Link href="/cloud">
              <Button>Connect Cloud Providers</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
