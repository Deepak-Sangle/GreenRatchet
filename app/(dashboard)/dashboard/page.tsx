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
import { getKPIUnit } from "@/lib/utils";
import { Cloud, Plus, Target } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const getDashboardData = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        include: {
          kpis: {
            orderBy: { createdAt: "desc" },
            include: {
              results: {
                orderBy: { periodEnd: "desc" },
                take: 1,
              },
            },
          },
          cloudConnections: {
            where: { isActive: true },
          },
        },
      },
    },
  });
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // First get basic user info to check organization
  const basicUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true, name: true },
  });

  if (!basicUser || !basicUser.organizationId) {
    redirect("/auth/signin");
  }

  // Get cached dashboard data
  const user = await getDashboardData(basicUser.id);

  if (!user || !user.organization) {
    redirect("/auth/signin");
  }

  const kpis = user.organization.kpis;
  const cloudConnections = user.organization.cloudConnections;

  const totalKPIs = kpis.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <Link href="/analytics">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Manage KPIs
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardItem
          title="Total KPIs"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          contentTitle={totalKPIs.toString()}
          contentBody="Tracked sustainability metrics"
        />

        <DashboardItem
          title="Cloud Connections"
          icon={<Cloud className="h-4 w-4 text-muted-foreground" />}
          contentTitle={cloudConnections.length.toString()}
          contentBody="Active data sources"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent KPIs</CardTitle>
          <CardDescription>
            Your organization's key performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kpis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No KPIs yet. Create your first KPI to get started.
              </p>
              <Link href="/kpis/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create KPI
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {kpis.slice(0, 5).map((kpi) => (
                <Link key={kpi.id} href={`/analytics`} className="block">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">{kpi.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Target: {kpi.targetValue} {getKPIUnit(kpi)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {kpi.type.replace(/_/g, " ")}
                      </Badge>
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
