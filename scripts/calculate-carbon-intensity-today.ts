/**
 * Script to calculate carbon intensity for all AWS regions for today's date
 * Usage: npm run calculate:carbon-intensity
 */

import { AWS_REGIONS } from "@/lib/constants";
import { syncAllRegionsForDate } from "@/lib/services/electricity-maps-sync";

const UNSUPPORTED_ELECTRICITY_MAPS_REGIONS = [
  AWS_REGIONS.UNKNOWN,
  AWS_REGIONS.AP_SOUTHEAST_3,
  AWS_REGIONS.CN_NORTH_1,
  AWS_REGIONS.CN_NORTHWEST_1,
  AWS_REGIONS.US_GOV_EAST_1,
  AWS_REGIONS.US_GOV_WEST_1,
];

const ALL_AWS_REGIONS = Object.values(AWS_REGIONS)
  .filter((region) => !UNSUPPORTED_ELECTRICITY_MAPS_REGIONS.includes(region))
  // add which regions to run for
  .filter((region) => ["us-east-1", 'us-west-2', 'ap-south-1'].includes(region))
  .map((region) => ({
    region,
    provider: "AWS" as const,
  }));

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function main(): Promise<void> {
  console.log("🚀 Starting carbon intensity calculation for today");
  console.log(`📅 Date: ${formatDate(new Date())}`);
  console.log(`📍 Total regions: ${ALL_AWS_REGIONS.length}`);
  console.log(
    `📍 Regions: ${ALL_AWS_REGIONS.map((r) => r.region).join(", ")}\n`
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const result = await syncAllRegionsForDate(today, ALL_AWS_REGIONS, {
      functions: ["carbonIntensity", "carbonIntensityFossilOnly"],
    });

    console.log("\n" + "=".repeat(60));
    console.log("📊 Calculation Summary");
    console.log("=".repeat(60));
    console.log(`✅ Successful syncs: ${result.totalSuccess}`);
    console.log(`❌ Failed syncs: ${result.totalErrors}`);
    console.log(`📍 Total regions: ${ALL_AWS_REGIONS.length}`);
    console.log(
      `🎯 Success rate: ${((result.totalSuccess / ALL_AWS_REGIONS.length) * 100).toFixed(2)}%`
    );

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:");
      result.errors.forEach((error) => console.error(`   ${error}`));
    }

    console.log("\n✨ Calculation complete!");

    if (result.totalErrors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
