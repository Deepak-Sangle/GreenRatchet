/**
 * Cloud Data Service
 *
 * This service handles fetching cloud usage data from AWS and GCP.
 * In production, this would make actual API calls to cloud providers.
 * For the hackathon, we generate realistic mock data.
 */

export interface CloudUsageData {
  provider: "AWS" | "GCP";
  aiComputeHours: number;
  totalEnergyKwh: number;
  totalCO2Tonnes: number;
  regionBreakdown: {
    region: string;
    computeHours: number;
    energyKwh: number;
    co2Tonnes: number;
    carbonIntensity: number; // gCO2/kWh
  }[];
  instanceTypes: {
    type: string;
    hours: number;
    isGPU: boolean;
  }[];
}

// Regional carbon intensity data (gCO2/kWh)
const CARBON_INTENSITY: Record<string, number> = {
  // AWS regions
  "us-east-1": 415, // Virginia
  "us-west-2": 270, // Oregon (hydro-heavy)
  "eu-west-1": 295, // Ireland
  "eu-north-1": 9, // Stockholm (very low carbon)
  "ap-southeast-1": 595, // Singapore
  // GCP regions
  "us-central1": 450, // Iowa
  "us-west1": 210, // Oregon
  "europe-west1": 120, // Belgium
  "asia-southeast1": 595, // Singapore
};

// GPU TDP (Thermal Design Power) in watts
// TODO: Use this for more accurate energy calculations in production
// const GPU_TDP: Record<string, number> = {
//   "p3.2xlarge": 300, // V100
//   "p3.8xlarge": 1200, // 4x V100
//   "p4d.24xlarge": 1600, // 8x A100
//   "g4dn.xlarge": 125, // T4
//   "a2-highgpu-1g": 300, // A100
//   "n1-standard-16-v100": 300, // V100
// };

/**
 * Fetch cloud usage data for a given organization
 * TODO: Replace with actual AWS/GCP API calls
 */
export async function fetchCloudUsageData(
  _cloudConnectionId: string
): Promise<CloudUsageData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock data for hackathon demo
  // TODO: Use cloudConnectionId to fetch real data from AWS/GCP
  return generateMockCloudData();
}

function generateMockCloudData(): CloudUsageData {
  const provider: "AWS" | "GCP" = Math.random() > 0.5 ? "AWS" : "GCP";

  const regions =
    provider === "AWS"
      ? ["us-east-1", "us-west-2", "eu-west-1", "eu-north-1"]
      : ["us-central1", "us-west1", "europe-west1"];

  const instanceTypes =
    provider === "AWS"
      ? [
          { type: "p3.2xlarge", hours: 1200, isGPU: true },
          { type: "p4d.24xlarge", hours: 450, isGPU: true },
          { type: "g4dn.xlarge", hours: 800, isGPU: true },
        ]
      : [
          { type: "a2-highgpu-1g", hours: 950, isGPU: true },
          { type: "n1-standard-16-v100", hours: 600, isGPU: true },
        ];

  let totalAIComputeHours = 0;
  let totalEnergyKwh = 0;
  let totalCO2Tonnes = 0;

  const regionBreakdown = regions.map((region) => {
    // Distribute compute hours across regions
    const regionHours = instanceTypes.reduce((sum, inst) => {
      return sum + inst.hours * (0.15 + Math.random() * 0.35);
    }, 0);

    // Calculate energy consumption
    // Simplified: average GPU TDP * hours / 1000 (to convert Wh to kWh)
    const avgTDP = 350; // Average GPU power
    const energyKwh = (avgTDP * regionHours) / 1000;

    // Calculate CO2 emissions
    const carbonIntensity = CARBON_INTENSITY[region] || 400;
    const co2Tonnes = (energyKwh * carbonIntensity) / 1_000_000;

    totalAIComputeHours += regionHours;
    totalEnergyKwh += energyKwh;
    totalCO2Tonnes += co2Tonnes;

    return {
      region,
      computeHours: Math.round(regionHours),
      energyKwh: Math.round(energyKwh * 100) / 100,
      co2Tonnes: Math.round(co2Tonnes * 1000) / 1000,
      carbonIntensity,
    };
  });

  return {
    provider,
    aiComputeHours: Math.round(totalAIComputeHours),
    totalEnergyKwh: Math.round(totalEnergyKwh * 100) / 100,
    totalCO2Tonnes: Math.round(totalCO2Tonnes * 1000) / 1000,
    regionBreakdown,
    instanceTypes,
  };
}
