import { auth } from "@/auth";
import { AWSConnectionDialog } from "@/components/cloud/aws-connection-dialog";
import { DisconnectCloudButton } from "@/components/cloud/disconnect-cloud-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Cloud, Database, Server, XCircle } from "lucide-react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

// Enable caching for this page
export const revalidate = 60; // Revalidate every 60 seconds

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
          Connect your cloud providers and infrastructure to enable automated
          ESG data collection
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
            calculations are versioned, auditable, and transparent.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                    alt="Amazon Web Services"
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">Amazon Web Services</CardTitle>
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
                <div className="pt-2">
                  <DisconnectCloudButton
                    connectionId={awsConnection.id}
                    provider="AWS"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm">Not connected</span>
                </div>
                <AWSConnectionDialog />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Cloud Platform - Coming Soon */}
        <Card className="opacity-60">
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
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-5 w-5" />
                <span className="text-sm">Not connected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                GCP integration is under development and will be available soon.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Microsoft Azure - Coming Soon */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-sky-100 flex items-center justify-center">
                  <Server className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Microsoft Azure</CardTitle>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-5 w-5" />
                <span className="text-sm">Not connected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Azure integration is under development and will be available
                soon.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* On-Premise - Coming Soon */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Database className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">On-Premise</CardTitle>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-5 w-5" />
                <span className="text-sm">Not connected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                On-premise infrastructure integration is under development and
                will be available soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            How We Calculate Cloud Usage Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Our methodology is built upon Etsy&apos;s Cloud Jewels approach. We
            calculate CO₂e estimates using:{" "}
            <strong>
              Total CO₂e = Operational Emissions + Embodied Emissions
            </strong>
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">
                1. Collect & Classify Cloud Usage
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                We query cloud provider billing and usage APIs to provide a
                holistic understanding of your emissions:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-2">
                <li>
                  <strong>AWS:</strong> Cost and Usage data via Cloudwatch and
                  Cost Explorer
                </li>
                {/* <li>
                  <strong>GCP:</strong> Billing Export Table using BigQuery
                </li>
                <li>
                  <strong>Azure:</strong> Consumption Management API
                </li> */}
              </ul>
              <p className="text-sm text-muted-foreground">
                This pulls usage and cost data from all linked accounts in your
                cloud organization. We validate and classify each usage line
                item as <strong>Compute</strong>, <strong>Storage</strong>,{" "}
                <strong>Networking</strong>, or <strong>Memory</strong>, based
                on pricing units (hours/seconds for compute,
                byte-seconds/GB-months for storage, bytes/GB for networking) and
                detailed usage type metadata.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">
                2. Calculate Hourly Compute & Load Usage
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                For more accurate energy estimation, we calculate the average
                compute energy consumption based on server utilization. By
                tracking hourly compute usage and load patterns, we can more
                accurately estimate energy consumption rather than using
                constant average utilization assumptions. This provides better
                accuracy compared to billing-data-only approaches that use fixed
                CPU utilization constants.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">
                3. Estimate Energy Consumption (Watt-Hours)
              </h4>
              <p className="text-sm text-muted-foreground">
                We then apply each cloud provider&apos;s Power Usage
                Effectiveness (PUE) factor to account for data center overhead
                (cooling, lighting, etc.).
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">
                4. Apply Regional Carbon Intensity
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                We convert energy consumption to carbon emissions using regional
                grid carbon intensity factors (metric tons CO₂e per kWh) for
                each cloud provider region:
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>
                  Operational Emissions = (Cloud Usage) × (Energy Conversion
                  Factors [kWh]) × (PUE) × (Grid Emissions Factors [metric tons
                  CO₂e])
                </strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Carbon intensity varies significantly by region. We use the most
                recent publicly available data from sources like oxygenit.io,
                ensuring location-based emissions reflect the actual grid mix
                where your cloud resources operate.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">
                5. Include Embodied Emissions & Track Over Time
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                We also account for embodied emissions—the carbon footprint from
                manufacturing datacenter servers and hardware. This is
                calculated based on estimated CO₂e emissions per instance type.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
