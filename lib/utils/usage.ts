import { format } from "date-fns";
import { match } from "ts-pattern";
import {
  AGGREGATION_PERIOD_OPTIONS,
  AggregationPeriodValue,
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  AWS_PUE_BY_REGION,
  CLOUD_METRIC_OPTIONS,
  CloudMetricValue,
} from "../constants";

/** Formats a metric value with appropriate units */
export function formatMetricValue(
  value: number,
  metric: CloudMetricValue,
): string {
  return match(metric)
    .with("co2e", () => {
      // CO2e is stored in metric tons (mtCO2e)
      if (value >= 1000) {
        return `${(value / 1000).toFixed(3)} ktCO₂e`;
      } else if (value >= 1) {
        return `${value.toFixed(3)} mtCO₂e`;
      } else if (value >= 0.001) {
        return `${(value * 1000).toFixed(2)} kg CO₂e`;
      } else {
        return `${(value * 1000000).toFixed(2)} g CO₂e`;
      }
    })
    .with("kilowattHours", () =>
      value >= 1000
        ? `${(value / 1000).toFixed(3)} MWh`
        : `${value.toFixed(3)} kWh`,
    )
    .with("cost", () => `$${value.toFixed(2)}`)
    .exhaustive();
}

/** Formats metric value for chart axis ticks (compact format) */
export function formatAxisTick(
  value: number,
  metric: CloudMetricValue,
): string {
  return formatMetricValue(value, metric);
}

/** Formats date for chart display based on aggregation period */
export function formatChartDate(
  dateString: string,
  aggregation: AggregationPeriodValue,
): string {
  return match(aggregation)
    .with("day", () => format(new Date(dateString), "MMM d"))
    .with("week", () => {
      // For week format (YYYY-Www), extract and display as "Week N"
      const weekMatch = dateString.match(/W(\d+)/);
      return weekMatch ? `Week ${weekMatch[1]}` : dateString;
    })
    .with("month", () => format(new Date(dateString + "-01"), "MMM yyyy"))
    .exhaustive();
}

/** Gets aggregation label for display */
export function getAggregationLabel(
  aggregation: AggregationPeriodValue,
): string {
  const option = AGGREGATION_PERIOD_OPTIONS.find(
    (o) => o.value === aggregation,
  );
  return option?.label.toLowerCase() ?? "daily";
}

/** Gets the metric label for display */
export function getMetricLabel(metric: CloudMetricValue): string {
  const option = CLOUD_METRIC_OPTIONS.find((o) => o.value === metric);
  return option?.label ?? metric;
}

/** Gets relevant emissions factors for regions in use */
// todo: use electricity maps api instead of static emission factors
export function getRelevantEmissionsFactors(
  availableRegions: string[],
): Array<{ region: string; factor: number }> {
  return availableRegions
    .map((region) => ({
      region,
      factor: AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH[region] ?? 0,
    }))
    .filter((item) => item.factor > 0)
    .sort((a, b) => a.region.localeCompare(b.region));
}

/**
 * Gets relevant PUE values for regions in use
 */
export function getRelevantPUEValues(
  availableRegions: string[],
): Array<{ region: string; pue: number }> {
  return availableRegions
    .map((region) => ({
      region,
      pue: AWS_PUE_BY_REGION[region] ?? AWS_CLOUD_CONSTANTS.PUE_AVG,
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

/**
 * Calculates average PUE across active regions using regional PUE data
 */
export function calculateAveragePUE(availableRegions: string[]): number {
  if (availableRegions.length === 0) return AWS_CLOUD_CONSTANTS.PUE_AVG;

  const pueValues: number[] = availableRegions
    .map((region) => AWS_PUE_BY_REGION[region])
    .filter((pue) => pue != null);

  if (pueValues.length === 0) return AWS_CLOUD_CONSTANTS.PUE_AVG;

  const sum = pueValues.reduce((acc, pue) => acc + pue, 0);
  return sum / pueValues.length;
}

/**
 * Calculates average emissions factor across active regions
 */
export function calculateAverageEmissionsFactor(
  availableRegions: string[],
): number {
  const factors = getRelevantEmissionsFactors(availableRegions);
  if (factors.length === 0) return 0;

  const sum = factors.reduce((acc, { factor }) => acc + factor, 0);
  return sum / factors.length;
}

/** Exports calculation constants to CSV */
export function exportConstantsToCSV(availableRegions: string[]): void {
  const csvLines: string[] = [];
  const avgPUE = calculateAveragePUE(availableRegions);
  const avgEmissionsFactor = calculateAverageEmissionsFactor(availableRegions);

  // Header
  csvLines.push("Calculation Constants for Cloud Carbon Footprint\n");

  // Key Constants
  csvLines.push("\nKey Constants");
  csvLines.push("Constant,Value,Unit");
  csvLines.push(`Power Usage Effectiveness (PUE),${avgPUE},ratio`);
  csvLines.push(
    `Average Emissions Factor (Active Regions),${avgEmissionsFactor.toFixed(10)},mtCO2e/kWh`,
  );
  csvLines.push(
    `SSD Coefficient,${AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT},Wh/TB-hour`,
  );
  csvLines.push(
    `HDD Coefficient,${AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT},Wh/TB-hour`,
  );
  csvLines.push(
    `Memory Coefficient,${AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT},kWh/GB`,
  );
  csvLines.push(
    `Networking Coefficient,${AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT},kWh/GB`,
  );
  csvLines.push(
    `Average CPU Utilization,${AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020},%`,
  );
  csvLines.push(
    `Server Expected Lifespan,${AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN},hours`,
  );

  // Regional Emissions Factors
  csvLines.push("\n\nRegional Emissions Factors (Active Regions)");
  csvLines.push("Region,Emissions Factor (mtCO2e/kWh)");
  const emissionsFactors = getRelevantEmissionsFactors(availableRegions);
  for (const { region, factor } of emissionsFactors) {
    csvLines.push(`${region},${factor}`);
  }

  // Regional PUE Values
  csvLines.push("\n\nRegional PUE Values (Active Regions)");
  csvLines.push("Region,PUE");
  const pueValues = getRelevantPUEValues(availableRegions);
  for (const { region, pue } of pueValues) {
    csvLines.push(`${region},${pue}`);
  }

  // Storage Replication Factors
  csvLines.push("\n\nStorage Replication Factors");
  csvLines.push("Service,Replication Factor");
  for (const [service, factor] of Object.entries(
    AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS,
  )) {
    csvLines.push(`${service},${factor}`);
  }

  const csv = csvLines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cloud-constants-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
