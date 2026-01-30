/**
 * KPI Calculator Service
 *
 * This service calculates KPI values based on cloud footprint data.
 * It implements real calculation logic for different KPI types.
 */

import type {
  KPI,
  KPIResultStatus,
  KpiDirection,
} from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isAIInstance } from "../constants";
import {
  buildCloudFootprintWhereClause,
  getCo2eByRegion,
  getCo2eByService,
  getEnergyByService,
  getOrganizationConnectionIds,
  getTotalCo2e,
  getTotalEnergy,
  getWaterWithdrawalByRegion,
} from "./cloud-data-service";
import {
  calculateEnergySourcePercentages,
  calculateTotalRenewableMix,
  calculateWeightedElectricityMix,
} from "./electricity-mix-service";

export interface KPICalculationResult {
  actualValue: number;
  targetValue: number;
  status: KPIResultStatus;
  calculationDetails: {
    formula: string;
    inputs: Record<string, number | string>;
    steps: string[];
    breakdown?: {
      byRegion?: Record<string, number>;
      byService?: Record<string, number>;
      byEnergySource?: Record<string, number>;
    };
  };
  dataSource: {
    provider: string[];
    timestamp: string;
    regions: string[];
    periodStart: Date;
    periodEnd: Date;
  };
}

/**
 * Main KPI calculation function that routes to type-specific calculators
 */
export async function calculateKPI(
  kpi: Pick<KPI, "type" | "targetValue" | "direction">,
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<KPICalculationResult> {
  const targetValue = Number(kpi.targetValue);
  const direction = kpi.direction;

  switch (kpi.type) {
    case "CO2_EMISSION":
      return calculateCO2Emission(
        organizationId,
        periodStart,
        periodEnd,
        targetValue,
        direction,
      );
    case "ENERGY_CONSUMPTION":
      return calculateEnergyConsumption(
        organizationId,
        periodStart,
        periodEnd,
        targetValue,
        direction,
      );
    case "WATER_WITHDRAWAL":
      return calculateWaterWithdrawal(
        organizationId,
        periodStart,
        periodEnd,
        targetValue,
        direction,
      );
    case "AI_COMPUTE_HOURS":
      return calculateAIComputeHours(
        organizationId,
        periodStart,
        periodEnd,
        targetValue,
        direction,
      );
    case "LOW_CARBON_REGION_PERCENTAGE":
      return calculateLowCarbonRegionPercentage(
        organizationId,
        periodStart,
        periodEnd,
        targetValue,
        direction,
      );
    case "CARBON_FREE_ENERGY_PERCENTAGE":
      return calculateCarbonFreeEnergyPercentage(
        organizationId,
        periodStart,
        periodEnd,
        targetValue,
        direction,
      );
    case "RENEWABLE_ENERGY_PERCENTAGE":
      return calculateRenewableEnergyPercentage(
        organizationId,
        periodStart,
        periodEnd,
        targetValue,
        direction,
      );
    case "ELECTRICITY_MIX_BREAKDOWN":
      return calculateElectricityMixBreakdown(
        organizationId,
        periodStart,
        periodEnd,
        targetValue,
        direction,
      );
    default:
      throw new Error(`Unsupported KPI type: ${kpi.type}`);
  }
}

/**
 * Helper function to determine KPI status based on direction
 */
function determineStatus(
  actualValue: number,
  targetValue: number,
  direction: KpiDirection,
): KPIResultStatus {
  if (direction === "LOWER_IS_BETTER") {
    return actualValue <= targetValue ? "PASSED" : "FAILED";
  } else {
    return actualValue >= targetValue ? "PASSED" : "FAILED";
  }
}

/**
 * Calculate calculation version for reproducibility
 */
export function getCalculationVersion(): string {
  return "v1.0.0";
}

/**
 * Calculate CO2 emission KPI by summing co2e from CloudFootprint records
 */
async function calculateCO2Emission(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection,
): Promise<KPICalculationResult> {
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};

  // Use shared service to get total CO2e
  const totalCO2 = await getTotalCo2e(organizationId, periodStart, periodEnd);

  // If no cloud usage data, return 0 emissions (which is good - no usage)
  if (totalCO2 === 0) {
    inputs.totalCO2Tonnes = 0;
    steps.push(`No cloud usage data found for the specified period`);
    steps.push(
      `Total CO2 emissions: 0 metric tons (no cloud workloads detected)`,
    );

    return {
      actualValue: 0,
      targetValue,
      status: determineStatus(0, targetValue, direction),
      calculationDetails: {
        formula: "Total CO2 Emissions = Σ(CO2e from CloudFootprint)",
        inputs,
        steps,
        breakdown: { byRegion: {}, byService: {} },
      },
      dataSource: {
        provider: [],
        timestamp: new Date().toISOString(),
        regions: [],
        periodStart,
        periodEnd,
      },
    };
  }

  inputs.totalCO2Tonnes = totalCO2;
  steps.push(`Aggregated CO2 emissions from CloudFootprint records`);
  steps.push(`Total CO2 emissions: ${totalCO2.toFixed(3)} metric tons`);

  // Use shared service to get breakdowns
  const byRegion = await getCo2eByRegion(
    organizationId,
    periodStart,
    periodEnd,
  );
  const byService = await getCo2eByService(
    organizationId,
    periodStart,
    periodEnd,
  );

  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { provider: true },
  });

  const providers = [...new Set(connections.map((c) => c.provider as string))];
  const regions = Object.keys(byRegion);
  const status = determineStatus(totalCO2, targetValue, direction);

  return {
    actualValue: Math.round(totalCO2 * 1000) / 1000,
    targetValue,
    status,
    calculationDetails: {
      formula: "Sum of co2e from all CloudFootprint records",
      inputs,
      steps,
      breakdown: { byRegion, byService },
    },
    dataSource: {
      provider: providers,
      timestamp: new Date().toISOString(),
      regions,
      periodStart,
      periodEnd,
    },
  };
}

/**
 * Calculate energy consumption KPI by summing kilowattHours from CloudFootprint records
 */
async function calculateEnergyConsumption(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection,
): Promise<KPICalculationResult> {
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};

  // Use shared service to get total energy
  const totalEnergy = await getTotalEnergy(
    organizationId,
    periodStart,
    periodEnd,
  );

  if (totalEnergy === 0) {
    inputs.totalEnergyKwh = 0;
    steps.push(`No energy consumption data found for the specified period`);
    steps.push(`Total energy consumption: 0 kWh (no cloud workloads detected)`);

    return {
      actualValue: 0,
      targetValue,
      status: determineStatus(0, targetValue, direction),
      calculationDetails: {
        formula: "Sum of kilowattHours from all CloudFootprint records",
        inputs,
        steps,
        breakdown: { byService: {} },
      },
      dataSource: {
        provider: [],
        timestamp: new Date().toISOString(),
        regions: [],
        periodStart,
        periodEnd,
      },
    };
  }

  inputs.totalEnergyKwh = totalEnergy;
  steps.push(`Aggregated energy consumption from CloudFootprint records`);
  steps.push(`Total energy consumption: ${totalEnergy.toFixed(2)} kWh`);

  // Use shared service to get breakdown by service
  const byService = await getEnergyByService(
    organizationId,
    periodStart,
    periodEnd,
  );

  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { provider: true },
  });

  const connectionIds = await getOrganizationConnectionIds(organizationId);
  const regionalData = await prisma.cloudFootprint.groupBy({
    by: ["region"],
    where: buildCloudFootprintWhereClause(
      connectionIds,
      periodStart,
      periodEnd,
      {
        kilowattHours: { not: null },
      },
    ),
    _sum: { kilowattHours: true },
  });

  const providers = [...new Set(connections.map((c) => c.provider as string))];
  const regions = regionalData.map((r) => r.region);
  const status = determineStatus(totalEnergy, targetValue, direction);

  return {
    actualValue: Math.round(totalEnergy * 100) / 100,
    targetValue,
    status,
    calculationDetails: {
      formula: "Sum of kilowattHours from all CloudFootprint records",
      inputs,
      steps,
      breakdown: { byService },
    },
    dataSource: {
      provider: providers,
      timestamp: new Date().toISOString(),
      regions,
      periodStart,
      periodEnd,
    },
  };
}

/**
 * Calculate water withdrawal KPI using WUE factors and energy data
 */
async function calculateWaterWithdrawal(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection,
): Promise<KPICalculationResult> {
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};

  // Use shared service to get water withdrawal
  const { total: totalWaterLiters, byRegion } =
    await getWaterWithdrawalByRegion(organizationId, periodStart, periodEnd);

  if (totalWaterLiters === 0) {
    inputs.totalWaterLiters = 0;
    steps.push(`No energy consumption data found for the specified period`);
    steps.push(
      `Total water withdrawal: 0 liters (no cloud workloads detected)`,
    );

    return {
      actualValue: 0,
      targetValue,
      status: determineStatus(0, targetValue, direction),
      calculationDetails: {
        formula: "Sum of (kilowattHours × WUE factor) for each region",
        inputs,
        steps,
        breakdown: { byRegion: {} },
      },
      dataSource: {
        provider: [],
        timestamp: new Date().toISOString(),
        regions: [],
        periodStart,
        periodEnd,
      },
    };
  }

  inputs.totalWaterLiters = totalWaterLiters;
  steps.push(`Calculating water withdrawal using WUE factors`);
  steps.push(`Formula: Water (liters) = Energy (kWh) × WUE (L/kWh)`);

  // Add regional breakdown to steps
  Object.entries(byRegion).forEach(([region, waterLiters]) => {
    steps.push(`  ${region}: ${waterLiters.toFixed(2)} L`);
  });

  steps.push(`Total water withdrawal: ${totalWaterLiters.toFixed(2)} liters`);

  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { provider: true },
  });

  const providers = [...new Set(connections.map((c) => c.provider as string))];
  const regions = Object.keys(byRegion);
  const status = determineStatus(totalWaterLiters, targetValue, direction);

  return {
    actualValue: Math.round(totalWaterLiters * 100) / 100,
    targetValue,
    status,
    calculationDetails: {
      formula: "Sum of (kilowattHours × WUE factor) for each region",
      inputs,
      steps,
      breakdown: { byRegion },
    },
    dataSource: {
      provider: providers,
      timestamp: new Date().toISOString(),
      regions,
      periodStart,
      periodEnd,
    },
  };
}

/**
 * Calculate AI compute hours KPI by identifying EC2 GPU instances
 */
async function calculateAIComputeHours(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection,
): Promise<KPICalculationResult> {
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};

  const connectionIds = await getOrganizationConnectionIds(organizationId);

  // Get EC2 GPU instances only (matches ai-usage-calculator approach)
  const ec2Data = await prisma.cloudFootprint.findMany({
    where: buildCloudFootprintWhereClause(
      connectionIds,
      periodStart,
      periodEnd,
      {
        serviceName: "EC2",
        serviceType: { not: null },
        kilowattHours: { not: null },
      },
    ),
    select: { serviceType: true, kilowattHours: true, region: true },
  });

  // Filter to only AI/ML GPU instances
  const aiData = ec2Data.filter((record) => isAIInstance(record.serviceType));

  // If no AI/ML usage data, return 0 compute hours (which is good - no usage)
  if (aiData.length === 0) {
    inputs.totalComputeHours = 0;
    inputs.avgGpuPowerKw = 0.3;
    steps.push(`No EC2 GPU instance usage found for the specified period`);
    steps.push(`Total compute hours: 0 (no AI/ML workloads detected)`);

    return {
      actualValue: 0,
      targetValue,
      status: determineStatus(0, targetValue, direction),
      calculationDetails: {
        formula: "Total AI/ML Compute Hours = Σ(kWh / Average GPU Power in kW)",
        inputs,
        steps,
        breakdown: { byService: {} },
      },
      dataSource: {
        provider: [],
        timestamp: new Date().toISOString(),
        regions: [],
        periodStart,
        periodEnd,
      },
    };
  }

  const avgGpuPowerKw = 0.3;
  let totalComputeHours = 0;
  const byService: Record<string, number> = {};

  steps.push(`Identifying EC2 GPU instances for AI/ML workloads`);
  steps.push(`Instance types: p3, p4, p5, g4, g5, inf1, inf2, trn1`);
  steps.push(`Assumption: Average GPU power = 300W`);

  aiData.forEach((record) => {
    if (record.kilowattHours !== null) {
      const computeHours = record.kilowattHours / avgGpuPowerKw;
      totalComputeHours += computeHours;
      const instanceFamily = record.serviceType?.split(".")[0] || "unknown";
      byService[instanceFamily] =
        (byService[instanceFamily] || 0) + computeHours;
    }
  });

  inputs.totalComputeHours = totalComputeHours;
  inputs.avgGpuPowerKw = avgGpuPowerKw;
  steps.push(`Total AI compute hours: ${totalComputeHours.toFixed(2)} hours`);

  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { provider: true },
  });

  const providers = [...new Set(connections.map((c) => c.provider as string))];
  const regions = [...new Set(aiData.map((d) => d.region))];
  const status = determineStatus(totalComputeHours, targetValue, direction);

  return {
    actualValue: Math.round(totalComputeHours * 100) / 100,
    targetValue,
    status,
    calculationDetails: {
      formula: "Sum of (kilowattHours / avgGpuPowerKw) for AI/ML services",
      inputs,
      steps,
      breakdown: { byService },
    },
    dataSource: {
      provider: providers,
      timestamp: new Date().toISOString(),
      regions,
      periodStart,
      periodEnd,
    },
  };
}

/**
 * Calculate low carbon region percentage using 300 gCO2/kWh threshold
 */
async function calculateLowCarbonRegionPercentage(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection,
): Promise<KPICalculationResult> {
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};
  const lowCarbonThreshold = 300;

  const connectionIds = await getOrganizationConnectionIds(organizationId);

  const regionalData = await prisma.cloudFootprint.groupBy({
    by: ["region"],
    where: buildCloudFootprintWhereClause(
      connectionIds,
      periodStart,
      periodEnd,
      {
        kilowattHours: { not: null },
      },
    ),
    _sum: { kilowattHours: true, co2e: true },
  });

  if (regionalData.length === 0) {
    inputs.lowCarbonEnergy = 0;
    inputs.totalEnergy = 0;
    inputs.lowCarbonThreshold = lowCarbonThreshold;
    steps.push(`No regional energy data found for the specified period`);
    steps.push(
      `Low-carbon region percentage: 0% (no cloud workloads detected)`,
    );

    return {
      actualValue: 0,
      targetValue,
      status: determineStatus(0, targetValue, direction),
      calculationDetails: {
        formula: "(Energy in regions with <300 gCO2/kWh / Total energy) × 100",
        inputs,
        steps,
        breakdown: { byRegion: {} },
      },
      dataSource: {
        provider: [],
        timestamp: new Date().toISOString(),
        regions: [],
        periodStart,
        periodEnd,
      },
    };
  }

  let totalEnergy = 0;
  let lowCarbonEnergy = 0;
  const byRegion: Record<string, number> = {};

  steps.push(`Calculating percentage of energy in low-carbon regions`);
  steps.push(`Low-carbon threshold: ${lowCarbonThreshold} gCO2/kWh`);

  regionalData.forEach((r) => {
    if (r._sum.kilowattHours !== null && r._sum.co2e !== null) {
      const energy = r._sum.kilowattHours;
      const carbonIntensity = (r._sum.co2e * 1000000) / energy;
      totalEnergy += energy;

      if (carbonIntensity < lowCarbonThreshold) {
        lowCarbonEnergy += energy;
        byRegion[r.region] = energy;
        steps.push(
          `  ${r.region}: ${carbonIntensity.toFixed(2)} gCO2/kWh (LOW CARBON) - ${energy.toFixed(2)} kWh`,
        );
      } else {
        steps.push(
          `  ${r.region}: ${carbonIntensity.toFixed(2)} gCO2/kWh - ${energy.toFixed(2)} kWh`,
        );
      }
    }
  });

  const percentage = (lowCarbonEnergy / totalEnergy) * 100;

  inputs.lowCarbonEnergy = lowCarbonEnergy;
  inputs.totalEnergy = totalEnergy;
  inputs.lowCarbonThreshold = lowCarbonThreshold;
  steps.push(`Low-carbon energy: ${lowCarbonEnergy.toFixed(2)} kWh`);
  steps.push(`Total energy: ${totalEnergy.toFixed(2)} kWh`);
  steps.push(`Percentage: ${percentage.toFixed(2)}%`);

  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { provider: true },
  });

  const providers = [...new Set(connections.map((c) => c.provider as string))];
  const regions = regionalData.map((r) => r.region);
  const status = determineStatus(percentage, targetValue, direction);

  return {
    actualValue: Math.round(percentage * 100) / 100,
    targetValue,
    status,
    calculationDetails: {
      formula: "(Energy in regions with <300 gCO2/kWh / Total energy) × 100",
      inputs,
      steps,
      breakdown: { byRegion },
    },
    dataSource: {
      provider: providers,
      timestamp: new Date().toISOString(),
      regions,
      periodStart,
      periodEnd,
    },
  };
}

/**
 * Calculate carbon free energy percentage using GridCarbonFreeEnergy data
 */
async function calculateCarbonFreeEnergyPercentage(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection,
): Promise<KPICalculationResult> {
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};

  const connectionIds = await getOrganizationConnectionIds(organizationId);

  const regionalEnergy = await prisma.cloudFootprint.groupBy({
    by: ["region", "cloudProvider"],
    where: buildCloudFootprintWhereClause(
      connectionIds,
      periodStart,
      periodEnd,
      {
        kilowattHours: { not: null },
      },
    ),
    _sum: { kilowattHours: true },
  });

  if (regionalEnergy.length === 0) {
    inputs.weightedAvgCFE = 0;
    inputs.totalEnergy = 0;
    steps.push(`No energy data found for the specified period`);
    steps.push(`Weighted average CFE: 0% (no cloud workloads detected)`);

    return {
      actualValue: 0,
      targetValue,
      status: determineStatus(0, targetValue, direction),
      calculationDetails: {
        formula:
          "Weighted average of GridCarbonFreeEnergy values by energy consumption",
        inputs,
        steps,
        breakdown: { byRegion: {} },
      },
      dataSource: {
        provider: [],
        timestamp: new Date().toISOString(),
        regions: [],
        periodStart,
        periodEnd,
      },
    };
  }

  let totalWeightedCFE = 0;
  let totalEnergy = 0;
  const byRegion: Record<string, number> = {};

  steps.push(`Calculating weighted average carbon-free energy percentage`);

  for (const r of regionalEnergy) {
    if (r._sum.kilowattHours !== null) {
      const energy = r._sum.kilowattHours;

      const cfeData = await prisma.gridCarbonFreeEnergy.findFirst({
        where: {
          dataCenterRegion: r.region,
          dataCenterProvider: r.cloudProvider as "AWS" | "GCP" | "AZURE",
          datetime: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { datetime: "desc" },
      });

      const cfePercentage = cfeData?.value ?? 0;
      totalWeightedCFE += energy * cfePercentage;
      totalEnergy += energy;
      byRegion[r.region] = cfePercentage;

      steps.push(
        `  ${r.region}: ${cfePercentage.toFixed(2)}% CFE, ${energy.toFixed(2)} kWh`,
      );
    }
  }

  const weightedAvgCFE = totalEnergy > 0 ? totalWeightedCFE / totalEnergy : 0;

  inputs.weightedAvgCFE = weightedAvgCFE;
  inputs.totalEnergy = totalEnergy;
  steps.push(`Weighted average CFE: ${weightedAvgCFE.toFixed(2)}%`);

  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { provider: true },
  });

  const providers = [...new Set(connections.map((c) => c.provider as string))];
  const regions = regionalEnergy.map((r) => r.region);
  const status = determineStatus(weightedAvgCFE, targetValue, direction);

  return {
    actualValue: Math.round(weightedAvgCFE * 100) / 100,
    targetValue,
    status,
    calculationDetails: {
      formula:
        "Weighted average of GridCarbonFreeEnergy values by energy consumption",
      inputs,
      steps,
      breakdown: { byRegion },
    },
    dataSource: {
      provider: providers,
      timestamp: new Date().toISOString(),
      regions,
      periodStart,
      periodEnd,
    },
  };
}

/**
 * Calculate renewable energy percentage using GridRenewableEnergy data
 */
async function calculateRenewableEnergyPercentage(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection,
): Promise<KPICalculationResult> {
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};

  const connectionIds = await getOrganizationConnectionIds(organizationId);

  const regionalEnergy = await prisma.cloudFootprint.groupBy({
    by: ["region", "cloudProvider"],
    where: buildCloudFootprintWhereClause(
      connectionIds,
      periodStart,
      periodEnd,
      {
        kilowattHours: { not: null },
      },
    ),
    _sum: { kilowattHours: true },
  });

  if (regionalEnergy.length === 0) {
    inputs.weightedAvgRenewable = 0;
    inputs.totalEnergy = 0;
    steps.push(`No energy data found for the specified period`);
    steps.push(
      `Weighted average renewable energy: 0% (no cloud workloads detected)`,
    );

    return {
      actualValue: 0,
      targetValue,
      status: determineStatus(0, targetValue, direction),
      calculationDetails: {
        formula:
          "Weighted average of GridRenewableEnergy values by energy consumption",
        inputs,
        steps,
        breakdown: { byRegion: {} },
      },
      dataSource: {
        provider: [],
        timestamp: new Date().toISOString(),
        regions: [],
        periodStart,
        periodEnd,
      },
    };
  }

  let totalWeightedRenewable = 0;
  let totalEnergy = 0;
  const byRegion: Record<string, number> = {};

  steps.push(`Calculating weighted average renewable energy percentage`);

  for (const r of regionalEnergy) {
    if (r._sum.kilowattHours !== null) {
      const energy = r._sum.kilowattHours;

      const renewableData = await prisma.gridRenewableEnergy.findFirst({
        where: {
          dataCenterRegion: r.region,
          dataCenterProvider: r.cloudProvider as "AWS" | "GCP" | "AZURE",
          datetime: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { datetime: "desc" },
      });

      const renewablePercentage = renewableData?.value ?? 0;
      totalWeightedRenewable += energy * renewablePercentage;
      totalEnergy += energy;
      byRegion[r.region] = renewablePercentage;

      steps.push(
        `  ${r.region}: ${renewablePercentage.toFixed(2)}% renewable, ${energy.toFixed(2)} kWh`,
      );
    }
  }

  const weightedAvgRenewable =
    totalEnergy > 0 ? totalWeightedRenewable / totalEnergy : 0;

  inputs.weightedAvgRenewable = weightedAvgRenewable;
  inputs.totalEnergy = totalEnergy;
  steps.push(
    `Weighted average renewable energy: ${weightedAvgRenewable.toFixed(2)}%`,
  );

  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { provider: true },
  });

  const providers = [...new Set(connections.map((c) => c.provider as string))];
  const regions = regionalEnergy.map((r) => r.region);
  const status = determineStatus(weightedAvgRenewable, targetValue, direction);

  return {
    actualValue: Math.round(weightedAvgRenewable * 100) / 100,
    targetValue,
    status,
    calculationDetails: {
      formula:
        "Weighted average of GridRenewableEnergy values by energy consumption",
      inputs,
      steps,
      breakdown: { byRegion },
    },
    dataSource: {
      provider: providers,
      timestamp: new Date().toISOString(),
      regions,
      periodStart,
      periodEnd,
    },
  };
}

/**
 * Calculate electricity mix breakdown using GridElectricityMix data
 * Uses shared electricity-mix-service for consistency
 */
async function calculateElectricityMixBreakdown(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  targetValue: number,
  direction: KpiDirection,
): Promise<KPICalculationResult> {
  const steps: string[] = [];
  const inputs: Record<string, number | string> = {};

  // Use shared service to calculate weighted electricity mix
  const { weightedMix, totalEnergy, byRegion } =
    await calculateWeightedElectricityMix(
      organizationId,
      periodStart,
      periodEnd,
    );

  if (totalEnergy === 0) {
    // No energy data means no usage, return 0 for all energy sources
    const emptyMix: Record<string, number> = {};
    const energySources = [
      "nuclear",
      "geothermal",
      "biomass",
      "coal",
      "wind",
      "solar",
      "hydro",
      "gas",
      "oil",
      "unknown",
    ];
    energySources.forEach((source) => {
      emptyMix[source] = 0;
    });

    steps.push(`No energy data found for the specified period`);
    steps.push(`All energy sources: 0% (no cloud workloads detected)`);

    return {
      actualValue: 0,
      targetValue,
      status: determineStatus(0, targetValue, direction),
      calculationDetails: {
        formula:
          "Weighted Average Electricity Mix = Σ(Regional Mix × Regional Energy) / Total Energy",
        inputs: { totalEnergy: 0 },
        steps,
        breakdown: { byEnergySource: emptyMix },
      },
      dataSource: {
        provider: [],
        timestamp: new Date().toISOString(),
        regions: [],
        periodStart,
        periodEnd,
      },
    };
  }

  steps.push(`Calculating weighted average electricity mix breakdown`);

  // Calculate energy source percentages
  const byEnergySource = calculateEnergySourcePercentages(
    weightedMix,
    totalEnergy,
  );

  // Calculate renewable percentage
  const renewablePercentage = calculateTotalRenewableMix(byEnergySource);

  inputs.totalEnergy = totalEnergy;
  Object.entries(byRegion).forEach(([region, energy]) => {
    steps.push(`  ${region}: ${(energy as number).toFixed(2)} kWh`);
  });
  steps.push(`Weighted average electricity mix calculated`);
  steps.push(`Renewable sources: ${renewablePercentage.toFixed(2)}%`);

  const connections = await prisma.cloudConnection.findMany({
    where: { organizationId, isActive: true },
    select: { provider: true },
  });

  const providers = [...new Set(connections.map((c) => c.provider as string))];
  const regions = Object.keys(byRegion);
  const status = determineStatus(renewablePercentage, targetValue, direction);

  return {
    actualValue: Math.round(renewablePercentage * 100) / 100,
    targetValue,
    status,
    calculationDetails: {
      formula:
        "Weighted average of GridElectricityMix values by energy consumption",
      inputs,
      steps,
      breakdown: { byRegion, byEnergySource },
    },
    dataSource: {
      provider: providers,
      timestamp: new Date().toISOString(),
      regions,
      periodStart,
      periodEnd,
    },
  };
}
