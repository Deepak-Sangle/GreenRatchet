import { auth } from "@/auth";
import { AWSConnectionDialog } from "@/components/cloud/aws-connection-dialog";
import { GCPConnectionDialog } from "@/components/cloud/gcp-connection-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Cloud, XCircle } from "lucide-react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

// Enable caching for this page
export const revalidate = 60; // Revalidate every 60 seconds

// TODO: Replace with your actual AWS account ID
const GREENRATCHET_AWS_ACCOUNT_ID = "123456789012";

async function getCloudConnectionsData(userId: string, organizationId: string) {
  return unstable_cache(
    async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: {
            include: {
              cloudConnections: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });
    },
    [`cloud-${userId}-${organizationId}`],
    {
      revalidate: 60,
      tags: [`cloud-${userId}`, `org-${organizationId}`],
    }
  )();
}

export default async function CloudConnectionsPage() {
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

  // Get cached cloud connections data
  const user = await getCloudConnectionsData(
    basicUser.id,
    basicUser.organizationId
  );

  if (!user || !user.organization) {
    redirect("/auth/signin");
  }

  const connections = user.organization.cloudConnections;
  const awsConnection = connections.find(
    (c) => c.provider === "AWS" && c.isActive
  );
  const gcpConnection = connections.find(
    (c) => c.provider === "GCP" && c.isActive
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cloud Connections</h1>
        <p className="text-muted-foreground mt-2">
          Connect your cloud providers to enable automated ESG data collection
        </p>
      </div>

      <Card className="border-primary/20 bg-accent/30">
        <CardHeader>
          <CardTitle className="text-base">
            Automated, Continuous, Cloud-Native ESG Assurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            By connecting your cloud providers, GreenRatchet automatically
            calculates ESG KPIs using real-time cloud usage data. All
            calculations are versioned, auditable, and transparent. No manual
            PDFs. No verification delays.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6">
                    <path
                      fill="#FF9900"
                      d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335c-.072.048-.144.072-.208.072-.08 0-.16-.04-.239-.112-.112-.12-.207-.248-.279-.384-.072-.135-.144-.287-.224-.463-.56.655-1.263.983-2.095.983-.6 0-1.08-.168-1.448-.512-.36-.344-.544-.808-.544-1.391 0-.616.224-1.12.68-1.496.455-.376 1.055-.567 1.807-.567.248 0 .504.016.767.056.264.04.535.088.816.152v-.503c0-.52-.112-.888-.328-1.096-.224-.207-.6-.312-1.135-.312-.248 0-.504.032-.767.08-.264.048-.52.104-.768.176-.112.032-.2.048-.256.056-.056.008-.096.008-.128.008-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28.04-.056.12-.104.239-.152.248-.128.544-.232.888-.328.344-.096.712-.136 1.104-.136.84 0 1.455.192 1.871.568.416.384.624.968.624 1.76v2.311zm-2.895 1.087c.24 0 .488-.04.744-.128.256-.088.479-.24.671-.44.12-.135.207-.272.247-.423.04-.152.064-.335.064-.551v-.263c-.208-.047-.431-.08-.671-.104-.24-.024-.479-.04-.695-.04-.496 0-.855.096-1.096.295-.24.2-.36.479-.36.855 0 .36.095.624.287.808.184.184.48.271.808.271zm5.696.783c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 4.208c-.048-.16-.072-.264-.072-.32 0-.128.064-.2.191-.2h.783c.151 0 .255.025.319.081.064.048.113.159.161.31l1.367 5.389 1.271-5.389c.032-.16.08-.263.144-.31.064-.048.175-.08.319-.08h.64c.152 0 .256.024.32.08.063.048.119.16.151.31l1.288 5.453 1.407-5.453c.048-.16.104-.263.168-.31.063-.048.167-.08.311-.08h.743c.128 0 .2.063.2.191 0 .04-.009.08-.017.128-.008.048-.024.128-.056.24l-1.968 7.217c-.048.16-.104.264-.168.312-.064.056-.168.08-.312.08h-.688c-.151 0-.255-.024-.319-.08-.064-.056-.12-.16-.151-.32l-1.271-5.285-1.256 5.277c-.032.16-.08.263-.144.319-.064.056-.175.08-.319.08h-.688zm9.775.224c-.4 0-.8-.047-1.192-.135-.392-.096-.68-.2-.863-.32-.112-.071-.191-.151-.231-.223-.04-.072-.064-.151-.064-.223v-.4c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.56.216.856.272.304.056.6.088.903.088.479 0 .847-.088 1.104-.247.256-.16.392-.4.392-.704 0-.2-.064-.375-.191-.528-.128-.151-.4-.295-.791-.423l-1.135-.36c-.576-.183-.991-.447-1.247-.791-.255-.344-.384-.735-.384-1.16 0-.336.072-.631.216-.887.144-.255.336-.479.568-.655.231-.184.504-.32.808-.415.304-.096.624-.136.959-.136.168 0 .344.008.512.032.175.023.336.055.496.087.151.04.295.08.431.127.136.048.247.096.336.144.096.056.167.119.215.191.048.064.072.151.072.263v.375c0 .168-.064.256-.184.256-.064 0-.167-.032-.296-.096-.448-.191-.951-.287-1.512-.287-.44 0-.783.072-1.023.224-.24.151-.36.375-.36.671 0 .2.072.375.207.527.136.152.424.304.855.448l1.111.351c.568.184.976.44 1.216.768.24.328.36.711.36 1.151 0 .344-.072.656-.216.928-.144.272-.344.512-.591.712-.248.2-.543.343-.887.431-.336.096-.711.144-1.12.144z"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">Amazon Web Services</CardTitle>
                  <CardDescription>AWS Cost Explorer & EC2</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {awsConnection ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Connected</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Role ARN:</strong> {awsConnection.roleArn}
                  </p>
                  <p>
                    <strong>Connected:</strong>{" "}
                    {formatDate(awsConnection.createdAt)}
                  </p>
                  {awsConnection.lastSync && (
                    <p>
                      <strong>Last Sync:</strong>{" "}
                      {formatDate(awsConnection.lastSync)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm">Not connected</span>
                </div>
                <AWSConnectionDialog accountId={GREENRATCHET_AWS_ACCOUNT_ID} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Google Cloud Platform
                  </CardTitle>
                  <CardDescription>GCP Billing & Compute</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {gcpConnection ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Connected</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Project ID:</strong> {gcpConnection.projectId}
                  </p>
                  <p>
                    <strong>Connected:</strong>{" "}
                    {formatDate(gcpConnection.createdAt)}
                  </p>
                  {gcpConnection.lastSync && (
                    <p>
                      <strong>Last Sync:</strong>{" "}
                      {formatDate(gcpConnection.lastSync)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm">Not connected</span>
                </div>
                <GCPConnectionDialog />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How We Calculate AI Environmental Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1">
                1. Identify AI Workloads
              </h4>
              <p className="text-sm text-muted-foreground">
                Detect GPU instances (P3, P4, A100, etc.) and ML services
                (SageMaker, Vertex AI) from cloud billing and compute metadata.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">
                2. Calculate Energy Usage
              </h4>
              <p className="text-sm text-muted-foreground">
                Multiply instance hours by GPU power consumption (TDP) to
                estimate total energy consumption in kWh.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">
                3. Apply Regional Carbon Intensity
              </h4>
              <p className="text-sm text-muted-foreground">
                Use regional grid carbon intensity data (gCO₂/kWh) for each
                AWS/GCP region to convert energy to carbon emissions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">4. Track Over Time</h4>
              <p className="text-sm text-muted-foreground">
                Store monthly immutable snapshots with full calculation metadata
                for auditability and trend analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
