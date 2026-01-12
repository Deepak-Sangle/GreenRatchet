import { KPI } from "@/app/generated/prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with proper locale support
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date with proper locale support
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Format date for form inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0] ?? "";
}

/**
 * Format basis points with proper sign
 */
export function formatBps(bps: number): string {
  return `${bps > 0 ? "+" : ""}${bps} bps`;
}

/**
 * Format percentage with proper precision
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with appropriate units (K, M, B)
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
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

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
