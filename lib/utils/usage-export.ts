import { type CloudUsageResponse } from "@/app/actions/cloud";
import type { CloudMetricValue } from "@/lib/constants";
import { match } from "ts-pattern";
import { getMetricLabel } from "./usage";

export const handleExport = (data: CloudUsageResponse | null) => {
  if (!data?.footprints || data.footprints.length === 0) return;

  const timestamp = new Date().toISOString().split("T")[0];

  // CSV header
  const headers = [
    "Period Start",
    "Period End",
    "Cloud Provider",
    "Service Name",
    "Region",
    "Energy (kWh)",
    "CO2e (mtCO2e)",
    "Cost ($)",
    "Metric Type",
    "Service Type",
    "Tags",
  ];

  // CSV rows
  const rows = data.footprints.map((fp) => [
    fp.periodStartDate.toLocaleString(),
    fp.periodEndDate.toLocaleString(),
    fp.cloudProvider,
    fp.serviceName,
    fp.region,
    fp.kilowattHours?.toString() ?? "N/A",
    fp.co2e.toString(),
    fp.cost?.toString() ?? "N/A",
    fp.type,
    fp.serviceType ?? "N/A",
    fp.tags ?? "",
  ]);

  // Combine header and rows with proper CSV escaping
  const csvLines = [headers, ...rows].map((row) =>
    row
      .map((cell) => {
        // Escape quotes and wrap in quotes if needed
        const cellStr = cell.toString();
        if (
          cellStr.includes(",") ||
          cellStr.includes('"') ||
          cellStr.includes("\n")
        ) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      })
      .join(","),
  );

  const csv = csvLines.join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cloud-usage-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const handleTabExport = (
  data: CloudUsageResponse | null,
  activeTab: "timeseries" | "services" | "regions" | "instancetypes",
  yAxisMetric: CloudMetricValue,
) => {
  if (!data) return;

  const csvLines: string[] = [];
  const timestamp = new Date().toISOString().split("T")[0];

  match(activeTab)
    .with("timeseries", () => {
      csvLines.push("Timeline Data Export");
      csvLines.push(
        `Date,Total ${getMetricLabel(yAxisMetric)},Operational ${getMetricLabel(yAxisMetric)},Embodied ${getMetricLabel(yAxisMetric)}`,
      );

      data.timeSeries.forEach((point) => {
        const operationalKey =
          `operational_${yAxisMetric}` as keyof typeof point;
        const embodiedKey = `embodied_${yAxisMetric}` as keyof typeof point;
        csvLines.push(
          `${point.date},${point[yAxisMetric]},${point[operationalKey] ?? 0},${point[embodiedKey] ?? 0}`,
        );
      });
    })
    .with("services", () => {
      csvLines.push("Services Data Export");
      csvLines.push(`Service,CO2e (mtCO2e),Energy (kWh),Cost ($)`);

      data.byService.forEach((service) => {
        csvLines.push(
          `${service.label},${service.co2e},${service.kilowattHours},${service.cost}`,
        );
      });
    })
    .with("regions", () => {
      csvLines.push("Regions Data Export");
      csvLines.push(`Region,CO2e (mtCO2e),Energy (kWh),Cost ($)`);

      data.byRegion.forEach((region) => {
        csvLines.push(
          `${region.region},${region.co2e},${region.kilowattHours},${region.cost}`,
        );
      });
    })
    .with("instancetypes", () => {
      csvLines.push("Instance Types Data Export (Embodied Metrics)");
      csvLines.push(`Instance Type,Service,CO2e (mtCO2e),Energy (kWh)`);

      data.byInstanceType.forEach((instanceType) => {
        csvLines.push(
          `${instanceType.instanceType},${instanceType.serviceName},${instanceType.co2e},${instanceType.kilowattHours}`,
        );
      });
    })
    .exhaustive();

  const csv = csvLines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cloud-${activeTab}-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
