import { AiComputeHoursKpi } from "@/components/kpis/ai-compute-hours-kpi";
import { Co2EmissionKpi } from "@/components/kpis/co2-emission-kpi";

export default function KPIsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">
          KPI Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Explore different KPI types to understand how your cloud usage
          performs across various sustainability metrics. Use these insights to
          decide which KPIs to track for your loans.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Co2EmissionKpi />
        <AiComputeHoursKpi />
      </div>
    </div>
  );
}
