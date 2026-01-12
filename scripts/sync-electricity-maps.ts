/**
 * Runner script to sync ElectricityMaps data for the last N days
 * Usage: npm run sync:electricity-maps [days]
 * Example: npm run sync:electricity-maps 30
 */

import { syncAllRegionsForDate } from "@/lib/services/electricity-maps-sync";

// Famous AWS regions
const AWS_REGIONS = [
  { region: "us-east-1", provider: "AWS" as const },
  { region: "us-west-2", provider: "AWS" as const },
  { region: "ap-south-1", provider: "AWS" as const },
  // { region: "eu-west-1", provider: "AWS" as const },
  // { region: "eu-central-1", provider: "AWS" as const },
  // { region: "ap-northeast-1", provider: "AWS" as const },
];

function getDatesForLastNDays(days: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(daysToSync: number): Promise<void> {
  console.log("🚀 Starting ElectricityMaps data sync");
  console.log(`📍 Regions: ${AWS_REGIONS.map((r) => r.region).join(", ")}`);
  console.log(`📅 Syncing last ${daysToSync} days`);

  const dates = getDatesForLastNDays(daysToSync);
  console.log(
    `📅 Date range: ${formatDate(dates[dates.length - 1])} to ${formatDate(dates[0])}`
  );

  let totalSuccess = 0;
  let totalErrors = 0;
  const allErrors: string[] = [];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const progress = `[${i + 1}/${dates.length}]`;

    console.log(`\n${progress} Syncing ${formatDate(date)}...`);

    try {
      const result = await syncAllRegionsForDate(date, AWS_REGIONS);

      totalSuccess += result.totalSuccess;
      totalErrors += result.totalErrors;

      if (result.errors.length > 0) {
        console.error(`❌ Errors for ${formatDate(date)}:`);
        result.errors.forEach((error) => console.error(`   ${error}`));
        allErrors.push(...result.errors);
      } else {
        console.log(
          `✅ Success: ${result.totalSuccess}/${AWS_REGIONS.length} regions`
        );
      }

      // Wait 1 second between dates to avoid rate limiting
      if (i < dates.length - 1) {
        await sleep(1000);
      }
    } catch (error) {
      console.error(`❌ Fatal error for ${formatDate(date)}:`, error);
      allErrors.push(
        `${formatDate(date)}: ${error instanceof Error ? error.message : String(error)}`
      );
      totalErrors += AWS_REGIONS.length;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Sync Summary");
  console.log("=".repeat(60));
  console.log(`✅ Total successful syncs: ${totalSuccess}`);
  console.log(`❌ Total failed syncs: ${totalErrors}`);
  console.log(`📅 Dates processed: ${dates.length}`);
  console.log(`📍 Regions per date: ${AWS_REGIONS.length}`);
  console.log(
    `🎯 Success rate: ${((totalSuccess / (dates.length * AWS_REGIONS.length)) * 100).toFixed(2)}%`
  );

  if (allErrors.length > 0) {
    console.log("\n❌ All errors:");
    allErrors.forEach((error) => console.error(`   ${error}`));
  }

  console.log("\n✨ Sync complete!");
}

// Parse command line argument for number of days (default: 1)
const daysArg = process.argv[2];
const daysToSync = daysArg ? parseInt(daysArg) : 1;

if (isNaN(daysToSync) || daysToSync < 1) {
  console.error(
    "❌ Invalid number of days. Please provide a positive integer."
  );
  console.error("Usage: npm run sync:electricity-maps [days]");
  console.error("Example: npm run sync:electricity-maps 30");
  process.exit(1);
}

main(daysToSync)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
