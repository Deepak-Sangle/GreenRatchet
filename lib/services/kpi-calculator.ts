/**
 * KPI Calculator Service
 *
 * This service calculates KPI values based on cloud usage data.
 * It implements the logic for different KPI types and formulas.
 */

import { KPI, KPIResultStatus } from "@/app/generated/prisma";
import { CloudUsageData } from "./cloud-data";

export interface KPICalculationResult {
  actualValue: number;
  targetValue: number;
  status: KPIResultStatus;
  calculationDetails: {
    formula: string;
    inputs: Record<string, number | string>;
    steps: string[];
    carbonIntensityUsed?: Record<string, number>;
  };
  dataSource: {
    provider: string;
    timestamp: string;
    regions: string[];
  };
}

/**
 * Calculate KPI value from cloud usage data
 */
export function calculateKPI(
  kpi: KPI,
  cloudData: CloudUsageData
): KPICalculationResult {
  let actualValue: number;
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};

  // Determine KPI type based on name/formula
  // In production, this would be more sophisticated
  const kpiName = kpi.name.toLowerCase();

  if (kpiName.includes("carbon intensity") || kpiName.includes("co2")) {
    // AI Carbon Intensity: tCO₂e / 1,000 AI compute hours
    const co2Tonnes = cloudData.totalCO2Tonnes;
    const computeHoursK = cloudData.aiComputeHours / 1000;

    inputs.totalCO2Tonnes = co2Tonnes;
    inputs.aiComputeHours = cloudData.aiComputeHours;

    steps.push(`Total CO2 emissions: ${co2Tonnes} tCO₂e`);
    steps.push(`Total AI compute hours: ${cloudData.aiComputeHours} hours`);
    steps.push(`Divide by 1,000: ${computeHoursK} (thousand hours)`);

    actualValue = co2Tonnes / computeHoursK;
    steps.push(`AI Carbon Intensity: ${actualValue.toFixed(3)} tCO₂e / 1,000 hours`);
  } else if (kpiName.includes("low-carbon") || kpiName.includes("region")) {
    // % AI workloads in low-carbon regions
    const lowCarbonThreshold = 300; // gCO2/kWh
    const lowCarbonHours = cloudData.regionBreakdown
      .filter((r) => r.carbonIntensity < lowCarbonThreshold)
      .reduce((sum, r) => sum + r.computeHours, 0);

    const totalHours = cloudData.aiComputeHours;
    actualValue = (lowCarbonHours / totalHours) * 100;

    inputs.lowCarbonComputeHours = lowCarbonHours;
    inputs.totalComputeHours = totalHours;
    inputs.lowCarbonThreshold = lowCarbonThreshold;

    steps.push(
      `Regions with carbon intensity < ${lowCarbonThreshold} gCO2/kWh:`
    );
    cloudData.regionBreakdown
      .filter((r) => r.carbonIntensity < lowCarbonThreshold)
      .forEach((r) => {
        steps.push(`  - ${r.region}: ${r.computeHours} hours`);
      });
    steps.push(`Total low-carbon hours: ${lowCarbonHours}`);
    steps.push(`Percentage: ${actualValue.toFixed(2)}%`);
  } else if (kpiName.includes("energy")) {
    // Energy per AI training run (simplified: total energy / number of runs)
    // For demo, assume 1 run per 100 GPU hours
    const estimatedRuns = Math.floor(cloudData.aiComputeHours / 100);
    actualValue = cloudData.totalEnergyKwh / estimatedRuns;

    inputs.totalEnergyKwh = cloudData.totalEnergyKwh;
    inputs.estimatedRuns = estimatedRuns;

    steps.push(`Total energy: ${cloudData.totalEnergyKwh} kWh`);
    steps.push(`Estimated training runs: ${estimatedRuns}`);
    steps.push(`Energy per run: ${actualValue.toFixed(2)} kWh`);
  } else {
    // Default: use carbon intensity
    actualValue = (cloudData.totalCO2Tonnes / cloudData.aiComputeHours) * 1000;
    inputs.calculationType = "default-carbon-intensity";
    steps.push("Using default carbon intensity calculation");
  }

  // Determine status
  const status: KPIResultStatus =
    actualValue <= kpi.targetValue ? "PASSED" : "FAILED";

  // Build carbon intensity map
  const carbonIntensityUsed: Record<string, number> = {};
  cloudData.regionBreakdown.forEach((r) => {
    carbonIntensityUsed[r.region] = r.carbonIntensity;
  });

  return {
    actualValue: Math.round(actualValue * 1000) / 1000,
    targetValue: kpi.targetValue,
    status,
    calculationDetails: {
      formula: kpi.metricFormula,
      inputs,
      steps,
      carbonIntensityUsed,
    },
    dataSource: {
      provider: cloudData.provider,
      timestamp: new Date().toISOString(),
      regions: cloudData.regionBreakdown.map((r) => r.region),
    },
  };
}

/**
 * Calculate calculation version for reproducibility
 */
export function getCalculationVersion(): string {
  return "v1.0.0-hackathon";
}
