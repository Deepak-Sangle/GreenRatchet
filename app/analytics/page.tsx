import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organization: {
        include: {
          borrowerLoans: {
            include: {
              kpis: {
                where: { status: "ACCEPTED" },
                include: {
                  results: {
                    orderBy: { createdAt: "desc" },
                    take: 6,
                  },
                },
              },
            },
          },
          lenderLoans: {
            include: {
              kpis: {
                where: { status: "ACCEPTED" },
                include: {
                  results: {
                    orderBy: { createdAt: "desc" },
                    take: 6,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.organization) {
    redirect("/auth/signin");
  }

  const isBorrower = user.role === "BORROWER";
  const loans = isBorrower
    ? user.organization.borrowerLoans
    : user.organization.lenderLoans;

  const allKPIs = loans.flatMap((loan) => loan.kpis);
  const totalResults = allKPIs.reduce(
    (sum, kpi) => sum + kpi.results.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KPI Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track environmental performance across all your SLL deals
        </p>
      </div>

      {totalResults === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No KPI Results Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {isBorrower
                ? "Connect your cloud providers and trigger KPI calculations to see analytics here."
                : "Once the borrower connects their cloud providers and KPI calculations run, you'll see analytics here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {allKPIs.map((kpi) => {

            const latestResult = kpi.results[0];

            return (
              <Card key={kpi.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{kpi.name}</CardTitle>
                      <CardDescription>{kpi.definition}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        latestResult.status === "PASSED" ? "success" : "destructive"
                      }
                    >
                      {latestResult.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Latest Value
                      </p>
                      <p className="text-2xl font-bold">
                        {latestResult.actualValue.toFixed(2)} {kpi.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Target
                      </p>
                      <p className="text-2xl font-bold">
                        {latestResult.targetValue.toFixed(2)} {kpi.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Performance
                      </p>
                      <p className="text-2xl font-bold">
                        {(
                          ((latestResult.targetValue - latestResult.actualValue) /
                            latestResult.targetValue) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      Calculation Details
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-1">
                      {(() => {
                        try {
                          const details = JSON.parse(latestResult.calculationDetails);
                          return details.steps?.map((step: string, i: number) => (
                            <div key={i} className="text-muted-foreground">
                              {step}
                            </div>
                          ));
                        } catch {
                          return <div>Calculation details unavailable</div>;
                        }
                      })()}
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 text-xs text-muted-foreground">
                    <div>
                      <strong>Data Source:</strong>{" "}
                      {(() => {
                        try {
                          const source = JSON.parse(latestResult.dataSource);
                          return source.provider;
                        } catch {
                          return "Unknown";
                        }
                      })()}
                    </div>
                    <div>
                      <strong>Calculation Version:</strong>{" "}
                      {latestResult.calculationVersion}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-primary/20 bg-accent/30">
        <CardHeader>
          <CardTitle className="text-base">
            Automated, Continuous ESG Assurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All KPI calculations are automated, versioned, and fully auditable.
            Every calculation includes the data source, formula, inputs, and
            step-by-step details for complete transparency.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
