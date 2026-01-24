import { AIUsageKPI } from "@/components/kpis/ai-usage-kpi";
import { CarbonFreeEnergyKpi } from "@/components/kpis/carbon-free-energy-kpi";
import { Co2EmissionKpi } from "@/components/kpis/co2-emission-kpi";
import { ElectricityMixKpi } from "@/components/kpis/electricity-mix-kpi";
import { EnergyConsumptionKpi } from "@/components/kpis/energy-consumption-kpi";
import { GhgIntensityKpi } from "@/components/kpis/ghg-intensity-kpi";
import { LowCarbonRegionKpi } from "@/components/kpis/low-carbon-region-kpi";
import { RenewableEnergyKpi } from "@/components/kpis/renewable-energy-kpi";
import { WaterStressedRegionKpi } from "@/components/kpis/water-stressed-region-kpi";
import { WaterWithdrawalKpi } from "@/components/kpis/water-withdrawal-kpi";

export default function KPIsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">
          KPI Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Explore different KPI types to understand how your cloud usage
          performs across a range of sustainability metrics. These insights help
          organizations assess their environmental impact, track progress
          against targets, and align with operational sustainability goals.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Co2EmissionKpi />
        <GhgIntensityKpi />
        <EnergyConsumptionKpi />
        <WaterWithdrawalKpi />
        <AIUsageKPI />
        <LowCarbonRegionKpi />
        <WaterStressedRegionKpi />
        <CarbonFreeEnergyKpi />
        <RenewableEnergyKpi />
        <ElectricityMixKpi />
      </div>
    </div>
  );
}
