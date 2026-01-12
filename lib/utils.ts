import { KPI } from "@/app/generated/prisma/client";
import { clsx, type ClassValue } from "clsx";
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

/**
 * Infers the unit for a KPI based on its type
 */
export function getKPIUnit(kpi: Pick<KPI, "type">): string | null {
  return match(kpi.type)
    .with("CO2_EMISSION", () => "tCO₂e")
    .with("ENERGY_CONSUMPTION", () => "MWh")
    .with("WATER_WITHDRAWAL", () => "L")
    .with("AI_COMPUTE_HOURS", () => "AI compute hours")
    .with("LOW_CARBON_REGION_PERCENTAGE", () => "%")
    .with("CARBON_FREE_ENERGY_PERCENTAGE", () => "%")
    .with("ELECTRICITY_MIX_BREAKDOWN", () => null)
    .with("RENEWABLE_ENERGY_PERCENTAGE", () => "%")
    .exhaustive();
}
