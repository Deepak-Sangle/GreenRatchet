import { KPI } from "@/app/generated/prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatBps(bps: number): string {
  return `${bps > 0 ? "+" : ""}${bps} bps`;
}

export function getKPIUnit(kpi: Pick<KPI, "type" | "valueType">): string | null {
  return match(kpi)
    .with({ type: "CO2_EMISSION", valueType: "ABSOLUTE" }, () => "tCO₂e")
    .with(
      { type: "CO2_EMISSION", valueType: "RATIO" },
      () => "tCO₂e / 1,000 compute hours"
    )
    .with({ type: "CO2_EMISSION", valueType: "PERCENTAGE" }, () => null)
    .with(
      { type: "AI_COMPUTE_HOURS", valueType: "ABSOLUTE" },
      () => "AI compute hours"
    )
    .with({ type: "AI_COMPUTE_HOURS", valueType: "PERCENTAGE" }, () => null)
    .with({ type: "AI_COMPUTE_HOURS", valueType: "RATIO" }, () => null)
    .exhaustive();
}
