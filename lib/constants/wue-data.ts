/**
 * Water Usage Effectiveness (WUE) Data
 * Source: AWS Sustainability - https://sustainability.aboutamazon.com/products-services/aws-cloud#increasing-efficiency
 * Latest 2024 data for AWS regions
 * Formula: Water (liters) = IT energy (kWh) × WUE (L/kWh)
 */

export interface WUEData {
  region: string;
  regionId: string;
  year: number;
  wue: number | null;
}

/**
 * WUE data for 2024 (latest available)
 * Only includes regions with WUE data available
 */
export const WUE_2024_DATA: WUEData[] = [
  // Global/Regional Averages
  { region: "GLOBAL", regionId: "GLOBAL", year: 2024, wue: 0.15 },
  { region: "AMER", regionId: "AMER", year: 2024, wue: 0.14 },
  { region: "EMEA", regionId: "EMEA", year: 2024, wue: 0.12 },
  { region: "APAC", regionId: "APAC", year: 2024, wue: 0.27 },
  { region: "Europe", regionId: "Europe", year: 2024, wue: 0.04 },
  { region: "North America", regionId: "North America", year: 2024, wue: 0.13 },
  {
    region: "Central/South America",
    regionId: "Central/South America",
    year: 2024,
    wue: 0.23,
  },
  {
    region: "Asia Pacific (excl. China)",
    regionId: "Asia Pacific (excl. China)",
    year: 2024,
    wue: 0.98,
  },

  // AWS Specific Regions
  {
    region: "Europe (Stockholm)",
    regionId: "eu-north-1",
    year: 2024,
    wue: 0.02,
  },
  { region: "U.S. East (Ohio)", regionId: "us-east-2", year: 2024, wue: 0.1 },
  { region: "Europe (Ireland)", regionId: "eu-west-1", year: 2024, wue: 0.03 },
  {
    region: "Europe (Frankfurt)",
    regionId: "eu-central-1",
    year: 2024,
    wue: 0.01,
  },
  {
    region: "South America (Sao Paulo)",
    regionId: "sa-east-1",
    year: 2024,
    wue: 0.23,
  },
  {
    region: "U.S. East (Northern Virginia)",
    regionId: "us-east-1",
    year: 2024,
    wue: 0.12,
  },
  {
    region: "Asia-Pacific (Melbourne)",
    regionId: "ap-southeast-4",
    year: 2024,
    wue: 0.02,
  },
  {
    region: "Asia-Pacific (Tokyo)",
    regionId: "ap-northeast-1",
    year: 2024,
    wue: 0.91,
  },
  {
    region: "U.S. West (Oregon)",
    regionId: "us-west-2",
    year: 2024,
    wue: 0.16,
  },
  {
    region: "U.S. West (Northern California)",
    regionId: "us-west-1",
    year: 2024,
    wue: 0.51,
  },
  {
    region: "Asia-Pacific (Singapore)",
    regionId: "ap-southeast-1",
    year: 2024,
    wue: 1.68,
  },
  {
    region: "Asia-Pacific (Sydney)",
    regionId: "ap-southeast-2",
    year: 2024,
    wue: 0.12,
  },
  {
    region: "Canada (Central)",
    regionId: "ca-central-1",
    year: 2024,
    wue: 0.04,
  },
  { region: "Europe (Spain)", regionId: "eu-south-2", year: 2024, wue: 0.24 },
  { region: "Canada (West)", regionId: "ca-west-1", year: 2024, wue: 0.08 },
  {
    region: "Asia-Pacific (Jakarta)",
    regionId: "ap-southeast-3",
    year: 2024,
    wue: 2.75,
  },
];

/**
 * Default WUE value to use when region-specific data is not available
 */
export const DEFAULT_WUE = 0.15; // Global average for 2024

/**
 * Get WUE value for a specific region
 */
export function getWUEForRegion(region: string): number {
  const wueData = WUE_2024_DATA.find(
    (data) =>
      data.regionId.toLowerCase() === region.toLowerCase() ||
      data.region.toLowerCase() === region.toLowerCase()
  );
  return wueData?.wue ?? DEFAULT_WUE;
}
