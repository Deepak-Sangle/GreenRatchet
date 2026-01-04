// Human-readable labels for enum values
// These are kept separate from generated schemas to allow customization

import {
  CloudProvider,
  KpiCategory,
  KpiDirection,
  KpiStatus,
  KpiValueType,
  LoanCurrency,
  LoanType,
  ObservationPeriod,
  UserRole,
} from "@/app/generated/prisma/enums";

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  FIXED_RATE: "Fixed Rate",
  FLOATING_RATE: "Floating Rate",
  AMORTIZED: "Amortized",
  ANNUITY: "Annuity",
  BALLOON: "Balloon",
  CREDIT_LINE: "Credit Line",
  REVOLVING_CREDIT_LINE: "Revolving Credit Line",
  CREDIT_CARD: "Credit Card",
};

export const CURRENCY_LABELS: Record<LoanCurrency, string> = {
  USD: "USD - US Dollar",
  EUR: "EUR - Euro",
  GBP: "GBP - British Pound",
  JPY: "JPY - Japanese Yen",
  AUD: "AUD - Australian Dollar",
  CAD: "CAD - Canadian Dollar",
  CHF: "CHF - Swiss Franc",
};

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

export const KPI_CATEGORY_LABELS: Record<KpiCategory, string> = {
  ENVIRONMENTAL: "Environmental",
  OPERATIONAL: "Operational",
  GOVERNANCE: "Governance",
};

export const KPI_VALUE_TYPE_LABELS: Record<KpiValueType, string> = {
  ABSOLUTE: "Absolute Value",
  INTENSITY: "Intensity",
  PERCENTAGE: "Percentage",
  SCORE: "Score",
};

export const KPI_DIRECTION_LABELS: Record<KpiDirection, string> = {
  LOWER_IS_BETTER: "Minimize",
  HIGHER_IS_BETTER: "Maximize",
  TARGET_RANGE: "Target Range",
};

export const KPI_FREQUENCY_LABELS: Record<ObservationPeriod, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL: "Annual",
};

export const KPI_STATUS_LABELS: Record<KpiStatus, string> = {
  PROPOSED: "Proposed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};
