import { auth } from "@/auth";
import { CalculateKPIsButton } from "@/components/loans/calculate-kpis-button";
import { InviteLenderDialog } from "@/components/loans/invite-lender-dialog";
import { KPIActions } from "@/components/loans/kpi-actions";
import { KPIFormDialog } from "@/components/loans/kpi-form-dialog";
import { KPIReviewActions } from "@/components/loans/kpi-review-actions";
import { MarginRatchetActions } from "@/components/loans/margin-ratchet-actions";
import { MarginRatchetDialog } from "@/components/loans/margin-ratchet-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KPI_CATEGORY_LABELS,
  KPI_DIRECTION_LABELS,
  KPI_FREQUENCY_LABELS,
  LOAN_TYPE_LABELS,
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatBps, formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Download, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
        include: {
          marginRatchets: true,
        },
      },
      marginRatchets: {
        include: {
          kpi: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!loan) {
    notFound();
  }

  // Check permissions
  const isBorrower =
    user.role === "BORROWER" && loan.borrowerOrgId === user.organizationId;
  const isLender =
    user.role === "LENDER" && loan.lenderOrgId === user.organizationId;

  if (!isBorrower && !isLender) {
    redirect("/dashboard");
  }

  const hasLender = !!loan.lenderOrgId;
  const proposedKPIs = loan.kpis.filter((kpi) => kpi.status === "PROPOSED");
  const acceptedKPIs = loan.kpis.filter((kpi) => kpi.status === "ACCEPTED");

  // KPIs available for margin ratchets (accepted or active)
  const kpisForRatchets = acceptedKPIs.map((kpi) => ({
    id: kpi.id,
    name: kpi.name,
  }));

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
                  <Download className="h-4" />
                  Export Loan Data
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-4 grid-cols-2 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Loan Type</p>
              <p className="font-medium">
                {LOAN_TYPE_LABELS[loan.type] || loan.type}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium">{loan.currency}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Principal Amount</p>
              <p className="font-medium">
                {Number(loan.principalAmount) >= 0
                  ? formatCurrency(Number(loan.principalAmount), loan.currency)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Committed Amount</p>
              <p className="font-medium">
                {Number(loan.committedAmount) >= 0
                  ? formatCurrency(Number(loan.committedAmount), loan.currency)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drawn Amount</p>
              <p className="font-medium">
                {Number(loan.drawnAmount) >= 0
                  ? formatCurrency(Number(loan.drawnAmount), loan.currency)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{formatDate(loan.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maturity Date</p>
              <p className="font-medium">{formatDate(loan.maturityDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  ? "Define sustainability KPIs for this loan. Configure margin ratchets to link KPI performance to loan pricing."
                  : "Review proposed KPIs. Accept or reject each KPI."}
              </CardDescription>
            </div>
            {<KPIFormDialog loanId={loan.id} />}
          </div>
        </CardHeader>
        <CardContent>
          {loan.kpis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No KPIs defined yet.</p>
              {isBorrower && (
                <p className="text-sm text-muted-foreground">
                  Add sustainability KPIs to get started.
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
                        <TableHead>Category</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposedKPIs.map((kpi) => (
                        <TableRow key={kpi.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{kpi.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {kpi.unit}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {KPI_CATEGORY_LABELS[kpi.category] ||
                                kpi.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{kpi.targetValue.toString()}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-sm">
                              {kpi.direction === "LOWER_IS_BETTER" ? (
                                <TrendingDown className="h-3 w-3 text-green-600" />
                              ) : kpi.direction === "HIGHER_IS_BETTER" ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : null}
                              {KPI_DIRECTION_LABELS[kpi.direction] ||
                                kpi.direction}
                            </span>
                          </TableCell>
                          <TableCell>
                            {KPI_FREQUENCY_LABELS[kpi.frequency] ||
                              kpi.frequency}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isLender && <KPIReviewActions kpiId={kpi.id} />}
                              <KPIActions
                                kpi={kpi}
                                loanId={loan.id}
                                isBorrower={isBorrower}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {acceptedKPIs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    Active KPIs
                    <Badge variant="success">{acceptedKPIs.length}</Badge>
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Baseline</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Ratchets</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acceptedKPIs.map((kpi) => (
                        <TableRow key={kpi.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{kpi.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {kpi.unit}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {KPI_CATEGORY_LABELS[kpi.category] ||
                                kpi.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {kpi.baselineValue?.toString() || "—"}
                          </TableCell>
                          <TableCell>{kpi.targetValue.toString()}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-sm">
                              {kpi.direction === "LOWER_IS_BETTER" ? (
                                <TrendingDown className="h-3 w-3 text-green-600" />
                              ) : kpi.direction === "HIGHER_IS_BETTER" ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : null}
                              {KPI_DIRECTION_LABELS[kpi.direction] ||
                                kpi.direction}
                            </span>
                          </TableCell>
                          <TableCell>
                            {kpi.marginRatchets.length > 0 ? (
                              <Badge variant="secondary">
                                {kpi.marginRatchets.length} configured
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <KPIActions
                              kpi={kpi}
                              loanId={loan.id}
                              isBorrower={isBorrower}
                            />
                          </TableCell>
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

      {/* Margin Ratchets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Margin Ratchets</CardTitle>
              <CardDescription>
                Configure how loan margins adjust based on KPI performance.
                Ratchets link sustainability targets to financial outcomes.
              </CardDescription>
            </div>
            {isBorrower && kpisForRatchets.length > 0 && (
              <MarginRatchetDialog loanId={loan.id} kpis={kpisForRatchets} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loan.marginRatchets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No margin ratchets configured yet.
              </p>
              {isBorrower && kpisForRatchets.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add and get KPIs accepted first, then configure margin
                  ratchets.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Linked KPI</TableHead>
                  <TableHead>Step Up</TableHead>
                  <TableHead>Step Down</TableHead>
                  <TableHead>Max Adjustment</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loan.marginRatchets.map((ratchet) => (
                  <TableRow key={ratchet.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ratchet.kpi.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ratchet.kpi.unit}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        {formatBps(ratchet.stepUpBps)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        {formatBps(-1 * ratchet.stepDownBps)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        ±{ratchet.maxAdjustmentBps} bps
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <MarginRatchetActions
                        loanId={loan.id}
                        ratchet={ratchet}
                        kpis={kpisForRatchets}
                        isBorrower={isBorrower}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              Your KPIs have been accepted. Connect your cloud providers to
              enable automated, continuous, cloud-native ESG assurance with full
              auditability.
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
