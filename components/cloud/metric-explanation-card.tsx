import { ExternalLink, Info } from "lucide-react";
import { Card, CardHeader } from "../ui/card";

export function MetricExplanationCard() {
  return (
    <Card className="border-primary/20 bg-accent/20">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-sm">
              Understanding Operational vs Embodied Metrics
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="font-medium">Operational Metrics</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Operational metrics capture the energy consumed and emissions
                  produced while cloud resources are actively running—such as
                  compute, storage, and networking. These metrics reflect
                  real-time usage and change directly with workload demand,
                  architecture choices, and regional deployment decisions.
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: "hsl(152, 58%, 58%)" }}
                  />
                  <span className="font-medium">Embodied Metrics</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Embodied metrics represent the emissions associated with the
                  physical lifecycle of cloud infrastructure, including
                  manufacturing, transportation, and end-of-life disposal of
                  hardware. These impacts are typically allocated over the
                  expected lifespan of the equipment (commonly around four years
                  for servers), providing a long-term view of
                  infrastructure-related emissions beyond day-to-day operations.{" "}
                  <a
                    href="https://www.oxygenit.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Source: OxygenIT
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
