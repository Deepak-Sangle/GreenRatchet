// Human-readable labels for enum values
// These are kept separate from generated schemas to allow customization

import {
  CloudProvider,
  KpiDirection,
  KpiType,
  ObservationPeriod,
  UserRole,
} from "@/app/generated/prisma/enums";

export const OBSERVATION_PERIOD_LABELS: Record<ObservationPeriod, string> = {
  ANNUAL: "Annual",
  QUARTERLY: "Quarterly",
  MONTHLY: "Monthly",
};

export const CLOUD_PROVIDER_LABELS: Record<CloudProvider, string> = {
  AWS: "Amazon Web Services",
  GCP: "Google Cloud Platform",
  AZURE: "Microsoft Azure",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  BORROWER: "Borrower",
  LENDER: "Lender",
};

export const KPI_TYPE_LABELS: Record<KpiType, string> = {
  CO2_EMISSION: "CO2 Emission",
  ENERGY_CONSUMPTION: "Energy Consumption",
  WATER_WITHDRAWAL: "Water Withdrawal",
  AI_COMPUTE_HOURS: "AI Compute Hours",
  LOW_CARBON_REGION_PERCENTAGE: "% CO2e in Low Carbon Regions",
  CARBON_FREE_ENERGY_PERCENTAGE: "Carbon-Free Energy %",
  ELECTRICITY_MIX_BREAKDOWN: "Electricity Mix Breakdown",
  RENEWABLE_ENERGY_PERCENTAGE: "Renewable Energy %",
  GHG_INTENSITY: "GHG Intensity",
  WATER_STRESSED_REGION_PERCENTAGE: "% Water Usage in Stressed Regions",
};

export const KPI_DIRECTION_LABELS: Record<KpiDirection, string> = {
  LOWER_IS_BETTER: "Minimize",
  HIGHER_IS_BETTER: "Maximize",
};

export const KPI_FREQUENCY_LABELS: Record<ObservationPeriod, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL: "Annual",
};
