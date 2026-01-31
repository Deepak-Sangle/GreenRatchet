import { Prisma } from "@/app/generated/prisma/client";
import { CloudProvider } from "@/app/generated/schemas/schemas";
import { auth } from "@/auth";
import { AWSConnectionDialog } from "@/components/cloud/aws-connection-dialog";
import { DisconnectCloudButton } from "@/components/cloud/disconnect-cloud-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { cn, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Cloud,
  Server,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { match } from "ts-pattern";

type CloudConnection = Prisma.CloudConnectionGetPayload<{}>;

interface SupportedCloud {
  id: string;
  name: string;
  logo: string;
  provider: CloudProvider;
  connectionName: string;
  bgColor: string;
}

interface UnsupportedCloud {
  id: string;
  name: string;
  provider: CloudProvider;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  description: string;
}

const SUPPORTED_CLOUD: SupportedCloud[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    provider: "AWS",
    connectionName: "Role ARN",
    bgColor: "bg-orange-100",
  },
];

const UNSUPPORTED_CLOUD: UnsupportedCloud[] = [
  {
    id: "gcp",
    name: "Google Cloud Platform",
    provider: "GCP",
    icon: Cloud,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    description:
      "GCP integration is under development and will be available soon.",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    provider: "AZURE",
    icon: Server,
    iconColor: "text-sky-600",
    bgColor: "bg-sky-100",
    description:
      "Azure integration is under development and will be available soon.",
  },
  // {
  //   id: "on-premise",
  //   name: "On-Premise",
  //   provider: "On-Premise",
  //   icon: Database,
  //   iconColor: "text-slate-600",
  //   bgColor: "bg-slate-100",
  //   description:
  //     "On-premise infrastructure integration is under development and will be available soon.",
  // },
];

function SupportedCloudCard({
  cloud,
  connection,
}: {
  cloud: SupportedCloud;
  connection?: CloudConnection;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center",
                cloud.bgColor,
              )}
            >
              <img
                src={cloud.logo}
                alt={cloud.name}
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-lg">{cloud.name}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cloud already connected */}
        {connection ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Connected</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>{cloud.connectionName}:</strong>{" "}
                {match(cloud.provider)
                  .with("AWS", () => connection.roleArn)
                  .with("GCP", () => connection.projectId)
                  .with("AZURE", () => connection.tenantId)
                  .otherwise(() => "N/A")}
              </p>
              <p>
                <strong>Connected:</strong> {formatDate(connection.createdAt)}
              </p>
              {connection.lastSync && (
                <p>
                  <strong>Last Sync:</strong> {formatDate(connection.lastSync)}
                </p>
              )}
            </div>
            <div className="pt-2">
              <DisconnectCloudButton
                connectionId={connection.id}
                provider={cloud.provider}
              />
            </div>
          </div>
        ) : (
          // No connection yet
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-5 w-5" />
              <span className="text-sm">Not connected</span>
            </div>
            {cloud.provider === "AWS" && <AWSConnectionDialog />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UnsupportedCloudCard({ cloud }: { cloud: UnsupportedCloud }) {
  const Icon = cloud.icon;
  return (
    <Card className="opacity-60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center",
                cloud.bgColor,
              )}
            >
              <Icon className={cn("h-6 w-6", cloud.iconColor)} />
            </div>
            <div>
              <CardTitle className="text-lg">{cloud.name}</CardTitle>
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
          <p className="text-xs text-muted-foreground">{cloud.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const getCloudConnectionsData = async (userId: string) => {
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
};

export default async function CloudConnectionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get cached cloud connections data
  const user = await getCloudConnectionsData(session.user.id);

  if (!user || !user.organization) {
    redirect("/auth/signin");
  }

  const connections = user.organization.cloudConnections;

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
        {SUPPORTED_CLOUD.map((cloud) => (
          <SupportedCloudCard
            key={cloud.id}
            cloud={cloud}
            connection={connections.find(
              (c) => c.provider === cloud.provider && c.isActive,
            )}
          />
        ))}

        {UNSUPPORTED_CLOUD.map((cloud) => (
          <UnsupportedCloudCard key={cloud.id} cloud={cloud} />
        ))}
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
