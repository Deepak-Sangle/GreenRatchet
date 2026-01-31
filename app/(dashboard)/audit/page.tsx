import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
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
import { formatDate, getKPIUnit } from "@/lib/utils";
import { redirect } from "next/navigation";

const getAuditLogsData = async (userId: string, organizationId: string) => {
  return prisma.auditLog.findMany({
    where: {
      OR: [{ userId: userId }, { organizationId: organizationId }],
    },
    include: {
      user: true,
      kpi: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
};

export default async function AuditTrailPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // First get basic user info to check organization
  const basicUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true },
  });

  if (!basicUser || !basicUser.organizationId) {
    redirect("/auth/signin");
  }

  // Get cached audit logs data
  const auditLogs = await getAuditLogsData(
    basicUser.id,
    basicUser.organizationId,
  );

  const actionBadgeVariant = (action: string) => {
    if (action.includes("CREATED")) return "default";
    if (action.includes("ACCEPTED")) return "success";
    if (action.includes("REJECTED")) return "destructive";
    if (action.includes("CALCULATED")) return "outline";
    return "secondary";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <p className="text-muted-foreground mt-2">
          Complete history of all actions and calculations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Full auditability of KPI lifecycle, calculations, and data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No audit logs yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => {
                  let details;
                  try {
                    details = JSON.parse(log.details);
                  } catch {
                    details = {};
                  }

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={actionBadgeVariant(log.action)}>
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.entity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.user?.name || "System"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {details.kpiName && (
                          <div>
                            <strong>KPI:</strong> {details.kpiName}
                          </div>
                        )}

                        {details.actualValue !== undefined && (
                          <div>
                            <strong>Value:</strong> {details.actualValue}
                            {log.kpi && getKPIUnit(log.kpi) && (
                              <span> {getKPIUnit(log.kpi)}</span>
                            )}{" "}
                            ({details.status})
                          </div>
                        )}
                        {details.provider && (
                          <div>
                            <strong>Provider:</strong> {details.provider}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-accent/30">
        <CardHeader>
          <CardTitle className="text-base">Full Auditability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Every action in the system is logged with timestamp, user, and
            details. KPI calculations include data source, formula, inputs, and
            step-by-step execution for complete transparency and
            reproducibility.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
